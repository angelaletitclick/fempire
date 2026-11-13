import { ActionForm } from "@/components/club/ActionForm";
import { MarkdownEditor } from "@/components/club/MarkdownEditor";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/club/fields";
import { authors, magazin } from "@/content/magazin";
import { toBerlinLocal } from "@/lib/time";
import { saveArticle } from "./actions";

export type ArticleDraft = {
  id: string;
  title: string;
  slug: string;
  teaser: string;
  topic: string;
  author: string;
  body: string;
  paid: boolean;
  status: "draft" | "published";
  published_at: string | null;
};

export const emptyArticle: ArticleDraft = {
  id: "",
  title: "",
  slug: "",
  teaser: "",
  topic: "",
  author: authors[0]!,
  body: "",
  paid: false,
  status: "draft",
  published_at: null,
};

/** Editor für Magazin-Artikel. Text in Markdown mit Werkzeugleiste, Vorschau und Einfügen aus Word/Google Docs. */
export function ArticleForm({ article }: { article: ArticleDraft }) {
  return (
    <ActionForm action={saveArticle} submitLabel="Speichern" className="mt-10">
      <input type="hidden" name="id" value={article.id} />
      <TextField name="title" label="Titel" defaultValue={article.title} maxLength={200} />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          name="slug"
          label="Adresse"
          hint="Teil der Adresse nach /magazin/. Leer lassen, dann entsteht sie aus dem Titel."
          defaultValue={article.slug}
          optional
          maxLength={80}
          pattern="[a-z0-9\-]*"
        />
        <TextField name="topic" label="Thema" hint="Kurz, z. B. Führung oder Struktur." defaultValue={article.topic} optional maxLength={60} />
      </div>
      <TextAreaField
        name="teaser"
        label="Teaser"
        hint="Ein bis zwei Sätze für Übersicht, Startseite und Suchmaschinen."
        defaultValue={article.teaser}
        optional
        rows={3}
        maxLength={400}
        className="[&_textarea]:min-h-24"
      />
      <MarkdownEditor
        name="body"
        defaultValue={article.body}
        hint={`Formatieren über die Leiste oder direkt: ## Überschrift, ### Zwischenüberschrift, **fett**, _kursiv_, - Liste, | Tabelle |. Text aus Word oder Google Docs einfach einfügen, Überschriften, Listen und Tabellen werden übernommen. Bei Mitglieder-Artikeln sind die ersten ${magazin.previewBlocks} Absätze für alle sichtbar.`}
      />

      <div className="grid gap-5 border-y border-line py-6 md:grid-cols-3">
        <SelectField name="author" label="Autorin" options={authors.map((name) => ({ value: name, label: name }))} defaultValue={article.author} />
        <SelectField
          name="status"
          label="Status"
          options={[
            { value: "draft", label: "Entwurf (nicht sichtbar)" },
            { value: "published", label: "Veröffentlicht" },
          ]}
          defaultValue={article.status}
        />
        <TextField
          name="publishedAt"
          label="Veröffentlichungsdatum"
          type="datetime-local"
          hint="Leer = beim Veröffentlichen jetzt."
          defaultValue={toBerlinLocal(article.published_at)}
          optional
        />
        <div className="md:col-span-3">
          <CheckField
            name="paid"
            label="Nur für Mitglieder (Paywall). Gäste sehen den Anfang, Mitglieder den ganzen Artikel."
            defaultChecked={article.paid}
          />
        </div>
      </div>
    </ActionForm>
  );
}
