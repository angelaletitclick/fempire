import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Section";
import { articleBySlug, articles, formatArticleDate, magazin } from "@/content/magazin";
import { site } from "@/content/site";

// Nur Artikel aus content/magazin.ts, alles andere ergibt 404
export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.teaser,
    alternates: { canonical: `/magazin/${article.slug}` },
    openGraph: { type: "article", publishedTime: article.date, authors: [article.author] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  return (
    <article className="container-site py-section">
      <Link href="/magazin" className="label hover:text-white">
        {magazin.backLink}
      </Link>
      <div className="mt-10">
        <SectionLabel index="M" label={article.topic} />
      </div>
      <h1 className="headline mt-6 max-w-[22ch] text-[2.25rem] leading-[1.1] [hyphens:auto] sm:text-5xl lg:text-6xl">
        {article.title}
      </h1>
      <p className="label mt-6 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          {magazin.byLabel} <span className="text-white">{article.author}</span>
        </span>
        <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
      </p>
      <p className="prose-width mt-10 text-xl leading-relaxed text-white">{article.teaser}</p>

      <div className="prose-width mt-10 space-y-6 border-t border-line pt-10 text-lg leading-relaxed text-slate-light">
        {article.body.map((block, i) =>
          block.startsWith("## ") ? (
            <h2 key={i} className="headline pt-6 text-2xl text-white md:text-3xl">
              {block.slice(3)}
            </h2>
          ) : (
            <p key={i}>{block}</p>
          ),
        )}
      </div>

      <div className="mt-16 flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/magazin" className="label hover:text-white">
          {magazin.backLink}
        </Link>
        <ButtonLink href={site.cta.href} className="w-full sm:w-auto">
          {site.cta.label}
          <Arrow />
        </ButtonLink>
      </div>
    </article>
  );
}
