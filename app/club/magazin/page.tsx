import Link from "next/link";
import { PageHead, Tag } from "@/components/club/PageHead";
import { ArticleList } from "@/components/sections/Magazin";
import { ButtonLink } from "@/components/ui/Button";
import { magazin } from "@/content/magazin";
import { requireMember } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { publishedArticles } from "@/lib/articles";

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
  const articles = await publishedArticles();
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

      <div className="mt-12">
        <ArticleList articles={articles} hrefBase="/club/magazin" />
      </div>

      {viewer.isAdmin && published.length ? (
        <section aria-labelledby="verwalten" className="mt-14">
          <h2 id="verwalten" className="label text-white">
            Veröffentlichte Artikel bearbeiten
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {published.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-x-5 gap-y-1 py-3 md:px-4">
                <span className="min-w-0 flex-1 text-white">{row.title}</span>
                <Link href={`/club/admin/magazin/${row.id}`} className="label hover:text-white">
                  Bearbeiten
                </Link>
                <Link href={`/magazin/${row.slug}`} className="label hover:text-white">
                  Öffentliche Ansicht
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
