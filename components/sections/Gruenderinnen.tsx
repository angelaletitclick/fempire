import { gruenderinnen } from "@/content/landing";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

/**
 * Kompakt, damit beide Porträts auf dem Desktop ohne Scrollen in eine Bildschirmhöhe passen:
 * Bild schmal links, Text rechts daneben.
 */
export function Gruenderinnen() {
  return (
    <Section
      id={gruenderinnen.id}
      index="05"
      label={gruenderinnen.label}
      headline={gruenderinnen.headline}
      intro={gruenderinnen.intro}
      bodyClassName="mt-10 md:mt-12"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
        {gruenderinnen.people.map((person, i) => (
          <Reveal
            as="article"
            key={person.name}
            delay={i * 150}
            className="grid grid-cols-[6.5rem_1fr] gap-x-5 gap-y-5 border-t border-line pt-6 sm:grid-cols-[10rem_1fr] sm:gap-x-8 xl:grid-cols-[11rem_1fr]"
          >
            <ImagePlaceholder caption={person.imageCaption} captionClassName="hidden sm:block" />
            <div className="min-w-0">
              <h3 className="headline text-xl [hyphens:none] sm:text-2xl xl:text-3xl">{person.name}</h3>
              <p className="label mt-3">{person.role}</p>
              <p className="mt-4 hidden text-base leading-relaxed text-slate sm:block">{person.bio}</p>
              <p className="mt-4 hidden border-t border-line pt-4 text-base leading-relaxed text-white sm:block">
                {person.club}
              </p>
            </div>
            {/* Auf schmalen Screens läuft der Text unter Bild und Namen über die volle Breite */}
            <div className="col-span-2 sm:hidden">
              <p className="text-base leading-relaxed text-slate">{person.bio}</p>
              <p className="mt-4 border-t border-line pt-4 text-base leading-relaxed text-white">{person.club}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
