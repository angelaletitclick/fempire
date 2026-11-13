import Link from "next/link";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { PageHead, Tag } from "@/components/club/PageHead";
import { PlainText } from "@/components/ui/RichText";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatShort } from "@/lib/time";
import { ActionForm } from "@/components/club/ActionForm";
import { TextField } from "@/components/club/fields";
import type { ForumCategory } from "@/lib/forum";
import { deleteCategory, deletePost, deleteThread, saveCategory, setPostStatus, setThreadStatus } from "../../forum/actions";

type Thread = { id: string; title: string; body: string; status: string; created_at: string; author: { full_name: string } | null };
type Post = { id: string; thread_id: string; body: string; status: string; created_at: string; author: { full_name: string } | null; thread: { title: string } | null };

export default async function AdminForumPage() {
  await requireAdmin();
  const db = supabaseAdmin();
  const [{ data: pendingData }, { data: postsData }, { data: categoryData }, { data: countData }] = await Promise.all([
    db
      .from("forum_threads")
      .select("id, title, body, status, created_at, author:members!forum_threads_author_id_fkey(full_name)")
      .in("status", ["pending", "hidden"])
      .order("created_at", { ascending: false }),
    db
      .from("forum_posts")
      .select("id, thread_id, body, status, created_at, author:members!forum_posts_author_id_fkey(full_name), thread:forum_threads!forum_posts_thread_id_fkey(title)")
      .order("created_at", { ascending: false })
      .limit(30),
    db.from("forum_categories").select("id, slug, name, description, sort").order("sort"),
    db.from("forum_threads").select("category_id"),
  ]);
  const categories = (categoryData ?? []) as ForumCategory[];
  const threadCount = new Map<string, number>();
  for (const row of (countData ?? []) as Array<{ category_id: string }>) threadCount.set(row.category_id, (threadCount.get(row.category_id) ?? 0) + 1);
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

      <section className="mt-14">
        <h2 className="label text-white">Kategorien</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-light">
          Reihenfolge über die Zahl (kleiner steht weiter oben). Löschen geht nur bei Kategorien ohne Themen.
        </p>
        <ul className="mt-4 grid gap-3">
          {categories.map((category) => (
            <li key={category.id} className="card p-5">
              <ActionForm action={saveCategory} submitLabel="Speichern" variant="outline" className="lg:grid-cols-[1fr_2fr_6rem_auto] lg:items-end">
                <input type="hidden" name="id" value={category.id} />
                <TextField name="name" label="Name" defaultValue={category.name} maxLength={60} />
                <TextField name="description" label="Beschreibung" defaultValue={category.description} optional maxLength={200} />
                <TextField name="sort" label="Reihenfolge" defaultValue={String(category.sort)} inputMode="numeric" />
              </ActionForm>
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-light">
                <span>{threadCount.get(category.id) ?? 0} Themen</span>
                {(threadCount.get(category.id) ?? 0) === 0 ? (
                  <form action={deleteCategory.bind(null, category.id)}>
                    <ConfirmButton variant="link" confirm={`Kategorie „${category.name}“ löschen?`}>
                      Löschen
                    </ConfirmButton>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 max-w-2xl border border-white p-5">
          <h3 className="label text-white">Neue Kategorie</h3>
          <ActionForm action={saveCategory} submitLabel="Anlegen" resetOnSuccess className="mt-4">
            <TextField name="name" label="Name" maxLength={60} />
            <TextField name="description" label="Beschreibung" optional maxLength={200} />
            <TextField name="sort" label="Reihenfolge" defaultValue="50" inputMode="numeric" />
          </ActionForm>
        </div>
      </section>
    </div>
  );
}
