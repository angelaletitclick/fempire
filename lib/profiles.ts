import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { profileSchema } from "@/lib/validation/profile";

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Profilfelder aus einem Formular lesen und prüfen */
export function readProfile(formData: FormData, fallbackCity: string) {
  return profileSchema.safeParse({
    full_name: formData.get("full_name") ?? "",
    company: formData.get("company") ?? "",
    position: formData.get("position") ?? "",
    city_slug: formData.get("city_slug") ?? fallbackCity,
    website: formData.get("website") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    instagram: formData.get("instagram") ?? "",
    bio: formData.get("bio") ?? "",
  });
}

/**
 * Profilfoto aus dem Formular übernehmen: neues Foto quadratisch auf 800 px zuschneiden,
 * Metadaten (z. B. GPS) entfernen und im privaten Speicher ablegen, oder das Foto entfernen.
 * Gibt eine Fehlermeldung zurück oder null.
 */
export async function applyAvatar(userId: string, currentPath: string | null, formData: FormData): Promise<string | null> {
  const file = formData.get("avatar");
  const remove = formData.get("remove_avatar") === "on";
  const admin = supabaseAdmin();
  const storage = admin.storage.from("avatars");
  const path = `${userId}.jpg`;

  if (file instanceof File && file.size > 0) {
    if (!TYPES.includes(file.type)) return "Bitte ein JPG, PNG oder WebP hochladen.";
    if (file.size > MAX_BYTES) return "Das Foto ist zu groß. Bitte ein kleineres Bild wählen.";
    try {
      const sharp = (await import("sharp")).default;
      const image = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        .resize(800, 800, { fit: "cover", position: "attention" })
        .jpeg({ quality: 82 })
        .toBuffer();
      const { error } = await storage.upload(path, image, { contentType: "image/jpeg", upsert: true });
      if (error) throw error;
      await admin.from("members").update({ avatar_path: path, updated_at: new Date().toISOString() }).eq("user_id", userId);
    } catch (error) {
      console.error("Profilfoto:", (error as Error).message);
      return "Das Profil ist gespeichert, das Foto nicht. Bitte versuch es mit einem anderen Bild.";
    }
  } else if (remove && currentPath) {
    await storage.remove([currentPath]);
    await admin.from("members").update({ avatar_path: null, updated_at: new Date().toISOString() }).eq("user_id", userId);
  }
  return null;
}
