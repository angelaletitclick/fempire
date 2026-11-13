import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ActionForm } from "@/components/club/ActionForm";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { TextAreaField } from "@/components/club/fields";
import { AuthorCard, ThreadTags } from "@/components/club/ForumBits";
import { Tag } from "@/components/club/PageHead";
import { PlainText } from "@/components/ui/RichText";
import { club } from "@/content/club";
import { requireMember } from "@/lib/auth";
import { POST_SELECT, THREAD_SELECT, type ForumCategory, type Post, type Thread } from "@/lib/forum";
import { cx } from "@/lib/cx";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { formatShort } from "@/lib/time";
import {
  createReply,
  deletePost,
  deleteThread,
  setPostStatus,
  setSolution,
  setThreadStatus,
  toggleThreadLock,
  toggleThreadPin,
  updatePost,
} from "../actions";
import { ThreadForm } from "../ThreadForm";

export const metadata = { title: "Forum" };

const t = club.forum;

export default async function ThreadPage({ params, searchParams }: PageProps<"/club/forum/[id]">) {
  const { id } = await params;
  const { bearbeiten } = await searchParams;
  const viewer = await requireMember();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  // Moderatorinnen sehen auch ausgeblendete Beiträge, um sie wiederherzustellen
  const db: SupabaseClient = viewer.isAdmin ? supabaseAdmin() : await supabaseServer();
  const [{ data: threadData }, { data: postsData }] = await Promise.all([
    db.from("forum_threads").select(THREAD_SELECT).eq("id", id).maybeSingle(),
    db.from("forum_posts").select(POST_SELECT).eq("thread_id", id).order("created_at"),
  ]);
  if (!threadData) notFound();
  const thread = threadData as unknown as Thread;
  const posts = (postsData ?? []) as unknown as Post[];

  const isAuthor = thread.author?.user_id === viewer.userId;
  const canEditThread = viewer.isAdmin || (isAuthor && thread.status !== "hidden");
  const canMarkSolution = thread.kind === "frage" && (isAuthor || viewer.isAdmin);
  const canReply = thread.status === "approved" && !thread.locked;
  const visibleReplies = posts.filter((post) => post.status === "approved").length;

  // Bearbeiten-Modus: ?bearbeiten=thema oder ?bearbeiten=<Antwort-ID>
  if (bearbeiten === "thema" && canEditThread) {
    const { data } = await db.from("forum_categories").select("id, slug, name, description, sort").order("sort");
    return (
      <div className="container-site max-w-3xl py-section">
        <Link href={`/club/forum/${thread.id}`} className="label hover:text-white">
          {t.cancel}
        </Link>
        <h1 className="headline mt-8 text-[2rem] leading-[1.1] sm:text-4xl">{t.edit}</h1>
        <ThreadForm
          categories={(data ?? []) as ForumCategory[]}
          thread={{ id: thread.id, title: thread.title, body: thread.body, category_id: thread.category_id, kind: thread.kind }}
          submitLabel={t.save}
        />
      </div>
    );
  }

  return (
    <div className="container-site py-section">
      {/* Brotkrumen */}
      <nav aria-label="Pfad" className="label flex flex-wrap items-center gap-2">
        <Link href="/club/forum" className="hover:text-white">
          {t.label}
        </Link>
        <span aria-hidden="true">/</span>
        {thread.category ? (
          <Link href={`/club/forum?kategorie=${thread.category.slug}`} className="hover:text-white">
            {thread.category.name}
          </Link>
        ) : null}
      </nav>

      <header className="mt-8 max-w-4xl">
        <ThreadTags thread={thread} />
        <h1 className="headline mt-4 text-[2rem] leading-[1.1] [hyphens:auto] sm:text-5xl">{thread.title}</h1>
        <p className="mt-4 text-sm text-slate-light">
          {visibleReplies} {t.replies} · {t.by} {thread.author?.full_name} · {formatShort(thread.created_at)}
          {thread.solved_post_id ? (
            <>
              {" · "}
              <a href={`#beitrag-${thread.solved_post_id}`} className="text-white underline underline-offset-4">
                {t.jumpToSolution}
              </a>
            </>
          ) : null}
        </p>
      </header>

      {thread.status === "pending" ? <Notice>{t.pendingNote}</Notice> : null}

      {viewer.isAdmin ? (
        <section aria-label={t.moderation} className="mt-8 flex flex-wrap items-center gap-2 border border-white p-4">
          <span className="label mr-2 text-white">{t.moderation}</span>
          {thread.status !== "approved" ? (
            <form action={setThreadStatus.bind(null, thread.id, "approved")}>
              <ConfirmButton variant="primary">Freigeben</ConfirmButton>
            </form>
          ) : (
            <form action={setThreadStatus.bind(null, thread.id, "hidden")}>
              <ConfirmButton>Ausblenden</ConfirmButton>
            </form>
          )}
          <form action={toggleThreadPin.bind(null, thread.id, !thread.pinned)}>
            <ConfirmButton>{thread.pinned ? "Lösen" : "Anheften"}</ConfirmButton>
          </form>
          <form action={toggleThreadLock.bind(null, thread.id, !thread.locked)}>
            <ConfirmButton>{thread.locked ? "Wieder öffnen" : "Schließen"}</ConfirmButton>
          </form>
          <form action={deleteThread.bind(null, thread.id)}>
            <ConfirmButton confirm="Thema mit allen Antworten endgültig löschen?">Löschen</ConfirmButton>
          </form>
        </section>
      ) : null}

      <ol className="mt-10 grid gap-3">
        {/* Eröffnungsbeitrag */}
        <PostFrame
          number={1}
          anchor="beitrag-start"
          authorCard={<AuthorCard author={thread.author} />}
          date={thread.created_at}
          editedAt={thread.edited_at}
          highlight={false}
          dimmed={false}
          actions={
            canEditThread ? (
              <Link href={`/club/forum/${thread.id}?bearbeiten=thema`} className="label hover:text-white">
                {t.edit}
              </Link>
            ) : null
          }
        >
          <PlainText text={thread.body} className="text-lg leading-relaxed text-white" />
        </PostFrame>

        {posts.map((post, i) => {
          const isSolution = thread.solved_post_id === post.id;
          const canEditPost = viewer.isAdmin || (post.author?.user_id === viewer.userId && post.status === "approved");
          const editing = bearbeiten === post.id && canEditPost;
          return (
            <PostFrame
              key={post.id}
              number={i + 2}
              anchor={`beitrag-${post.id}`}
              authorCard={<AuthorCard author={post.author} />}
              date={post.created_at}
              editedAt={post.edited_at}
              highlight={isSolution}
              dimmed={post.status === "hidden"}
              badge={isSolution ? <Tag tone="white">✓ {t.solution}</Tag> : post.status === "hidden" ? <Tag tone="pink">{t.hidden}</Tag> : null}
              actions={
                <>
                  {canEditPost && !editing ? (
                    <Link href={`/club/forum/${thread.id}?bearbeiten=${post.id}#beitrag-${post.id}`} className="label hover:text-white">
                      {t.edit}
                    </Link>
                  ) : null}
                  {canMarkSolution && post.status === "approved" ? (
                    <form action={setSolution.bind(null, thread.id, isSolution ? null : post.id)}>
                      <button type="submit" className="label text-white underline-offset-4 hover:underline">
                        {isSolution ? t.unmarkSolution : t.markSolution}
                      </button>
                    </form>
                  ) : null}
                  {viewer.isAdmin ? (
                    <>
                      <form action={setPostStatus.bind(null, post.id, thread.id, post.status === "hidden" ? "approved" : "hidden")}>
                        <button type="submit" className="label hover:text-white">
                          {post.status === "hidden" ? "Einblenden" : "Ausblenden"}
                        </button>
                      </form>
                      <form action={deletePost.bind(null, post.id, thread.id)}>
                        <ConfirmButton variant="link" confirm="Antwort endgültig löschen?">
                          Löschen
                        </ConfirmButton>
                      </form>
                    </>
                  ) : null}
                </>
              }
            >
              {editing ? (
                <ActionForm
                  action={updatePost}
                  submitLabel={t.save}
                  footer={
                    <Link href={`/club/forum/${thread.id}#beitrag-${post.id}`} className="label hover:text-white">
                      {t.cancel}
                    </Link>
                  }
                >
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="hidden" name="threadId" value={thread.id} />
                  <TextAreaField name="body" label={t.replyLabel} defaultValue={post.body} maxLength={10000} rows={6} />
                </ActionForm>
              ) : (
                <PlainText text={post.body} className="text-base leading-relaxed text-white" />
              )}
            </PostFrame>
          );
        })}
      </ol>

      {posts.length === 0 ? <p className="mt-6 text-slate-light">{t.noReplies}</p> : null}

      <section aria-labelledby="antworten" className="mt-12 max-w-4xl">
        {canReply ? (
          <>
            <h2 id="antworten" className="headline text-2xl">
              {t.replyTitle}
            </h2>
            <ActionForm action={createReply} submitLabel={t.reply} pendingLabel="Wird gesendet" resetOnSuccess className="mt-6">
              <input type="hidden" name="threadId" value={thread.id} />
              <TextAreaField name="body" label={t.replyLabel} maxLength={10000} rows={6} />
            </ActionForm>
          </>
        ) : thread.locked ? (
          <Notice>{t.lockedNote}</Notice>
        ) : null}
      </section>
    </div>
  );
}

