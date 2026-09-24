import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  MAIL_REPLY_TO: z.email(),
  MAIL_NOTIFY_TO: z
    .string()
    .min(1)
    .transform((value) => value.split(",").map((entry) => entry.trim()))
    .pipe(z.array(z.email()).min(1)),
  IP_HASH_SALT: z.string().min(16),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

/**
 * Validiert die Umgebungsvariablen beim ersten Zugriff, nicht beim Import.
 * So läuft `next build` auch ohne .env.local; ein Fehler fällt erst dort auf,
 * wo tatsächlich eine Bewerbung gespeichert oder eine Mail versendet wird.
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Umgebungsvariablen fehlen oder sind ungültig: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}
