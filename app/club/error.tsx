"use client";

import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Section";

/** Fehlerseite im Mitgliederbereich statt der englischen Standardmeldung */
export default function ClubError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-site max-w-2xl py-section">
      <SectionLabel index="·" label="Fehler" />
      <h1 className="headline mt-6 text-[2.25rem] leading-[1.1] sm:text-5xl">Das hat nicht geklappt.</h1>
      <p className="mt-5 text-base leading-relaxed text-slate-light">
        Bitte versuch es noch einmal. Wenn du gerade ein Foto hochgeladen hast: Nimm ein kleineres Bild oder einen Screenshot davon.
        Hält der Fehler an, schreib uns kurz, was du gemacht hast.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => reset()}>Erneut versuchen</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Seite neu laden
        </Button>
      </div>
    </section>
  );
}
