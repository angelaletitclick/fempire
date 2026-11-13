"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { club } from "@/content/club";
import { requireAdmin, requireMember } from "@/lib/auth";
import { notifyRecipients, sendMail } from "@/lib/mail";
import { forumPendingNotification } from "@/lib/mail/templates";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

const uuid = z.uuid();

const threadSchema = z.object({
  title: z.string().trim().min(3, "Der Titel braucht mindestens 3 Zeichen.").max(140),
  body: z.string().trim().min(1, "Bitte beschreibe dein Thema.").max(10000),
  categoryId: z.uuid("Bitte wähle eine Kategorie."),
  kind: z.enum(["frage", "diskussion"]),
});

function readThread(formData: FormData) {
  return threadSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    categoryId: formData.get("categoryId"),
    kind: formData.get("kind") ?? "diskussion",
  });
}

function revalidateForum(threadId?: string) {
  revalidatePath("/club/forum");
  revalidatePath("/club/admin/forum");
  revalidatePath("/club/admin");
  revalidatePath("/club");
  if (threadId) revalidatePath(`/club/forum/${threadId}`);
}

/** Neues Thema. Mitglieder: wartet auf Freigabe. Moderatorinnen (Admins): sofort sichtbar. */
export async function createThread(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireMember();
  const parsed = readThread(formData);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? club.errors.validation };
  const { title, body, categoryId, kind } = parsed.data;
  const row = { title, body, category_id: categoryId, kind, author_id: viewer.userId };

  if (viewer.isAdmin) {
    const { data, error } = await supabaseAdmin()
      .from("forum_threads")
      .insert({ ...row, status: "approved" })
      .select("id")
      .single();
    if (error) {
      console.error("Forum:", error.message);
      return { status: "error", message: club.errors.generic };
    }
    revalidateForum();
    redirect(`/club/forum/${data.id}`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("forum_threads").insert({ ...row, status: "pending" });
  if (error) {
    console.error("Forum:", error.message);
    return { status: "error", message: club.errors.generic };
  }

  after(async () => {
    const to = notifyRecipients();
    if (!to.length) return;
    try {
      await sendMail(forumPendingNotification({ to, author: viewer.member.full_name, title }));
    } catch (mailError) {
      console.error("Forum-Benachrichtigung:", (mailError as Error).message);
    }
  });

  revalidateForum();
  return { status: "ok", message: club.forum.submitted };
}

/** Thema bearbeiten: Autorin über RLS, Moderatorinnen auch fremde Themen */
export async function updateThread(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireMember();
  const id = uuid.safeParse(formData.get("threadId"));
  const parsed = readThread(formData);
  if (!id.success) return { status: "error", message: club.errors.generic };
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? club.errors.validation };
  const { title, body, categoryId, kind } = parsed.data;
  const update = { title, body, category_id: categoryId, kind, edited_at: new Date().toISOString() };

  const db = viewer.isAdmin ? supabaseAdmin() : await supabaseServer();
  const { data, error } = await db.from("forum_threads").update(update).eq("id", id.data).select("id");
  if (error || !data?.length) {
    if (error) console.error("Forum bearbeiten:", error.message);
    return { status: "error", message: club.errors.generic };
  }
  revalidateForum(id.data);
  redirect(`/club/forum/${id.data}`);
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
  revalidateForum(parsed.data.threadId);
  return { status: "ok", message: "Gesendet." };
}

/** Antwort bearbeiten: Autorin über RLS, Moderatorinnen auch fremde Antworten */
export async function updatePost(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireMember();
  const postId = uuid.safeParse(formData.get("postId"));
  const parsed = replySchema.safeParse({ threadId: formData.get("threadId"), body: formData.get("body") });
  if (!postId.success || !parsed.success) {
    return { status: "error", message: parsed.success ? club.errors.generic : (parsed.error.issues[0]?.message ?? club.errors.validation) };
  }
  const db = viewer.isAdmin ? supabaseAdmin() : await supabaseServer();
  const { data, error } = await db
    .from("forum_posts")
    .update({ body: parsed.data.body, edited_at: new Date().toISOString() })
    .eq("id", postId.data)
    .eq("thread_id", parsed.data.threadId)
    .select("id");
  if (error || !data?.length) {
    if (error) console.error("Antwort bearbeiten:", error.message);
    return { status: "error", message: club.errors.generic };
  }
  revalidateForum(parsed.data.threadId);
  redirect(`/club/forum/${parsed.data.threadId}#beitrag-${postId.data}`);
}

