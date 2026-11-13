import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Avatar } from "@/components/club/Avatar";
import { ThreadTags } from "@/components/club/ForumBits";
import { PageHead } from "@/components/club/PageHead";
import { ButtonLink } from "@/components/ui/Button";
import { club } from "@/content/club";
import { requireMember } from "@/lib/auth";
import { cleanSearch, THREAD_FILTERS, THREAD_LIST_SELECT, type ForumCategory, type ThreadFilter, type ThreadListItem } from "@/lib/forum";
import { cx } from "@/lib/cx";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { formatShort } from "@/lib/time";

export const metadata = { title: "Forum" };

export default async function ForumPage({ searchParams }: PageProps<"/club/forum">) {
  const viewer = await requireMember();
  const t = club.forum;
  const params = await searchParams;
  const q = cleanSearch(params.q);
  const filter: ThreadFilter = THREAD_FILTERS.includes(params.filter as ThreadFilter) ? (params.filter as ThreadFilter) : "alle";

  // Moderatorinnen sehen auch Themen, die auf Freigabe warten
  const db: SupabaseClient = viewer.isAdmin ? supabaseAdmin() : await supabaseServer();
  const { data: categoryData } = await db.from("forum_categories").select("id, slug, name, description, sort").order("sort");
  const categories = (categoryData ?? []) as ForumCategory[];
  const active = categories.find((category) => category.slug === params.kategorie);

  let query = db
    .from("forum_threads")
    .select(THREAD_LIST_SELECT)
    .order("pinned", { ascending: false })
    .order("last_activity_at", { ascending: false })
    .limit(100);
  if (viewer.isAdmin) query = query.neq("status", "hidden");
  if (active) query = query.eq("category_id", active.id);
  if (q) query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
  if (filter === "fragen") query = query.eq("kind", "frage");
  if (filter === "offen") query = query.eq("kind", "frage").is("solved_post_id", null);
  if (filter === "diskussionen") query = query.eq("kind", "diskussion");
  const { data } = await query;
  const threads = (data ?? []) as unknown as ThreadListItem[];

  // Zahlen pro Kategorie (nur freigegebene Themen)
  const { data: statData } = await db.from("forum_threads").select("category_id, last_activity_at").eq("status", "approved");
  const stats = new Map<string, { count: number; last: string }>();
  for (const row of (statData ?? []) as Array<{ category_id: string; last_activity_at: string }>) {
    const entry = stats.get(row.category_id) ?? { count: 0, last: "" };
    entry.count += 1;
    if (row.last_activity_at > entry.last) entry.last = row.last_activity_at;
    stats.set(row.category_id, entry);
  }

  const link = (next: { kategorie?: string; filter?: string; q?: string }) => {
    const sp = new URLSearchParams();
    const kategorie = "kategorie" in next ? next.kategorie : active?.slug;
    const f = "filter" in next ? next.filter : filter;
    const search = "q" in next ? next.q : q;
    if (kategorie) sp.set("kategorie", kategorie);
    if (f && f !== "alle") sp.set("filter", f);
    if (search) sp.set("q", search);
    const s = sp.toString();
    return s ? `/club/forum?${s}` : "/club/forum";
  };

  return (
    <div className="container-site py-section">
      <PageHead
        label={active ? `${t.label} · ${active.name}` : t.label}
        headline={active ? `${active.name}.` : t.headline}
        intro={active?.description || t.intro}
        actions={<ButtonLink href={active ? `/club/forum/neu?kategorie=${active.slug}` : "/club/forum/neu"}>{t.newThread}</ButtonLink>}
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        {/* Themenliste */}
        <section aria-labelledby="themen" className="lg:col-span-8">
          <form action="/club/forum" role="search" className="flex gap-2">
            {active ? <input type="hidden" name="kategorie" value={active.slug} /> : null}
            {filter !== "alle" ? <input type="hidden" name="filter" value={filter} /> : null}
            <label htmlFor="forum-q" className="sr-only">
              {t.searchLabel}
            </label>
            <input
              id="forum-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder={t.searchPlaceholder}
              className="h-12 min-w-0 flex-1 border border-line bg-plum px-4 text-base text-white placeholder:text-slate focus:border-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
            />
            <button type="submit" className="label h-12 border border-white/40 px-5 text-white hover:border-pink hover:bg-pink">
              {t.search}
            </button>
          </form>

          <nav aria-label="Filter" className="mt-4 flex flex-wrap gap-2">
            {THREAD_FILTERS.map((value) => (
              <Link
                key={value}
                href={link({ filter: value })}
                aria-current={filter === value ? "page" : undefined}
                className={cx("label border px-3 py-2", filter === value ? "border-white bg-white text-plum" : "border-line hover:text-white")}
              >
                {t.filters[value]}
              </Link>
            ))}
          </nav>

          <h2 id="themen" className="label mt-10 text-white">
            {active ? active.name : t.latest}
            {q ? ` · „${q}“` : ""}
          </h2>

          {threads.length === 0 ? (
            <p className="mt-4 border border-line p-6 text-slate-light">{q || active || filter !== "alle" ? t.emptyFilter : t.empty}</p>
          ) : (
            <ul className="mt-4 border-t border-line">
              <li aria-hidden="true" className="hidden grid-cols-12 gap-4 border-b border-line py-3 md:grid">
                <span className="label col-span-7">{t.columns.topic}</span>
                <span className="label col-span-2 text-center">{t.columns.replies}</span>
                <span className="label col-span-3">{t.columns.last}</span>
              </li>
              {threads.map((thread) => {
                const replies = thread.posts[0]?.count ?? 0;
                return (
                  <li key={thread.id} className="border-b border-line">
                    <Link href={`/club/forum/${thread.id}`} className="grid grid-cols-12 items-center gap-4 py-5 transition-colors hover:bg-surface md:px-2">
                      <span className="col-span-12 flex min-w-0 items-start gap-4 md:col-span-7">
                        {thread.author ? <Avatar member={thread.author} size="sm" /> : null}
                        <span className="min-w-0">
                          <ThreadTags thread={thread} />
                          <span className="mt-2 block text-lg font-semibold leading-snug text-white">{thread.title}</span>
                          <span className="mt-1 block text-sm text-slate-light">
                            {thread.category?.name} · {t.by} {thread.author?.full_name} · {formatShort(thread.created_at)}
                          </span>
                        </span>
                      </span>
                      <span className="col-span-4 text-sm text-slate-light md:col-span-2 md:text-center">
                        <span className="headline text-xl text-white tabular-nums md:block">{replies}</span>
                        <span className="ml-2 md:hidden">{t.columns.replies}</span>
                      </span>
                      <span className="col-span-8 text-sm text-slate-light md:col-span-3">
                        {replies > 0 && thread.last_author ? (
                          <>
                            <span className="block text-white">{thread.last_author.full_name}</span>
                            {formatShort(thread.last_activity_at)}
                          </>
                        ) : (
                          t.noRepliesYet
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Kategorien und Spielregeln */}
        <aside className="grid content-start gap-4 lg:col-span-4">
          <nav aria-labelledby="kategorien" className="card p-6">
            <h2 id="kategorien" className="label text-white">
              {t.categories}
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              <li>
                <Link
                  href={link({ kategorie: undefined })}
                  aria-current={!active ? "page" : undefined}
                  className={cx("flex items-baseline justify-between gap-3 py-3 hover:text-white", !active ? "text-white" : "text-slate-light")}
                >
                  <span className={!active ? "font-semibold" : undefined}>{t.allCategories}</span>
                </Link>
              </li>
              {categories.map((category) => {
                const stat = stats.get(category.id);
                const current = active?.id === category.id;
                return (
                  <li key={category.id}>
                    <Link
                      href={link({ kategorie: category.slug })}
                      aria-current={current ? "page" : undefined}
                      className={cx("block py-3 hover:text-white", current ? "text-white" : "text-slate-light")}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={current ? "font-semibold" : undefined}>{category.name}</span>
                        <span className="label tabular-nums">{stat?.count ?? 0}</span>
                      </span>
                      {stat?.last ? <span className="mt-0.5 block text-xs text-slate">zuletzt {formatShort(stat.last)}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <section aria-labelledby="regeln" className="border border-line p-6">
            <h2 id="regeln" className="label text-white">
              {t.rulesTitle}
            </h2>
            <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-slate-light">
              {t.rules.map((rule) => (
                <li key={rule} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-white" />
                  {rule}
                </li>
              ))}
              <li className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-white" />
                {t.approvalNote}
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
