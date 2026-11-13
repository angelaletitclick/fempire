import Link from "next/link";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { PageHead, Tag } from "@/components/club/PageHead";
import { PlainText } from "@/components/ui/RichText";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatShort } from "@/lib/time";
import { deletePost, deleteThread, setPostStatus, setThreadStatus } from "../../forum/actions";

type Thread = { id: string; title: string; body: string; status: string; created_at: string; author: { full_name: string } | null };
type Post = { id: string; thread_id: string; body: string; status: string; created_at: string; author: { full_name: string } | null; thread: { title: string } | null };

export default async function AdminForumPage() {
  await requireAdmin();
  const db = supabaseAdmin();
  const [{ data: pendingData }, { data: postsData }] = await Promise.all([
    db
      .from("forum_threads")
      .select("id, title, body, status, created_at, author:members(full_name)")
      .in("status", ["pending", "hidden"])
      .order("created_at", { ascending: false }),
    db
      .from("forum_posts")
      .select("id, thread_id, body, status, created_at, author:members(full_name), thread:forum_threads(title)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  const threads = (pendingData ?? []) as unknown as Thread[];
  const posts = (postsData ?? []) as unknown as Post[];

  return (
    <div className="container-site py-section">
      <PageHead
        label="Backend"
        headline="Forum."
        intro="Neue Themen erscheinen erst nach eurer Freigabe. Antworten sind sofort sichtbar, ihr könnt sie ausblenden oder löschen."
        actions={
          <Link href="/club/forum" className="label text-white underline underline-offset-4">
            Zum Forum
          </Link>
        }
      />

      <section className="mt-12">
        <h2 className="label text-white">Themen zur Freigabe und ausgeblendet ({threads.length})</h2>
        {threads.length === 0 ? (
          <p className="mt-4 border border-line p-6 text-slate-light">Nichts offen.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {threads.map((thread) => (
              <li key={thread.id} className={thread.status === "pending" ? "border border-white p-5" : "card p-5"}>
                <p className="flex flex-wrap items-center gap-2">
                  <Tag tone={thread.status === "pending" ? "white" : "pink"}>{thread.status === "pending" ? "Wartet" : "Ausgeblendet"}</Tag>
                  <span className="label">
                    {thread.author?.full_name} · {formatShort(thread.created_at)}
                  </span>
                </p>
                <Link href={`/club/forum/${thread.id}`} className="mt-3 block text-lg font-semibold text-white hover:underline">
                  {thread.title}
                </Link>
                <PlainText text={thread.body.length > 600 ? `${thread.body.slice(0, 600)} …` : thread.body} className="mt-2 text-base text-slate-light" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={setThreadStatus.bind(null, thread.id, "approved")}>
                    <ConfirmButton variant="primary">Freigeben</ConfirmButton>
                  </form>
                  {thread.status === "pending" ? (
                    <form action={setThreadStatus.bind(null, thread.id, "hidden")}>
                      <ConfirmButton>Ausblenden</ConfirmButton>
                    </form>
                  ) : null}
                  <form action={deleteThread.bind(null, thread.id)}>
                    <ConfirmButton confirm="Thema endgültig löschen?">Löschen</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h2 className="label text-white">Neueste Antworten</h2>
        {posts.length === 0 ? (
          <p className="mt-4 border border-line p-6 text-slate-light">Noch keine Antworten.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {posts.map((post) => (
              <li key={post.id} className={post.status === "hidden" ? "py-4 opacity-60" : "py-4"}>
                <p className="text-sm text-slate-light">
                  <span className="font-semibold text-white">{post.author?.full_name}</span> in{" "}
                  <Link href={`/club/forum/${post.thread_id}`} className="text-white underline underline-offset-4">
                    {post.thread?.title}
                  </Link>{" "}
                  · {formatShort(post.created_at)}
                  {post.status === "hidden" ? " · ausgeblendet" : ""}
                </p>
                <PlainText text={post.body.length > 400 ? `${post.body.slice(0, 400)} …` : post.body} className="mt-2 text-base text-white" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={setPostStatus.bind(null, post.id, post.thread_id, post.status === "hidden" ? "approved" : "hidden")}>
                    <ConfirmButton>{post.status === "hidden" ? "Einblenden" : "Ausblenden"}</ConfirmButton>
                  </form>
                  <form action={deletePost.bind(null, post.id, post.thread_id)}>
                    <ConfirmButton confirm="Antwort endgültig löschen?">Löschen</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
