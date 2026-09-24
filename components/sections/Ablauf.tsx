import { ablauf } from "@/content/landing";
import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Ablauf() {
  return (
    <Section id={ablauf.id} index="06" label={ablauf.label} headline={ablauf.headline}>
      <Rail label={ablauf.label} as="ol" columns={4}>
        {ablauf.steps.map((step, i) => (
          <Reveal as="li" key={step.title} delay={150 + i * 100} className="card flex flex-col p-6 md:p-8">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="headline text-5xl text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Verbindungslinie zum nächsten Schritt */}
              {i < ablauf.steps.length - 1 ? <span aria-hidden="true" className="h-px flex-1 bg-line" /> : null}
            </div>
            <h3 className="mt-8 text-xl font-semibold">
              <span className="sr-only">Schritt {i + 1}: </span>
              {step.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-slate-light">{step.body}</p>
          </Reveal>
        ))}
      </Rail>
    </Section>
  );
}
