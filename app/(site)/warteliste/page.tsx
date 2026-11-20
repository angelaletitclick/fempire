import type { Metadata } from "next";
import { WaitlistForm } from "@/components/sections/WaitlistForm";
import { Marked } from "@/components/ui/Marked";
import { SectionLabel } from "@/components/ui/Section";
import { closing } from "@/content/landing";

const t = closing.waitlist;

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: "/warteliste" },
};

/** Warteliste für die Mitgliedschaft. In der Aufbauphase Ziel aller „Warteliste“-Buttons. */
export default function WartelistePage() {
  return (
    <div className="container-site py-section">
      <SectionLabel index="·" label={t.meta.title} />
      <h1 className="headline mt-6 max-w-[20ch] text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-6xl">
        <Marked text={t.pageHeadline} />
      </h1>
      <p className="prose-width mt-6 text-lg leading-relaxed text-slate-light">{t.pageIntro}</p>
      <div className="mt-12">
        <WaitlistForm />
      </div>
    </div>
  );
}
