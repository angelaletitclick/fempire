import "server-only";
import { gruenderinnen } from "@/content/landing";
import { avatarUrl } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type AuthorProfile = {
  name: string;
  /** Profilfoto aus dem Mitgliederbereich, sonst das Porträt von der Startseite */
  image: string | null;
  /** Position und Unternehmen, eine Zeile */
  role: string;
  /** Kurzbeschreibung, wenige Sätze */
  about: string;
  /** Profil im Mitgliederbereich (nur für eingeloggte Mitglieder sinnvoll) */
  profileHref: string | null;
};

function shorten(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(". ") + 1, cut.lastIndexOf(" ")))} …`;
}

/**
 * Autorinnen eines Artikels. Das Feld "author" enthält einen Namen oder zwei mit "und".
 * Daten kommen aus dem Profil im Mitgliederbereich (Foto, Position, Über dich),
 * fehlende Angaben aus den Gründerinnen-Texten der Startseite.
 */
export async function authorProfiles(author: string): Promise<AuthorProfile[]> {
  const names = author
    .split(/\s+und\s+|\s*&\s*/)
    .map((name) => name.trim())
    .filter(Boolean);

  let members: Array<{
    user_id: string;
    full_name: string;
    position: string | null;
    company: string | null;
    bio: string | null;
    avatar_path: string | null;
    updated_at: string;
  }> = [];
  try {
    const { data } = await supabaseAdmin()
      .from("members")
      .select("user_id, full_name, position, company, bio, avatar_path, updated_at")
      .eq("role", "admin")
      .in("full_name", names);
    members = data ?? [];
  } catch {
    members = [];
  }

  return names.map((name) => {
    const member = members.find((entry) => entry.full_name === name);
    const founder = gruenderinnen.people.find((person) => person.name === name);
    const role = [member?.position, member?.company].filter(Boolean).join(", ") || founder?.role || "";
    return {
      name,
      image: (member && avatarUrl(member)) || founder?.image || null,
      role,
      about: shorten(member?.bio || founder?.bio || ""),
      profileHref: member ? `/club/mitglieder/${member.user_id}` : null,
    };
  });
}
