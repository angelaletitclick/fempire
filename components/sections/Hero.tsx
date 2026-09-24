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
      className="relative flex min-h-[min(calc(100svh-4rem),56rem)] flex-col overflow-hidden"
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

      <div className="container-site relative my-auto py-16 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <h1
              id="hero-heading"
              className="headline text-[clamp(2.25rem,4.8vw,4.75rem)] [hyphens:none]"
            >
              {hero.headline.map((line, i) => (
                // overflow-hidden maskiert die aufsteigende Zeile. Der seitliche Überstand
                // (-mx/px) sorgt dafür, dass eine Markierungsfläche nicht abgeschnitten wird.
                <span key={line} className="-mx-[0.2em] block overflow-hidden px-[0.2em] py-[0.06em]">
                  <span className="anim-rise anim-mark block [&_.mark]:-ml-[0.14em]" style={delay(200 + i * 160)}>
                    <Marked text={line} />
                  </span>
                </span>
              ))}
            </h1>
          </div>
          <Seal
            id="seal-hero"
            text={hero.seal}
            className="anim-fade-in hidden w-40 justify-self-end lg:col-span-3 lg:block xl:w-48"
          />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="anim-fade-up lg:col-span-7" style={delay(600)}>
            <p className="prose-width text-lg leading-relaxed text-white md:text-xl">{hero.subline}</p>
            {next ? (
              <p className="label mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-white">
                <span aria-hidden="true" className="anim-pulse h-1.5 w-1.5 bg-white" />
                <span>{hero.nextMeetingLabel}:</span>
                <span className="text-slate-light">
                  {termine.rule.place}, {formatLong(next.date)}
                </span>
              </p>
            ) : null}
          </div>
          <div
            className="anim-fade-up flex flex-col gap-5 sm:flex-row sm:items-center lg:col-span-5 lg:justify-end"
            style={delay(750)}
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
        <div className="anim-fade-in flex items-center justify-between gap-6 border-t border-line pb-8 pt-5" style={delay(900)}>
          <p className="label">{hero.scarcity}</p>
          <Seal id="seal-hero-mobile" text={hero.seal} className="w-20 shrink-0 lg:hidden" />
        </div>
      </div>
    </section>
  );
}
