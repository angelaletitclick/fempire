import type { Metadata } from "next";
import { ApplicationForm } from "@/components/funnel/ApplicationForm";
import { funnel } from "@/content/funnel";

export const metadata: Metadata = {
  title: funnel.meta.title,
  description: funnel.meta.description,
};

/** Fokussierter Screen ohne Navigation: nur das Formular. */
export default function BewerbungPage() {
  return (
    <main>
      <ApplicationForm />
    </main>
  );
}
