"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { funnel } from "@/content/funnel";
import { applicationStatuses, tierValues } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { rejectionMail } from "@/lib/mail/templates";
import { upsertMember } from "@/lib/members";
import { supabaseAdmin } from "@/lib/supabase/admin";

function revalidate(id: string) {
  revalidatePath("/club/admin/bewerbungen");
  revalidatePath(`/club/admin/bewerbungen/${id}`);
  revalidatePath("/club/admin");
  revalidatePath("/club/admin/mitglieder");
}

const acceptSchema = z.object({
  id: z.uuid(),
  tier: z.enum(tierValues),
  sendWelcome: z.boolean(),
});

/** Aufnehmen: Konto und Mitgliedschaft anlegen, Willkommensmail mit Login-Link */
export async function acceptApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = acceptSchema.safeParse({
    id: formData.get("id"),
    tier: formData.get("tier"),
    sendWelcome: formData.get("sendWelcome") === "on",
  });
  if (!parsed.success) return { status: "error", message: "Bitte eine Mitgliedschaft wählen." };

  const db = supabaseAdmin();
  const { data: application } = await db
    .from("applications")
    .select("id, name, email, city_slug, company, role")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!application) return { status: "error", message: "Bewerbung nicht gefunden." };

  try {
    const roleLabel = funnel.options.role.find((option) => option.value === application.role)?.label ?? null;
    const result = await upsertMember({
      email: application.email,
      fullName: application.name,
      tier: parsed.data.tier,
      citySlug: application.city_slug === "andere" ? "osnabrueck" : application.city_slug,
      company: application.company,
      position: roleLabel,
      applicationId: application.id,
      sendWelcome: parsed.data.sendWelcome,
    });
    await db
      .from("applications")
      .update({ status: "aufgenommen", assigned_circle: parsed.data.tier, decided_at: new Date().toISOString() })
      .eq("id", application.id);
    revalidate(application.id);
    if (result.mailError) {
      console.error("Willkommensmail:", result.mailError);
      return { status: "error", message: "Aufgenommen, aber die Willkommensmail ist nicht rausgegangen. Bitte Mail-Einstellungen prüfen." };
    }
    return { status: "ok", message: parsed.data.sendWelcome ? "Aufgenommen. Die Willkommensmail ist raus." : "Aufgenommen." };
  } catch (error) {
    console.error("Aufnahme:", (error as Error).message);
    return { status: "error", message: `Aufnahme fehlgeschlagen: ${(error as Error).message}` };
  }
}

export async function rejectApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Bewerbung nicht gefunden." };
  const sendRejection = formData.get("sendRejection") === "on";

  const db = supabaseAdmin();
  const { data: application, error } = await db
    .from("applications")
    .update({ status: "abgelehnt", decided_at: new Date().toISOString() })
    .eq("id", id.data)
    .select("id, name, email")
    .maybeSingle();
  if (error || !application) return { status: "error", message: "Das hat nicht geklappt." };
  revalidate(application.id);

  if (!sendRejection) return { status: "ok", message: "Abgelehnt, ohne Mail." };
  try {
    await sendMail(rejectionMail({ to: application.email, name: application.name.split(" ")[0] ?? application.name }));
    return { status: "ok", message: "Abgelehnt. Die Absage ist raus." };
  } catch (mailError) {
    console.error("Absage-Mail:", (mailError as Error).message);
    return { status: "error", message: "Abgelehnt, aber die Absage-Mail ist nicht rausgegangen." };
  }
}

const noteSchema = z.object({
  id: z.uuid(),
  status: z.enum(applicationStatuses.map((s) => s.value) as [string, ...string[]]),
  note: z.string().max(5000),
});

/** Status (z. B. Kennenlerngespräch) und interne Notiz */
export async function updateApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = noteSchema.safeParse({ id: formData.get("id"), status: formData.get("status"), note: formData.get("note") ?? "" });
  if (!parsed.success) return { status: "error", message: "Bitte Eingaben prüfen." };
  const { error } = await supabaseAdmin()
    .from("applications")
    .update({ status: parsed.data.status, internal_note: parsed.data.note.trim() || null })
    .eq("id", parsed.data.id);
  if (error) return { status: "error", message: "Das hat nicht geklappt." };
  revalidate(parsed.data.id);
  return { status: "ok", message: "Gespeichert." };
}
