"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/components/club/ActionForm";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { berlinLocalToDate } from "@/lib/time";

/** "Warum wir über Zahlen reden" → "warum-wir-ueber-zahlen-reden" */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const schema = z.object({
  id: z.union([z.uuid(), z.literal("")]),
  title: z.string().trim().min(3, "Bitte einen Titel angeben.").max(200),
  slug: z.string().trim().max(80),
  teaser: z.string().trim().max(400),
  topic: z.string().trim().max(60),
  author: z.string().trim().min(2, "Bitte eine Autorin angeben.").max(120),
  body: z.string().max(100000),
  paid: z.boolean(),
  status: z.enum(["draft", "published"]),
  publishedAt: z.string(),
});

function revalidateMagazin(slug?: string) {
  revalidatePath("/club/admin/magazin");
  revalidatePath("/magazin");
  revalidatePath("/");
  revalidatePath("/club");
  revalidatePath("/sitemap.xml");
  revalidatePath("/club/magazin");
  if (slug) {
    revalidatePath(`/magazin/${slug}`);
    revalidatePath(`/club/magazin/${slug}`);
  }
}

export async function saveArticle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") ?? "",
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    teaser: formData.get("teaser") ?? "",
    topic: formData.get("topic") ?? "",
    author: formData.get("author"),
    body: formData.get("body") ?? "",
    paid: formData.get("paid") === "on",
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt") ?? "",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen." };
  const input = parsed.data;

  const slug = slugify(input.slug || input.title);
  if (!slug) return { status: "error", message: "Die Adresse (Slug) ist leer. Bitte einen Titel mit Buchstaben angeben." };
  if (input.status === "published" && !input.body.trim()) {
    return { status: "error", message: "Ohne Text kann der Artikel nicht veröffentlicht werden." };
  }

  const db = supabaseAdmin();
  let previousSlug: string | undefined;
  let publishedAt: string | null = input.publishedAt ? (berlinLocalToDate(input.publishedAt)?.toISOString() ?? null) : null;
  if (input.id) {
    const { data } = await db.from("articles").select("slug, published_at").eq("id", input.id).maybeSingle();
    previousSlug = data?.slug as string | undefined;
    publishedAt ??= (data?.published_at as string | null) ?? null;
  }
  if (input.status === "published" && !publishedAt) publishedAt = new Date().toISOString();

  const row = {
    slug,
    title: input.title,
    teaser: input.teaser,
    topic: input.topic,
    author: input.author,
    body: input.body.replace(/\r\n/g, "\n"),
    paid: input.paid,
    status: input.status,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };

  const result = input.id
    ? await db.from("articles").update(row).eq("id", input.id).select("id").single()
    : await db.from("articles").insert(row).select("id").single();
  if (result.error) {
    if (result.error.code === "23505") return { status: "error", message: `Die Adresse /magazin/${slug} ist schon vergeben.` };
    console.error("Artikel:", result.error.message);
    return { status: "error", message: "Speichern fehlgeschlagen." };
  }

  revalidateMagazin(slug);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/magazin/${previousSlug}`);
  if (!input.id) redirect(`/club/admin/magazin/${result.data.id}?neu=1`);
  return { status: "ok", message: input.status === "published" ? "Gespeichert und veröffentlicht." : "Als Entwurf gespeichert." };
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return;
  const db = supabaseAdmin();
  const { data } = await db.from("articles").delete().eq("id", id).select("slug").maybeSingle();
  revalidateMagazin(data?.slug as string | undefined);
  redirect("/club/admin/magazin");
}
