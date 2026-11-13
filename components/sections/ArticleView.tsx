import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Markdown } from "@/components/ui/Markdown";
import { SectionLabel } from "@/components/ui/Section";
import { magazin } from "@/content/magazin";
import type { Article } from "@/lib/articles";
import type { AuthorProfile } from "@/lib/authors";
import { magazinImageUrl } from "@/lib/magazin-images";
import { formatDate } from "@/lib/time";

/**
 * Artikelansicht für Website und Mitgliederbereich:
 * Kopf mit Autorinnen, hervorgehobener Teaser, Titelbild, Text, optional Paywall, Autorinnen-Box.
 */
export function ArticleView({
  article,
  body,
  authors,
  backHref,
  topRight,
  paywall,
  footer,
}: {
  article: Article;
  /** Sichtbarer Text (bei Paywall nur der Anfang) */
  body: string;
  authors: AuthorProfile[];
  backHref: string;
  topRight?: ReactNode;
  paywall?: ReactNode;
  footer?: ReactNode;
}) {
  const cover = magazinImageUrl(article.cover_path);
  const label = article.paid ? `${article.topic || magazin.label} · ${magazin.paidLabel}` : article.topic || magazin.label;

  return (
    <article className="container-site py-section">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={backHref} className="label hover:text-white">
          {magazin.backLink}
        </Link>
        {topRight}
      </div>

      <header className="mt-10 max-w-4xl">
        <SectionLabel index="M" label={label} />
        <h1 className="headline mt-6 text-[2.25rem] leading-[1.1] [hyphens:auto] sm:text-5xl lg:text-6xl">{article.title}</h1>

        {/* Autorinnen mit Avatar und Kurzbeschreibung */}
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          {authors.map((author) => (
            <div key={author.name} className="flex items-center gap-3">
              <AuthorImage author={author} size="h-12 w-12" />
              <div className="leading-tight">
                <p className="text-sm text-white">
                  <span className="text-slate-light">{magazin.byLabel} </span>
                  <span className="font-semibold">{author.name}</span>
                </p>
                {author.role ? <p className="mt-1 text-xs text-slate-light">{author.role}</p> : null}
              </div>
            </div>
          ))}
          <time dateTime={article.published_at} className="label">
            {formatDate(article.published_at)}
          </time>
        </div>
      </header>

      {/* Teaser als deutlich abgesetzter Vorspann */}
      {article.teaser ? (
        <p className="mt-12 max-w-4xl border-l-4 border-pink pl-6 text-xl font-medium leading-relaxed text-white md:pl-8 md:text-2xl md:leading-relaxed">
          {article.teaser}
        </p>
      ) : null}

      {cover ? (
        <figure className="mt-12">
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-line bg-surface">
            <Image src={cover} alt={article.cover_alt} fill priority={false} sizes="(min-width: 1408px) 1360px, 100vw" className="object-cover" />
          </div>
          {article.cover_caption ? <figcaption className="mt-3 text-sm text-slate-light">{article.cover_caption}</figcaption> : null}
        </figure>
      ) : null}

      <div className="prose-width mt-12 text-lg leading-relaxed text-slate-light">
        <Markdown text={body} />
        {paywall}
      </div>

      {/* Über die Autorin */}
      {authors.some((author) => author.about) ? (
        <aside aria-label={authors.length > 1 ? "Über die Autorinnen" : "Über die Autorin"} className="prose-width mt-16 grid gap-4">
          {authors.map((author) =>
            author.about ? (
              <div key={author.name} className="card flex gap-5 p-6">
                <AuthorImage author={author} size="h-16 w-16" />
                <div className="min-w-0">
                  <p className="label">{authors.length > 1 ? "Über die Autorinnen" : "Über die Autorin"}</p>
                  <p className="mt-2 font-semibold text-white">{author.name}</p>
                  {author.role ? <p className="text-sm text-slate-light">{author.role}</p> : null}
                  <p className="mt-3 text-sm leading-relaxed text-slate-light">{author.about}</p>
                </div>
              </div>
            ) : null,
          )}
        </aside>
      ) : null}

      {footer}
    </article>
  );
}

function AuthorImage({ author, size }: { author: AuthorProfile; size: string }) {
  return (
    <span className={`relative shrink-0 overflow-hidden border border-line bg-surface ${size}`}>
      {author.image ? (
        // Profilfoto über /club/avatar oder Porträt aus public/bilder
        // eslint-disable-next-line @next/next/no-img-element
        <img src={author.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top grayscale contrast-110" />
      ) : (
        <span aria-hidden="true" className="headline absolute inset-0 flex items-center justify-center text-xs">
          {author.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")}
        </span>
      )}
    </span>
  );
}
