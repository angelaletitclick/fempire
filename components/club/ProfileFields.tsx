import { Avatar } from "@/components/club/Avatar";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/club/fields";
import { ImageInput } from "@/components/club/ImageInput";
import { cities } from "@/content/cities";
import { club } from "@/content/club";
import type { Member } from "@/lib/auth";

/** Profilfelder samt Foto. Genutzt für das eigene Profil und von Admins für andere Mitglieder. */
export function ProfileFields({ member }: { member: Member }) {
  const f = club.profile.fields;
  return (
    <>
          <div className="flex items-center gap-6">
            <Avatar member={member} size="lg" />
            <div className="grid gap-3">
              <label htmlFor="f-avatar" className="text-sm font-medium text-white">
                {f.avatar}
              </label>
              <ImageInput id="f-avatar" name="avatar" maxSize={1200} describedBy="f-avatar-hint" />
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
    </>
  );
}
