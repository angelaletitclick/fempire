"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { club } from "@/content/club";
import { requireAdmin, requireMember } from "@/lib/auth";
import { notifyRecipients, sendMail } from "@/lib/mail";
import { forumPendingNotification } from "@/lib/mail/templates";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

const threadSchema = z.object({
  title: z.string().trim().min(3, "Der Titel braucht mindestens 3 Zeichen.").max(140),
  body: z.string().trim().min(1, "Bitte beschreibe dein Thema.").max(10000),
});

/** Neues Thema. Mitglieder: wartet auf Freigabe. Admins: sofort sichtbar. */
export async function createThread(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireMember();
  const parsed = threadSchema.safeParse({ title: formData.get("title"), body: formData.get("body") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? club.errors.validation };

  if (viewer.isAdmin) {
    const { error } = await supabaseAdmin()
      .from("forum_threads")
      .insert({ ...parsed.data, author_id: viewer.userId, status: "approved" });
    if (error) {
      console.error("Forum:", error.message);
      return { status: "error", message: club.errors.generic };
    }
    revalidatePath("/club/forum");
    return { status: "ok", message: "Veröffentlicht." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("forum_threads")
    .insert({ ...parsed.data, author_id: viewer.userId, status: "pending" });
  if (error) {
    console.error("Forum:", error.message);
    return { status: "error", message: club.errors.generic };
  }

  after(async () => {
    const to = notifyRecipients();
    if (!to.length) return;
    try {
      await sendMail(forumPendingNotification({ to, author: viewer.member.full_name, title: parsed.data.title }));
    } catch (error) {
      console.error("Forum-Benachrichtigung:", (error as Error).message);
    }
  });

  revalidatePath("/club/forum");
  revalidatePath("/club/admin");
  return { status: "ok", message: club.forum.submitted };
}

const replySchema = z.object({ threadId: z.uuid(), body: z.string().trim().min(1, "Bitte schreib eine Antwort.").max(10000) });

export async function createReply(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireMember();
  const parsed = replySchema.safeParse({ threadId: formData.get("threadId"), body: formData.get("body") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? club.errors.validation };

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("forum_posts")
    .insert({ thread_id: parsed.data.threadId, body: parsed.data.body, author_id: viewer.userId, status: "approved" });
  if (error) {
    console.error("Forum-Antwort:", error.message);
    return { status: "error", message: club.errors.generic };
  }
  revalidatePath(`/club/forum/${parsed.data.threadId}`);
  revalidatePath("/club/forum");
  return { status: "ok", message: "Gesendet." };
}

// ---------------------------------------------------------------------------
// Moderation (nur Admins). Auch aus dem Backend unter /club/admin/forum genutzt.
// ---------------------------------------------------------------------------

const uuid = z.uuid();

function revalidateForum(threadId?: string) {
  revalidatePath("/club/forum");
  revalidatePath("/club/admin/forum");
  revalidatePath("/club/admin");
  revalidatePath("/club");
  if (threadId) revalidatePath(`/club/forum/${threadId}`);
}

export async function setThreadStatus(threadId: string, status: "approved" | "hidden"): Promise<void> {
  await requireAdmin();
  if (!uuid.safeParse(threadId).success) return;
  const { error } = await supabaseAdmin().from("forum_threads").update({ status }).eq("id", threadId);
  if (error) console.error("Moderation:", error.message);
  revalidateForum(threadId);
}

export async function toggleThreadPin(threadId: string, pinned: boolean): Promise<void> {
  await requireAdmin();
  if (!uuid.safeParse(threadId).success) return;
  const { error } = await supabaseAdmin().from("forum_threads").update({ pinned }).eq("id", threadId);
  if (error) console.error("Moderation:", error.message);
  revalidateForum(threadId);
}

export async function deleteThread(threadId: string): Promise<void> {
  await requireAdmin();
  if (!uuid.safeParse(threadId).success) return;
  const { error } = await supabaseAdmin().from("forum_threads").delete().eq("id", threadId);
  if (error) console.error("Moderation:", error.message);
  revalidateForum();
}

export async function setPostStatus(postId: string, threadId: string, status: "approved" | "hidden"): Promise<void> {
  await requireAdmin();
  if (!uuid.safeParse(postId).success) return;
  const { error } = await supabaseAdmin().from("forum_posts").update({ status }).eq("id", postId);
  if (error) console.error("Moderation:", error.message);
  revalidateForum(threadId);
}

export async function deletePost(postId: string, threadId: string): Promise<void> {
  await requireAdmin();
  if (!uuid.safeParse(postId).success) return;
  const { error } = await supabaseAdmin().from("forum_posts").delete().eq("id", postId);
  if (error) console.error("Moderation:", error.message);
  revalidateForum(threadId);
}
