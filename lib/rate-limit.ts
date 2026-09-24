import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { securityEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** IP der Anfrage, auf Vercel aus x-forwarded-for. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** IP nie im Klartext speichern: gesalzener SHA-256-Hash. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${securityEnv().IP_HASH_SALT}:${ip}`).digest("hex");
}

const LIMITS = {
  application: { limit: 5, windowSeconds: 60 * 60 },
  waitlist: { limit: 10, windowSeconds: 60 * 60 },
} as const;

/**
 * Prüft das Limit in Supabase (Funktion hit_rate_limit, siehe Migration).
 * Fällt die Prüfung technisch aus, wird die Anfrage durchgelassen: lieber ein
 * möglicher Spam-Eintrag als eine verlorene echte Bewerbung.
 */
export async function allowRequest(bucket: keyof typeof LIMITS, ipHash: string): Promise<boolean> {
  const { limit, windowSeconds } = LIMITS[bucket];
  const { data, error } = await supabaseAdmin().rpc("hit_rate_limit", {
    p_bucket: bucket,
    p_key: ipHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("Rate-Limit-Prüfung fehlgeschlagen", error.message);
    return true;
  }
  return data === true;
}
