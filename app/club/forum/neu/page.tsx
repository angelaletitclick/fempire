import Link from "next/link";
import { PageHead } from "@/components/club/PageHead";
import { club } from "@/content/club";
import { requireMember } from "@/lib/auth";
import type { ForumCategory } from "@/lib/forum";
import { supabaseServer } from "@/lib/supabase/server";
import { ThreadForm } from "../ThreadForm";

export const metadata = { title: "Neues Thema" };

export default async function NewThreadPage({ searchParams }: PageProps<"/club/forum/neu">) {
  const viewer = await requireMember();
  const { kategorie } = await searchParams;
  const t = club.forum;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("forum_categories").select("id, slug, name, description, sort").order("sort");
  const categories = (data ?? []) as ForumCategory[];
  const preselected = categories.find((category) => category.slug === kategorie)?.id;

  return (
    <div className="container-site max-w-3xl py-section">
      <Link href="/club/forum" className="label hover:text-white">
        {t.back}
      </Link>
      <div className="mt-8">
        <PageHead label={t.label} headline={t.newThread} intro={viewer.isAdmin ? undefined : t.approvalNote} />
      </div>
      <ThreadForm categories={categories} defaultCategory={preselected} submitLabel={viewer.isAdmin ? "Veröffentlichen" : t.submit} />
    </div>
  );
}
