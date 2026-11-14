import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/club/ActionForm";
import { Avatar } from "@/components/club/Avatar";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { ConfirmPayment } from "@/components/club/ConfirmPayment";
import { SelectField } from "@/components/club/fields";
import { PageHead } from "@/components/club/PageHead";
import { ProfileFields } from "@/components/club/ProfileFields";
import { TierBadge } from "@/components/club/TierBadge";
import { memberStatuses, roles, tiers } from "@/content/club";
import { MEMBER_COLUMNS, requireAdmin, type Member } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/time";
import { deleteMember, saveMemberProfile, updateMembership } from "../actions";

/** Ein Mitglied im Backend: Mitgliedschaft und Status, komplettes Profil, Konto löschen */
export default async function AdminMemberPage({ params }: PageProps<"/club/admin/mitglieder/[id]">) {
  const viewer = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabaseAdmin().from("members").select(`${MEMBER_COLUMNS}, email`).eq("user_id", id).maybeSingle();
  if (!data) notFound();
  const member = data as Member & { email: string | null };
  const isSelf = member.user_id === viewer.userId;

  return (
    <div className="container-site max-w-4xl py-section">
      <Link href="/club/admin/mitglieder" className="label hover:text-white">
        Alle Mitglieder
      </Link>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar member={member} size="lg" />
        <div className="min-w-0">
          <TierBadge member={member} long />
          <div className="mt-3">
            <PageHead label="Mitglied" headline={member.full_name} />
          </div>
          <p className="mt-3 text-sm text-slate-light">
            {member.email} · seit {formatDate(member.created_at)} ·{" "}
            <Link href={`/club/mitglieder/${member.user_id}`} className="text-white underline underline-offset-4">
              Profil ansehen
            </Link>
          </p>
        </div>
      </div>

      <section aria-labelledby="mitgliedschaft" className="mt-12 border border-white p-6 md:p-8">
        <h2 id="mitgliedschaft" className="label text-white">
          Mitgliedschaft
        </h2>
        {member.status === "payment_due" ? <ConfirmPayment userId={member.user_id} /> : null}
        <ActionForm action={updateMembership} submitLabel="Speichern" variant="outline" className="mt-5 md:grid-cols-3 md:items-end">
          <input type="hidden" name="userId" value={member.user_id} />
          <SelectField name="tier" label="Mitgliedschaft" options={tiers} defaultValue={member.tier ?? ""} emptyLabel="Keine (nur Admin)" />
          <SelectField name="status" label="Status" options={memberStatuses} defaultValue={member.status} />
          <SelectField name="role" label="Rolle" options={roles} defaultValue={member.role} />
        </ActionForm>
      </section>

      <section aria-labelledby="profil" className="mt-10">
        <h2 id="profil" className="label text-white">
          Profil
        </h2>
        <ActionForm action={saveMemberProfile} submitLabel="Profil speichern" className="mt-6">
          <input type="hidden" name="userId" value={member.user_id} />
          <ProfileFields member={member} />
        </ActionForm>
      </section>

      {!isSelf ? (
        <form action={deleteMember.bind(null, member.user_id)} className="mt-14 border-t border-line pt-6">
          <ConfirmButton confirm={`Konto von ${member.full_name} endgültig löschen? Profil, Forum-Beiträge und Nachrichten werden mit gelöscht.`}>
            Konto löschen
          </ConfirmButton>
        </form>
      ) : null}
    </div>
  );
}
