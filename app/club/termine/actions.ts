"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

const id = z.uuid();

/** Zusage. Ob sie erlaubt ist (Mitgliedschaft, Plätze, Termin in der Zukunft), prüft die Datenbank (RLS). */
export async function attendEvent(eventId: string): Promise<void> {
  const viewer = await requireMember();
  const parsed = id.safeParse(eventId);
  if (!parsed.success) return;
  const supabase = await supabaseServer();
  const { error } = await supabase.from("event_registrations").insert({ event_id: parsed.data, user_id: viewer.userId });
  if (error && error.code !== "23505") console.error("Zusage:", error.message);
  revalidatePath("/club/termine");
  revalidatePath("/club");
}

export async function declineEvent(eventId: string): Promise<void> {
  const viewer = await requireMember();
  const parsed = id.safeParse(eventId);
  if (!parsed.success) return;
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("event_id", parsed.data)
    .eq("user_id", viewer.userId);
  if (error) console.error("Absage:", error.message);
  revalidatePath("/club/termine");
  revalidatePath("/club");
}
