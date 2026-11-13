"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const statusSchema = z.enum(["neu", "bestaetigt", "abgesagt"]);

export async function setTrialStatus(id: string, status: string): Promise<void> {
  await requireAdmin();
  const parsedStatus = statusSchema.safeParse(status);
  if (!z.uuid().safeParse(id).success || !parsedStatus.success) return;
  const { error } = await supabaseAdmin().from("trial_requests").update({ status: parsedStatus.data }).eq("id", id);
  if (error) console.error("Schnuppern:", error.message);
  revalidatePath("/club/admin/schnuppern");
  revalidatePath("/club/admin");
}

export async function deleteTrial(id: string): Promise<void> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return;
  const { error } = await supabaseAdmin().from("trial_requests").delete().eq("id", id);
  if (error) console.error("Schnuppern:", error.message);
  revalidatePath("/club/admin/schnuppern");
  revalidatePath("/club/admin");
}
