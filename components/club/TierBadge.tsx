import type { CSSProperties } from "react";
import { tierLabel, type Role, type Tier } from "@/content/club";
import { cx } from "@/lib/cx";

/**
 * Kennzeichnung der Mitgliedschaft in deren Farbe (Tokens --tier-* in globals.css).
 * Admins erscheinen als Team bzw. im Forum als Moderatorin.
 */
export function TierBadge({
  member,
  adminLabel = "Team",
  long = false,
  className,
}: {
  member: { role: Role | string; tier: Tier | string | null };
  adminLabel?: string;
  /** Ausgeschriebener Name statt Kurzform */
  long?: boolean;
  className?: string;
}) {
  const base = "label inline-flex items-center whitespace-nowrap px-2 py-0.5 text-[0.625rem]";
  if (member.role === "admin") {
    return <span className={cx(base, "bg-white text-plum", className)}>{adminLabel}</span>;
  }
  if (!member.tier) return null;
  const style = { "--tier": `var(--tier-${member.tier})`, "--tier-ink": `var(--tier-${member.tier}-ink)` } as CSSProperties;
  return (
    <span style={style} className={cx(base, "bg-[var(--tier)] text-[var(--tier-ink)]", className)}>
      {tierLabel(member.tier, !long)}
    </span>
  );
}