/** Lösung markieren oder zurücknehmen: die Autorin der Frage oder eine Moderatorin */
export async function setSolution(threadId: string, postId: string | null): Promise<void> {
  const viewer = await requireMember();
  if (!uuid.safeParse(threadId).success || (postId !== null && !uuid.safeParse(postId).success)) return;
  const db = supabaseAdmin();
  const { data: thread } = await db.from("forum_threads").select("author_id, kind").eq("id", threadId).maybeSingle();
  if (!thread || thread.kind !== "frage") return;
  if (thread.author_id !== viewer.userId && !viewer.isAdmin) return;
  if (postId) {
    const { data: post } = await db.from("forum_posts").select("id").eq("id", postId).eq("thread_id", threadId).eq("status", "approved").maybeSingle();
    if (!post) return;
  }
  const { error } = await db.from("forum_threads").update({ solved_post_id: postId }).eq("id", threadId);
  if (error) console.error("Lösung:", error.message);
  revalidateForum(threadId);
}

// ---------------------------------------------------------------------------
// Moderation (nur Admins). Auch aus dem Backend unter /club/admin/forum genutzt.
// ---------------------------------------------------------------------------

async function moderateThread(threadId: string, update: Record<string, unknown>) {
  await requireAdmin();
  if (!uuid.safeParse(threadId).success) return;
  const { error } = await supabaseAdmin().from("forum_threads").update(update).eq("id", threadId);
  if (error) console.error("Moderation:", error.message);
  revalidateForum(threadId);
}

export async function setThreadStatus(threadId: string, status: "approved" | "hidden"): Promise<void> {
  await moderateThread(threadId, { status });
}

export async function toggleThreadPin(threadId: string, pinned: boolean): Promise<void> {
  await moderateThread(threadId, { pinned });
}

export async function toggleThreadLock(threadId: string, locked: boolean): Promise<void> {
  await moderateThread(threadId, { locked });
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
  const db = supabaseAdmin();
  const { error } = await db.from("forum_posts").update({ status }).eq("id", postId);
  // Eine ausgeblendete Antwort kann keine Lösung sein
  if (status === "hidden") await db.from("forum_threads").update({ solved_post_id: null }).eq("solved_post_id", postId);
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

// ---------------------------------------------------------------------------
// Kategorien (nur Admins)
// ---------------------------------------------------------------------------

const categorySchema = z.object({
  name: z.string().trim().min(2, "Bitte einen Namen angeben.").max(60),
  description: z.string().trim().max(200),
  sort: z.coerce.number().int().min(0).max(999),
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = formData.get("id");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    sort: formData.get("sort") || 50,
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? club.errors.validation };
  const db = supabaseAdmin();
  const { error } =
    typeof id === "string" && uuid.safeParse(id).success
      ? await db.from("forum_categories").update(parsed.data).eq("id", id)
      : await db.from("forum_categories").insert({ ...parsed.data, slug: slugify(parsed.data.name) });
  if (error) {
    return { status: "error", message: error.code === "23505" ? "Diese Kategorie gibt es schon." : club.errors.generic };
  }
  revalidateForum();
  return { status: "ok", message: "Gespeichert." };
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return;
  // Kategorien mit Themen bleiben bestehen (Fremdschlüssel "restrict"), erst Themen verschieben
  const { error } = await supabaseAdmin().from("forum_categories").delete().eq("id", id);
  if (error) console.error("Kategorie löschen:", error.message);
  revalidateForum();
}
