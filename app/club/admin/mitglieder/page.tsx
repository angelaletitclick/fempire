import Link from "next/link";
import { ActionForm } from "@/components/club/ActionForm";
import { Avatar } from "@/components/club/Avatar";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { ConfirmPayment } from "@/components/club/ConfirmPayment";
import { CheckField, SelectField, TextField } from "@/components/club/fields";
import { PageHead } from "@/components/club/PageHead";
import { TierBadge } from "@/components/club/TierBadge";
import { memberStatuses, roles, tiers } from "@/content/club";
import { requireAdmin, type Member } from "@/lib/auth";
import { memberDiscountNote } from "@/lib/codes";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/time";
import { addMember, deleteMember, updateMembership } from "./actions";

export default async function AdminMitgliederPage() {
  const viewer = await requireAdmin();
  const { data } = await supabaseAdmin()
    .from("members")
    .select("user_id, email, full_name, role, tier, status, company, avatar_path, updated_at, created_at, invite_code, discount_percent, free_until")
    .order("role")
    .order("full_name");
  const members = (data ?? []) as Array<
    Member & { email: string | null; invite_code: string | null; discount_percent: number; free_until: string | null }
  >;

  return (
    <div className="container-site py-section">
      <PageHead
        label="Backend"
        headline="Mitglieder."
        intro="Status „Aktiv (bezahlt)“ schaltet Forum, Termine, Verzeichnis und Mitglieder-Artikel frei. Pausiert oder beendet sperrt den Zugang, das Profil bleibt erhalten."
      />

      <ul className="mt-10 grid gap-3">
        {members.map((member) => (
          <li key={member.user_id} className="card p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar member={member} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <Link href={`/club/admin/mitglieder/${member.user_id}`} className="font-semibold text-white hover:underline">
                    {member.full_name}
                  </Link>
                  <TierBadge member={member} />
                </p>
                <p className="text-sm text-slate-light">
                  {member.email}
                  {member.company ? ` · ${member.company}` : ""} · seit {formatDate(member.created_at)}
                </p>
                {memberDiscountNote(member) ? <p className="mt-1 text-sm text-white">Beitrag: {memberDiscountNote(member)}</p> : null}
              </div>
              <Link href={`/club/admin/mitglieder/${member.user_id}`} className="label text-white underline-offset-4 hover:underline">
                Profil bearbeiten
              </Link>
            </div>
            {member.status === "payment_due" ? <ConfirmPayment userId={member.user_id} /> : null}
            <ActionForm action={updateMembership} submitLabel="Speichern" variant="outline" className="mt-5 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
              <input type="hidden" name="userId" value={member.user_id} />
              <SelectField name="tier" label="Mitgliedschaft" options={tiers} defaultValue={member.tier ?? ""} emptyLabel="Keine (nur Admin)" />
              <SelectField name="status" label="Status" options={memberStatuses} defaultValue={member.status} />
              <SelectField name="role" label="Rolle" options={roles} defaultValue={member.role} />
            </ActionForm>
            {member.user_id !== viewer.userId ? (
              <form action={deleteMember.bind(null, member.user_id)} className="mt-4">
                <ConfirmButton confirm={`Konto von ${member.full_name} endgültig löschen? Profil, Forum-Beiträge und Nachrichten werden mit gelöscht.`}>
                  Konto löschen
                </ConfirmButton>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      <section className="mt-14 max-w-2xl border border-white p-6 md:p-8">
        <h2 className="label text-white">Mitglied direkt anlegen</h2>
        <p className="mt-2 text-sm text-slate-light">Für Mitglieder ohne Online-Bewerbung. Sie melden sich danach mit ihrer E-Mail-Adresse an.</p>
        <ActionForm action={addMember} submitLabel="Anlegen" pendingLabel="Wird angelegt" resetOnSuccess className="mt-6">
          <TextField name="fullName" label="Name" maxLength={120} />
          <TextField name="email" label="E-Mail" type="email" maxLength={200} />
          <SelectField name="tier" label="Mitgliedschaft" options={tiers} defaultValue="leader" />
          <CheckField name="sendWelcome" label="Willkommensmail mit Login-Link senden" defaultChecked />
        </ActionForm>
      </section>
    </div>
  );
}
