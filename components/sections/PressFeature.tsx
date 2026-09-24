import { gruenderinnen } from "@/content/landing";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Presseartikel über eine der Gründerinnen. Groß gesetzt, damit er als Beleg wirkt:
 * Quelle und Datum links, der Originaltitel als Zitat rechts.
 */
export function PressFeature() {
  const press = gruenderinnen.press;
  return (
    <Reveal
      as="figure"
      className="relative mt-3 grid gap-8 overflow-hidden border border-white p-6 sm:p-10 lg:mt-4 lg:grid-cols-12 lg:gap-10 lg:p-14"
    >
      {/* Großes Anführungszeichen als stiller Hintergrund */}
      <span
        aria-hidden="true"
        className="headline pointer-events-none absolute -right-2 -top-10 text-[12rem] leading-none text-white/[0.06] md:text-[18rem]"
      >
        „
      </span>

      <figcaption className="relative lg:col-span-4">
        <p className="label text-white">{press.label}</p>
        <p className="headline mt-5 text-2xl leading-tight md:text-3xl">{press.outlet}</p>
        <p className="mt-2 text-sm text-slate-light">
          {press.date} · über {press.about}
        </p>
      </figcaption>

      <div className="relative lg:col-span-8">
        <blockquote cite={press.url}>
          <p className="headline text-[1.625rem] leading-[1.15] md:text-4xl lg:text-[2.75rem]">
            „{press.title}“
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-light md:text-lg">{press.teaser}</p>
        </blockquote>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={press.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 items-center gap-3 bg-white px-6 text-xs font-semibold uppercase tracking-[0.12em] text-onyx transition-colors hover:bg-pink"
          >
            {press.linkLabel}
            <span className="sr-only"> (öffnet noz.de in neuem Tab)</span>
            <Arrow />
          </a>
          <span className="label">{press.paywallNote}</span>
        </div>
      </div>
    </Reveal>
  );
}
