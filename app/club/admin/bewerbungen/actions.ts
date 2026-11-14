"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { funnel } from "@/content/funnel";
import { applicationStatuses, tierLabel, tierValues } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { acceptedMail, rejectionMail } from "@/lib/mail/templates";
import { codeAllowsTier, describeCode, findCode, memberCodeFields, needsPayment, priceFor } from "@/lib/codes";
import { sendWelcome, upsertMember } from "@/lib/members";
import { supabaseAdmin } from "@/lib/supabase/admin";

function revalidate(id: string) {
  revalidatePath("/club/admin/bewerbungen");
  revalidatePath(`/club/admin/bewerbungen/${id}`);
  revalidatePath("/club/admin");
  revalidatePath("/club/admin/mitglieder");
}

const acceptSchema = z.object({
  id: z.uuid(),
  tier: z.enum(tierValues),
  sendWelcome: z.boolean(),
});

/**
 * Aufnehmen: Konto und Mitgliedschaft anlegen, Status "Zahlung offen".
 * Die Mail nennt den Beitrag und bittet um die erste Zahlung. Freigeschaltet wird erst,
 * wenn ihr unter Mitglieder "Zahlung eingegangen" bestätigt.
 */
export async function acceptApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = acceptSchema.safeParse({
    id: formData.get("id"),
    tier: formData.get("tier"),
    sendWelcome: formData.get("sendWelcome") === "on",
  });
  if (!parsed.success) return { status: "error", message: "Bitte eine Mitgliedschaft wählen." };

  const db = supabaseAdmin();
  const { data: application } = await db
    .from("applications")
    .select("id, name, email, city_slug, company, role, invite_code")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!application) return { status: "error", message: "Bewerbung nicht gefunden." };

  // Einladungscode aus der Bewerbung anwenden, wenn er für die gewählte Mitgliedschaft gilt
  const tier = parsed.data.tier;
  const found = application.invite_code ? await findCode(application.invite_code as string) : null;
  const code = found && codeAllowsTier(found.code, tier) ? found.code : null;
  const paymentDue = needsPayment(code);

  try {
    const roleLabel = funnel.options.role.find((option) => option.value === application.role)?.label ?? null;
    const { userId } = await upsertMember({
      email: application.email,
      fullName: application.name,
      tier,
      citySlug: application.city_slug === "andere" ? "osnabrueck" : application.city_slug,
      company: application.company,
      position: roleLabel,
      applicationId: application.id,
      status: paymentDue ? "payment_due" : "active",
      sendWelcome: false,
    });
    await db.from("members").update(memberCodeFields(code)).eq("user_id", userId);
    await db
      .from("applications")
      .update({ status: "aufgenommen", assigned_circle: tier, decided_at: new Date().toISOString() })
      .eq("id", application.id);
    revalidate(application.id);

    const codeLine = code ? `Mit deinem Code ${code.code}: ${describeCode(code)}.` : "";
    const codeInfo = found && !code ? " Der Einladungscode gilt nicht für diese Mitgliedschaft und wurde nicht angewendet." : "";
    if (!parsed.data.sendWelcome) {
      return { status: "ok", message: `Aufgenommen${paymentDue ? ", Zahlung offen" : " und freigeschaltet"}. Ohne Mail.${codeInfo}` };
    }
    const first = application.name.split(" ")[0] ?? application.name;
    try {
      if (paymentDue) {
        const price = priceFor(tier, code?.discount_percent ?? 0);
        await sendMail(
          acceptedMail({
            to: application.email,
            name: first,
            tier: tierLabel(tier),
            price: price?.gross ?? "",
            period: price?.period ?? "",
            vat: price?.vat ?? "",
            codeNote: codeLine ? ` ${codeLine}` : "",
          }),
        );
      } else {
        const mailError = await sendWelcome({
          email: application.email,
          fullName: application.name,
          tier,
          role: "member",
          extra: codeLine ? [codeLine] : [],
        });
        if (mailError) throw new Error(mailError);
      }
    } catch (mailError) {
      console.error("Aufnahme-Mail:", (mailError as Error).message);
      return { status: "error", message: "Aufgenommen, aber die Mail ist nicht rausgegangen. Bitte Mail-Einstellungen prüfen." };
    }
    return {
      status: "ok",
      message: paymentDue
        ? `Aufgenommen. Die Mail mit der Bitte um den Beitrag ist raus. Nach Zahlungseingang unter Mitglieder freischalten.${codeInfo}`
        : "Aufgenommen und über den Code sofort freigeschaltet. Die Willkommensmail ist raus.",
    };
  } catch (error) {
    console.error("Aufnahme:", (error as Error).message);
    return { status: "error", message: `Aufnahme fehlgeschlagen: ${(error as Error).message}` };
  }
}

export async function rejectApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Bewerbung nicht gefunden." };
  const sendRejection = formData.get("sendRejection") === "on";

  const db = supabaseAdmin();
  const { data: application, error } = await db
    .from("applications")
    .update({ status: "abgelehnt", decided_at: new Date().toISOString() })
    .eq("id", id.data)
    .select("id, name, email")
    .maybeSingle();
  if (error || !application) return { status: "error", message: "Das hat nicht geklappt." };
  revalidate(application.id);

  if (!sendRejection) return { status: "ok", message: "Abgelehnt, ohne Mail." };
  try {
    await sendMail(rejectionMail({ to: application.email, name: application.name.split(" ")[0] ?? application.name }));
    return { status: "ok", message: "Abgelehnt. Die Absage ist raus." };
  } catch (mailError) {
    console.error("Absage-Mail:", (mailError as Error).message);
    return { status: "error", message: "Abgelehnt, aber die Absage-Mail ist nicht rausgegangen." };
  }
}

const noteSchema = z.object({
  id: z.uuid(),
  status: z.enum(applicationStatuses.map((s) => s.value) as [string, ...string[]]),
  note: z.string().max(5000),
});

/** Status (z. B. Kennenlerngespräch) und interne Notiz */
export async function updateApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = noteSchema.safeParse({ id: formData.get("id"), status: formData.get("status"), note: formData.get("note") ?? "" });
  if (!parsed.success) return { status: "error", message: "Bitte Eingaben prüfen." };
  const { error } = await supabaseAdmin()
    .from("applications")
    .update({ status: parsed.data.status, internal_note: parsed.data.note.trim() || null })
    .eq("id", parsed.data.id);
  if (error) return { status: "error", message: "Das hat nicht geklappt." };
  revalidate(parsed.data.id);
  return { status: "ok", message: "Gespeichert." };
}
