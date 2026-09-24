import { gruenderinnen } from "@/content/landing";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { PressFeature } from "./PressFeature";

/**
 * Kompakt, damit beide Porträts auf dem Desktop ohne Scrollen in eine Bildschirmhöhe passen:
 * je eine Karte, Bild schmal links, Text daneben.
 */
export function Gruenderinnen() {
  return (
    <Section
      id={gruenderinnen.id}
      index="05"
      label={gruenderinnen.label}
      headline={gruenderinnen.headline}
      intro={gruenderinnen.intro}
    >
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        {gruenderinnen.people.map((person, i) => (
          <Reveal
            as="article"
            key={person.name}
            delay={i * 150}
            className="card grid grid-cols-[5.5rem_1fr] gap-x-5 gap-y-5 p-5 sm:grid-cols-[9rem_1fr] sm:gap-x-7 sm:p-7"
          >
            <ImagePlaceholder caption={person.imageCaption} captionClassName="hidden sm:block" />
            <div className="min-w-0 self-center sm:self-start">
              <h3 className="headline text-xl [hyphens:none] sm:text-2xl xl:text-3xl">{person.name}</h3>
              <p className="label mt-3">{person.role}</p>
              <p className="mt-4 hidden text-base leading-relaxed text-slate-light sm:block">{person.bio}</p>
            </div>
            <p className="col-span-2 text-base leading-relaxed text-slate-light sm:hidden">{person.bio}</p>
            <p className="col-span-2 border-t border-line pt-4 text-base leading-relaxed text-white">
              {person.club}
            </p>
          </Reveal>
        ))}
      </div>
      <PressFeature />
    </Section>
  );
}
