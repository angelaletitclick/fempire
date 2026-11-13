import "server-only";
import type { EventFormat, Tier } from "@/content/club";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type EventStatus = "draft" | "published" | "cancelled";

export type ClubEvent = {
  id: string;
  title: string;
  format: EventFormat;
  topic: string | null;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  city_slug: string;
  location: string | null;
  audience: Tier[];
  price_cents: number | null;
  trial_price_cents: number | null;
  capacity: number | null;
  status: EventStatus;
  cancel_note: string | null;
};

/** Was Gäste sehen dürfen: kein Ort, keine Beträge */
export type PublicEvent = Pick<
  ClubEvent,
  "id" | "title" | "format" | "topic" | "starts_at" | "ends_at" | "city_slug" | "status"
> & { trial: boolean };

const PUBLIC_COLUMNS = "id, title, format, topic, starts_at, ends_at, city_slug, status, trial_price_cents";

type PublicRow = Omit<PublicEvent, "trial"> & { trial_price_cents: number | null };

function toPublic(row: PublicRow): PublicEvent {
  const { trial_price_cents, ...rest } = row;
  return { ...rest, trial: trial_price_cents !== null };
}

/** Kommende veröffentlichte oder abgesagte Termine für die öffentliche Seite */
export async function upcomingPublicEvents(limit: number): Promise<PublicEvent[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("events")
      .select(PUBLIC_COLUMNS)
      .in("status", ["published", "cancelled"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return ((data ?? []) as PublicRow[]).map(toPublic);
  } catch (error) {
    console.error("Termine:", (error as Error).message);
    return [];
  }
}

/** Nächster stattfindender Termin (für Hero und Aktionsleiste) */
export async function nextPublicEvent(): Promise<PublicEvent | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("events")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? toPublic(data as PublicRow) : null;
  } catch (error) {
    console.error("Termine:", (error as Error).message);
    return null;
  }
}

/** Kommende Termine, an denen Schnuppern möglich ist */
export async function trialEvents(): Promise<PublicEvent[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("events")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .not("trial_price_cents", "is", null)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(12);
    if (error) throw error;
    return ((data ?? []) as PublicRow[]).map(toPublic);
  } catch (error) {
    console.error("Termine:", (error as Error).message);
    return [];
  }
}
