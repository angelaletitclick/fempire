"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { siteUrl } from "@/lib/site-url";
import { supabaseServer } from "@/lib/supabase/server";

export type LoginState = { status: "idle" } | { status: "sent" } | { status: "error"; message: string };

/**
 * Adresse, unter der die Seite gerade aufgerufen wird (Vercel-Domain, eigene Domain oder localhost).
 * So führt der Login-Link immer zurück auf dieselbe Website, auch ohne NEXT_PUBLIC_SITE_URL.
 */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Magic Link per Mail. shouldCreateUser: false, damit sich nur bereits eingeladene
 * Mitglieder anmelden können. Die Antwort ist immer dieselbe, egal ob die Adresse
 * existiert, damit niemand Mitglieder-Adressen abfragen kann.
 */
export async function requestLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { status: "error", message: "Bitte eine gültige E-Mail-Adresse angeben." };

  try {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.toLowerCase(),
      options: { shouldCreateUser: false, emailRedirectTo: `${await requestOrigin()}/club/auth/callback` },
    });
    // Unbekannte Adressen liefern einen Fehler, den wir bewusst nicht anzeigen
    if (error) console.warn("Club-Login:", error.message);
  } catch (error) {
    console.error("Club-Login:", (error as Error).message);
    return { status: "error", message: "Die Anmeldung ist gerade nicht erreichbar." };
  }
  return { status: "sent" };
}

export async function signOut(): Promise<void> {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/club/login");
}
