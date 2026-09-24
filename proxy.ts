import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Hält die Supabase-Sitzung im Mitgliederbereich aktuell (Token-Refresh über Cookies)
 * und leitet nicht angemeldete Besucherinnen zur Anmeldung um. Die eigentliche
 * Berechtigungsprüfung passiert zusätzlich in app/club/page.tsx.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = pathname.startsWith("/club/login") || pathname.startsWith("/club/auth");
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/club/login", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/club", "/club/:path*"],
};
