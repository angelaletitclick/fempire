import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Reveal } from "./Reveal";

/**
 * Sektionsrahmen: Trennlinie, die sich beim Scrollen zeichnet, Label mit Nummer
 * und Headline, die von unten freigelegt wird. Alle Sektionen der Startseite
 * nutzen ihn, damit Abstände und Bewegung einheitlich bleiben.
 */
export function Section({
  id,
  index,
  label,
  headline,
  intro,
  className,
  bodyClassName = "mt-14 md:mt-20",
  children,
}: {
  id: string;
  index: string;
  label: string;
  headline: string;
  intro?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cx("container-site py-section", className)}>
      <Reveal variant="line" className="h-px bg-line" />
      <div className="grid gap-8 pt-8 md:grid-cols-12 md:gap-10 md:pt-10">
        <Reveal as="p" className="label md:col-span-3">
          <span aria-hidden="true">{index} — </span>
          {label}
        </Reveal>
        <div className="md:col-span-9">
          <Reveal
            as="h2"
            id={headingId}
            variant="wipe"
            delay={100}
            className="headline text-[clamp(1.75rem,3.4vw,3.25rem)] [hyphens:auto]"
          >
            {headline}
          </Reveal>
          {intro ? (
            <Reveal as="p" delay={250} className="prose-width mt-8 text-lg leading-relaxed text-slate">
              {intro}
            </Reveal>
          ) : null}
        </div>
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
