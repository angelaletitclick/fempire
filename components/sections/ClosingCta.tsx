import type { ReactNode } from "react";
import { closing } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Crown } from "@/components/ui/Emblem";
import { Marked } from "@/components/ui/Marked";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/Section";

export function ClosingCta({ waitlist }: { waitlist?: ReactNode }) {
  return (
    <section id={closing.id} aria-labelledby="closing-heading" className="container-site py-section">
      <Reveal className="card relative overflow-hidden p-6 sm:p-10 lg:p-16">
        <Crown className="absolute right-6 top-6 w-10 text-white sm:right-10 sm:top-10 md:w-14" />
        <SectionLabel index="08" label={closing.label} />
        <Reveal
          as="h2"
          id="closing-heading"
          variant="wipe"
          delay={100}
          className="headline mt-8 text-[2.75rem] leading-[1.1] sm:text-6xl lg:text-[5.5rem]"
        >
          <Marked text={closing.headline} />
        </Reveal>
        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:items-end">
          <p className="prose-width text-lg leading-relaxed text-slate-light md:col-span-7 md:text-xl">{closing.body}</p>
          <div className="md:col-span-5 md:justify-self-end">
            <ButtonLink href={site.cta.href} variant="accent" className="w-full sm:w-auto">
              {site.cta.label}
              <Arrow />
            </ButtonLink>
          </div>
        </div>
      </Reveal>
      {waitlist}
    </section>
  );
}
