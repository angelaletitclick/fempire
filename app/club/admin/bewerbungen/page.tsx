import Link from "next/link";
import { PageHead, Tag } from "@/components/club/PageHead";
import { TierBadge } from "@/components/club/TierBadge";
import { applicationStatuses, optionLabel } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { circleFromStored } from "@/lib/validation/application";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cx } from "@/lib/cx";
import { formatShort } from "@/lib/time";

type Row = {
  id: string;
  created_at: string;
  name: string;
  city: string;
  company: string | null;
  status: string;
  score: number;
  suggested_circle: string;
  invite_code: string | null;
};

const FILTERS = [{ value: "offen", label: "Offen" }, ...applicationStatuses, { value: "alle", label: "Alle" }];

export default async function BewerbungenPage({ searchParams }: PageProps<"/club/admin/bewerbungen">) {
  await requireAdmin();
  const { status: rawStatus } = await searchParams;
  const status = typeof rawStatus === "string" && FILTERS.some((f) => f.value === rawStatus) ? rawStatus : "offen";

  let query = supabaseAdmin()
    .from("applications")
    .select("id, created_at, name, city, company, status, score, suggested_circle, invite_code")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status === "offen") query = query.in("status", ["neu", "geprueft", "gespraech"]);
  else if (status !== "alle") query = query.eq("status", status);
  const { data } = await query;
  const rows = (data ?? []) as Row[];

  return (
    <div className="container-site py-section">
      <PageHead label="Backend" headline="Bewerbungen." intro="Jede Bewerberin wählt ihren Kreis selbst. Beim Aufnehmen könnt ihr die Mitgliedschaft noch ändern. Der Score ist nur hier sichtbar." />

      <nav aria-label="Filter" className="mt-10 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/club/admin/bewerbungen?status=${filter.value}`}
            aria-current={status === filter.value ? "page" : undefined}
            className={cx("label border px-3 py-2", status === filter.value ? "border-white bg-white text-plum" : "border-line hover:text-white")}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-8 border border-line p-6 text-slate-light">Keine Bewerbungen in dieser Ansicht.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={`/club/admin/bewerbungen/${row.id}`} className="grid gap-2 py-4 hover:bg-surface sm:grid-cols-12 sm:items-center md:px-4">
                <span className="sm:col-span-4">
                  <span className="block font-semibold text-white">{row.name}</span>
                  <span className="text-sm text-slate-light">
                    {[row.company, row.city].filter(Boolean).join(", ")}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2 sm:col-span-3">
                  <TierBadge member={{ role: "member", tier: circleFromStored(row.suggested_circle) }} long />
                  {row.invite_code ? <span className="label text-white">Code {row.invite_code}</span> : null}
                </span>
                <span className="text-sm tabular-nums text-white sm:col-span-1">Score {row.score}</span>
                <span className="sm:col-span-2">
                  <Tag tone={row.status === "neu" ? "white" : "line"}>{optionLabel(applicationStatuses, row.status)}</Tag>
                </span>
                <span className="text-sm text-slate-light sm:col-span-2 sm:text-right">{formatShort(row.created_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
