import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/club/ActionForm";
import { Avatar } from "@/components/club/Avatar";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { TextAreaField } from "@/components/club/fields";
import { Tag } from "@/components/club/PageHead";
import { PlainText } from "@/components/ui/RichText";
import { club } from "@/content/club";
import { requireMember, type Member } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { formatShort } from "@/lib/time";
import { createReply, deletePost, deleteThread, setPostStatus, setThreadStatus, toggleThreadPin } from "../actions";

export const metadata = { title: "Forum" };

type Author = Pick<Member, "user_id" | "full_name" | "avatar_path" | "updated_at" | "company">;
type Thread = {
  id: string;
  title: string;
  body: string;
  status: "pending" | "approved" | "hidden";
  pinned: boolean;
  created_at: string;
  author: Author | null;
};
type Post = { id: string; body: string; status: "approved" | "hidden"; created_at: string; author: Author | null };

const AUTHOR = "author:members(user_id, full_name, avatar_path, updated_at, company)";

export default async function ThreadPage({ params }: PageProps<"/club/forum/[id]">) {
  const { id } = await params;
  const viewer = await requireMember();
  const t = club.forum;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  // Admins sehen auch ausgeblendete Beiträge, um sie wiederherzustellen
  const db: SupabaseClient = viewer.isAdmin ? supabaseAdmin() : await supabaseServer();
  const [{ data: thread }, { data: postsData }] = await Promise.all([
    db.from("forum_threads").select(`id, title, body, status, pinned, created_at, ${AUTHOR}`).eq("id", id).maybeSingle(),
    db.from("forum_posts").select(`id, body, status, created_at, ${AUTHOR}`).eq("thread_id", id).order("created_at"),
  ]);
  if (!thread) notFound();
  const th = thread as unknown as Thread;
  const posts = (postsData ?? []) as unknown as Post[];

  return (
    <div className="container-site max-w-4xl py-section">
      <Link href="/club/forum" className="label hover:text-white">
        {t.back}
      </Link>

      <article className="mt-8">
        <p className="flex flex-wrap gap-2">
          {th.pinned ? <Tag tone="white">{t.pinned}</Tag> : null}
          {th.status === "pending" ? <Tag>{t.pending}</Tag> : null}
          {th.status === "hidden" ? <Tag tone="pink">{t.hidden}</Tag> : null}
        </p>
        <h1 className="headline mt-4 text-[2rem] leading-[1.1] [hyphens:auto] sm:text-4xl">{th.title}</h1>
        <Byline author={th.author} date={th.created_at} />
        <PlainText text={th.body} className="mt-6 text-lg leading-relaxed text-white" />

        {viewer.isAdmin ? (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
            {th.status !== "approved" ? (
              <form action={setThreadStatus.bind(null, th.id, "approved")}>
                <ConfirmButton variant="primary">Freigeben</ConfirmButton>
              </form>
            ) : (
              <form action={setThreadStatus.bind(null, th.id, "hidden")}>
                <ConfirmButton>Ausblenden</ConfirmButton>
              </form>
            )}
            <form action={toggleThreadPin.bind(null, th.id, !th.pinned)}>
              <ConfirmButton>{th.pinned ? "Lösen" : "Anheften"}</ConfirmButton>
            </form>
            <form action={deleteThread.bind(null, th.id)}>
              <ConfirmButton confirm="Thema mit allen Antworten endgültig löschen?">Löschen</ConfirmButton>
            </form>
          </div>
        ) : null}
      </article>

      <section aria-labelledby="replies" className="mt-14">
        <h2 id="replies" className="label text-white">
          {t.replies} ({posts.filter((post) => post.status === "approved").length})
        </h2>
        {posts.length === 0 ? (
          <p className="mt-4 text-slate-light">{t.noReplies}</p>
        ) : (
          <ol className="mt-4 divide-y divide-line border-y border-line">
            {posts.map((post) => (
              <li key={post.id} className={post.status === "hidden" ? "py-6 opacity-60" : "py-6"}>
                <div className="flex items-start gap-4">
                  {post.author ? <Avatar member={post.author} size="sm" /> : null}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-light">
                      <span className="font-semibold text-white">{post.author?.full_name}</span> · {formatShort(post.created_at)}
                      {post.status === "hidden" ? <span className="ml-2"><Tag tone="pink">{t.hidden}</Tag></span> : null}
                    </p>
                    <PlainText text={post.body} className="mt-2 text-base leading-relaxed text-white" />
                    {viewer.isAdmin ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <form action={setPostStatus.bind(null, post.id, th.id, post.status === "hidden" ? "approved" : "hidden")}>
                          <ConfirmButton>{post.status === "hidden" ? "Einblenden" : "Ausblenden"}</ConfirmButton>
                        </form>
                        <form action={deletePost.bind(null, post.id, th.id)}>
                          <ConfirmButton confirm="Antwort endgültig löschen?">Löschen</ConfirmButton>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        {th.status === "approved" ? (
          <ActionForm action={createReply} submitLabel={t.reply} pendingLabel="Wird gesendet" resetOnSuccess className="mt-8">
            <input type="hidden" name="threadId" value={th.id} />
            <TextAreaField name="body" label={t.replyLabel} maxLength={10000} rows={5} />
          </ActionForm>
        ) : null}
      </section>
    </div>
  );
}

function Byline({ author, date }: { author: Author | null; date: string }) {
  return (
    <div className="mt-6 flex items-center gap-4">
      {author ? <Avatar member={author} size="sm" /> : null}
      <p className="text-sm text-slate-light">
        {author ? (
          <Link href={`/club/mitglieder/${author.user_id}`} className="font-semibold text-white hover:underline">
            {author.full_name}
          </Link>
        ) : null}
        {author?.company ? ` · ${author.company}` : ""} · {formatShort(date)}
      </p>
    </div>
  );
}
