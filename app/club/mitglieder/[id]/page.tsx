import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/club/Avatar";
import { TierBadge } from "@/components/club/TierBadge";
import { ButtonLink } from "@/components/ui/Button";
import { PlainText } from "@/components/ui/RichText";
import { cityBySlug } from "@/content/cities";
import { club } from "@/content/club";
import { canMessage } from "@/lib/messaging";
import { MEMBER_COLUMNS, requireMember, type Member } from "@/lib/auth";
import { safeUrl } from "@/lib/validation/profile";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Profil" };

export default async function MemberProfilePage({ params }: PageProps<"/club/mitglieder/[id]">) {
  const { id } = await params;
  const viewer = await requireMember();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = club.members;

  const supabase = await supabaseServer();
  const { data } = await supabase.from("members").select(MEMBER_COLUMNS).eq("user_id", id).maybeSingle();
  const member = data as Member | null;
  if (!member || (member.role !== "admin" && member.status !== "active")) notFound();

  const links = [
    { label: "Website", href: safeUrl(member.website) },
    { label: "LinkedIn", href: safeUrl(member.linkedin) },
    { label: "Instagram", href: safeUrl(member.instagram) },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));
  const isSelf = member.user_id === viewer.userId;
  const { count: incoming } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", member.user_id)
    .eq("recipient_id", viewer.userId);
  const mayWrite = canMessage(viewer.member, member, (incoming ?? 0) > 0);

  return (
    <div className="container-site max-w-4xl py-section">
      <Link href="/club/mitglieder" className="label hover:text-white">
        {t.back}
      </Link>

      <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-start">
        <Avatar member={member} size="lg" />
        <div className="min-w-0 flex-1">
          <TierBadge member={member} adminLabel={t.team} long />
          <h1 className="headline mt-4 text-[2.25rem] leading-[1.1] sm:text-5xl">{member.full_name}</h1>
          {member.position || member.company ? (
            <p className="mt-3 text-lg text-white">{[member.position, member.company].filter(Boolean).join(", ")}</p>
          ) : null}
          <p className="label mt-3">{cityBySlug(member.city_slug)?.name ?? member.city_slug}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {isSelf ? (
              <ButtonLink href="/club/profil" variant="outline" size="sm">
                Profil bearbeiten
              </ButtonLink>
            ) : mayWrite ? (
              <ButtonLink href={`/club/nachrichten/${member.user_id}`} size="sm">
                {t.message}
              </ButtonLink>
            ) : (
              <p className="max-w-md text-sm text-slate-light">{club.messages.notAllowed}</p>
            )}
            {viewer.isAdmin && !isSelf ? (
              <ButtonLink href={`/club/admin/mitglieder/${member.user_id}`} variant="outline" size="sm">
                Profil bearbeiten
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>

      {member.bio ? <PlainText text={member.bio} className="prose-width mt-12 text-lg leading-relaxed text-white" /> : null}

      {links.length ? (
        <section className="mt-10 border-t border-line pt-6">
          <h2 className="label">{t.links}</h2>
          <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer nofollow" className="text-white underline underline-offset-4 hover:text-slate-light">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
