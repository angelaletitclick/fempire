import "server-only";
import { z } from "zod";

/**
 * Supabase-URL: bevorzugt NEXT_PUBLIC_SUPABASE_URL, sonst SUPABASE_URL (legt die
 * Supabase-Integration in Vercel automatisch an). Leere Werte zählen als nicht gesetzt.
 */
export function resolveSupabaseUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.NEXT_PUBLIC_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim() || undefined;
}

/**
 * Umgebungsvariablen, nach Dienst gruppiert. Jede Gruppe wird erst beim ersten
 * Zugriff geprüft, nicht beim Import. So läuft `next build` ohne .env.local,
 * und Supabase funktioniert auch, solange Resend noch nicht eingerichtet ist.
 */
function lazy<T extends z.ZodType>(schema: T) {
  let cached: z.infer<T> | undefined;
  return (): z.infer<T> => {
    if (cached) return cached;
    const parsed = schema.safeParse({ ...process.env, NEXT_PUBLIC_SUPABASE_URL: resolveSupabaseUrl() });
    if (!parsed.success) {
      const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
      throw new Error(`Umgebungsvariablen fehlen oder sind ungültig: ${missing}. Siehe .env.example.`);
    }
    cached = parsed.data;
    return cached;
  };
}

/** Öffentlicher Supabase-Zugang (unterliegt RLS) */
export const supabaseEnv = lazy(
  z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  }),
);

/** Serverseitiger Supabase-Zugang mit Service-Role-Key (umgeht RLS) */
export const supabaseAdminEnv = lazy(
  z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  }),
);

export const mailEnv = lazy(
  z.object({
    RESEND_API_KEY: z.string().min(1),
    MAIL_FROM: z.string().min(1),
    MAIL_REPLY_TO: z.email(),
    MAIL_NOTIFY_TO: z
      .string()
      .min(1)
      .transform((value) => value.split(",").map((entry) => entry.trim()))
      .pipe(z.array(z.email()).min(1)),
  }),
);

export const securityEnv = lazy(
  z.object({
    IP_HASH_SALT: z.string().min(16),
  }),
);
