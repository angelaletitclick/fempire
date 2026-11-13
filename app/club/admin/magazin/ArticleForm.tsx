import { ActionForm } from "@/components/club/ActionForm";
import { ImageInput } from "@/components/club/ImageInput";
import { MarkdownEditor } from "@/components/club/MarkdownEditor";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/club/fields";
import { authors, magazin } from "@/content/magazin";
import { magazinImageUrl } from "@/lib/magazin-images";
import { toBerlinLocal } from "@/lib/time";
import { saveArticle, uploadArticleImage } from "./actions";

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
  cover_path: string | null;
  cover_alt: string;
  cover_caption: string;
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
  cover_path: null,
  cover_alt: "",
  cover_caption: "",
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
      <fieldset className="grid gap-5 border-y border-line py-6">
        <legend className="sr-only">Titelbild</legend>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden border border-line bg-surface sm:w-64">
            {article.cover_path ? (
              // Vorschau des aktuellen Titelbilds
              // eslint-disable-next-line @next/next/no-img-element
              <img src={magazinImageUrl(article.cover_path) ?? ""} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="label absolute inset-0 flex items-center justify-center">Kein Titelbild</span>
            )}
          </div>
          <div className="grid flex-1 gap-3">
            <label htmlFor="f-cover" className="text-sm font-medium text-white">
              Titelbild
            </label>
            <ImageInput id="f-cover" name="cover" maxSize={2400} />
            <p className="text-sm text-slate-light">JPG, PNG oder WebP, höchstens 8 MB. Querformat wirkt am besten. Wird beim Speichern hochgeladen.</p>
            {article.cover_path ? <CheckField name="removeCover" label="Titelbild entfernen" /> : null}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="coverAlt" label="Bildbeschreibung" hint="Was ist zu sehen? Für Screenreader und Suchmaschinen." defaultValue={article.cover_alt} optional maxLength={300} />
          <TextField name="coverCaption" label="Bildunterschrift" hint="Sichtbar unter dem Bild, z. B. Foto: Name." defaultValue={article.cover_caption} optional maxLength={300} />
        </div>
      </fieldset>

      <MarkdownEditor
        name="body"
        onUploadImage={uploadArticleImage}
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
