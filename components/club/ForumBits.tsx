import Link from "next/link";
import { Avatar } from "@/components/club/Avatar";
import { Tag } from "@/components/club/PageHead";
import { club, tierLabel } from "@/content/club";
import type { ForumAuthor, ThreadListItem } from "@/lib/forum";
import { formatDate } from "@/lib/time";

const t = club.forum;

/** Kennzeichnungen eines Themas: Art, gelöst/offen, angeheftet, geschlossen, Freigabe */
export function ThreadTags({ thread }: { thread: Pick<ThreadListItem, "kind" | "solved_post_id" | "pinned" | "locked" | "status"> }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {thread.pinned ? <Tag tone="white">{t.pinned}</Tag> : null}
      <Tag>{t.kinds[thread.kind]}</Tag>
      {thread.kind === "frage" ? (
        thread.solved_post_id ? (
          <Tag tone="white">✓ {t.solved}</Tag>
        ) : (
          <Tag>{t.open}</Tag>
        )
      ) : null}
      {thread.locked ? <Tag>{t.locked}</Tag> : null}
      {thread.status === "pending" ? <Tag tone="pink">{t.pending}</Tag> : null}
      {thread.status === "hidden" ? <Tag tone="pink">{t.hidden}</Tag> : null}
    </span>
  );
}

/** Rolle unter dem Namen: Moderatorin (Admin) oder Mitgliedschaft */
export function RoleBadge({ author }: { author: Pick<ForumAuthor, "role" | "tier"> }) {
  if (author.role === "admin") {
    return <span className="label inline-block bg-white px-2 py-0.5 text-[0.625rem] text-plum">{t.moderator}</span>;
  }
  return <span className="label text-[0.625rem]">{tierLabel(author.tier, true)}</span>;
}

/** Autorinnen-Spalte eines Beitrags */
export function AuthorCard({ author }: { author: ForumAuthor | null }) {
  if (!author) return <div className="text-sm text-slate-light">Gelöschtes Konto</div>;
  return (
    <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-3">
      <Avatar member={author} size="md" />
      <div className="min-w-0">
        <Link href={`/club/mitglieder/${author.user_id}`} className="block font-semibold leading-tight text-white hover:underline">
          {author.full_name}
        </Link>
        <div className="mt-1">
          <RoleBadge author={author} />
        </div>
        {author.company ? <p className="mt-1 text-xs text-slate-light">{author.company}</p> : null}
        <p className="mt-1 hidden text-xs text-slate md:block">
          {t.memberSince} {formatDate(author.created_at)}
        </p>
      </div>
    </div>
  );
}
