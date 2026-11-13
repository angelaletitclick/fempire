"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { eventFormatValues, tierValues } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { berlinLocalToDate } from "@/lib/time";

/** "29", "19,90" oder "19.90" → Cent. Leer → null */
function toCents(value: string): number | null | "invalid" {
  const trimmed = value.trim().replace(/\s|€/g, "");
  if (!trimmed) return null;
  if (!/^\d+([.,]\d{1,2})?$/.test(trimmed)) return "invalid";
  return Math.round(Number(trimmed.replace(",", ".")) * 100);
}

const schema = z.object({
  id: z.union([z.uuid(), z.literal("")]),
  title: z.string().trim().min(2, "Bitte einen Titel angeben.").max(160),
  format: z.enum(eventFormatValues),
  topic: z.string().trim().max(160),
  description: z.string().trim().max(5000),
  startsAt: z.string().min(1, "Bitte Beginn angeben."),
  endsAt: z.string(),
  citySlug: z.string().trim().min(1).max(60),
  location: z.string().trim().max(300),
  audience: z.array(z.enum(tierValues)).min(1, "Bitte mindestens eine Mitgliedschaft wählen, die teilnehmen kann."),
  price: z.string(),
  trial: z.boolean(),
  trialPrice: z.string(),
  capacity: z.string(),
  status: z.enum(["draft", "published", "cancelled"]),
  cancelNote: z.string().trim().max(500),
});

function revalidateEvents(id?: string) {
  revalidatePath("/club/admin/termine");
  revalidatePath("/club/admin");
  revalidatePath("/club/termine");
  revalidatePath("/club");
  revalidatePath("/schnuppern");
  // Startseite, Kopfzeile und Aktionsleiste zeigen den nächsten Termin
  revalidatePath("/", "layout");
  if (id) revalidatePath(`/club/admin/termine/${id}`);
}

export async function saveEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") ?? "",
    title: formData.get("title"),
    format: formData.get("format"),
    topic: formData.get("topic") ?? "",
    description: formData.get("description") ?? "",
    startsAt: formData.get("startsAt") ?? "",
    endsAt: formData.get("endsAt") ?? "",
    citySlug: formData.get("citySlug") ?? "osnabrueck",
    location: formData.get("location") ?? "",
    audience: formData.getAll("audience"),
    price: formData.get("price") ?? "",
    trial: formData.get("trial") === "on",
    trialPrice: formData.get("trialPrice") ?? "",
    capacity: formData.get("capacity") ?? "",
    status: formData.get("status"),
    cancelNote: formData.get("cancelNote") ?? "",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen." };
  const input = parsed.data;

  const startsAt = berlinLocalToDate(input.startsAt);
  if (!startsAt) return { status: "error", message: "Bitte einen gültigen Beginn angeben." };
  const endsAt = input.endsAt ? berlinLocalToDate(input.endsAt) : null;
  if (endsAt && endsAt <= startsAt) return { status: "error", message: "Das Ende muss nach dem Beginn liegen." };

  const price = toCents(input.price);
  const trialPrice = input.trial ? toCents(input.trialPrice) : null;
  if (price === "invalid" || trialPrice === "invalid") return { status: "error", message: "Beträge bitte als Zahl angeben, z. B. 29 oder 19,90." };
  if (input.trial && trialPrice === null) return { status: "error", message: "Bitte einen Schnupper-Beitrag angeben." };

  const capacity = input.capacity.trim() ? Number(input.capacity) : null;
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) {
    return { status: "error", message: "Plätze bitte als ganze Zahl angeben." };
  }

  const row = {
    title: input.title,
    format: input.format,
    topic: input.topic || null,
    description: input.description || null,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt?.toISOString() ?? null,
    city_slug: input.citySlug,
    location: input.location || null,
    audience: input.audience,
    price_cents: price,
    trial_price_cents: trialPrice,
    capacity,
    status: input.status,
    cancel_note: input.status === "cancelled" ? input.cancelNote || null : null,
    updated_at: new Date().toISOString(),
  };

  const db = supabaseAdmin();
  const result = input.id
    ? await db.from("events").update(row).eq("id", input.id).select("id").single()
    : await db.from("events").insert(row).select("id").single();
  if (result.error) {
    console.error("Termin:", result.error.message);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }
  revalidateEvents(result.data.id);
  if (!input.id) redirect(`/club/admin/termine/${result.data.id}?neu=1`);
  return { status: "ok", message: "Gespeichert." };
}

/** Schnell-Aktionen aus der Liste: veröffentlichen, absagen, zurück auf Entwurf */
export async function setEventStatus(id: string, status: "draft" | "published" | "cancelled"): Promise<void> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return;
  const { error } = await supabaseAdmin().from("events").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) console.error("Termin-Status:", error.message);
  revalidateEvents(id);
}

/** Termin kopieren, z. B. für die nächste Ausgabe eines Formats. Die Kopie ist ein Entwurf. */
export async function duplicateEvent(id: string): Promise<void> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return;
  const db = supabaseAdmin();
  const { data } = await db.from("events").select("*").eq("id", id).maybeSingle();
  if (!data) return;
  const copyRow: Record<string, unknown> = { ...(data as Record<string, unknown>), status: "draft", cancel_note: null };
  for (const key of ["id", "created_at", "updated_at"]) delete copyRow[key];
  const { data: copy } = await db
    .from("events")
    .insert(copyRow)
    .select("id")
    .single();
  revalidateEvents();
  if (copy) redirect(`/club/admin/termine/${copy.id}`);
}

export async function deleteEvent(id: string): Promise<void> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return;
  const { error } = await supabaseAdmin().from("events").delete().eq("id", id);
  if (error) console.error("Termin löschen:", error.message);
  revalidateEvents();
  redirect("/club/admin/termine");
}
