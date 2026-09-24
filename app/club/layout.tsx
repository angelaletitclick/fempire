import type { Metadata } from "next";
import { Logo } from "@/components/sections/Logo";

export const metadata: Metadata = {
  title: "Mitgliederbereich",
  robots: { index: false, follow: false },
};

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="container-site flex h-16 items-center justify-between">
          <Logo />
          <span className="label">Mitgliederbereich</span>
        </div>
      </header>
      <main id="inhalt" className="flex-1">
        {children}
      </main>
    </div>
  );
}
