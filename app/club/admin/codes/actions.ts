"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { tierValues } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { normalizeCode } from "@/lib/codes";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Gut lesbarer Code ohne verwechselbare Zeichen (0/O, 1/I) */
function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return `FEMPIRE-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

const intField = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? 0 : Number(value)))
    .pipe(z.number({ error: `${label}: bitte eine Zahl.` }).int(`${label}: bitte eine ganze Zahl.`).min(min).max(max, `${label}: höchstens ${max}.`));

const createSchema = z
  .object({
    code: z
      .string()
      .transform(normalizeCode)
      .refine((value) => value === "" || /^[A-Z0-9-]{4,40}$/.test(value), "Code: 4 bis 40 Zeichen, nur Buchstaben, Ziffern und Bindestrich."),
    note: z.string().trim().max(200),
    tiers: z.array(z.enum(tierValues)),
    discount: intField(0, 100, "Rabatt"),
    freeMonths: intField(0, 36, "Kostenlose Monate"),
    skip: z.boolean(),
    maxUses: intField(0, 100000, "Anzahl"),
    expires: z.string().trim().refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Bitte ein gültiges Datum."),
  })
  .refine((data) => data.discount > 0 || data.freeMonths > 0 || data.skip, {
    error: "Bitte mindestens einen Vorteil wählen: Rabatt, kostenlose Monate oder Aufnahme ohne Bewerbung.",
  });

export async function createCode(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = createSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    note: String(formData.get("note") ?? ""),
    tiers: formData.getAll("tiers").map(String),
    discount: String(formData.get("discount") ?? ""),
    freeMonths: String(formData.get("freeMonths") ?? ""),
    skip: formData.get("skip") === "on",
    maxUses: String(formData.get("maxUses") ?? ""),
    expires: String(formData.get("expires") ?? ""),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen." };
  const data = parsed.data;
  const code = data.code || generateCode();

  const { error } = await supabaseAdmin()
    .from("invite_codes")
    .insert({
      code,
      note: data.note || null,
      // Alle Kreise angekreuzt = keine Einschränkung
      tiers: data.tiers.length === tierValues.length ? [] : data.tiers,
      discount_percent: data.discount,
      free_months: data.freeMonths,
      skip_application: data.skip,
      max_uses: data.maxUses > 0 ? data.maxUses : null,
      // Bis einschließlich Ablauftag (Ende des Tages, deutsche Zeit)
      expires_at: data.expires ? new Date(`${data.expires}T23:59:59+01:00`).toISOString() : null,
    });
  if (error) {
    if (error.code === "23505") return { status: "error", message: `Den Code ${code} gibt es schon.` };
    console.error("Code anlegen:", error.message);
    return { status: "error", message: "Das hat nicht geklappt." };
  }
  revalidatePath("/club/admin/codes");
  return { status: "ok", message: `Code ${code} angelegt.` };
}

export async function setCodeActive(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return;
  await supabaseAdmin().from("invite_codes").update({ active }).eq("id", id);
  revalidatePath("/club/admin/codes");
}

export async function deleteCode(id: string): Promise<void> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return;
  await supabaseAdmin().from("invite_codes").delete().eq("id", id);
  revalidatePath("/club/admin/codes");
}
