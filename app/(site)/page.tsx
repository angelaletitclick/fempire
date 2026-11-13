import { Ablauf } from "@/components/sections/Ablauf";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { WaitlistForm } from "@/components/sections/WaitlistForm";
import { Faq } from "@/components/sections/Faq";
import { Filter } from "@/components/sections/Filter";
import { FounderCircle } from "@/components/sections/FounderCircle";
import { LeaderCircle } from "@/components/sections/LeaderCircle";
import { Gruenderinnen } from "@/components/sections/Gruenderinnen";
import { Hero } from "@/components/sections/Hero";
import { Magazin } from "@/components/sections/Magazin";
import { Manifest } from "@/components/sections/Manifest";
import { OrganizationJsonLd } from "@/components/sections/OrganizationJsonLd";
import { Termine } from "@/components/sections/Termine";
import { Ticker } from "@/components/sections/Ticker";

// Termine und Magazin kommen aus dem Backend. Änderungen dort aktualisieren die Seite sofort,
// zusätzlich stündlich, damit vergangene Termine verschwinden.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <Ticker />
      <Manifest />
      <Filter />
      <LeaderCircle />
      <FounderCircle />
      <Termine />
      <Gruenderinnen />
      <Ablauf />
      <Faq />
      <Magazin />
      <ClosingCta waitlist={<WaitlistForm />} />
    </>
  );
}
