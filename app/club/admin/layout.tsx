import { ClubNav } from "@/components/club/ClubNav";
import { admin } from "@/content/club";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Backend" };

/** Backend: nur für Admins. Jede Aktion prüft die Rolle zusätzlich serverseitig. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div>
      <div className="border-b border-line bg-surface">
        <div className="container-site flex items-center gap-6">
          <span className="label hidden shrink-0 text-white md:block">{admin.label}</span>
          <div className="min-w-0 flex-1">
            <ClubNav items={admin.nav} label="Backend" exact={["/club/admin"]} />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
