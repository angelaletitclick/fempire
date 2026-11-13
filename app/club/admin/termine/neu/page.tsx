import Link from "next/link";
import { PageHead } from "@/components/club/PageHead";
import { requireAdmin } from "@/lib/auth";
import { EventForm, emptyEvent } from "../EventForm";

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <div className="container-site max-w-4xl py-section">
      <Link href="/club/admin/termine" className="label hover:text-white">
        Alle Termine
      </Link>
      <div className="mt-8">
        <PageHead label="Termine" headline="Neuer Termin." />
      </div>
      <EventForm event={emptyEvent} />
    </div>
  );
}
