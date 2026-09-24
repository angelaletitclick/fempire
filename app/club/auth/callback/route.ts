import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Ziel des Magic Links: Code gegen Sitzung tauschen, dann in den Club. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/club", request.url));
    console.error("Club-Callback:", error.message);
  }
  return NextResponse.redirect(new URL("/club/login?fehler=link", request.url));
}
