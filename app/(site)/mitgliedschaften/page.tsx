import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Marked } from "@/components/ui/Marked";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/Section";
import { TrialBand } from "@/components/sections/TrialBand";
import { funnel } from "@/content/funnel";
import { membership } from "@/content/membership";
import { mitgliedschaften } from "@/content/mitgliedschaften";

export const metadata: Metadata = {
  title: mitgliedschaften.meta.title,
  description: mitgliedschaften.meta.description,
  alternates: { canonical: "/mitgliedschaften" },
};

// Schnuppertermine kommen aus dem Backend
export const revalidate = 3600;

const tierStyle = (tier: string) =>
  ({
    "--tier": `var(--tier-${tier})`,
    "--tier-ink": `var(--tier-${tier}-ink)`,
  }) as CSSProperties;

/** Alle Mitgliedschaften im Detail, ohne Beträge. Jede mit eigenem Weg in die Bewerbung. */
export default function MitgliedschaftenPage() {
  const t = mitgliedschaften;
  return (
    <>
      <div className="container-site py-section">
        <SectionLabel index="M" label={t.label} />
        <h1 className="headline mt-6 max-w-[20ch] text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-6xl">
          <Marked text={t.headline} />
        </h1>
        <p className="prose-width mt-6 text-lg leading-relaxed text-slate-light">
          {t.intro}
        </p>

        {/* Sprungmarken in den Farben der Mitgliedschaften */}
        <nav aria-label={t.jumpLabel} className="mt-10 flex flex-wrap gap-2">
          {t.circles.map((circle) => (
            <a
              key={circle.tier}
              href={`#${circle.tier}`}
              style={tierStyle(circle.tier)}
              className="label inline-flex items-center gap-2 border border-[var(--tier)] px-3 py-2 text-white transition-colors hover:bg-[var(--tier)] hover:text-[var(--tier-ink)]"
            >
              <span aria-hidden="true" className="h-2 w-2 bg-[var(--tier)]" />
              {circle.name}
            </a>
          ))}
        </nav>

        <div className="mt-16 grid gap-6 md:mt-24 md:gap-8">
          {t.circles.map((circle, i) => {
            const plan = membership.circles.find(
              (entry) => entry.tier === circle.tier,
            );
            const pledge = funnel.circles.find(
              (entry) => entry.tier === circle.tier,
            );
            return (
              <section
                key={circle.tier}
                id={circle.tier}
                aria-labelledby={`${circle.tier}-title`}
                style={tierStyle(circle.tier)}
                className="scroll-mt-24"
              >
                <Reveal className="border border-line">
                  <span
                    aria-hidden="true"
                    className="block h-1.5 bg-[var(--tier)]"
                  />
                  <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-12 lg:p-12">
                    <div className="lg:col-span-5">
                      <p className="label flex items-center gap-3">
                        <span className="tabular-nums text-[var(--tier)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </p>
                      <h2
                        id={`${circle.tier}-title`}
                        className="headline mt-4 text-3xl leading-tight sm:text-4xl"
                      >
                        {circle.name}
                      </h2>
                      <p className="mt-3 text-lg text-[var(--tier)]">
                        {circle.tagline}
                      </p>
                      <p className="mt-6 text-base leading-relaxed text-slate-light">
                        {circle.description}
                      </p>
                      {plan?.note ? (
                        <p className="mt-4 text-sm text-white">{plan.note}</p>
                      ) : null}

                      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Link
                          href={`/bewerbung?kreis=${circle.tier}`}
                          className="inline-flex h-12 items-center justify-center gap-3 bg-[var(--tier)] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--tier-ink)] transition-opacity hover:opacity-85"
                        >
                          {t.ctaTemplate.replace("{name}", circle.name)}
                          <Arrow />
                        </Link>
                      </div>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
                      <div>
                        <h3 className="label text-white">{t.labels.for}</h3>
                        <ul className="mt-4 grid gap-3">
                          {circle.for.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-3 text-base leading-relaxed text-white"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-[var(--tier)]"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <h3 className="label mt-8">{t.labels.notFor}</h3>
                        <ul className="mt-4 grid gap-3">
                          {circle.notFor.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-3 text-base leading-relaxed text-slate-light"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-2.5 h-px w-3 shrink-0 bg-slate"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="label text-white">
                          {t.labels.included}
                        </h3>
                        <ul className="mt-4 grid gap-2">
                          {(plan?.included ?? []).map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-3 text-sm leading-relaxed text-white"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 12 10"
                                className="mt-1.5 h-2.5 w-3 shrink-0 text-[var(--tier)]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 5l3.5 3.5L11 1" />
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                        <h3 className="label mt-8 text-white">
                          {t.labels.rhythm}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-light">
                          {circle.rhythm}
                        </p>
                        {pledge ? (
                          <>
                            <h3 className="label mt-8 text-white">
                              {t.labels.commitment}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-light">
                              {pledge.commitment}
                            </p>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </section>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={t.priceLink.href}
            className="label inline-flex items-center gap-2 text-white underline-offset-4 hover:underline"
          >
            {t.priceLink.label}
            <Arrow />
          </Link>
          <ButtonLink
            href={t.trial.cta.href}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {t.trial.cta.label}
            <Arrow />
          </ButtonLink>
        </div>
      </div>

      <TrialBand />
    </>
  );
}
