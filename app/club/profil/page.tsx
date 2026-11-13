import { redirect } from "next/navigation";
import { ActionForm } from "@/components/club/ActionForm";
import { ProfileFields } from "@/components/club/ProfileFields";
import { PageHead } from "@/components/club/PageHead";
import { club, memberStatuses, optionLabel, tierLabel } from "@/content/club";
import { getViewer } from "@/lib/auth";
import { saveProfile } from "./actions";

export const metadata = { title: "Profil" };

export default async function ProfilPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/club/login");
  if (!viewer.member) redirect("/club");
  const member = viewer.member;
  const t = club.profile;

  return (
    <div className="container-site max-w-3xl py-section">
      <PageHead label={t.label} headline={t.headline} intro={t.intro} />

      <dl className="mt-10 grid gap-1 border-y border-line py-4 text-sm">
        <div className="flex flex-wrap gap-x-3">
          <dt className="label">{t.membership}</dt>
          <dd className="text-white">
            {viewer.isAdmin ? "Admin" : `${tierLabel(member.tier)} · ${optionLabel(memberStatuses, member.status)}`}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-3">
          <dt className="label">E-Mail</dt>
          <dd className="text-white">{viewer.email}</dd>
        </div>
      </dl>

      <ActionForm action={saveProfile} submitLabel={t.save} className="mt-10">
        <ProfileFields member={member} />
      </ActionForm>
    </div>
  );
}
