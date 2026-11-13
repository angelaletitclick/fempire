import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Liefert Profilfotos aus dem privaten Bucket aus. Nur für aktive Mitglieder
 * und für die eigene Person, damit Fotos nie öffentlich abrufbar sind.
 */
export async function GET(_request: Request, { params }: RouteContext<"/club/avatar/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse(null, { status: 404 });

  const viewer = await getViewer();
  if (!viewer || (!viewer.isActive && viewer.userId !== id)) return new NextResponse(null, { status: 403 });

  const admin = supabaseAdmin();
  const { data: member } = await admin.from("members").select("avatar_path, status, role").eq("user_id", id).maybeSingle();
  const visible = member && (member.role === "admin" || member.status === "active" || viewer.userId === id);
  if (!member?.avatar_path || !visible) return new NextResponse(null, { status: 404 });

  const { data, error } = await admin.storage.from("avatars").download(member.avatar_path as string);
  if (error || !data) return new NextResponse(null, { status: 404 });

  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "image/jpeg",
      // Privat cachen: die Adresse enthält ?v=, ein neues Foto bekommt eine neue Adresse
      "Cache-Control": "private, max-age=86400",
    },
  });
}
