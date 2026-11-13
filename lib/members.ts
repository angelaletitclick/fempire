import "server-only";
import { tierLabel, type Tier } from "@/content/club";
import { sendMail } from "@/lib/mail";
import { welcomeMail } from "@/lib/mail/templates";
import { siteUrl } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Auth-Konto zu einer E-Mail finden (die Admin-API hat keine Suche nach Adresse) */
async function findUserId(email: string): Promise<string | null> {
  const admin = supabaseAdmin();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((entry) => entry.email?.toLowerCase() === email);
    if (user) return user.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

/**
 * Legt ein Mitglied an (oder aktualisiert es): Auth-Konto ohne Passwort, Eintrag in members,
 * auf Wunsch Willkommensmail mit Link zum Login. Nur nach requireAdmin() aufrufen.
 */
export async function upsertMember(input: {
  email: string;
  fullName: string;
  tier: Tier | null;
  role?: "member" | "admin";
  citySlug?: string;
  company?: string | null;
  position?: string | null;
  applicationId?: string | null;
  sendWelcome: boolean;
}): Promise<{ userId: string; mailError?: string }> {
  const admin = supabaseAdmin();
  const email = input.email.trim().toLowerCase();

  let userId = await findUserId(email);
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });
    if (error || !data.user) throw new Error(error?.message ?? "Konto konnte nicht angelegt werden");
    userId = data.user.id;
  }

  const { data: existing } = await admin.from("members").select("user_id").eq("user_id", userId).maybeSingle();
  const row = {
    email,
    full_name: input.fullName,
    tier: input.tier,
    role: input.role ?? "member",
    status: "active",
    updated_at: new Date().toISOString(),
    ...(input.applicationId ? { application_id: input.applicationId } : {}),
  };
  const { error } = existing
    ? await admin.from("members").update(row).eq("user_id", userId)
    : await admin.from("members").insert({
        ...row,
        user_id: userId,
        city_slug: input.citySlug ?? "osnabrueck",
        company: input.company ?? null,
        position: input.position ?? null,
      });
  if (error) throw new Error(error.message);

  if (!input.sendWelcome) return { userId };
  try {
    await sendMail(
      welcomeMail({
        to: email,
        name: input.fullName.split(" ")[0] ?? input.fullName,
        tier: input.role === "admin" ? "Team" : tierLabel(input.tier),
        loginUrl: `${siteUrl}/club/login`,
      }),
    );
    return { userId };
  } catch (mailError) {
    return { userId, mailError: (mailError as Error).message };
  }
}
