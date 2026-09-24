import "server-only";
import type { Application } from "@/lib/validation/application";

/**
 * Interne Vorbewertung einer Bewerbung, 0 bis 100. Wird nur in der Datenbank gespeichert
 * und nie an die Bewerberin zurückgegeben. Sie ersetzt nicht das Lesen, sondern hilft beim Sortieren.
 *
 * ANNAHME: Gewichtung 40 Umsatz, 30 Rolle und Rechtsform, 30 Vollständigkeit.
 */

const REVENUE: Record<string, number> = {
  lt250k: 5,
  "250k-500k": 15,
  "500k-1m": 25,
  "1m-3m": 35,
  gt3m: 40,
  angestellt: 15,
};

const ROLE: Record<string, number> = {
  gruenderin_gf: 20,
  gf: 20,
  investorin: 20,
  c_level: 20,
  gesellschafterin: 18,
  fuehrungskraft: 12,
  selbststaendig: 6,
  andere: 5,
};

const LEGAL_FORM: Record<string, number> = {
  gmbh: 10,
  holding: 10,
  gmbh_co_kg: 10,
  ag: 10,
  ug: 6,
  angestellt: 6,
  einzel: 3,
  freiberuflich: 3,
  andere: 2,
};

function textDepth(value: string): number {
  const length = value.trim().length;
  if (length >= 200) return 6;
  if (length >= 80) return 4;
  return 1;
}

export function scoreApplication(application: Application): number {
  const revenue = REVENUE[application.revenueRange] ?? 0;
  const position = Math.min(30, (ROLE[application.role] ?? 0) + (LEGAL_FORM[application.legalForm] ?? 0));
  const completeness =
    textDepth(application.goal12m) +
    textDepth(application.bottleneck) +
    textDepth(application.motivation) +
    textDepth(application.contribution) +
    (application.phone ? 3 : 0) +
    (application.profileUrl ? 3 : 0);

  return Math.max(0, Math.min(100, revenue + position + completeness));
}
