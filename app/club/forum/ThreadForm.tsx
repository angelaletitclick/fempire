import { ActionForm } from "@/components/club/ActionForm";
import { SelectField, TextAreaField, TextField } from "@/components/club/fields";
import { club } from "@/content/club";
import type { ForumCategory, ThreadKind } from "@/lib/forum";
import { createThread, updateThread } from "./actions";

/** Formular für neue und bearbeitete Themen */
export function ThreadForm({
  categories,
  thread,
  defaultCategory,
  submitLabel,
}: {
  categories: ForumCategory[];
  thread?: { id: string; title: string; body: string; category_id: string; kind: ThreadKind };
  defaultCategory?: string;
  submitLabel: string;
}) {
  const t = club.forum;
  return (
    <ActionForm
      action={thread ? updateThread : createThread}
      submitLabel={submitLabel}
      pendingLabel="Wird gesendet"
      resetOnSuccess={!thread}
      className="mt-10"
    >
      {thread ? <input type="hidden" name="threadId" value={thread.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="categoryId"
          label={t.categoryLabel}
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          defaultValue={thread?.category_id ?? defaultCategory ?? categories[0]?.id}
        />
        <SelectField name="kind" label={t.kindLabel} options={t.kindOptions} defaultValue={thread?.kind ?? "frage"} />
      </div>
      <TextField name="title" label={t.titleLabel} hint={t.titleHint} defaultValue={thread?.title} maxLength={140} minLength={3} />
      <TextAreaField name="body" label={t.bodyLabel} hint={t.bodyHint} defaultValue={thread?.body} maxLength={10000} rows={10} />
    </ActionForm>
  );
}
