import type { Metadata } from "next";
import { ArticleList } from "@/components/sections/Magazin";
import { Marked } from "@/components/ui/Marked";
import { SectionLabel } from "@/components/ui/Section";
import { magazin } from "@/content/magazin";
import { publishedArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: magazin.meta.title,
  description: magazin.meta.description,
  alternates: { canonical: "/magazin" },
};

// Neue Artikel lösen im Backend eine Aktualisierung aus, zusätzlich stündlich
export const revalidate = 3600;

export default async function MagazinPage() {
  const articles = await publishedArticles();
  return (
    <div className="container-site py-section">
      <SectionLabel index="M" label={magazin.label} />
      <h1 className="headline mt-6 max-w-[20ch] text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-6xl">
        <Marked text={magazin.headline} />
      </h1>
      <p className="prose-width mt-6 text-lg leading-relaxed text-slate-light">{magazin.intro}</p>
      <div className="mt-14 md:mt-20">
        <ArticleList articles={articles} />
      </div>
    </div>
  );
}
