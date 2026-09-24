import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

/** Client im Kontext der angemeldeten Nutzerin. Unterliegt RLS. */
export async function supabaseServer() {
  // Zuerst die Cookies lesen: das macht die Route dynamisch, bevor die Env-Prüfung
  // laufen kann. Sonst würde Next die Seite beim Build vorab rendern.
  const cookieStore = await cookies();
  const env = supabaseEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // In Server Components nicht erlaubt. Die Session erneuert proxy.ts.
        }
      },
    },
  });
}
