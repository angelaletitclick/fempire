import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { SectionLabel } from "@/components/ui/Section";
import { magazin } from "@/content/magazin";
import { site } from "@/content/site";
import { parseBody, publishedArticle } from "@/lib/articles";
import { getViewer } from "@/lib/auth";
import { formatDate } from "@/lib/time";

// Mitglieder-Artikel hängen an der Anmeldung: immer frisch rendern, nie aus dem Cache
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/magazin/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await publishedArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.teaser,
    alternates: { canonical: `/magazin/${article.slug}` },
    openGraph: { type: "article", publishedTime: article.published_at, authors: [article.author] },
  };
}

/**
 * Artikelseite. Bei Mitglieder-Artikeln entscheidet der Server, wie viel Text herausgeht:
 * Gäste bekommen nur die ersten Absätze, der Rest wird gar nicht erst ausgeliefert.
 */
export default async function ArticlePage({ params }: PageProps<"/magazin/[slug]">) {
  const { slug } = await params;
  const article = await publishedArticle(slug);
  if (!article) notFound();

  const viewer = article.paid ? await getViewer() : null;
  const entitled = !article.paid || Boolean(viewer?.isActive);
  const blocks = parseBody(article.body);
  const visible = entitled ? blocks : blocks.slice(0, magazin.previewBlocks);
  const p = magazin.paywall;

  return (
    <article className="container-site py-section">
      <Link href="/magazin" className="label hover:text-white">
        {magazin.backLink}
      </Link>
      <div className="mt-10">
        <SectionLabel index="M" label={article.paid ? `${article.topic || magazin.label} · ${magazin.paidLabel}` : article.topic || magazin.label} />
      </div>
      <h1 className="headline mt-6 max-w-[22ch] text-[2.25rem] leading-[1.1] [hyphens:auto] sm:text-5xl lg:text-6xl">
        {article.title}
      </h1>
      <p className="label mt-6 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          {magazin.byLabel} <span className="text-white">{article.author}</span>
        </span>
        <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
      </p>
      {article.teaser ? <p className="prose-width mt-10 text-xl leading-relaxed text-white">{article.teaser}</p> : null}

      <div className="prose-width relative mt-10 border-t border-line pt-10 text-lg leading-relaxed text-slate-light">
        <RichText blocks={visible} />
        {!entitled ? (
          <p aria-hidden="true" className="mt-6 text-2xl tracking-[0.3em] text-slate">
            …
          </p>
        ) : null}
      </div>

      {!entitled ? (
        <section aria-labelledby="paywall" className="prose-width mt-6 border border-white p-6 md:p-10">
          <h2 id="paywall" className="headline text-2xl md:text-3xl">
            {p.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-light">{viewer?.member ? p.inactive : p.body}</p>
          {!viewer ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/club/login">{p.login}</ButtonLink>
              <ButtonLink href={site.cta.href} variant="outline">
                {p.apply}
                <Arrow />
              </ButtonLink>
            </div>
          ) : null}
        </section>
      ) : null}

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
