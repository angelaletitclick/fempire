"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { funnel } from "@/content/funnel";
import { notifyRecipients, sendMail } from "@/lib/mail";
import { applicationConfirmation, applicationNotification } from "@/lib/mail/templates";
import { allowRequest, clientIp, hashIp } from "@/lib/rate-limit";
import { scoreApplication } from "@/lib/scoring";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cityBySlug, OTHER_CITY } from "@/content/cities";
import {
  emptyDraft,
  fieldStep,
  HONEYPOT,
  isFoundations,
  parseApplication,
  toFieldErrors,
  type FieldErrors,
  type StepId,
} from "@/lib/validation/application";

export type ApplicationState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors; step?: StepId };

/** Unter dieser Ausfülldauer gilt das Formular als automatisiert abgeschickt. */
const MIN_FILL_MS = 4000;

export async function submitApplication(_prev: ApplicationState, formData: FormData): Promise<ApplicationState> {
  // Spam: still so tun, als hätte alles geklappt, damit Bots nichts lernen
  const startedAt = Number(formData.get("startedAt"));
  if (formData.get(HONEYPOT) || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    redirect("/danke");
  }

  const raw = Object.fromEntries(
    Object.keys(emptyDraft).map((key) => [key, key === "privacy" ? formData.get(key) === "on" : String(formData.get(key) ?? "")]),
  );
  const parsed = parseApplication(raw);
  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error);
    const firstField = Object.keys(fieldErrors)[0];
    return {
      status: "error",
      message: funnel.errors.validation,
      fieldErrors,
      step: firstField ? fieldStep[firstField] : undefined,
    };
  }
  const application = parsed.data;
  const foundations = isFoundations(application);
  const cityName =
    application.city === OTHER_CITY ? application.cityOther : (cityBySlug(application.city)?.name ?? application.city);

  let ipHash: string | null = null;
  try {
    ipHash = hashIp(await clientIp());
  } catch (error) {
    console.warn("IP-Hash nicht möglich:", (error as Error).message);
  }

  let id: string;
  const score = scoreApplication(application);
  try {
    if (ipHash && !(await allowRequest("application", ipHash))) {
      return { status: "error", message: funnel.errors.rateLimit };
    }

    const { data, error } = await supabaseAdmin()
      .from("applications")
      .insert({
        score,
        name: application.name,
        email: application.email.toLowerCase(),
        phone: application.phone || null,
        city: cityName,
        city_slug: application.city,
        profile_url: application.profileUrl,
        stage: application.stage,
        suggested_circle: foundations ? "foundations" : "leader",
        industry: application.industry,
        // Leader-Pfad
        company: foundations ? null : application.company,
        legal_form: foundations ? null : application.legalForm,
        role: foundations ? null : application.role,
        founded_year: foundations ? null : application.foundedYear,
        employees: foundations ? null : application.employees,
        revenue_range: foundations ? null : application.revenueRange,
        // FOUNDATIONS-Pfad
        current_activity: foundations ? application.currentActivity : null,
        founding_timeline: foundations ? application.foundingTimeline : null,
        idea: foundations ? application.idea : null,
        goal_12m: application.goal12m,
        bottleneck: application.bottleneck,
        motivation: application.motivation,
        contribution: application.contribution,
        has_children: application.hasChildren || null,
        time_commitment: application.timeCommitment,
        privacy_accepted_at: new Date().toISOString(),
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Kein Datensatz zurückgegeben");
    id = data.id as string;
  } catch (error) {
    console.error("Bewerbung konnte nicht gespeichert werden:", (error as Error).message);
    return { status: "error", message: funnel.errors.generic };
  }

  // Mails nach der Antwort verschicken, damit die Bewerberin nicht wartet.
  // Ein Mailfehler lässt die bereits gespeicherte Bewerbung unberührt.
  after(async () => {
    const recipients = notifyRecipients();
    const results = await Promise.allSettled([
      sendMail(applicationConfirmation(application)),
      recipients.length
        ? sendMail(applicationNotification(application, { id, score, cityName }, recipients))
        : Promise.resolve(),
    ]);
    for (const result of results) {
      if (result.status === "rejected") console.error(`Bewerbung ${id}:`, result.reason);
    }
  });

  redirect("/danke");
}
