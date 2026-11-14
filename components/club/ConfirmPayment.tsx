import { confirmPayment } from "@/app/club/admin/mitglieder/actions";
import { admin } from "@/content/club";

/** Hinweis bei "Zahlung offen" mit Knopf zum Freischalten (schickt die Willkommensmail) */
export function ConfirmPayment({ userId }: { userId: string }) {
  const t = admin.paymentDue;
  return (
    <form action={confirmPayment.bind(null, userId)} className="mt-4 flex flex-wrap items-center gap-4 border border-white p-4">
      <p className="min-w-[16rem] flex-1 text-sm leading-relaxed text-white">{t.body}</p>
      <button type="submit" className="label bg-white px-4 py-3 text-plum transition-colors hover:bg-blush">
        {t.button}
      </button>
    </form>
  );
}
