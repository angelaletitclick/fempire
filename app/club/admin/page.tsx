import Link from "next/link";
import { PageHead } from "@/components/club/PageHead";
import { Arrow } from "@/components/ui/Button";
import { formatLabel } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatLong, formatTime } from "@/lib/time";

export default async function AdminPage() {
  await requireAdmin();
  const db = supabaseAdmin();
  const count = (table: string, column: string, value: string) =>
    db.from(table).select("id", { count: "exact", head: true }).eq(column, value);

  const [applications, threads, trials, members, events] = await Promise.all([
    count("applications", "status", "neu"),
    count("forum_threads", "status", "pending"),
    count("trial_requests", "status", "neu"),
    db.from("members").select("user_id", { count: "exact", head: true }).eq("status", "active").eq("role", "member"),
    db
      .from("events")
      .select("id, title, topic, format, starts_at, status")
      .neq("status", "draft")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(4),
  ]);

  const tiles = [
    { label: "Neue Bewerbungen", value: applications.count ?? 0, href: "/club/admin/bewerbungen" },
    { label: "Forum: zur Freigabe", value: threads.count ?? 0, href: "/club/admin/forum" },
    { label: "Schnupper-Anfragen", value: trials.count ?? 0, href: "/club/admin/schnuppern" },
    { label: "Aktive Mitglieder", value: members.count ?? 0, href: "/club/admin/mitglieder" },
  ];

  return (
    <div className="container-site py-section">
      <PageHead label="Backend" headline="Übersicht." />
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link href={tile.href} className={`group flex h-full flex-col p-6 ${tile.value > 0 && tile.label !== "Aktive Mitglieder" ? "border border-white" : "card"}`}>
              <span className="label">{tile.label}</span>
              <span className="headline mt-4 text-5xl tabular-nums">{tile.value}</span>
              <span className="label mt-6 inline-flex items-center gap-2 text-white">
                Öffnen <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-14">
        <div className="flex items-center justify-between gap-4">
          <h2 className="label text-white">Nächste Termine</h2>
          <Link href="/club/admin/termine/neu" className="label text-white hover:underline">
            Termin anlegen
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {(events.data ?? []).map((event) => (
            <li key={event.id}>
              <Link href={`/club/admin/termine/${event.id}`} className="flex flex-wrap items-baseline justify-between gap-2 py-4 hover:bg-surface md:px-4">
                <span className="text-white">
                  {event.title}
                  {event.topic ? `: ${event.topic}` : ""} <span className="label ml-2">{formatLabel(event.format)}</span>
                </span>
                <span className="text-sm text-slate-light">
                  {formatLong(event.starts_at)}, {formatTime(event.starts_at)} Uhr{event.status === "cancelled" ? " · abgesagt" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
