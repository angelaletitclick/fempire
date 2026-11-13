import type { Metadata } from "next";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Marked } from "@/components/ui/Marked";
import { SectionLabel } from "@/components/ui/Section";
import { TermineList } from "@/components/sections/Termine";
import { termine } from "@/content/landing";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: termine.meta.title,
  description: termine.meta.description,
  alternates: { canonical: "/termine" },
};

// Änderungen im Backend aktualisieren die Seite sofort, zusätzlich stündlich,
// damit vergangene Termine verschwinden.
export const revalidate = 3600;

/** Eigene Seite mit allen kommenden Terminen. Bewusst nicht in der Navigation, zum Verlinken. */
export default function TerminePage() {
  return (
    <div className="container-site py-section">
      <SectionLabel index="T" label={termine.label} />
      <h1 className="headline mt-6 max-w-[20ch] text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-6xl">
        <Marked text={termine.headline} />
      </h1>
      <p className="prose-width mt-6 text-lg leading-relaxed text-slate-light">{termine.intro}</p>
      <div className="mt-14 md:mt-20">
        <TermineList limit={termine.showAll} />
      </div>
      <div className="mt-12">
        <ButtonLink href={site.cta.href} className="w-full sm:w-auto">
          {site.cta.label}
          <Arrow />
        </ButtonLink>
      </div>
    </div>
  );
}
