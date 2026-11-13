import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { PageHead } from "@/components/club/PageHead";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteArticle } from "../actions";
import { ArticleForm, type ArticleDraft } from "../ArticleForm";

export default async function EditArticlePage({ params, searchParams }: PageProps<"/club/admin/magazin/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { neu, gespeichert } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabaseAdmin()
    .from("articles")
    .select("id, title, slug, teaser, topic, author, body, paid, status, published_at, cover_path, cover_alt, cover_caption")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const article = data as ArticleDraft;

  return (
    <div className="container-site max-w-4xl py-section">
      <Link href="/club/admin/magazin" className="label hover:text-white">
        Alle Artikel
      </Link>
      <div className="mt-8">
        <PageHead
          label="Magazin"
          headline={article.title}
          actions={
            article.status === "published" ? (
              <Link href={`/magazin/${article.slug}`} target="_blank" className="label text-white underline underline-offset-4">
                Ansehen
              </Link>
            ) : undefined
          }
        />
      </div>
      {gespeichert ? (
        <p role="status" className="mt-6 border border-white px-4 py-3 text-sm text-white">
          Gespeichert.
        </p>
      ) : null}
      {neu ? (
        <p role="status" className="mt-6 border border-white px-4 py-3 text-sm text-white">
          Angelegt.
        </p>
      ) : null}
      <ArticleForm article={article} />
      <form action={deleteArticle.bind(null, article.id)} className="mt-10 border-t border-line pt-6">
        <ConfirmButton confirm="Artikel endgültig löschen?">Artikel löschen</ConfirmButton>
      </form>
    </div>
  );
}
