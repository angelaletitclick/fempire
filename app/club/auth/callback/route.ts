import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Ziel des Login-Links. Zwei Varianten:
 * - ?token_hash=…&type=… (empfohlen, Mail-Vorlage in Supabase): funktioniert auf jedem Gerät,
 *   auch wenn der Link am Handy geöffnet wird, obwohl er am Laptop angefordert wurde.
 * - ?code=… (Supabase-Standard): funktioniert nur im Browser, in dem der Link angefordert wurde.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  try {
    const supabase = await supabaseServer();
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL("/club", request.url));
      console.error("Club-Callback (token_hash):", error.message);
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/club", request.url));
      console.error("Club-Callback (code):", error.message);
    }
  } catch (error) {
    console.error("Club-Callback:", (error as Error).message);
  }
  return NextResponse.redirect(new URL("/club/login?fehler=link", request.url));
}
