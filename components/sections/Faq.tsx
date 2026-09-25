import { faq } from "@/content/faq";
import { Section } from "@/components/ui/Section";

/** Accordion auf Basis von details/summary: tastaturbedienbar und ohne JavaScript funktionsfähig. */
export function Faq() {
  return (
    <Section id={faq.id} index="08" label={faq.label} headline={faq.headline}>
      <div className="grid gap-2 lg:max-w-4xl">
        {faq.items.map((item) => (
          <details key={item.question} className="card group open:border-slate">
            <summary className="flex cursor-pointer items-center justify-between gap-6 px-5 py-5 transition-colors hover:bg-white/[0.02] md:px-7 md:py-6">
              <h3 className="text-base font-semibold leading-snug md:text-lg">{item.question}</h3>
              <span
                aria-hidden="true"
                className="relative flex h-8 w-8 shrink-0 items-center justify-center border border-line transition-colors group-open:border-white group-open:bg-white group-open:text-plum"
              >
                <span className="absolute h-px w-3 bg-current" />
                <span className="absolute h-3 w-px bg-current transition-transform duration-300 group-open:rotate-90" />
              </span>
            </summary>
            <div className="prose-width space-y-4 px-5 pb-6 text-base leading-relaxed text-slate-light md:px-7">
              {item.answer.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
