import { manifest } from "@/content/landing";
import { Marked } from "@/components/ui/Marked";
import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Manifest() {
  return (
    <Section id={manifest.id} index="01" label={manifest.label} headline={manifest.headline}>
      <Rail label={manifest.label} as="ol">
        {manifest.statements.map((statement, i) => (
          <Reveal as="li" key={statement.title} delay={i * 70} className="card flex flex-col p-6 md:p-8">
            <span aria-hidden="true" className="headline text-4xl text-slate/50 md:text-5xl">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-8 text-xl font-semibold leading-snug text-balance md:text-2xl">
              <Marked text={statement.title} />
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-light">{statement.body}</p>
          </Reveal>
        ))}
      </Rail>
    </Section>
  );
}
