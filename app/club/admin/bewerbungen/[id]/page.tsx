import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/club/ActionForm";
import { CheckField, SelectField, TextAreaField } from "@/components/club/fields";
import { PageHead, Tag } from "@/components/club/PageHead";
import { applicationStatuses, optionLabel, tierLabel, tiers } from "@/content/club";
import { TierBadge } from "@/components/club/TierBadge";
import { funnel } from "@/content/funnel";
import { requireAdmin } from "@/lib/auth";
import { codeAllowsTier, describeCode, describeTiers, findCode } from "@/lib/codes";
import { applicationRows } from "@/lib/mail/templates";
import { applicationFromRow } from "@/lib/validation/application";
import { safeUrl } from "@/lib/validation/profile";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatShort } from "@/lib/time";
import { acceptApplication, rejectApplication, updateApplication } from "../actions";

type Application = Record<string, string | number | null> & {
  id: string;
  name: string;
  email: string;
  status: string;
  suggested_circle: string;
  assigned_circle: string | null;
  internal_note: string | null;
  created_at: string;
  score: number;
};

export default async function BewerbungPage({ params }: PageProps<"/club/admin/bewerbungen/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabaseAdmin().from("applications").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const a = data as Application;
  const { fields } = funnel;
  const str = (value: unknown) => (value === null || value === undefined || value === "" ? "–" : String(value));
  const application = applicationFromRow(a);
  const circle = application.circle;
  const code = a.invite_code ? await findCode(String(a.invite_code)) : null;

  const rows: Array<[string, string]> = [
    [fields.email.label, a.email],
    [fields.phone.label, str(a.phone)],
    [fields.city.label, str(a.city)],
    [fields.profileUrl.label, str(a.profile_url)],
    ...applicationRows(application),
    // Ältere Bewerbungen enthalten noch Antworten auf die entfallenen Fragen
    ...(a.motivation ? ([["Warum dieser Kreis?", str(a.motivation)]] as Array<[string, string]>) : []),
    ...(a.contribution ? ([["Was bringst du ein?", str(a.contribution)]] as Array<[string, string]>) : []),
    ["Verbindlichkeit", a.commitment_accepted_at ? `bestätigt am ${formatShort(String(a.commitment_accepted_at))}` : "–"],
  ];
  const profileLink = safeUrl(a.profile_url as string | null);
  const decided = a.status === "aufgenommen" || a.status === "abgelehnt";

  return (
    <div className="container-site py-section">
      <Link href="/club/admin/bewerbungen" className="label hover:text-white">
        Alle Bewerbungen
      </Link>
      <div className="mt-8">
        <PageHead label={`Eingang ${formatShort(a.created_at)}`} headline={a.name} />
      </div>
      <p className="mt-5 flex flex-wrap gap-2">
        <Tag tone="white">{optionLabel(applicationStatuses, a.status)}</Tag>
        <Tag>Score {a.score}</Tag>
        <TierBadge member={{ role: "member", tier: circle }} long />
        {a.assigned_circle ? <Tag>Aufgenommen als {tierLabel(a.assigned_circle)}</Tag> : null}
      </p>
      {code ? (
        <p className="mt-4 border border-white p-4 text-sm text-white">
          <span className="label mr-2">Einladungscode</span>
          <span className="font-semibold">{code.code.code}</span>: {describeCode(code.code)} · gilt für {describeTiers(code.code)}
          {!codeAllowsTier(code.code, circle) ? " · gilt nicht für den gewählten Kreis" : ""}
          <span className="mt-1 block text-slate-light">Wird beim Aufnehmen automatisch angewendet.</span>
        </p>
      ) : a.invite_code ? (
        <p className="mt-4 text-sm text-slate-light">Einladungscode {String(a.invite_code)} (inzwischen gelöscht)</p>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <dl className="divide-y divide-line border-y border-line lg:col-span-7">
          {rows.map(([label, value]) => (
            <div key={label} className="py-4">
              <dt className="label">{label}</dt>
              <dd className="mt-1 whitespace-pre-line break-words text-base text-white">
                {label === fields.profileUrl.label && profileLink ? (
                  <a href={profileLink} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-4">
                    {value}
                  </a>
                ) : label === fields.email.label ? (
                  <a href={`mailto:${value}`} className="underline underline-offset-4">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid content-start gap-4 lg:col-span-5">
          <section className="card p-6">
            <h2 className="label text-white">Aufnehmen</h2>
            <p className="mt-2 text-sm text-slate-light">
              Legt das Konto mit Status „Zahlung offen“ an. Die Mail nennt den Beitrag und bittet um die erste Überweisung. Sobald das Geld da ist, schaltet ihr das Mitglied unter Mitglieder frei, dann geht die Willkommensmail mit dem Zugang raus. Ist die Mitgliedschaft über den Code kostenlos (100 % oder freie erste Monate), wird sie sofort freigeschaltet und die Willkommensmail geht direkt raus.
            </p>
            <ActionForm action={acceptApplication} submitLabel={a.status === "aufgenommen" ? "Erneut aufnehmen" : "Aufnehmen"} pendingLabel="Wird angelegt" className="mt-5">
              <input type="hidden" name="id" value={a.id} />
              <SelectField name="tier" label="Mitgliedschaft" options={tiers} defaultValue={a.assigned_circle ?? circle} />
              <CheckField name="sendWelcome" label="Aufnahme-Mail senden" defaultChecked />
            </ActionForm>
          </section>

          {a.status !== "abgelehnt" ? (
            <section className="border border-line p-6">
              <h2 className="label text-white">Ablehnen</h2>
              <ActionForm action={rejectApplication} submitLabel="Ablehnen" variant="outline" pendingLabel="Wird gespeichert" className="mt-5">
                <input type="hidden" name="id" value={a.id} />
                <CheckField name="sendRejection" label="Freundliche Absage per Mail senden" defaultChecked={!decided} />
              </ActionForm>
            </section>
          ) : null}

          <section className="border border-line p-6">
            <h2 className="label text-white">Status und Notiz</h2>
            <ActionForm action={updateApplication} submitLabel="Speichern" variant="outline" className="mt-5">
              <input type="hidden" name="id" value={a.id} />
              <SelectField name="status" label="Status" options={applicationStatuses} defaultValue={a.status} />
              <TextAreaField name="note" label="Interne Notiz" defaultValue={a.internal_note ?? ""} optional rows={5} maxLength={5000} />
            </ActionForm>
          </section>
        </div>
      </div>
    </div>
  );
}
