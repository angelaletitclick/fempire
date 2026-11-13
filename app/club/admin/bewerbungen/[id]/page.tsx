import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/club/ActionForm";
import { CheckField, SelectField, TextAreaField } from "@/components/club/fields";
import { PageHead, Tag } from "@/components/club/PageHead";
import { applicationStatuses, optionLabel, tierLabel, tiers } from "@/content/club";
import { funnel } from "@/content/funnel";
import { requireAdmin } from "@/lib/auth";
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
  const { fields, options } = funnel;
  const founder = a.suggested_circle === "foundations";
  const str = (value: unknown) => (value === null || value === undefined || value === "" ? "–" : String(value));

  const rows: Array<[string, string]> = [
    [fields.email.label, a.email],
    [fields.phone.label, str(a.phone)],
    [fields.city.label, str(a.city)],
    [fields.profileUrl.label, str(a.profile_url)],
    [fields.stage.label, optionLabel(options.stage, a.stage as string)],
    ...(founder
      ? ([
          [fields.industry.labelFoundations, str(a.industry)],
          [fields.currentActivity.label, str(a.current_activity)],
          [fields.foundingTimeline.label, optionLabel(options.foundingTimeline, a.founding_timeline as string)],
          [fields.idea.label, str(a.idea)],
          [fields.goal12m.labelFoundations, str(a.goal_12m)],
          [fields.bottleneck.labelFoundations, str(a.bottleneck)],
        ] as Array<[string, string]>)
      : ([
          [fields.company.label, str(a.company)],
          [fields.legalForm.label, optionLabel(options.legalForm, a.legal_form as string)],
          [fields.role.label, optionLabel(options.role, a.role as string)],
          [fields.foundedYear.label, str(a.founded_year)],
          [fields.employees.label, optionLabel(options.employees, a.employees as string)],
          [fields.industry.label, str(a.industry)],
          [fields.revenueRange.label, optionLabel(options.revenueRange, a.revenue_range as string)],
          [fields.goal12m.label, str(a.goal_12m)],
          [fields.bottleneck.label, str(a.bottleneck)],
        ] as Array<[string, string]>)),
    [fields.motivation.label, str(a.motivation)],
    [fields.contribution.label, str(a.contribution)],
    [fields.hasChildren.label, a.has_children ? optionLabel(options.hasChildren, a.has_children as string) : "Keine Angabe"],
    [fields.timeCommitment.label, optionLabel(options.timeCommitment, a.time_commitment as string)],
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
        <Tag>Vorschlag: {founder ? "Founder Circle" : "Leader Circle"}</Tag>
        {a.assigned_circle ? <Tag>Aufgenommen als {tierLabel(a.assigned_circle)}</Tag> : null}
      </p>

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
              Legt das Konto an und schaltet den Mitgliederbereich frei. Die Mitgliedschaft gilt als aktiv (bezahlt), ändern könnt ihr das unter Mitglieder.
            </p>
            <ActionForm action={acceptApplication} submitLabel={a.status === "aufgenommen" ? "Erneut aufnehmen" : "Aufnehmen"} pendingLabel="Wird angelegt" className="mt-5">
              <input type="hidden" name="id" value={a.id} />
              <SelectField name="tier" label="Mitgliedschaft" options={tiers} defaultValue={a.assigned_circle ?? (founder ? "founder" : "leader")} />
              <CheckField name="sendWelcome" label="Willkommensmail mit Login-Link senden" defaultChecked />
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
