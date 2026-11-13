import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Liefert Profilfotos aus dem privaten Bucket aus. Fotos von Mitgliedern nur für aktive Mitglieder
 * und die eigene Person. Fotos des Teams (Admins) sind öffentlich, weil sie als Autorinnen
 * im Magazin erscheinen.
 */
export async function GET(_request: Request, { params }: RouteContext<"/club/avatar/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse(null, { status: 404 });

  const admin = supabaseAdmin();
  const { data: member } = await admin.from("members").select("avatar_path, status, role").eq("user_id", id).maybeSingle();
  if (!member?.avatar_path) return new NextResponse(null, { status: 404 });
  const isTeam = member.role === "admin";

  if (!isTeam) {
    const viewer = await getViewer();
    if (!viewer || (!viewer.isActive && viewer.userId !== id)) return new NextResponse(null, { status: 403 });
    if (member.status !== "active" && viewer.userId !== id) return new NextResponse(null, { status: 404 });
  }

  const { data, error } = await admin.storage.from("avatars").download(member.avatar_path as string);
  if (error || !data) return new NextResponse(null, { status: 404 });

  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "image/jpeg",
      // Privat cachen: die Adresse enthält ?v=, ein neues Foto bekommt eine neue Adresse
      "Cache-Control": isTeam ? "public, max-age=86400" : "private, max-age=86400",
    },
  });
}
