import { homeCity } from "@/content/cities";
import Link from "next/link";
import type { CSSProperties } from "react";
import { hero } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Marked } from "@/components/ui/Marked";
import { formatLong, upcomingMeetings } from "@/lib/meetings";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Senkrechte Linien im Hintergrund: Säulen als architektonisches Motiv */
const PILLARS = ["25%", "50%", "75%"];

export function Hero() {
  const next = upcomingMeetings(1)[0];
  return (
    <section
      aria-labelledby="hero-heading"
      // Mobil: volle Bildschirmhöhe abzüglich Kopfzeile und unterer Aktionsleiste
      className="relative flex min-h-[calc(100svh-4rem-4.5rem)] flex-col overflow-hidden lg:min-h-[min(calc(100svh-4rem),56rem)]"
    >
      <div aria-hidden="true" className="container-site pointer-events-none absolute inset-0">
        <div className="relative h-full">
          {PILLARS.map((left, i) => (
            <span
              key={left}
              className="anim-grow-y absolute top-0 h-full w-px bg-line-soft"
              style={{ left, ...delay(i * 150) }}
            />
          ))}
        </div>
      </div>

      <div className="container-site relative my-auto py-10 md:py-20">
        <h1
          id="hero-heading"
          // Mobil so groß wie möglich: das längste Teilstück („NEHMERINNEN,“) muss in die Zeile passen,
          // deshalb hyphens:manual (nur die weiche Trennstelle aus content/ zählt). Ab sm passt
          // „Unternehmerinnen“ ungetrennt, ab lg steht jeder Satz in genau einer Zeile (nowrap).
          className="headline text-[9.2vw] leading-[1.22] [hyphens:manual] sm:text-[6vw] lg:whitespace-nowrap lg:text-[clamp(2.25rem,4.3vw,4rem)]"
        >
          {hero.headline.map((line, i) => (
            // overflow-hidden maskiert die aufsteigende Zeile; -mx/px lässt Platz für die Fläche
            <span key={line} className="-mx-[0.2em] block overflow-hidden px-[0.2em]">
              <span className="anim-rise anim-mark block" style={delay(200 + i * 180)}>
                <Marked text={line} />
              </span>
            </span>
          ))}
        </h1>

        <div className="mt-8 grid gap-8 md:mt-12 lg:grid-cols-12 lg:items-end">
          <div className="anim-fade-up lg:col-span-7" style={delay(700)}>
            <p className="prose-width text-base leading-relaxed text-white sm:text-lg">{hero.subline}</p>
            <p className="mt-4 text-base sm:text-lg">
              <span className="text-slate-light">{hero.foundationsHint.question} </span>
              <Link
                href={hero.foundationsHint.href}
                className="font-semibold text-white underline decoration-pink decoration-2 underline-offset-4 hover:decoration-white"
              >
                {hero.foundationsHint.link}
              </Link>
            </p>
            {next ? (
              <p className="card mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                <span aria-hidden="true" className="anim-pulse h-1.5 w-1.5 bg-white" />
                <span className="label text-white">{hero.nextMeetingLabel}</span>
                <span className="text-slate-light">
                  {homeCity.name}, {formatLong(next.date)}
                </span>
              </p>
            ) : null}
          </div>
          {/* Mobil übernimmt die fixierte Aktionsleiste unten den CTA */}
          <div
            className="anim-fade-up hidden flex-col gap-5 sm:flex sm:flex-row sm:items-center lg:col-span-5 lg:justify-end"
            style={delay(850)}
          >
            <ButtonLink href={site.cta.href}>
              {site.cta.label}
              <Arrow />
            </ButtonLink>
            <Link href={hero.secondaryCta.href} className="label py-3 transition-colors hover:text-white">
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
