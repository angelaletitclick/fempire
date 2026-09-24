import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { datenschutz } from "@/content/legal";

export const metadata: Metadata = { title: datenschutz.title };

export default function DatenschutzPage() {
  return <LegalPage document={datenschutz} />;
}
