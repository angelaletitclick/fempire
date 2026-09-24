import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/Button";
import { StatusPage } from "@/components/ui/StatusPage";
import { confirmWaitlist } from "../actions";

export const metadata: Metadata = {
  title: "Warteliste bestätigen",
  robots: { index: false, follow: false },
};

export default async function ConfirmPage({ searchParams }: PageProps<"/warteliste/bestaetigen">) {
  const { token, status } = await searchParams;

  if (status === "ok") {
    return (
      <StatusPage
        label="Warteliste"
        headline="Du stehst ==auf der Liste.=="
        body="Wir melden uns, sobald in deiner Stadt ein Kreis startet. Bis dahin bekommst du keine weiteren Mails von uns."
      >
        <ButtonLink href="/" variant="outline">
          Zur Startseite
        </ButtonLink>
      </StatusPage>
    );
  }

  if (status === "ungueltig" || typeof token !== "string") {
    return (
      <StatusPage
        label="Warteliste"
        headline="Link ungültig."
        body="Der Bestätigungslink ist abgelaufen oder unvollständig. Trag dich einfach auf der Startseite erneut ein."
      >
        <ButtonLink href="/#bewerbung" variant="outline">
          Zur Warteliste
        </ButtonLink>
      </StatusPage>
    );
  }

  // Bestätigung erst per Klick: Mailprogramme rufen Links teils automatisch auf
  return (
    <StatusPage label="Warteliste" headline="Eintragung bestätigen." body="Ein Klick, dann stehst du auf der Warteliste.">
      <form action={confirmWaitlist}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit">Jetzt bestätigen</Button>
      </form>
    </StatusPage>
  );
}
