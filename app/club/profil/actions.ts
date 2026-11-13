"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/components/club/ActionForm";
import { club } from "@/content/club";
import { getViewer } from "@/lib/auth";
import { applyAvatar, readProfile } from "@/lib/profiles";
import { supabaseServer } from "@/lib/supabase/server";

/** Eigenes Profil speichern. Auch pausierte Mitglieder und Admins können ihr Profil pflegen. */
export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer?.member) return { status: "error", message: club.errors.generic };

  const parsed = readProfile(formData, viewer.member.city_slug);
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

  const avatarError = await applyAvatar(viewer.userId, viewer.member.avatar_path, formData);
  revalidatePath("/club", "layout");
  if (avatarError) return { status: "error", message: avatarError };
  return { status: "ok", message: club.profile.saved };
}
