import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { MemberStatus, Role, Tier } from "@/content/club";
import { supabaseServer } from "@/lib/supabase/server";

/** Spalten eines Mitglieds, die Mitglieder untereinander sehen dürfen (siehe Spaltenrechte in der Migration) */
export const MEMBER_COLUMNS =
  "user_id, created_at, full_name, role, tier, status, city_slug, company, position, website, linkedin, instagram, bio, avatar_path, updated_at";

export type Member = {
  user_id: string;
  created_at: string;
  full_name: string;
  role: Role;
  tier: Tier | null;
  status: MemberStatus;
  city_slug: string;
  company: string | null;
  position: string | null;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  bio: string | null;
  avatar_path: string | null;
  updated_at: string;
};

export type Viewer = {
  userId: string;
  email: string;
  member: Member | null;
  isAdmin: boolean;
  /** Aktives (bezahltes) Mitglied oder Admin: Zugriff auf Forum, Termine, Verzeichnis, bezahlte Artikel */
  isActive: boolean;
};

/**
 * Die angemeldete Person, einmal pro Anfrage ermittelt. null ohne Anmeldung
 * oder wenn Supabase nicht konfiguriert ist (dann verhält sich die Seite wie für Gäste).
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  let supabase: Awaited<ReturnType<typeof supabaseServer>>;
  try {
    supabase = await supabaseServer();
  } catch {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("members").select(MEMBER_COLUMNS).eq("user_id", user.id).maybeSingle();
  const member = (data as Member | null) ?? null;
  const isAdmin = member?.role === "admin";
  return {
    userId: user.id,
    email: user.email ?? "",
    member,
    isAdmin,
    isActive: isAdmin || member?.status === "active",
  };
});

/** Für Seiten des Mitgliederbereichs: angemeldet und aktiv, sonst Umleitung */
export async function requireMember(): Promise<Viewer & { member: Member }> {
  const viewer = await getViewer();
  if (!viewer) redirect("/club/login");
  if (!viewer.member || !viewer.isActive) redirect("/club");
  return viewer as Viewer & { member: Member };
}

/** Für das Backend und jede Admin-Aktion. Die Prüfung läuft serverseitig vor jedem Zugriff mit dem Secret Key. */
export async function requireAdmin(): Promise<Viewer & { member: Member }> {
  const viewer = await getViewer();
  if (!viewer) redirect("/club/login");
  if (!viewer.isAdmin || !viewer.member) redirect("/club");
  return viewer as Viewer & { member: Member };
}

/** Adresse des Profilfotos. ?v= sorgt dafür, dass ein neues Foto sofort erscheint. */
export function avatarUrl(member: Pick<Member, "user_id" | "avatar_path" | "updated_at">): string | null {
  return member.avatar_path ? `/club/avatar/${member.user_id}?v=${encodeURIComponent(member.updated_at)}` : null;
}
