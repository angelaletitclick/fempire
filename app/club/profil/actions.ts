"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/club/ActionForm";
import { club } from "@/content/club";
import { getViewer } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Foto quadratisch auf 800 px zuschneiden und als JPEG speichern. Dabei fallen alle
 * Metadaten weg (z. B. GPS-Position aus Handyfotos).
 */
async function processAvatar(file: File): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const input = Buffer.from(await file.arrayBuffer());
  return sharp(input).rotate().resize(800, 800, { fit: "cover", position: "attention" }).jpeg({ quality: 82 }).toBuffer();
}

/** Eigenes Profil speichern. Auch pausierte Mitglieder und Admins können ihr Profil pflegen. */
export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer?.member) return { status: "error", message: club.errors.generic };

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name") ?? "",
    company: formData.get("company") ?? "",
    position: formData.get("position") ?? "",
    city_slug: formData.get("city_slug") ?? viewer.member.city_slug,
    website: formData.get("website") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    instagram: formData.get("instagram") ?? "",
    bio: formData.get("bio") ?? "",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? club.errors.validation };

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("members")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("user_id", viewer.userId);
  if (error) {
    console.error("Profil:", error.message);
    return { status: "error", message: club.errors.generic };
  }

  // Foto: Hochladen läuft serverseitig nach der Prüfung, der Bucket ist privat
  const file = formData.get("avatar");
  const remove = formData.get("remove_avatar") === "on";
  const storage = supabaseAdmin().storage.from("avatars");
  const path = `${viewer.userId}.jpg`;

  if (file instanceof File && file.size > 0) {
    if (!TYPES.includes(file.type)) return { status: "error", message: "Bitte ein JPG, PNG oder WebP hochladen." };
    if (file.size > MAX_BYTES) return { status: "error", message: "Das Foto ist größer als 3 MB." };
    try {
      const image = await processAvatar(file);
      const { error: uploadError } = await storage.upload(path, image, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;
      await supabaseAdmin()
        .from("members")
        .update({ avatar_path: path, updated_at: new Date().toISOString() })
        .eq("user_id", viewer.userId);
    } catch (uploadError) {
      console.error("Profilfoto:", (uploadError as Error).message);
      return { status: "error", message: "Das Profil ist gespeichert, das Foto nicht. Bitte versuch es mit einem anderen Bild." };
    }
  } else if (remove && viewer.member.avatar_path) {
    await storage.remove([viewer.member.avatar_path]);
    await supabaseAdmin().from("members").update({ avatar_path: null, updated_at: new Date().toISOString() }).eq("user_id", viewer.userId);
  }

  revalidatePath("/club", "layout");
  return { status: "ok", message: club.profile.saved };
}
