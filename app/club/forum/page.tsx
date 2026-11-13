import Link from "next/link";
import { Avatar } from "@/components/club/Avatar";
import { PageHead, Tag } from "@/components/club/PageHead";
import { ButtonLink } from "@/components/ui/Button";
import { club } from "@/content/club";
import { requireMember, type Member } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { formatShort } from "@/lib/time";

export const metadata = { title: "Forum" };

type ThreadRow = {
  id: string;
  title: string;
  status: "pending" | "approved" | "hidden";
  pinned: boolean;
  last_activity_at: string;
  author: Pick<Member, "user_id" | "full_name" | "avatar_path" | "updated_at"> | null;
  forum_posts: Array<{ count: number }>;
};

export default async function ForumPage() {
  await requireMember();
  const t = club.forum;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("forum_threads")
    .select("id, title, status, pinned, last_activity_at, author:members(user_id, full_name, avatar_path, updated_at), forum_posts(count)")
    .order("pinned", { ascending: false })
    .order("last_activity_at", { ascending: false })
    .limit(100);
  const threads = (data ?? []) as unknown as ThreadRow[];

  return (
    <div className="container-site py-section">
      <PageHead
        label={t.label}
        headline={t.headline}
        intro={t.intro}
        actions={<ButtonLink href="/club/forum/neu">{t.newThread}</ButtonLink>}
      />

      {threads.length === 0 ? (
        <p className="mt-12 border border-line p-6 text-slate-light">{t.empty}</p>
      ) : (
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {threads.map((thread) => (
            <li key={thread.id}>
              <Link href={`/club/forum/${thread.id}`} className="flex items-center gap-4 py-5 transition-colors hover:bg-surface md:gap-6 md:px-4">
                {thread.author ? <Avatar member={thread.author} size="sm" /> : null}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    {thread.pinned ? <Tag tone="white">{t.pinned}</Tag> : null}
                    {thread.status === "pending" ? <Tag>{t.pending}</Tag> : null}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">{thread.title}</p>
                  <p className="mt-1 text-sm text-slate-light">
                    {thread.author?.full_name} · {formatShort(thread.last_activity_at)}
                  </p>
                </div>
                <p className="label shrink-0 text-right tabular-nums">
                  {thread.forum_posts[0]?.count ?? 0}
                  <span className="block">{t.replies}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
