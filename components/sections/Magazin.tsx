import Link from "next/link";
import { formatArticleDate, magazin, sortedArticles, type Article } from "@/content/magazin";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/** Teaser-Sektion der Startseite mit den neuesten Artikeln */
export function Magazin() {
  const latest = sortedArticles().slice(0, magazin.showOnHome);
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

export function ArticleList({ articles }: { articles: Article[] }) {
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
          <Link href={`/magazin/${article.slug}`} className="flex w-full flex-col p-6 md:p-8">
            <p className="label flex flex-wrap gap-x-3">
              <span className="text-white">{article.topic}</span>
              <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
            </p>
            <h3 className="headline mt-8 text-xl leading-tight md:text-2xl">{article.title}</h3>
            <p className="mt-4 flex-1 text-base leading-relaxed text-slate-light">{article.teaser}</p>
            <p className="label mt-8 flex items-center gap-2 text-white group-hover:underline">
              {magazin.readMore}
              <Arrow />
            </p>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
