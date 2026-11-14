"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { tierLabel } from "@/content/club";
import { funnel } from "@/content/funnel";
import { cityBySlug, OTHER_CITY } from "@/content/cities";
import {
  codeAllowsTier,
  describeCode,
  describeTiers,
  findCode,
  memberCodeFields,
  needsPayment,
  priceFor,
  redeemCode,
  type InviteCode,
} from "@/lib/codes";
import { notifyRecipients, sendMail } from "@/lib/mail";
import { acceptedMail, applicationConfirmation, applicationNotification, applicationRows, directJoinNotification } from "@/lib/mail/templates";
import { sendWelcome, upsertMember } from "@/lib/members";
import { allowRequest, clientIp, hashIp } from "@/lib/rate-limit";
import { scoreApplication } from "@/lib/scoring";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  BOOLEAN_FIELDS,
  emptyDraft,
  fieldStep,
  HONEYPOT,
  parseApplication,
  toFieldErrors,
  usesCompany,
  type Application,
  type ApplicationDraft,
  type FieldErrors,
  type StepId,
} from "@/lib/validation/application";

export type ApplicationState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors; step?: StepId };

/** Ergebnis der Code-Prüfung im ersten Schritt */
export type CodeCheck =
  | { status: "ok"; code: string; benefit: string; tiers: string[]; tiersLabel: string; skipApplication: boolean }
  | { status: "error"; message: string };

/** Unter dieser Ausfülldauer gilt das Formular als automatisiert abgeschickt. */
const MIN_FILL_MS = 4000;

async function ipHashOrNull(): Promise<string | null> {
  try {
    return hashIp(await clientIp());
  } catch (error) {
    console.warn("IP-Hash nicht möglich:", (error as Error).message);
    return null;
  }
}

/** Einladungscode im ersten Schritt prüfen, ohne ihn einzulösen */
export async function checkInviteCode(raw: string): Promise<CodeCheck> {
  const ipHash = await ipHashOrNull();
  if (ipHash && !(await allowRequest("code", ipHash))) return { status: "error", message: funnel.code.rateLimit };
  const found = await findCode(String(raw ?? ""));
  if (!found?.usable) return { status: "error", message: funnel.code.invalid };
  const { code } = found;
  return {
    status: "ok",
    code: code.code,
    benefit: describeCode(code),
    tiers: code.tiers,
    tiersLabel: describeTiers(code),
    skipApplication: code.skip_application,
  };
}

