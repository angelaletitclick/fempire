import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { impressum } from "@/content/legal";

export const metadata: Metadata = { title: impressum.title };

export default function ImpressumPage() {
  return <LegalPage document={impressum} />;
}
