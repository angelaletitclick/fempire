import { faq } from "@/content/faq";
import { Section } from "@/components/ui/Section";

/** Accordion auf Basis von details/summary: tastaturbedienbar und ohne JavaScript funktionsfähig. */
export function Faq() {
  return (
    <Section id={faq.id} index="07" label={faq.label} headline={faq.headline}>
      <div className="border-t border-line md:ml-[25%]">
        {faq.items.map((item) => (
          <details key={item.question} className="group border-b border-line">
            <summary className="flex cursor-pointer items-start justify-between gap-6 py-7 text-xl font-semibold leading-snug transition-colors hover:text-slate-light md:text-2xl">
              <h3 className="font-semibold">{item.question}</h3>
              <span aria-hidden="true" className="relative mt-2 block h-4 w-4 shrink-0">
                <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                <span className="absolute left-1/2 top-0 h-4 w-px bg-current transition-transform duration-300 group-open:rotate-90" />
              </span>
            </summary>
            <div className="prose-width space-y-4 pb-8 text-base leading-relaxed text-slate">
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
