import "server-only";
import type { Member } from "@/lib/auth";

/**
 * Abfragen und Typen fürs Forum. forum_threads hat zwei Verweise auf members (Autorin, letzte
 * Antwort) und zwei Verbindungen zu forum_posts (Antworten, Lösung), deshalb sind die
 * Verknüpfungen ausdrücklich über die Fremdschlüssel benannt.
 */

export type ForumAuthor = Pick<Member, "user_id" | "full_name" | "avatar_path" | "updated_at" | "company" | "role" | "tier" | "created_at">;
export type ForumCategory = { id: string; slug: string; name: string; description: string; sort: number };

export type ThreadStatus = "pending" | "approved" | "hidden";
export type ThreadKind = "frage" | "diskussion";

export type ThreadListItem = {
  id: string;
  title: string;
  kind: ThreadKind;
  status: ThreadStatus;
  pinned: boolean;
  locked: boolean;
  solved_post_id: string | null;
  created_at: string;
  last_activity_at: string;
  category: Pick<ForumCategory, "slug" | "name"> | null;
  author: Pick<ForumAuthor, "user_id" | "full_name" | "avatar_path" | "updated_at"> | null;
  last_author: { full_name: string } | null;
  posts: Array<{ count: number }>;
};

export type Thread = Omit<ThreadListItem, "author" | "posts" | "last_author"> & {
  body: string;
  edited_at: string | null;
  category_id: string;
  author: ForumAuthor | null;
};

export type Post = {
  id: string;
  body: string;
  status: "approved" | "hidden";
  created_at: string;
  edited_at: string | null;
  author: ForumAuthor | null;
};

const AUTHOR_FIELDS = "user_id, full_name, avatar_path, updated_at, company, role, tier, created_at";

export const THREAD_LIST_SELECT = `id, title, kind, status, pinned, locked, solved_post_id, created_at, last_activity_at,
  category:forum_categories(slug, name),
  author:members!forum_threads_author_id_fkey(user_id, full_name, avatar_path, updated_at),
  last_author:members!forum_threads_last_author_id_fkey(full_name),
  posts:forum_posts!forum_posts_thread_id_fkey(count)`;

export const THREAD_SELECT = `id, title, body, kind, status, pinned, locked, solved_post_id, created_at, last_activity_at, edited_at, category_id,
  category:forum_categories(slug, name),
  author:members!forum_threads_author_id_fkey(${AUTHOR_FIELDS})`;

export const POST_SELECT = `id, body, status, created_at, edited_at, author:members!forum_posts_author_id_fkey(${AUTHOR_FIELDS})`;

/** Suchbegriff so bereinigen, dass er den Filter der Datenbankabfrage nicht verändern kann */
export function cleanSearch(value: unknown): string {
  return typeof value === "string" ? value.replace(/[%*,()\\:."']/g, " ").trim().slice(0, 80) : "";
}

export const THREAD_FILTERS = ["alle", "fragen", "offen", "diskussionen"] as const;
export type ThreadFilter = (typeof THREAD_FILTERS)[number];
