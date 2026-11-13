import Link from "next/link";
import { PageHead, Tag } from "@/components/club/PageHead";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { magazin } from "@/content/magazin";
import { requireMember } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/time";

export const metadata = { title: "Magazin" };

type Row = {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  topic: string;
  author: string;
  paid: boolean;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};

/**
 * Magazin im Mitgliederbereich: alle Artikel vollständig lesbar.
 * Admins sehen zusätzlich Entwürfe und können schreiben und bearbeiten.
 */
export default async function ClubMagazinPage() {
  const viewer = await requireMember();
  let query = supabaseAdmin()
    .from("articles")
    .select("id, slug, title, teaser, topic, author, paid, status, published_at, updated_at")
    .order("published_at", { ascending: false, nullsFirst: true });
  if (!viewer.isAdmin) query = query.eq("status", "published");
  const { data } = await query;
  const rows = (data ?? []) as Row[];
  const drafts = rows.filter((row) => row.status === "draft");
  const published = rows.filter((row) => row.status === "published");

  return (
    <div className="container-site py-section">
      <PageHead
        label={magazin.label}
        headline={magazin.headline}
        intro="Alle Artikel, auch die nur für Mitglieder, vollständig lesbar."
        actions={viewer.isAdmin ? <ButtonLink href="/club/admin/magazin/neu">Neuer Artikel</ButtonLink> : undefined}
      />

      {viewer.isAdmin && drafts.length ? (
        <section aria-labelledby="entwuerfe" className="mt-12">
          <h2 id="entwuerfe" className="label text-white">
            Entwürfe ({drafts.length})
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {drafts.map((row) => (
              <li key={row.id}>
                <Link href={`/club/admin/magazin/${row.id}`} className="flex flex-wrap items-center gap-3 py-4 hover:bg-surface md:px-4">
                  <span className="min-w-0 flex-1 font-semibold text-white">{row.title}</span>
                  <Tag>Entwurf</Tag>
                  <span className="label">Bearbeiten</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {published.length === 0 ? (
        <p className="mt-12 border border-line p-6 text-slate-light">{magazin.empty}</p>
      ) : (
        <ul className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {published.map((row) => (
            <li key={row.id} className="card flex flex-col">
              <Link href={`/club/magazin/${row.slug}`} className="group flex flex-1 flex-col p-6 md:p-8">
                <p className="label flex flex-wrap gap-x-3">
                  {row.topic ? <span className="text-white">{row.topic}</span> : null}
                  {row.published_at ? <time dateTime={row.published_at}>{formatDate(row.published_at)}</time> : null}
                  {row.paid ? <span>{magazin.paidLabel}</span> : null}
                </p>
                <h2 className="headline mt-6 text-xl leading-tight md:text-2xl">{row.title}</h2>
                <p className="mt-4 flex-1 text-base leading-relaxed text-slate-light">{row.teaser}</p>
                <p className="label mt-6 flex items-center gap-2 text-white group-hover:underline">
                  {magazin.readMore}
                  <Arrow />
                </p>
              </Link>
              {viewer.isAdmin ? (
                <div className="flex gap-5 border-t border-line px-6 py-3 md:px-8">
                  <Link href={`/club/admin/magazin/${row.id}`} className="label hover:text-white">
                    Bearbeiten
                  </Link>
                  <Link href={`/magazin/${row.slug}`} className="label hover:text-white">
                    Öffentliche Ansicht
                  </Link>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
