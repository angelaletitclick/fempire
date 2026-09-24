import { filter } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Filter() {
  return (
    <Section id={filter.id} index="02" label={filter.label} headline={filter.headline}>
      <div className="grid border-y border-line md:grid-cols-2">
        <Reveal className="py-10 md:border-r md:border-line md:py-14 md:pr-12">
          <h3 className="label text-white">{filter.yes.title}</h3>
          <ul className="mt-8 space-y-6">
            {filter.yes.items.map((item) => (
              <li key={item} className="flex gap-5 text-xl leading-snug md:text-2xl">
                <span aria-hidden="true" className="mt-[0.2em] font-light text-white">
                  +
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120} className="border-t border-line py-10 md:border-t-0 md:py-14 md:pl-12">
          <h3 className="label text-pink">{filter.no.title}</h3>
          <ul className="mt-8 space-y-6">
            {filter.no.items.map((item) => (
              <li key={item} className="flex gap-5 text-xl leading-snug text-slate md:text-2xl">
                <span aria-hidden="true" className="mt-[0.2em] font-light">
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