export async function submitApplication(_prev: ApplicationState, formData: FormData): Promise<ApplicationState> {
  // Spam: still so tun, als hätte alles geklappt, damit Bots nichts lernen
  const startedAt = Number(formData.get("startedAt"));
  if (formData.get(HONEYPOT) || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    redirect("/danke");
  }

  const raw = Object.fromEntries(
    Object.keys(emptyDraft).map((key) => [
      key,
      (BOOLEAN_FIELDS as readonly string[]).includes(key) ? formData.get(key) === "on" : String(formData.get(key) ?? ""),
    ]),
  ) as ApplicationDraft;

  // Code vorab prüfen: bestimmt, ob die Bewerbung übersprungen wird
  let code: InviteCode | null = null;
  if (raw.code.trim()) {
    const found = await findCode(raw.code);
    if (!found?.usable || !codeAllowsTier(found.code, raw.circle || "community")) {
      return { status: "error", message: funnel.errors.codeInvalid, fieldErrors: { code: funnel.code.invalid }, step: "kreis" };
    }
    code = found.code;
  }
  const direct = Boolean(code?.skip_application);

  const parsed = parseApplication(raw, direct);
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
  if (code && !codeAllowsTier(code, application.circle)) {
    return {
      status: "error",
      message: funnel.code.wrongCircle.replace("{tiers}", describeTiers(code)),
      fieldErrors: { code: funnel.code.wrongCircle.replace("{tiers}", describeTiers(code)) },
      step: "kreis",
    };
  }

  const ipHash = await ipHashOrNull();
  if (ipHash && !(await allowRequest("application", ipHash))) {
    return { status: "error", message: funnel.errors.rateLimit };
  }

  const cityName =
    application.city === OTHER_CITY ? application.cityOther : (cityBySlug(application.city)?.name ?? application.city);

  if (direct && code) return joinWithCode(application, code, cityName);

  // Code für die spätere Aufnahme reservieren (zählt als Nutzung)
  if (code) {
    const redeemed = await redeemCode(code.code);
    if (!redeemed) {
      return { status: "error", message: funnel.errors.codeInvalid, fieldErrors: { code: funnel.code.invalid }, step: "kreis" };
    }
  }

  let id: string;
  const score = scoreApplication(application);
  const company = usesCompany(application.circle);
  try {
    const { data, error } = await supabaseAdmin()
      .from("applications")
      .insert({
        score,
        name: application.name,
        email: application.email.toLowerCase(),
        phone: application.phone || null,
        city: cityName,
        city_slug: application.city,
        profile_url: application.profileUrl || null,
        suggested_circle: application.circle,
        stage: company ? application.stage : application.circle === "founder" ? "vor_gruendung" : null,
        industry: application.industry || null,
        company: application.company || null,
        legal_form: application.legalForm || null,
        role: application.role || null,
        founded_year: application.foundedYear ? Number(application.foundedYear) : null,
        employees: application.employees || null,
        revenue_range: application.revenueRange || null,
        current_activity: application.currentActivity || null,
        founding_timeline: application.foundingTimeline || null,
        idea: application.idea || null,
        goal_12m: application.goal12m || null,
        bottleneck: application.bottleneck || null,
        expectation: application.expectation || null,
        mastermind_focus: application.mastermindFocus || null,
        has_children: application.hasChildren || null,
        time_commitment: application.timeCommitment || null,
        invite_code: code?.code ?? null,
        commitment_accepted_at: new Date().toISOString(),
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

/**
 * Aufnahme über Einladungscode ohne Bewerbung: Konto und Mitgliedschaft sofort anlegen.
 * Kostenlos (100 % oder freie Monate): sofort aktiv mit Willkommensmail.
 * Sonst: Zahlung offen, Mail mit Beitrag; freigeschaltet wird nach Zahlungseingang.
 */
async function joinWithCode(application: Application, code: InviteCode, cityName: string): Promise<ApplicationState> {
  const email = application.email.trim().toLowerCase();
  const db = supabaseAdmin();

  // Bestehende Konten nie über das öffentliche Formular verändern
  const { data: existing } = await db.from("members").select("user_id").eq("email", email).maybeSingle();
  if (existing) return { status: "error", message: funnel.errors.exists, fieldErrors: { email: funnel.errors.exists }, step: "person" };

  const redeemed = await redeemCode(code.code);
  if (!redeemed) {
    return { status: "error", message: funnel.errors.codeInvalid, fieldErrors: { code: funnel.code.invalid }, step: "kreis" };
  }

  const paymentDue = needsPayment(redeemed);
  const tier = application.circle;
  try {
    const { userId } = await upsertMember({
      email,
      fullName: application.name,
      tier,
      citySlug: application.city === OTHER_CITY ? "osnabrueck" : application.city,
      status: paymentDue ? "payment_due" : "active",
      sendWelcome: false,
    });
    await db
      .from("members")
      .update({ ...memberCodeFields(redeemed), website: application.profileUrl || null })
      .eq("user_id", userId);
  } catch (error) {
    console.error("Aufnahme mit Code:", (error as Error).message);
    return { status: "error", message: funnel.errors.generic };
  }

  const benefit = describeCode(redeemed);
  after(async () => {
    const first = application.name.split(" ")[0] ?? application.name;
    const codeLine = `Mit deinem Code ${redeemed.code}: ${benefit}.`;
    try {
      if (paymentDue) {
        const price = priceFor(tier, redeemed.discount_percent);
        await sendMail(
          acceptedMail({
            to: email,
            name: first,
            tier: tierLabel(tier),
            price: price?.gross ?? "",
            period: price?.period ?? "",
            vat: price?.vat ?? "",
            codeNote: ` ${codeLine}`,
          }),
        );
      } else {
        const mailError = await sendWelcome({ email, fullName: application.name, tier, role: "member", extra: [codeLine] });
        if (mailError) throw new Error(mailError);
      }
    } catch (error) {
      console.error("Mail an neues Mitglied:", (error as Error).message);
    }
    const recipients = notifyRecipients();
    if (recipients.length) {
      await sendMail(
        directJoinNotification({
          to: recipients,
          name: application.name,
          email,
          circle: tierLabel(tier),
          code: redeemed.code,
          benefit,
          status: paymentDue ? "Zahlung offen" : "Aktiv",
          rows: [
            ["Stadt", cityName],
            ["Telefon", application.phone || "–"],
            ["Link", application.profileUrl || "–"],
            ...applicationRows(application),
          ],
        }),
      ).catch((error: unknown) => console.error("Team-Mail Code:", (error as Error).message));
    }
  });

  redirect("/danke?direkt=1");
}
