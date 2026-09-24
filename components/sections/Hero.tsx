import Link from "next/link";
import type { CSSProperties } from "react";
import { hero, termine } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Seal } from "@/components/ui/Emblem";
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
          // Mobil ~11vw, damit der Titel den Screen füllt. Ab lg ein Satz pro Zeile (nowrap),
          // Schriftgröße so bemessen, dass der längere Satz in die Containerbreite passt.
          className="headline text-[11vw] leading-[1.22] [hyphens:none] sm:text-[7.5vw] lg:whitespace-nowrap lg:text-[clamp(2.5rem,4.8vw,4.75rem)]"
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
            <p className="prose-width text-lg leading-relaxed text-white md:text-xl">{hero.subline}</p>
            {next ? (
              <p className="card mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                <span aria-hidden="true" className="anim-pulse h-1.5 w-1.5 bg-white" />
                <span className="label text-white">{hero.nextMeetingLabel}</span>
                <span className="text-slate-light">
                  {termine.rule.place}, {formatLong(next.date)}
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

      <div className="container-site relative">
        <div className="anim-fade-in flex items-center justify-between gap-6 border-t border-line pb-6 pt-5" style={delay(1000)}>
          <p className="label">{hero.scarcity}</p>
          <Seal id="seal-hero" text={hero.seal} className="w-16 shrink-0 lg:w-24" />
        </div>
      </div>
    </section>
  );
}
