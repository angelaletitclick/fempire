import { gruenderinnen } from "@/content/landing";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Gruenderinnen() {
  return (
    <Section
      id={gruenderinnen.id}
      index="05"
      label={gruenderinnen.label}
      headline={gruenderinnen.headline}
      intro={gruenderinnen.intro}
    >
      <div className="grid gap-16 md:grid-cols-2 md:gap-10">
        {gruenderinnen.people.map((person, i) => (
          <Reveal as="article" key={person.name} delay={i * 120} className="flex flex-col">
            <ImagePlaceholder caption={person.imageCaption} />
            <h3 className="headline mt-10 text-2xl sm:text-4xl lg:text-5xl [hyphens:none]">{person.name}</h3>
            <p className="label mt-4">{person.role}</p>
            <p className="prose-width mt-6 text-base leading-relaxed text-slate">{person.bio}</p>
            <p className="prose-width mt-6 border-t border-line pt-6 text-base leading-relaxed text-white">
              {person.club}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
