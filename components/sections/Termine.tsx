import { termine } from "@/content/landing";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Termine() {
  return (
    <Section id={termine.id} index="04" label={termine.label} headline={termine.headline} intro={termine.intro}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <ul className="border-t border-line lg:col-span-8">
          {termine.items.map((item) => (
            <Reveal
              as="li"
              key={`${item.date}-${item.title}`}
              className="grid gap-2 border-b border-line py-7 sm:grid-cols-12 sm:gap-6"
            >
              <p className="headline text-2xl sm:col-span-4">{item.date}</p>
              <div className="sm:col-span-5">
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="text-base text-slate">{item.place}</p>
              </div>
              <p className="label sm:col-span-3 sm:text-right">{item.note}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal as="aside" delay={120} className="border border-line p-8 lg:col-span-4">
          <p className="label text-pink">{termine.foundingNote.title}</p>
          <p className="mt-5 text-lg leading-relaxed">{termine.foundingNote.body}</p>
        </Reveal>
      </div>
    </Section>
  );
}
