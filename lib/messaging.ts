import type { Member } from "@/lib/auth";

const RANK: Record<string, number> = { community: 1, founder: 2, leader: 3, mastermind: 4 };

/**
 * Wer darf wem schreiben? Spiegelt die Datenbankregel can_message (Migration 20261116):
 * Team an alle und alle ans Team, sonst nur an die eigene oder eine niedrigere Mitgliedschaft.
 * Wer zuerst angeschrieben wurde, darf antworten (hasIncoming).
 */
export function canMessage(
  sender: Pick<Member, "user_id" | "role" | "tier">,
  recipient: Pick<Member, "user_id" | "role" | "tier">,
  hasIncoming = false,
): boolean {
  if (sender.user_id === recipient.user_id) return false;
  if (sender.role === "admin" || recipient.role === "admin" || hasIncoming) return true;
  return (RANK[sender.tier ?? ""] ?? 0) >= (RANK[recipient.tier ?? ""] ?? 0);
}
