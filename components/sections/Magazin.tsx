import Image from "next/image";
import Link from "next/link";
import { magazin } from "@/content/magazin";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { publishedArticles, type ArticleSummary } from "@/lib/articles";
import { magazinImageUrl } from "@/lib/magazin-images";
import { formatDate } from "@/lib/time";

/** Teaser-Sektion der Startseite mit den neuesten Artikeln */
export async function Magazin() {
  const latest = await publishedArticles(magazin.showOnHome);
  return (
    <Section id={magazin.id} index="09" label={magazin.label} headline={magazin.headline} intro={magazin.intro}>
      <ArticleList articles={latest} />
      {latest.length > 0 ? (
        <Reveal className="mt-8">
          <ButtonLink href="/magazin" variant="outline" className="w-full sm:w-auto">
            {magazin.allLink}
            <Arrow />
          </ButtonLink>
        </Reveal>
      ) : null}
    </Section>
  );
}

/** Titelbild einer Karte, ohne Bild eine schlichte Fläche mit Linie (wie die Bild-Platzhalter der Seite) */
function ArticleCover({ article }: { article: ArticleSummary }) {
  const src = magazinImageUrl(article.cover_path);
  return (
    <span className="relative block aspect-[16/10] w-full overflow-hidden border-b border-line bg-plum">
      {src ? (
        <Image
          src={src}
          alt={article.cover_alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-x-6 bottom-6 h-px bg-line" />
      )}
    </span>
  );
}

export function ArticleList({ articles, hrefBase = "/magazin" }: { articles: ArticleSummary[]; hrefBase?: string }) {
  if (articles.length === 0) {
    return (
      <Reveal as="p" className="border border-line p-6 text-lg text-slate-light md:p-10">
        {magazin.empty}
      </Reveal>
    );
  }
  return (
    <ul className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
      {articles.map((article, i) => (
        <Reveal as="li" key={article.slug} delay={i * 70} className="card group flex">
          <Link href={`${hrefBase}/${article.slug}`} className="flex w-full flex-col">
            <ArticleCover article={article} />
            <div className="flex flex-1 flex-col p-6 md:p-8">
            <p className="label flex flex-wrap gap-x-3">
              {article.topic ? <span className="text-white">{article.topic}</span> : null}
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              {article.paid ? <span>{magazin.paidLabel}</span> : null}
            </p>
            <h3 className="headline mt-6 text-xl leading-tight md:text-2xl">{article.title}</h3>
            {article.teaser ? (
              <p className="mt-4 flex-1 border-l-2 border-white pl-4 text-base font-medium leading-relaxed text-white">{article.teaser}</p>
            ) : (
              <span className="flex-1" />
            )}
            <p className="label mt-8 flex items-center gap-2 text-white group-hover:underline">
              {magazin.readMore}
              <Arrow />
            </p>
            </div>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
