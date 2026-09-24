import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Marked } from "./Marked";
import { Reveal } from "./Reveal";

/**
 * Sektionsrahmen mit klarer Hierarchie:
 *   1. Nummer und Label (klein, Versalien)
 *   2. Headline groß und über die volle Breite
 *   3. optional ein Intro
 *   4. Inhalt, meist in Karten
 * Die Headline ist bewusst mehrere Stufen größer als jeder Text darunter.
 */
export function Section({
  id,
  index,
  label,
  headline,
  intro,
  className,
  bodyClassName = "mt-10 md:mt-16",
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
      <div className="pt-6 md:pt-10">
        <SectionLabel index={index} label={label} />
        <Reveal
          as="h2"
          id={headingId}
          variant="wipe"
          delay={100}
          className="headline mt-5 max-w-[20ch] text-[2.25rem] leading-[1.05] [hyphens:auto] sm:text-5xl md:mt-7 lg:text-[4.25rem]"
        >
          <Marked text={headline} />
        </Reveal>
        {intro ? (
          <Reveal as="p" delay={250} className="prose-width mt-5 text-base leading-relaxed text-slate-light md:mt-7 md:text-lg">
            {intro}
          </Reveal>
        ) : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <Reveal as="p" className="label flex items-center gap-3">
      <span className="inline-flex h-7 min-w-7 items-center justify-center border border-line px-1.5 text-white tabular-nums">
        {index}
      </span>
      {label}
    </Reveal>
  );
}
