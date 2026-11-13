import { ConfirmButton } from "@/components/club/ConfirmButton";
import { PageHead, Tag } from "@/components/club/PageHead";
import { formatLabel, optionLabel, trialStatuses } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatLong, formatShort, formatTime } from "@/lib/time";
import { deleteTrial, setTrialStatus } from "./actions";

type Row = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: string;
  event: { title: string; topic: string | null; format: string; starts_at: string } | null;
};

export default async function SchnuppernAdminPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin()
    .from("trial_requests")
    .select("id, created_at, name, email, phone, company, message, status, event:events(title, topic, format, starts_at)")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="container-site py-section">
      <PageHead
        label="Backend"
        headline="Schnuppern."
        intro="Anfragen für Schnuppertermine. Bestätigt oder sagt ab und schreibt der Interessentin per Mail, die Adresse ist verlinkt."
      />
      {rows.length === 0 ? (
        <p className="mt-10 border border-line p-6 text-slate-light">Noch keine Anfragen.</p>
      ) : (
        <ul className="mt-10 grid gap-3">
          {rows.map((row) => (
            <li key={row.id} className={row.status === "neu" ? "border border-white p-5" : "card p-5"}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-white">{row.name}</p>
                  <p className="text-sm text-slate-light">
                    <a href={`mailto:${row.email}`} className="text-white underline underline-offset-4">
                      {row.email}
                    </a>
                    {row.phone ? ` · ${row.phone}` : ""}
                    {row.company ? ` · ${row.company}` : ""}
                  </p>
                  {row.event ? (
                    <p className="mt-2 text-sm text-white">
                      {formatLabel(row.event.format)}: {row.event.title}
                      {row.event.topic ? `, ${row.event.topic}` : ""} · {formatLong(row.event.starts_at)}, {formatTime(row.event.starts_at)} Uhr
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-light">Termin gelöscht</p>
                  )}
                  {row.message ? <p className="mt-3 whitespace-pre-line text-base text-slate-light">{row.message}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Tag tone={row.status === "neu" ? "white" : row.status === "abgesagt" ? "pink" : "line"}>{optionLabel(trialStatuses, row.status)}</Tag>
                  <span className="label">{formatShort(row.created_at)}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {row.status !== "bestaetigt" ? (
                  <form action={setTrialStatus.bind(null, row.id, "bestaetigt")}>
                    <ConfirmButton variant="primary">Bestätigt</ConfirmButton>
                  </form>
                ) : null}
                {row.status !== "abgesagt" ? (
                  <form action={setTrialStatus.bind(null, row.id, "abgesagt")}>
                    <ConfirmButton>Abgesagt</ConfirmButton>
                  </form>
                ) : null}
                <form action={deleteTrial.bind(null, row.id)}>
                  <ConfirmButton confirm="Anfrage endgültig löschen?">Löschen</ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
