"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { club } from "@/content/club";
import { requireMember } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { newMessageMail } from "@/lib/mail/templates";
import { canMessage } from "@/lib/messaging";
import { siteUrl } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

const schema = z.object({
  recipientId: z.uuid(),
  body: z.string().trim().min(1, "Die Nachricht ist leer.").max(4000, "Höchstens 4.000 Zeichen."),
});

/**
 * Nachricht senden. Ob die Empfängerin angeschrieben werden darf, prüft zusätzlich die Datenbank (RLS).
 * Danach eine Mail an die Empfängerin, aber nur bei der ersten ungelesenen Nachricht dieser
 * Unterhaltung, damit ein schneller Austausch keine Mailflut auslöst.
 */
export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireMember();
  const parsed = schema.safeParse({ recipientId: formData.get("recipientId"), body: formData.get("body") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? club.errors.validation };
  const { recipientId, body } = parsed.data;
  if (recipientId === viewer.userId) return { status: "error", message: club.errors.generic };

  const admin = supabaseAdmin();
  const [{ data: recipient }, { count: incoming }] = await Promise.all([
    admin.from("members").select("user_id, role, tier, status, email, full_name").eq("user_id", recipientId).maybeSingle(),
    admin.from("messages").select("id", { count: "exact", head: true }).eq("sender_id", recipientId).eq("recipient_id", viewer.userId),
  ]);
  if (!recipient || (recipient.role !== "admin" && recipient.status !== "active")) {
    return { status: "error", message: club.errors.generic };
  }
  if (!canMessage(viewer.member, recipient, (incoming ?? 0) > 0)) {
    return { status: "error", message: club.messages.notAllowed };
  }

  // Ungelesene Nachrichten in dieser Richtung vor dem Senden zählen
  const { count: unreadBefore } = await admin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", viewer.userId)
    .eq("recipient_id", recipientId)
    .is("read_at", null);

  const supabase = await supabaseServer();
  const { error } = await supabase.from("messages").insert({ sender_id: viewer.userId, recipient_id: recipientId, body });
  if (error) {
    console.error("Nachricht:", error.message);
    return { status: "error", message: club.errors.generic };
  }

  if ((unreadBefore ?? 0) === 0 && recipient.email) {
    after(async () => {
      try {
        await sendMail(
          newMessageMail({
            to: recipient.email as string,
            name: (recipient.full_name as string).split(" ")[0] ?? (recipient.full_name as string),
            sender: viewer.member.full_name,
            url: `${siteUrl}/club/nachrichten/${viewer.userId}`,
          }),
        );
      } catch (mailError) {
        console.error("Nachricht-Mail:", (mailError as Error).message);
      }
    });
  }

  revalidatePath(`/club/nachrichten/${recipientId}`);
  revalidatePath("/club/nachrichten");
  return { status: "ok", message: "Gesendet." };
}
