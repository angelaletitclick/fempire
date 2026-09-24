import type { ReactNode } from "react";
import { closing } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Crown } from "@/components/ui/Emblem";
import { Reveal } from "@/components/ui/Reveal";

export function ClosingCta({ waitlist }: { waitlist?: ReactNode }) {
  return (
    <section id={closing.id} aria-labelledby="closing-heading" className="container-site py-section">
      <Reveal variant="line" className="h-px bg-line" />
      <div className="flex items-center justify-between pt-8 md:pt-10">
        <p className="label">
          <span aria-hidden="true">08 — </span>
          {closing.label}
        </p>
        <Reveal delay={200}>
          <Crown className="w-10 text-white md:w-12" />
        </Reveal>
      </div>
      <Reveal
        as="h2"
        id="closing-heading"
        variant="wipe"
        delay={100}
        className="headline mt-10 text-[clamp(2.5rem,6.2vw,5.75rem)]"
      >
        {closing.headline}
      </Reveal>
      <Reveal delay={300} className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
        <p className="prose-width text-lg leading-relaxed text-slate md:col-span-6 md:text-xl">{closing.body}</p>
        <div className="md:col-span-6 md:justify-self-end">
          <ButtonLink href={site.cta.href} variant="accent">
            {site.cta.label}
            <Arrow />
          </ButtonLink>
        </div>
      </Reveal>
      {waitlist}
    </section>
  );
}
