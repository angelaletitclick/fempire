import type { Metadata } from "next";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Marked } from "@/components/ui/Marked";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/Section";
import { membership } from "@/content/membership";

export const metadata: Metadata = {
  title: membership.meta.title,
  description: membership.meta.description,
};

/**
 * Beiträge beider Kreise. Bewusst untereinander statt nebeneinander,
 * damit es nicht wie eine Preistabelle mit Stufen wirkt.
 */
export default function MitgliedsbeitragPage() {
  const t = membership;
  return (
    <article className="container-site py-section">
      <SectionLabel index="€" label={t.label} />
      <h1 className="headline mt-6 max-w-[20ch] text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-6xl">
        <Marked text={t.headline} />
      </h1>
      <p className="prose-width mt-6 text-lg leading-relaxed text-slate-light">{t.intro}</p>

      <div className="mt-14 grid gap-4 md:mt-20">
        {t.circles.map((circle) => (
          <Reveal as="section" key={circle.id} aria-labelledby={`${circle.id}-name`} className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
            <div className="lg:col-span-5">
              <h2 id={`${circle.id}-name`} className="headline text-3xl md:text-4xl">
                {circle.name}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-light">{circle.for}</p>

              <dl className="mt-8 grid gap-6">
                <div>
                  <dt className="label">{t.labels.price}</dt>
                  <dd className="mt-2">
                    <span className="headline text-4xl md:text-5xl">{circle.price.net}</span>
                    <span className="ml-2 text-base text-white">
                      {t.labels.net} {circle.period}
                    </span>
                    <span className="mt-1 block text-sm text-slate-light">
                      {circle.price.gross} {circle.price.vatNote}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="label">{t.labels.term}</dt>
                  <dd className="mt-2 text-base text-white">{circle.term}</dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-7">
              <h3 className="label">{t.labels.included}</h3>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {circle.included.map((item) => (
                  <li key={item} className="flex items-start gap-4 py-4 text-base leading-relaxed text-white md:text-lg">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-white" />
                    {item}
                  </li>
                ))}
              </ul>
              {circle.note ? <p className="mt-4 text-sm leading-relaxed text-slate-light">{circle.note}</p> : null}
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
