import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/Button";
import { StatusPage } from "@/components/ui/StatusPage";
import { leaveWaitlist } from "../actions";

export const metadata: Metadata = {
  title: "Von der Warteliste abmelden",
  robots: { index: false, follow: false },
};

export default async function LeavePage({ searchParams }: PageProps<"/warteliste/abmelden">) {
  const { token, status } = await searchParams;

  if (status === "ok") {
    return (
      <StatusPage
        label="Warteliste"
        headline="Abgemeldet."
        body="Deine Eintragung ist gelöscht. Du bekommst keine Mails mehr von uns."
      >
        <ButtonLink href="/" variant="outline">
          Zur Startseite
        </ButtonLink>
      </StatusPage>
    );
  }

  if (typeof token !== "string") {
    return <StatusPage label="Warteliste" headline="Link ungültig." body="Bitte nutze den Link aus unserer E-Mail." />;
  }

  return (
    <StatusPage label="Warteliste" headline="Von der Warteliste abmelden?" body="Wir löschen deine Eintragung vollständig.">
      <form action={leaveWaitlist}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="outline">
          Abmelden
        </Button>
      </form>
    </StatusPage>
  );
}
