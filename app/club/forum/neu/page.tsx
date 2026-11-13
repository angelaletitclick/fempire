import Link from "next/link";
import { ActionForm } from "@/components/club/ActionForm";
import { TextAreaField, TextField } from "@/components/club/fields";
import { PageHead } from "@/components/club/PageHead";
import { club } from "@/content/club";
import { requireMember } from "@/lib/auth";
import { createThread } from "../actions";

export const metadata = { title: "Neues Thema" };

export default async function NewThreadPage() {
  const viewer = await requireMember();
  const t = club.forum;
  return (
    <div className="container-site max-w-3xl py-section">
      <Link href="/club/forum" className="label hover:text-white">
        {t.back}
      </Link>
      <div className="mt-8">
        <PageHead label={t.label} headline={t.newThread} intro={viewer.isAdmin ? undefined : t.approvalNote} />
      </div>
      <ActionForm action={createThread} submitLabel={viewer.isAdmin ? "Veröffentlichen" : t.submit} pendingLabel="Wird gesendet" resetOnSuccess className="mt-10">
        <TextField name="title" label={t.titleLabel} maxLength={140} minLength={3} />
        <TextAreaField name="body" label={t.bodyLabel} hint={t.bodyHint} maxLength={10000} rows={10} />
      </ActionForm>
    </div>
  );
}
