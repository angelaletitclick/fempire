"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { memberStatuses, roles, tierValues } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { upsertMember } from "@/lib/members";
import { supabaseAdmin } from "@/lib/supabase/admin";

function revalidate() {
  revalidatePath("/club/admin/mitglieder");
  revalidatePath("/club/admin");
  revalidatePath("/club", "layout");
}

const updateSchema = z.object({
  userId: z.uuid(),
  tier: z.union([z.enum(tierValues), z.literal("")]),
  status: z.enum(memberStatuses.map((s) => s.value) as [string, ...string[]]),
  role: z.enum(roles.map((r) => r.value) as [string, ...string[]]),
});

/** Mitgliedschaft, Status (bezahlt/aktiv) und Rolle setzen */
export async function updateMembership(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireAdmin();
  const parsed = updateSchema.safeParse({
    userId: formData.get("userId"),
    tier: formData.get("tier") ?? "",
    status: formData.get("status"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { status: "error", message: "Bitte Eingaben prüfen." };
  const { userId, tier, status, role } = parsed.data;
  if (userId === viewer.userId && role !== "admin") {
    return { status: "error", message: "Du kannst dir die Admin-Rolle nicht selbst entziehen." };
  }
  if (role === "member" && !tier) return { status: "error", message: "Mitglieder brauchen eine Mitgliedschaft." };

  const { error } = await supabaseAdmin()
    .from("members")
    .update({ tier: tier || null, status, role, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return { status: "error", message: "Das hat nicht geklappt." };
  revalidate();
  return { status: "ok", message: "Gespeichert." };
}

const addSchema = z.object({
  fullName: z.string().trim().min(2, "Bitte einen Namen angeben.").max(120),
  email: z.email("Bitte eine gültige E-Mail-Adresse angeben."),
  tier: z.enum(tierValues),
  sendWelcome: z.boolean(),
});

/** Mitglied ohne Bewerbung anlegen, z. B. bestehende Kontakte */
export async function addMember(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = addSchema.safeParse({
    fullName: formData.get("fullName"),
    email: String(formData.get("email") ?? "").trim(),
    tier: formData.get("tier"),
    sendWelcome: formData.get("sendWelcome") === "on",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen." };
  try {
    const result = await upsertMember({ ...parsed.data, sendWelcome: parsed.data.sendWelcome });
    revalidate();
    if (result.mailError) return { status: "error", message: "Angelegt, aber die Willkommensmail ist nicht rausgegangen." };
    return { status: "ok", message: "Angelegt." };
  } catch (error) {
    return { status: "error", message: `Anlegen fehlgeschlagen: ${(error as Error).message}` };
  }
}

/** Konto endgültig löschen (Profil, Forum-Beiträge und Nachrichten fallen mit weg) */
export async function deleteMember(userId: string): Promise<void> {
  const viewer = await requireAdmin();
  if (!z.uuid().safeParse(userId).success || userId === viewer.userId) return;
  const admin = supabaseAdmin();
  const { data } = await admin.from("members").select("avatar_path").eq("user_id", userId).maybeSingle();
  if (data?.avatar_path) await admin.storage.from("avatars").remove([data.avatar_path as string]);
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) console.error("Mitglied löschen:", error.message);
  revalidate();
}
