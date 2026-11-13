import Link from "next/link";
import { AutoRefresh } from "@/components/club/AutoRefresh";
import { Avatar } from "@/components/club/Avatar";
import { PageHead } from "@/components/club/PageHead";
import { club } from "@/content/club";
import { requireMember, type Member } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { formatShort } from "@/lib/time";

export const metadata = { title: "Nachrichten" };

type Conversation = { partner_id: string; last_body: string; last_at: string; last_from_me: boolean; unread: number };

export default async function NachrichtenPage() {
  await requireMember();
  const t = club.messages;
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("my_conversations");
  const conversations = ((data ?? []) as Conversation[]).sort((a, b) => b.last_at.localeCompare(a.last_at));

  const ids = conversations.map((c) => c.partner_id);
  const { data: partnersData } = ids.length
    ? await supabase.from("members").select("user_id, full_name, avatar_path, updated_at, company").in("user_id", ids)
    : { data: [] };
  const partners = new Map(
    ((partnersData ?? []) as Array<Pick<Member, "user_id" | "full_name" | "avatar_path" | "updated_at" | "company">>).map((p) => [p.user_id, p]),
  );

  return (
    <div className="container-site max-w-4xl py-section">
      <AutoRefresh seconds={30} />
      <PageHead label={t.label} headline={t.headline} intro={t.intro} />
      {conversations.length === 0 ? (
        <p className="mt-12 border border-line p-6 text-slate-light">
          {t.empty}{" "}
          <Link href="/club/mitglieder" className="text-white underline underline-offset-4">
            {club.members.label}
          </Link>
        </p>
      ) : (
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {conversations.map((conversation) => {
            const partner = partners.get(conversation.partner_id);
            if (!partner) return null;
            const unread = Number(conversation.unread);
            return (
              <li key={conversation.partner_id}>
                <Link href={`/club/nachrichten/${partner.user_id}`} className="flex items-center gap-4 py-5 hover:bg-surface md:px-4">
                  <Avatar member={partner} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline justify-between gap-4">
                      <span className={unread ? "font-semibold text-white" : "text-white"}>{partner.full_name}</span>
                      <span className="label shrink-0">{formatShort(conversation.last_at)}</span>
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-light">
                      {conversation.last_from_me ? `${t.you}: ` : ""}
                      {conversation.last_body}
                    </p>
                  </div>
                  {unread > 0 ? (
                    <span className="inline-flex h-6 min-w-6 items-center justify-center bg-white px-1.5 text-xs font-semibold text-plum tabular-nums">
                      {unread}
                      <span className="sr-only"> ungelesen</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
