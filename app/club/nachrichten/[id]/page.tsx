import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/club/ActionForm";
import { AutoRefresh } from "@/components/club/AutoRefresh";
import { Avatar } from "@/components/club/Avatar";
import { TextAreaField } from "@/components/club/fields";
import { TierBadge } from "@/components/club/TierBadge";
import { canMessage } from "@/lib/messaging";
import { PlainText } from "@/components/ui/RichText";
import { club } from "@/content/club";
import { requireMember, type Member } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { cx } from "@/lib/cx";
import { formatShort } from "@/lib/time";
import { sendMessage } from "../actions";

export const metadata = { title: "Nachrichten" };

type Message = { id: string; sender_id: string; body: string; created_at: string };

export default async function ConversationPage({ params }: PageProps<"/club/nachrichten/[id]">) {
  const { id } = await params;
  const viewer = await requireMember();
  if (!/^[0-9a-f-]{36}$/i.test(id) || id === viewer.userId) notFound();
  const t = club.messages;

  const supabase = await supabaseServer();
  const { data: partnerData } = await supabase
    .from("members")
    .select("user_id, full_name, avatar_path, updated_at, company, position, role, status, tier")
    .eq("user_id", id)
    .maybeSingle();
  const partner = partnerData as (Pick<Member, "user_id" | "full_name" | "avatar_path" | "updated_at" | "company" | "position" | "role" | "status" | "tier">) | null;
  if (!partner || (partner.role !== "admin" && partner.status !== "active")) notFound();

  const me = viewer.userId;
  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .or(`and(sender_id.eq.${me},recipient_id.eq.${id}),and(sender_id.eq.${id},recipient_id.eq.${me})`)
    .order("created_at", { ascending: false })
    .limit(200);
  const messages = ((data ?? []) as Message[]).reverse();

  // Eingegangene Nachrichten als gelesen markieren
  await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("sender_id", id).eq("recipient_id", me).is("read_at", null);

  return (
    <div className="container-site max-w-3xl py-section">
      <AutoRefresh seconds={15} />
      <Link href="/club/nachrichten" className="label hover:text-white">
        {t.back}
      </Link>

      <Link href={`/club/mitglieder/${partner.user_id}`} className="mt-8 flex items-center gap-4">
        <Avatar member={partner} size="md" />
        <span>
          <span className="headline block text-2xl">{partner.full_name}</span>
          <TierBadge member={partner} className="my-1 flex w-fit" />
          {partner.position || partner.company ? (
            <span className="text-sm text-slate-light">{[partner.position, partner.company].filter(Boolean).join(", ")}</span>
          ) : null}
        </span>
      </Link>

      <ol className="mt-10 grid gap-3 border-t border-line pt-8" aria-label="Verlauf">
        {messages.length === 0 ? <li className="text-slate-light">{t.startHint}</li> : null}
        {messages.map((message) => {
          const mine = message.sender_id === me;
          return (
            <li key={message.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cx("max-w-[85%] px-4 py-3 sm:max-w-[75%]", mine ? "bg-white text-plum" : "card text-white")}>
                <p className={cx("text-xs", mine ? "text-plum/70" : "text-slate-light")}>
                  <span className="sr-only">{mine ? t.you : partner.full_name}, </span>
                  {formatShort(message.created_at)}
                </p>
                <PlainText text={message.body} className="mt-1 text-base leading-relaxed" />
              </div>
            </li>
          );
        })}
      </ol>

      {canMessage(viewer.member, partner, messages.some((message) => message.sender_id === id)) ? (
      <ActionForm action={sendMessage} submitLabel={t.send} pendingLabel="Wird gesendet" resetOnSuccess className="mt-8">
        <input type="hidden" name="recipientId" value={partner.user_id} />
        <TextAreaField name="body" label={t.placeholder} hint={t.mailNote} maxLength={4000} rows={3} className="[&_textarea]:min-h-24" />
      </ActionForm>
      ) : (
        <p className="mt-8 border border-line px-4 py-3 text-sm text-slate-light">{t.notAllowed}</p>
      )}
    </div>
  );
}
