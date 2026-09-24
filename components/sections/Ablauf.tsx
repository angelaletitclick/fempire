import { ablauf } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cx } from "@/lib/cx";

export function Ablauf() {
  return (
    <Section id={ablauf.id} index="06" label={ablauf.label} headline={ablauf.headline}>
      <Reveal variant="line" className="h-px bg-line" />
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
        {ablauf.steps.map((step, i) => (
          <Reveal
            as="li"
            key={step.title}
            delay={200 + i * 120}
            className={cx(
              "border-b border-line py-10 lg:border-b-0",
              // Trennlinien links: im 2er-Raster jede zweite Spalte, im 4er-Raster alle außer der ersten
              i % 2 === 1 && "sm:border-l sm:pl-6",
              i % 2 === 0 && "sm:pr-6",
              i === 2 && "lg:border-l lg:pl-6",
            )}
          >
            <span aria-hidden="true" className="headline block text-6xl text-slate md:text-7xl">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-8 text-xl font-semibold">
              <span className="sr-only">Schritt {i + 1}: </span>
              {step.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-slate">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
