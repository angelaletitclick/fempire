import { redirect } from "next/navigation";
import { ActionForm } from "@/components/club/ActionForm";
import { Avatar } from "@/components/club/Avatar";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/club/fields";
import { PageHead } from "@/components/club/PageHead";
import { cities } from "@/content/cities";
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
  const f = t.fields;

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
        <div className="flex items-center gap-6">
          <Avatar member={member} size="lg" />
          <div className="grid gap-3">
            <label htmlFor="f-avatar" className="text-sm font-medium text-white">
              {f.avatar}
            </label>
            <input
              id="f-avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-describedby="f-avatar-hint"
              className="text-sm text-slate-light file:mr-4 file:h-10 file:cursor-pointer file:border file:border-white/40 file:bg-transparent file:px-4 file:text-[0.7rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-white hover:file:border-pink hover:file:bg-pink"
            />
            <p id="f-avatar-hint" className="text-sm text-slate-light">
              {f.avatarHint}
            </p>
            {member.avatar_path ? <CheckField name="remove_avatar" label={f.removeAvatar} /> : null}
          </div>
        </div>

        <TextField name="full_name" label={f.fullName} defaultValue={member.full_name} autoComplete="name" maxLength={120} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="company" label={f.company} defaultValue={member.company ?? ""} optional autoComplete="organization" maxLength={160} />
          <TextField name="position" label={f.position} defaultValue={member.position ?? ""} optional autoComplete="organization-title" maxLength={160} />
        </div>
        <SelectField
          name="city_slug"
          label={f.city}
          defaultValue={member.city_slug}
          options={cities.map((city) => ({ value: city.slug, label: city.name }))}
        />
        <TextField name="website" label={f.website} defaultValue={member.website ?? ""} optional inputMode="url" placeholder="https://" maxLength={300} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="linkedin" label={f.linkedin} defaultValue={member.linkedin ?? ""} optional inputMode="url" placeholder="https://www.linkedin.com/in/…" maxLength={300} />
          <TextField name="instagram" label={f.instagram} defaultValue={member.instagram ?? ""} optional placeholder="@name" maxLength={300} />
        </div>
        <TextAreaField name="bio" label={f.bio} hint={f.bioHint} defaultValue={member.bio ?? ""} optional maxLength={2000} rows={6} />
      </ActionForm>
    </div>
  );
}
