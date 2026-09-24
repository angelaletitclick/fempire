"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { sendMail } from "@/lib/mail";
import { waitlistConfirm } from "@/lib/mail/templates";
import { allowRequest, clientIp, hashIp } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { HONEYPOT } from "@/lib/validation/application";
import { waitlistSchema } from "@/lib/validation/waitlist";

export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: { email?: string; city?: string } };

const GENERIC_ERROR = "Das hat nicht geklappt. Bitte versuch es später noch einmal.";

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Spam: Erfolg vortäuschen, nichts speichern
  if (formData.get(HONEYPOT)) return { status: "success" };

  const parsed = waitlistSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    city: String(formData.get("city") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: { email?: string; city?: string } = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "email" | "city";
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Bitte prüfe deine Angaben.", fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const { city } = parsed.data;

  try {
    let ipHash: string | null = null;
    try {
      ipHash = hashIp(await clientIp());
    } catch {
      // Salt fehlt: ohne Rate-Limit weitermachen
    }
    if (ipHash && !(await allowRequest("waitlist", ipHash))) {
      return { status: "error", message: "Zu viele Versuche. Bitte versuch es in einer Stunde noch einmal." };
    }

    const db = supabaseAdmin();
    let token: string | null = null;

    const inserted = await db
      .from("waitlist")
      .insert({ email, city, ip_hash: ipHash })
      .select("confirm_token")
      .single();

    if (inserted.error?.code === "23505") {
      // Schon eingetragen: nur erneut bestätigen lassen, falls noch offen.
      // Nach außen immer dieselbe Antwort, damit niemand Adressen abfragen kann.
      const existing = await db
        .from("waitlist")
        .select("confirm_token, confirmed_at")
        .eq("email", email)
        .eq("city", city)
        .maybeSingle();
      if (existing.data && !existing.data.confirmed_at) token = existing.data.confirm_token as string;
    } else if (inserted.error || !inserted.data) {
      throw new Error(inserted.error?.message ?? "Kein Datensatz");
    } else {
      token = inserted.data.confirm_token as string;
    }

    if (token) {
      const mail = waitlistConfirm({
        email,
        city,
        confirmUrl: `${siteUrl}/warteliste/bestaetigen?token=${token}`,
        unsubscribeUrl: `${siteUrl}/warteliste/abmelden?token=${token}`,
      });
      after(async () => {
        try {
          await sendMail(mail);
        } catch (error) {
          console.error("Wartelisten-Mail:", error);
        }
      });
    }
  } catch (error) {
    console.error("Warteliste:", (error as Error).message);
    return { status: "error", message: GENERIC_ERROR };
  }

  return { status: "success" };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Bestätigt die Eintragung. Per Button (POST), nicht beim Öffnen des Links. */
export async function confirmWaitlist(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  let ok = false;
  if (UUID.test(token)) {
    const { data, error } = await supabaseAdmin()
      .from("waitlist")
      .update({ confirmed_at: new Date().toISOString() })
      .eq("confirm_token", token)
      .select("id")
      .maybeSingle();
    if (error) console.error("Bestätigung:", error.message);
    ok = Boolean(data);
  }
  redirect(`/warteliste/bestaetigen?status=${ok ? "ok" : "ungueltig"}`);
}

/** Löscht die Eintragung vollständig. */
export async function leaveWaitlist(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (UUID.test(token)) {
    const { error } = await supabaseAdmin().from("waitlist").delete().eq("confirm_token", token);
    if (error) console.error("Abmeldung:", error.message);
  }
  // Immer dieselbe Antwort, auch bei unbekanntem Token
  redirect("/warteliste/abmelden?status=ok");
}
