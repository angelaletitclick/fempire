import Link from "next/link";
import { PageHead } from "@/components/club/PageHead";
import { requireAdmin } from "@/lib/auth";
import { ArticleForm, emptyArticle } from "../ArticleForm";

export default async function NewArticlePage() {
  await requireAdmin();
  return (
    <div className="container-site max-w-4xl py-section">
      <Link href="/club/admin/magazin" className="label hover:text-white">
        Alle Artikel
      </Link>
      <div className="mt-8">
        <PageHead label="Magazin" headline="Neuer Artikel." />
      </div>
      <ArticleForm article={emptyArticle} />
    </div>
  );
}
