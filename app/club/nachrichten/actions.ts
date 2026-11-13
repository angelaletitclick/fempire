"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { club } from "@/content/club";
import { requireMember } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

const schema = z.object({
  recipientId: z.uuid(),
  body: z.string().trim().min(1, "Die Nachricht ist leer.").max(4000, "Höchstens 4.000 Zeichen."),
});

/** Ob die Empfängerin angeschrieben werden darf, prüft die Datenbank (RLS). */
export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse({ recipientId: formData.get("recipientId"), body: formData.get("body") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? club.errors.validation };
  if (parsed.data.recipientId === viewer.userId) return { status: "error", message: club.errors.generic };

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("messages")
    .insert({ sender_id: viewer.userId, recipient_id: parsed.data.recipientId, body: parsed.data.body });
  if (error) {
    console.error("Nachricht:", error.message);
    return { status: "error", message: club.errors.generic };
  }
  revalidatePath(`/club/nachrichten/${parsed.data.recipientId}`);
  revalidatePath("/club/nachrichten");
  return { status: "ok", message: "Gesendet." };
}
