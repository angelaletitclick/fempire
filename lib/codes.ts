import "server-only";
import { tierLabel, type Tier } from "@/content/club";
import { membership } from "@/content/membership";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Einladungscode wie in der Tabelle invite_codes */
export type InviteCode = {
  id: string;
  created_at: string;
  code: string;
  note: string | null;
  tiers: Tier[];
  discount_percent: number;
  free_months: number;
  skip_application: boolean;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  active: boolean;
};

/** Vorteile eines Codes, wie sie bei Bewerberin und Mitglied gespeichert werden */
export type CodeBenefit = Pick<InviteCode, "code" | "tiers" | "discount_percent" | "free_months" | "skip_application">;

export const normalizeCode = (value: string) => value.trim().toUpperCase().replace(/\s+/g, "");

/** Code nachschlagen. `usable`: aktiv, nicht abgelaufen, nicht aufgebraucht. */
export async function findCode(raw: string): Promise<{ code: InviteCode; usable: boolean } | null> {
  const value = normalizeCode(raw);
  if (value.length < 4 || value.length > 40) return null;
  const { data } = await supabaseAdmin().from("invite_codes").select("*").eq("code", value).maybeSingle();
  if (!data) return null;
  const code = data as InviteCode;
  return { code, usable: isUsable(code) };
}

export function isUsable(code: InviteCode): boolean {
  if (!code.active) return false;
  if (code.expires_at && new Date(code.expires_at).getTime() <= Date.now()) return false;
  if (code.max_uses !== null && code.uses >= code.max_uses) return false;
  return true;
}

export const codeAllowsTier = (code: Pick<InviteCode, "tiers">, tier: string) => code.tiers.length === 0 || code.tiers.includes(tier as Tier);

/** Lesbare Beschreibung der Vorteile, z. B. „Die ersten 3 Monate kostenlos · Aufnahme ohne Bewerbung“ */
export function describeCode(code: Pick<InviteCode, "discount_percent" | "free_months" | "skip_application">): string {
  const parts: string[] = [];
  if (code.discount_percent >= 100) parts.push("Mitgliedschaft kostenlos");
  else if (code.discount_percent > 0) parts.push(`${code.discount_percent} % Rabatt auf den Monatsbeitrag`);
  if (code.free_months > 0 && code.discount_percent < 100) {
    parts.push(code.free_months === 1 ? "Der erste Monat kostenlos" : `Die ersten ${code.free_months} Monate kostenlos`);
  }
  if (code.skip_application) parts.push("Aufnahme ohne Bewerbung");
  return parts.join(" · ");
}

export function describeTiers(code: Pick<InviteCode, "tiers">): string {
  return code.tiers.length ? code.tiers.map((tier) => tierLabel(tier)).join(", ") : "alle Mitgliedschaften";
}

/** Zählt die Nutzung atomar hoch. Liefert den Code oder null, wenn er nicht mehr gilt. */
export async function redeemCode(raw: string): Promise<InviteCode | null> {
  const { data, error } = await supabaseAdmin().rpc("redeem_invite_code", { p_code: normalizeCode(raw) });
  if (error) {
    console.error("Code einlösen:", error.message);
    return null;
  }
  const rows = (data ?? []) as InviteCode[];
  return rows[0] ?? null;
}

/** Datum in n Monaten (YYYY-MM-DD) */
function inMonths(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

/** Felder für members, wenn ein Code bei der Aufnahme angewendet wird */
export function memberCodeFields(code: CodeBenefit | null) {
  if (!code) return { invite_code: null, discount_percent: 0, free_until: null };
  return {
    invite_code: code.code,
    discount_percent: code.discount_percent,
    free_until: code.free_months > 0 ? inMonths(code.free_months) : null,
  };
}

/** Muss vor der Freischaltung gezahlt werden? Nein bei 100 % Rabatt oder kostenlosen ersten Monaten. */
export function needsPayment(code: CodeBenefit | null): boolean {
  if (!code) return true;
  return code.discount_percent < 100 && code.free_months === 0;
}

const euro = (cents: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

/** Monatsbeitrag einer Mitgliedschaft mit Rabatt, z. B. „ab 124,50 €“ */
export function priceFor(tier: Tier | null, discountPercent = 0): { gross: string; period: string; vat: string } | null {
  const circle = membership.circles.find((entry) => entry.tier === tier);
  if (!circle) return null;
  const cents = Math.round(circle.grossCents * (1 - discountPercent / 100));
  return { gross: `${circle.from ? "ab " : ""}${euro(cents)}`, period: circle.period, vat: circle.price.vatNote };
}

/** Lesbarer Hinweis zum Code eines Mitglieds, z. B. für Dashboard und Backend */
export function memberDiscountNote(member: { invite_code: string | null; discount_percent: number; free_until: string | null }): string | null {
  const parts: string[] = [];
  if (member.discount_percent >= 100) parts.push("kostenlos");
  else if (member.discount_percent > 0) parts.push(`${member.discount_percent} % Rabatt`);
  if (member.free_until && member.discount_percent < 100) {
    const until = new Date(`${member.free_until}T00:00:00`);
    if (until.getTime() > Date.now()) parts.push(`kostenlos bis ${until.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`);
  }
  if (!parts.length) return null;
  return `${parts.join(", ")}${member.invite_code ? ` (Code ${member.invite_code})` : ""}`;
}
