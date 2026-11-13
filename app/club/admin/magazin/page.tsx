import Link from "next/link";
import { PageHead, Tag } from "@/components/club/PageHead";
import { ButtonLink } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/time";

type Row = { id: string; title: string; slug: string; status: string; paid: boolean; author: string; published_at: string | null; updated_at: string };

export default async function AdminMagazinPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin()
    .from("articles")
    .select("id, title, slug, status, paid, author, published_at, updated_at")
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <div className="container-site py-section">
      <PageHead
        label="Backend"
        headline="Magazin."
        intro="Artikel schreiben, veröffentlichen und festlegen, ob sie frei lesbar sind oder nur für Mitglieder."
        actions={<ButtonLink href="/club/admin/magazin/neu">Neuer Artikel</ButtonLink>}
      />
      {rows.length === 0 ? (
        <p className="mt-10 border border-line p-6 text-slate-light">Noch keine Artikel.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={`/club/admin/magazin/${row.id}`} className="flex flex-wrap items-center gap-3 py-4 hover:bg-surface md:px-4">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white">{row.title}</span>
                  <span className="text-sm text-slate-light">
                    /magazin/{row.slug} · {row.author}
                  </span>
                </span>
                <Tag tone={row.paid ? "white" : "line"}>{row.paid ? "Mitglieder" : "Frei"}</Tag>
                <Tag tone={row.status === "published" ? "white" : "line"}>
                  {row.status === "published" && row.published_at ? `Online seit ${formatDate(row.published_at)}` : "Entwurf"}
                </Tag>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
