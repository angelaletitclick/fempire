import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Marked } from "@/components/ui/Marked";
import { PlayInView, PlayInViewFallback } from "@/components/ui/PlayInView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/Section";
import { membership } from "@/content/membership";

export const metadata: Metadata = {
  title: membership.meta.title,
  description: membership.meta.description,
};

type Circle = (typeof membership.circles)[number];
type TierKey = Circle["tier"];

/** Farbe der Mitgliedschaft als CSS-Variablen (Tokens in globals.css) */
const tierStyle = (tier: TierKey, extra?: Record<string, string>) =>
  ({ "--tier": `var(--tier-${tier})`, "--tier-ink": `var(--tier-${tier}-ink)`, ...extra }) as CSSProperties;

const delay = (ms: number) => ({ "--d": `${ms}ms` });

const features = membership.comparison.features;
const countFor = (tier: TierKey) => features.filter((feature) => feature.tiers[tier]).length;

/**
 * Mitgliedschaften im Überblick: vier Karten in den Farben der Mitgliedschaften,
 * darunter der Vergleich. Animationen starten erst, wenn der Bereich sichtbar wird.
 */
export default function MitgliedsbeitragPage() {
  const t = membership;
  const c = t.comparison;

  return (
    <article className="container-site py-section">
      <PlayInViewFallback />
      <SectionLabel index="€" label={t.label} />
      <h1 className="headline mt-6 max-w-[20ch] text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-6xl">
        <Marked text={t.headline} />
      </h1>
      <p className="prose-width mt-6 text-lg leading-relaxed text-slate-light">{t.intro}</p>

      {/* Karten */}
      <p aria-hidden="true" className="label mt-14 flex items-center gap-2 md:hidden">
        Wischen
        <Arrow />
      </p>
      <PlayInView as="ul" aria-label={t.cardsLabel} className="rail mt-4 md:mt-20 md:grid-cols-2 xl:grid-cols-4">
        {t.circles.map((circle, i) => (
          <TierCard key={circle.id} circle={circle} index={i} />
        ))}
      </PlayInView>

      {/* Vergleich */}
      <section aria-labelledby="vergleich" className="mt-24 md:mt-32">
        <SectionLabel index="≡" label="Vergleich" />
        <h2 id="vergleich" className="headline mt-5 text-[2rem] leading-[1.05] sm:text-5xl">
          <Marked text={c.title} />
        </h2>
        <p className="prose-width mt-5 text-base leading-relaxed text-slate-light md:text-lg">{c.intro}</p>

        <PlayInView className="mt-10 -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] [scrollbar-width:thin]">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">Leistungen der Mitgliedschaften im Vergleich</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-[34%] bg-plum pb-4 pr-4 align-bottom">
                  <span className="label">{c.featureLabel}</span>
                </th>
                {t.circles.map((circle, col) => (
                  <th key={circle.id} scope="col" className="w-[16.5%] px-2 pb-4 align-bottom" style={tierStyle(circle.tier)}>
                    <span aria-hidden="true" className="anim-fill mb-4 block h-1 bg-[var(--tier)]" style={delay(col * 120) as CSSProperties} />
                    <span className="headline block text-base text-white md:text-lg">{circle.short}</span>
                    <span className="mt-1 block text-sm font-normal text-[var(--tier)]">
                      {circle.price.gross} <span className="text-slate-light">/ Monat</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, row) => (
                <tr key={feature.label} className="border-t border-line">
                  <th scope="row" className="sticky left-0 z-10 bg-plum py-4 pr-4 text-base font-normal leading-snug text-white">
                    {feature.label}
                  </th>
                  {t.circles.map((circle, col) => {
                    const value = feature.tiers[circle.tier];
                    const d = delay(row * 70 + col * 50);
                    return (
                      <td key={circle.id} className="px-2 py-4 align-middle" style={tierStyle(circle.tier, d)}>
                        {value === true ? (
                          <span className="anim-pop flex h-7 w-7 items-center justify-center bg-[var(--tier)] text-[var(--tier-ink)]">
                            <svg aria-hidden="true" viewBox="0 0 12 10" className="h-2.5 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 5l3.5 3.5L11 1" />
                            </svg>
                            <span className="sr-only">{c.included}</span>
                          </span>
                        ) : value ? (
                          <span className="anim-pop inline-flex items-center gap-2 text-sm font-semibold text-[var(--tier)]">
                            <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-[var(--tier)]" />
                            {value}
                          </span>
                        ) : (
                          <span className="text-slate">
                            <span aria-hidden="true">–</span>
                            <span className="sr-only">{c.notIncluded}</span>
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </PlayInView>
      </section>

      {/* Schnuppern, Retreat, Gründungsphase, Warum */}
      <div className="mt-24 grid gap-4 md:mt-32 lg:grid-cols-2">
        <Reveal as="section" aria-labelledby="trial-title" className="flex flex-col border border-white p-6 sm:p-10">
          <h2 id="trial-title" className="label text-white">
            {t.trial.title}
          </h2>
          <p className="mt-4">
            <span className="headline text-4xl">{t.trial.price.gross}</span>
            <span className="ml-2 text-base text-white">{t.trial.period}</span>
          </p>
          <p className="mt-1 text-sm text-slate-light">
            {t.trial.price.vatNote} · {t.trial.price.net}
          </p>
          <p className="mt-4 flex-1 text-base leading-relaxed text-slate-light">{t.trial.body}</p>
          <div className="mt-6">
            <ButtonLink href={t.trial.cta.href} variant="outline" className="w-full sm:w-auto">
              {t.trial.cta.label}
              <Arrow />
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal as="section" aria-labelledby="retreat-title" className="border border-line p-6 sm:p-10">
          <h2 id="retreat-title" className="label text-white">
            {t.retreat.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed">{t.retreat.body}</p>
        </Reveal>
        <Reveal className="border border-white p-6 sm:p-10">
          <h2 className="label text-white">{t.foundingPhase.title}</h2>
          <p className="mt-4 text-lg leading-relaxed">{t.foundingPhase.body}</p>
        </Reveal>
        <Reveal className="border border-line p-6 sm:p-10">
          <h2 className="label text-white">{t.why.title}</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-light">
            {t.why.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-light">{t.details}</p>
        <ButtonLink href={t.cta.href} className="w-full sm:w-auto">
          {t.cta.label}
          <Arrow />
        </ButtonLink>
      </div>
    </article>
  );
}

function TierCard({ circle, index }: { circle: Circle; index: number }) {
  const count = countFor(circle.tier);
  const total = features.length;
  const base = index * 150;
  return (
    <li
      className="anim-fade-up group relative flex flex-col border border-line bg-surface transition-colors duration-500 hover:border-[var(--tier)]"
      style={tierStyle(circle.tier, delay(base))}
    >
      <span aria-hidden="true" className="anim-fill block h-1.5 bg-[var(--tier)]" style={delay(base + 200) as CSSProperties} />
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <Emblem tier={circle.tier} base={base} />
          <span className="label bg-[var(--tier)] px-2.5 py-1 text-[0.625rem] text-[var(--tier-ink)]">{circle.short}</span>
        </div>

        <h2 className="headline mt-8 text-2xl leading-tight [hyphens:auto]">{circle.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-light">{circle.for}</p>

        <p className="mt-8">
          <CountUp
            cents={circle.grossCents}
            prefix={circle.from ? "ab " : ""}
            className="headline block text-[2.5rem] leading-none text-[var(--tier)]"
          />
          <span className="mt-2 block text-sm text-white">{circle.period}</span>
          <span className="mt-1 block text-xs text-slate-light">
            {circle.price.vatNote} · {circle.price.net}
          </span>
        </p>

        <div className="mt-8">
          <p className="label flex justify-between gap-2">
            <span>{membership.comparison.countLabel.replace("{count}", String(count)).replace("{total}", String(total))}</span>
          </p>
          <div aria-hidden="true" className="mt-2 h-1 bg-line-soft">
            <span
              className="anim-fill block h-full bg-[var(--tier)]"
              style={{ width: `${(count / total) * 100}%`, ...delay(base + 400) } as CSSProperties}
            />
          </div>
        </div>

        <ul className="mt-6 grid gap-2 text-sm leading-relaxed text-white">
          {circle.included.slice(0, 4).map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-[var(--tier)]" />
              {item}
            </li>
          ))}
        </ul>

        {circle.note ? <p className="mt-4 text-xs leading-relaxed text-slate-light">{circle.note}</p> : null}

        <Link
          href={membership.cta.href}
          className="label mt-auto inline-flex items-center gap-2 pt-8 text-white transition-colors group-hover:text-[var(--tier)]"
        >
          {membership.cardCta}
          <Arrow />
        </Link>
      </div>
    </li>
  );
}

/**
 * Eigenes Zeichen pro Mitgliedschaft, ohne Rangfolge: Community als Netz aus vier Feldern,
 * Founder Circle als Fundament, Leader Circle als Kreis im Kreis, Masterminds als verdichteter Kern.
 * Die Linien zeichnen sich nacheinander.
 */
const EMBLEMS: Record<TierKey, string[]> = {
  community: ["M4 4h20v20H4z", "M32 4h20v20H32z", "M4 32h20v20H4z", "M32 32h20v20H32z"],
  founder: ["M4 4h48v48H4z", "M4 40h48", "M28 40V16"],
  leader: ["M4 4h48v48H4z", "M16 16h24v24H16z"],
  mastermind: ["M4 4h48v48H4z", "M28 8l20 20-20 20L8 28z", "M22 22h12v12H22z"],
};

function Emblem({ tier, base }: { tier: TierKey; base: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 56 56" className="h-14 w-14" fill="none" stroke="var(--tier)" strokeWidth="1.5">
      {EMBLEMS[tier].map((d, i) => (
        <path key={d} d={d} pathLength={1} className="anim-draw" style={delay(base + 300 + i * 220) as CSSProperties} />
      ))}
    </svg>
  );
}
