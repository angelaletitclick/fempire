import Link from "next/link";
import { Avatar } from "@/components/club/Avatar";
import { PageHead } from "@/components/club/PageHead";
import { TierBadge } from "@/components/club/TierBadge";
import { club } from "@/content/club";
import { MEMBER_COLUMNS, requireMember, type Member } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Mitglieder" };

export default async function MitgliederPage() {
  await requireMember();
  const t = club.members;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("members").select(MEMBER_COLUMNS).order("full_name");
  // Admins (Team) zuerst, dann alle aktiven Mitglieder
  const members = ((data ?? []) as Member[])
    .filter((member) => member.role === "admin" || member.status === "active")
    .sort((a, b) => Number(b.role === "admin") - Number(a.role === "admin"));

  return (
    <div className="container-site py-section">
      <PageHead label={t.label} headline={t.headline} intro={t.intro} />
      {members.length === 0 ? (
        <p className="mt-12 border border-line p-6 text-slate-light">{t.empty}</p>
      ) : (
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.user_id} className="card">
              <Link href={`/club/mitglieder/${member.user_id}`} className="flex h-full items-start gap-4 p-5 hover:bg-plum">
                <Avatar member={member} size="md" />
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-white">{member.full_name}</p>
                  {member.position || member.company ? (
                    <p className="mt-1 text-sm text-slate-light">
                      {[member.position, member.company].filter(Boolean).join(", ")}
                    </p>
                  ) : null}
                  <p className="mt-3">
                    <TierBadge member={member} adminLabel={t.team} />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
