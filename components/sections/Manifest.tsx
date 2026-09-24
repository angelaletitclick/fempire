import { manifest } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Manifest() {
  return (
    <Section id={manifest.id} index="01" label={manifest.label} headline={manifest.headline}>
      <ol className="border-b border-line">
        {manifest.statements.map((statement, i) => (
          <Reveal as="li" key={statement.title} className="grid gap-4 border-t border-line py-8 md:grid-cols-12 md:gap-10 md:py-12">
            <span aria-hidden="true" className="label md:col-span-3">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="md:col-span-9 md:grid md:grid-cols-9 md:gap-10">
              <h3 className="text-[clamp(1.5rem,3.2vw,2.5rem)] font-semibold leading-tight tracking-tight text-balance md:col-span-5">
                {statement.title}
              </h3>
              <p className="prose-width mt-4 text-base leading-relaxed text-slate md:col-span-4 md:mt-2">
                {statement.body}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
