import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/sections/ArticleView";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { markdownPreview } from "@/components/ui/Markdown";
import { magazin } from "@/content/magazin";
import { site } from "@/content/site";
import { publishedArticle } from "@/lib/articles";
import { getViewer } from "@/lib/auth";
import { authorProfiles } from "@/lib/authors";
import { magazinImageUrl } from "@/lib/magazin-images";

// Mitglieder-Artikel hängen an der Anmeldung: immer frisch rendern, nie aus dem Cache
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/magazin/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await publishedArticle(slug);
  if (!article) return {};
  const cover = magazinImageUrl(article.cover_path);
  return {
    title: article.title,
    description: article.teaser,
    alternates: { canonical: `/magazin/${article.slug}` },
    openGraph: {
      type: "article",
      publishedTime: article.published_at,
      authors: [article.author],
      ...(cover ? { images: [{ url: cover, alt: article.cover_alt }] } : {}),
    },
  };
}

/**
 * Öffentliche Artikelseite. Bei Mitglieder-Artikeln entscheidet der Server, wie viel Text herausgeht:
 * Gäste bekommen nur die ersten Absätze, der Rest wird gar nicht erst ausgeliefert.
 */
export default async function ArticlePage({ params }: PageProps<"/magazin/[slug]">) {
  const { slug } = await params;
  const article = await publishedArticle(slug);
  if (!article) notFound();

  const viewer = article.paid ? await getViewer() : null;
  const entitled = !article.paid || Boolean(viewer?.isActive);
  const body = entitled ? article.body : markdownPreview(article.body, magazin.previewBlocks);
  const authors = await authorProfiles(article.author);
  const p = magazin.paywall;

  return (
    <ArticleView
      article={article}
      body={body}
      authors={authors}
      backHref="/magazin"
      paywall={
        entitled ? null : (
          <>
            <p aria-hidden="true" className="mt-6 text-2xl tracking-[0.3em] text-slate">
              …
            </p>
            <section aria-labelledby="paywall" className="mt-6 border border-white p-6 md:p-10">
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
          </>
        )
      }
      footer={
        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/magazin" className="label hover:text-white">
            {magazin.backLink}
          </Link>
          <ButtonLink href={site.cta.href} className="w-full sm:w-auto">
            {site.cta.label}
            <Arrow />
          </ButtonLink>
        </div>
      }
    />
  );
}
