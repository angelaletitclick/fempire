import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/ui/Markdown";
import { SectionLabel } from "@/components/ui/Section";
import { magazin } from "@/content/magazin";
import { publishedArticle } from "@/lib/articles";
import { requireMember } from "@/lib/auth";
import { formatDate } from "@/lib/time";

export const metadata = { title: "Magazin" };

/** Artikel im Mitgliederbereich, immer vollständig */
export default async function ClubArticlePage({ params }: PageProps<"/club/magazin/[slug]">) {
  const { slug } = await params;
  const viewer = await requireMember();
  const article = await publishedArticle(slug);
  if (!article) notFound();

  return (
    <article className="container-site py-section">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/club/magazin" className="label hover:text-white">
          {magazin.backLink}
        </Link>
        {viewer.isAdmin ? (
          <Link href={`/club/admin/magazin/${article.id}`} className="label text-white underline underline-offset-4">
            Bearbeiten
          </Link>
        ) : null}
      </div>
      <div className="mt-10">
        <SectionLabel index="M" label={article.paid ? `${article.topic || magazin.label} · ${magazin.paidLabel}` : article.topic || magazin.label} />
      </div>
      <h1 className="headline mt-6 max-w-[22ch] text-[2.25rem] leading-[1.1] [hyphens:auto] sm:text-5xl">{article.title}</h1>
      <p className="label mt-6 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          {magazin.byLabel} <span className="text-white">{article.author}</span>
        </span>
        <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
      </p>
      {article.teaser ? <p className="prose-width mt-10 text-xl leading-relaxed text-white">{article.teaser}</p> : null}
      <div className="prose-width mt-10 border-t border-line pt-10 text-lg leading-relaxed text-slate-light">
        <Markdown text={article.body} />
      </div>
    </article>
  );
}
