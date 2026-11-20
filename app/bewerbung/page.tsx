import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { site } from "@/content/site";
import { ApplicationForm } from "@/components/funnel/ApplicationForm";
import { funnel } from "@/content/funnel";

export const metadata: Metadata = {
  title: funnel.meta.title,
  description: funnel.meta.description,
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * Fokussierter Screen ohne Navigation: nur das Formular.
 * Links können Kreis und Einladungscode vorbelegen: /bewerbung?kreis=leader&code=FEMPIRE24
 */
export default async function BewerbungPage({ searchParams }: PageProps<"/bewerbung">) {
  const params = await searchParams;
  // Aufbauphase: keine Bewerbung auf eine Mitgliedschaft, nur Warteliste. Einladungscodes aus dem Backend gehen weiter.
  if (site.aufbauphase && !first(params.code)) redirect("/warteliste");
  return (
    <main>
      <ApplicationForm initialCircle={first(params.kreis).slice(0, 20)} initialCode={first(params.code).slice(0, 40)} />
    </main>
  );
}
