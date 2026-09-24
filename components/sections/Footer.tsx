import Link from "next/link";
import { site } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="container-site pb-[calc(4.5rem+2.5rem+env(safe-area-inset-bottom))] pt-10 lg:pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <Logo />
          <p className="mt-4 max-w-sm text-base text-slate">{site.footer.note}</p>
        </div>
        <nav aria-label="Weitere Seiten" className="md:col-span-6 md:justify-self-end">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {[...site.footer.links, ...site.footer.legal].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="label hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={site.footer.members.href} className="label hover:text-white">
                {site.footer.members.label}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="label mt-10">
        © {year} {site.name}
      </p>
    </footer>
  );
}
