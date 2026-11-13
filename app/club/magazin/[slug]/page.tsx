import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/sections/ArticleView";
import { publishedArticle } from "@/lib/articles";
import { requireMember } from "@/lib/auth";
import { authorProfiles } from "@/lib/authors";

export const metadata = { title: "Magazin" };

/** Artikel im Mitgliederbereich, immer vollständig */
export default async function ClubArticlePage({ params }: PageProps<"/club/magazin/[slug]">) {
  const { slug } = await params;
  const viewer = await requireMember();
  const article = await publishedArticle(slug);
  if (!article) notFound();
  const authors = await authorProfiles(article.author);

  return (
    <ArticleView
      article={article}
      body={article.body}
      authors={authors}
      backHref="/club/magazin"
      topRight={
        viewer.isAdmin ? (
          <Link href={`/club/admin/magazin/${article.id}`} className="label text-white underline underline-offset-4">
            Bearbeiten
          </Link>
        ) : undefined
      }
    />
  );
}
