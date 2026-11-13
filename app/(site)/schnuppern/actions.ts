"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { formatLabel } from "@/content/club";
import { schnuppern } from "@/content/schnuppern";
import { notifyRecipients, sendMail } from "@/lib/mail";
import { trialConfirmation, trialNotification } from "@/lib/mail/templates";
import { allowRequest, clientIp, hashIp } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatLong, formatTime } from "@/lib/time";
import { HONEYPOT } from "@/lib/validation/application";

const schema = z.object({
  eventId: z.uuid(schnuppern.errors.event),
  name: z.string().trim().min(2, schnuppern.errors.name).max(120),
  email: z.email(schnuppern.errors.email).max(200),
  phone: z.string().trim().max(40),
  company: z.string().trim().max(160),
  message: z.string().trim().max(2000),
  privacy: z.literal(true, schnuppern.errors.privacy),
});

export async function requestTrial(_prev: FormState, formData: FormData): Promise<FormState> {
  // Bots bekommen dieselbe Antwort wie Menschen
  if (formData.get(HONEYPOT)) return { status: "ok", message: schnuppern.success };

  const parsed = schema.safeParse({
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    message: formData.get("message") ?? "",
    privacy: formData.get("privacy") === "on",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? schnuppern.errors.generic };
  const input = parsed.data;

  const db = supabaseAdmin();
  try {
    let ipHash: string | null = null;
    try {
      ipHash = hashIp(await clientIp());
    } catch {
      ipHash = null;
    }
    if (ipHash && !(await allowRequest("trial", ipHash))) return { status: "error", message: schnuppern.errors.rateLimit };

    const { data: event } = await db
      .from("events")
      .select("id, title, topic, format, starts_at")
      .eq("id", input.eventId)
      .eq("status", "published")
      .not("trial_price_cents", "is", null)
      .gte("starts_at", new Date().toISOString())
      .maybeSingle();
    if (!event) return { status: "error", message: schnuppern.errors.event };

    const { error } = await db.from("trial_requests").insert({
      event_id: event.id,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      company: input.company || null,
      message: input.message || null,
      privacy_accepted_at: new Date().toISOString(),
      ip_hash: ipHash,
    });
    if (error) throw error;

    const date = `${formatLong(event.starts_at)}, ${formatTime(event.starts_at)} Uhr`;
    after(async () => {
      const to = notifyRecipients();
      const results = await Promise.allSettled([
        sendMail(trialConfirmation({ to: input.email, name: input.name.split(" ")[0] ?? input.name, date })),
        to.length
          ? sendMail(
              trialNotification({
                to,
                name: input.name,
                email: input.email,
                date,
                rows: [
                  ["Termin", `${formatLabel(event.format)}: ${event.title}${event.topic ? `, ${event.topic}` : ""}`],
                  ["Datum", date],
                  ["Name", input.name],
                  ["E-Mail", input.email],
                  ["Telefon", input.phone || "–"],
                  ["Unternehmen", input.company || "–"],
                  ["Nachricht", input.message || "–"],
                ],
              }),
            )
          : Promise.resolve(),
      ]);
      for (const result of results) if (result.status === "rejected") console.error("Schnuppern-Mail:", result.reason);
    });
  } catch (error) {
    console.error("Schnuppern:", (error as Error).message);
    return { status: "error", message: schnuppern.errors.generic };
  }

  revalidatePath("/club/admin/schnuppern");
  revalidatePath("/club/admin");
  return { status: "ok", message: schnuppern.success };
}
