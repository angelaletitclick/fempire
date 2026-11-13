import "server-only";
import { randomUUID } from "node:crypto";
import { resolveSupabaseUrl } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const MAGAZIN_BUCKET = "magazin";
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Öffentliche Adresse eines Bildes im Magazin-Speicher */
export function magazinImageUrl(path: string | null | undefined): string | null {
  const base = resolveSupabaseUrl();
  return path && base ? `${base}/storage/v1/object/public/${MAGAZIN_BUCKET}/${path}` : null;
}

export function checkImage(file: File): string | null {
  if (!TYPES.includes(file.type)) return "Bitte ein JPG, PNG oder WebP hochladen.";
  if (file.size > MAX_IMAGE_BYTES) return "Das Bild ist größer als 8 MB.";
  return null;
}

/**
 * Bild verkleinern, drehen wie fotografiert, Metadaten (GPS, Kamera) entfernen und als JPEG
 * in den Magazin-Speicher legen. Gibt den Pfad im Speicher zurück. Nur nach requireAdmin() aufrufen.
 */
export async function uploadMagazinImage(file: File, kind: "cover" | "inline"): Promise<string> {
  const sharp = (await import("sharp")).default;
  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize({ width: kind === "cover" ? 2400 : 1800, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const path = `${kind}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.jpg`;
  const { error } = await supabaseAdmin()
    .storage.from(MAGAZIN_BUCKET)
    .upload(path, output, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function removeMagazinImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const { error } = await supabaseAdmin().storage.from(MAGAZIN_BUCKET).remove([path]);
  if (error) console.error("Bild löschen:", error.message);
}
