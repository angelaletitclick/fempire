import Image from "next/image";
import { gruenderinnen } from "@/content/landing";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Presseartikel über eine der Gründerinnen. Der Screenshot wirkt wie ein Zeitungsausschnitt:
 * in Graustufen passend zur CI, beim Überfahren in Farbe. Daneben Quelle und Originaltitel.
 */
export function PressFeature() {
  const press = gruenderinnen.press;
  return (
    <Reveal
      as="figure"
      className="relative mt-3 grid gap-8 overflow-hidden border border-white p-5 sm:p-8 lg:mt-4 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-12"
    >
      {/* Großes Anführungszeichen als stiller Hintergrund */}
      <span
        aria-hidden="true"
        className="headline pointer-events-none absolute -right-2 -top-10 text-[12rem] leading-none text-white/[0.06] md:text-[18rem]"
      >
        „
      </span>

      <a
        href={press.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block lg:col-span-5"
      >
        <span className="sr-only">Artikel auf noz.de öffnen (neuer Tab)</span>
        <Image
          src={press.image.src}
          width={press.image.width}
          height={press.image.height}
          alt={press.image.alt}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="h-auto w-full border border-line grayscale transition-[filter] duration-700 ease-out group-hover:grayscale-0"
        />
        <span className="label mt-3 block text-[0.625rem]">{press.image.credit}</span>
      </a>

      <div className="relative lg:col-span-7">
        <figcaption>
          <p className="label text-white">{press.label}</p>
          <p className="headline mt-4 text-2xl leading-tight md:text-3xl">{press.outlet}</p>
          <p className="mt-2 text-sm text-slate-light">
            {press.date} · von {press.author} · über {press.about}
          </p>
        </figcaption>
        <blockquote cite={press.url} className="mt-8">
          <p className="headline text-[1.5rem] leading-[1.15] md:text-3xl lg:text-[2.25rem]">„{press.title}“</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-light md:text-lg">{press.teaser}</p>
        </blockquote>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={press.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 items-center gap-3 bg-white px-6 text-xs font-semibold uppercase tracking-[0.12em] text-plum transition-colors hover:bg-pink hover:text-white"
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
