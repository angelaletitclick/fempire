import type { Metadata } from "next";
import Link from "next/link";
import { ClubNav } from "@/components/club/ClubNav";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { Logo } from "@/components/sections/Logo";
import { club } from "@/content/club";
import { getViewer } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Mitgliederbereich",
  robots: { index: false, follow: false },
};

async function unreadCount(userId: string): Promise<number> {
  const supabase = await supabaseServer();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

export default async function ClubLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const showNav = Boolean(viewer?.member && viewer.isActive);
  const unread = showNav && viewer ? await unreadCount(viewer.userId) : 0;
  const items = viewer?.isAdmin ? [...club.nav, club.adminLink] : club.nav;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          <Logo />
          {viewer ? (
            <form action={signOut}>
              <ConfirmButton>{club.signOut}</ConfirmButton>
            </form>
          ) : (
            <Link href="/" className="label hover:text-white">
              Zur Website
            </Link>
          )}
        </div>
        {showNav ? (
          <div className="container-site">
            <ClubNav items={items} label="Mitgliederbereich" badges={{ "/club/nachrichten": unread }} exact={["/club"]} />
          </div>
        ) : null}
      </header>
      <main id="inhalt" className="flex-1">
        {children}
      </main>
    </div>
  );
}
