import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Reveal } from "./Reveal";

/**
 * Sektionsrahmen mit Trennlinie oben, Label mit Nummer und Headline.
 * Alle Sektionen der Startseite nutzen ihn, damit Abstände einheitlich bleiben.
 */
export function Section({
  id,
  index,
  label,
  headline,
  intro,
  className,
  children,
}: {
  id: string;
  index: string;
  label: string;
  headline: string;
  intro?: string;
  className?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cx("container-site py-section", className)}>
      <div className="border-t border-line pt-8 md:pt-10">
        <Reveal className="grid gap-8 md:grid-cols-12 md:gap-10">
          <p className="label md:col-span-3">
            <span aria-hidden="true">{index} — </span>
            {label}
          </p>
          <div className="md:col-span-9">
            <h2
              id={headingId}
              className="headline text-[clamp(1.75rem,3.4vw,3.25rem)] [hyphens:auto]"
            >
              {headline}
            </h2>
            {intro ? <p className="prose-width mt-8 text-lg leading-relaxed text-slate">{intro}</p> : null}
          </div>
        </Reveal>
        <div className="mt-14 md:mt-20">{children}</div>
      </div>
    </section>
  );
}
