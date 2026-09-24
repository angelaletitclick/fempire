import type { ReactNode } from "react";
import { closing } from "@/content/landing";
import { site } from "@/content/site";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function ClosingCta({ waitlist }: { waitlist?: ReactNode }) {
  return (
    <section id={closing.id} aria-labelledby="closing-heading" className="container-site py-section">
      <div className="border-t border-line pt-8 md:pt-10">
        <p className="label">
          <span aria-hidden="true">08 — </span>
          {closing.label}
        </p>
        <Reveal>
          <h2 id="closing-heading" className="headline mt-10 text-[clamp(2.75rem,10vw,9rem)]">
            {closing.headline}
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
            <p className="prose-width text-lg leading-relaxed text-slate md:col-span-6 md:text-xl">
              {closing.body}
            </p>
            <div className="md:col-span-6 md:justify-self-end">
              <ButtonLink href={site.cta.href} variant="accent">
                {site.cta.label}
                <Arrow />
              </ButtonLink>
            </div>
          </div>
        </Reveal>
        {waitlist}
      </div>
    </section>
  );
}
