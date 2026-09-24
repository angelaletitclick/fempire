import { Ablauf } from "@/components/sections/Ablauf";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { WaitlistForm } from "@/components/sections/WaitlistForm";
import { Faq } from "@/components/sections/Faq";
import { Filter } from "@/components/sections/Filter";
import { Foundations } from "@/components/sections/Foundations";
import { LeaderCircle } from "@/components/sections/LeaderCircle";
import { Gruenderinnen } from "@/components/sections/Gruenderinnen";
import { Hero } from "@/components/sections/Hero";
import { Manifest } from "@/components/sections/Manifest";
import { OrganizationJsonLd } from "@/components/sections/OrganizationJsonLd";
import { Termine } from "@/components/sections/Termine";
import { Ticker } from "@/components/sections/Ticker";

// Die Termine werden aus einer Regel berechnet. Einmal täglich neu erzeugen,
// damit "Nächstes Treffen" und die Terminliste nie veraltet sind.
export const revalidate = 86400;

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <Ticker />
      <Manifest />
      <Filter />
      <LeaderCircle />
      <Foundations />
      <Termine />
      <Gruenderinnen />
      <Ablauf />
      <Faq />
      <ClosingCta waitlist={<WaitlistForm />} />
    </>
  );
}