/** Ein Beitrag: links Autorin, rechts Datum, Nummer, Text und Aktionen */
function PostFrame({
  number,
  anchor,
  authorCard,
  date,
  editedAt,
  highlight,
  dimmed,
  badge,
  actions,
  children,
}: {
  number: number;
  anchor: string;
  authorCard: ReactNode;
  date: string;
  editedAt: string | null;
  highlight: boolean;
  dimmed: boolean;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <li
      id={anchor}
      className={cx(
        "grid scroll-mt-24 gap-5 p-5 md:grid-cols-[12rem_1fr] md:gap-8 md:p-7",
        highlight ? "border-2 border-white bg-surface" : "card",
        dimmed && "opacity-60",
      )}
    >
      <div className="border-b border-line pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">{authorCard}</div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label flex flex-wrap items-center gap-3">
            <time dateTime={date}>{formatShort(date)} Uhr</time>
            {editedAt ? <span className="normal-case tracking-normal text-slate">({t.edited} {formatShort(editedAt)})</span> : null}
            {badge}
          </p>
          <a href={`#${anchor}`} className="label tabular-nums hover:text-white" aria-label={`Beitrag ${number}`}>
            #{number}
          </a>
        </div>
        <div className="mt-4">{children}</div>
        {actions ? <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">{actions}</div> : null}
      </div>
    </li>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="mt-8 flex max-w-4xl items-start gap-3 border border-line px-4 py-3 text-sm text-white">
      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-white" />
      {children}
    </p>
  );
}
