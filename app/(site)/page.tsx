import { Ablauf } from "@/components/sections/Ablauf";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { Faq } from "@/components/sections/Faq";
import { Filter } from "@/components/sections/Filter";
import { Formate } from "@/components/sections/Formate";
import { Gruenderinnen } from "@/components/sections/Gruenderinnen";
import { Hero } from "@/components/sections/Hero";
import { Manifest } from "@/components/sections/Manifest";
import { Termine } from "@/components/sections/Termine";
import { OrganizationJsonLd } from "@/components/sections/OrganizationJsonLd";

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <Manifest />
      <Filter />
      <Formate />
      <Termine />
      <Gruenderinnen />
      <Ablauf />
      <Faq />
      <ClosingCta />
    </>
  );
}
