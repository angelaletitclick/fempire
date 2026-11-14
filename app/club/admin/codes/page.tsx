import { ActionForm } from "@/components/club/ActionForm";
import { ConfirmButton } from "@/components/club/ConfirmButton";
import { CheckField, Fieldset, TextField } from "@/components/club/fields";
import { PageHead, Tag } from "@/components/club/PageHead";
import { tiers } from "@/content/club";
import { requireAdmin } from "@/lib/auth";
import { describeCode, describeTiers, isUsable, type InviteCode } from "@/lib/codes";
import { siteUrl } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/time";
import { createCode, deleteCode, setCodeActive } from "./actions";

export const metadata = { title: "Einladungscodes" };

/** Einladungscodes: Rabatt, kostenlose Monate, Aufnahme ohne Bewerbung */
export default async function CodesPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin().from("invite_codes").select("*").order("created_at", { ascending: false });
  const codes = (data ?? []) as InviteCode[];

  return (
    <div className="container-site py-section">
      <PageHead
        label="Backend"
        headline="Einladungscodes."
        intro="Für Einladungen: Rabatt auf den Beitrag, kostenlose erste Monate oder Aufnahme ohne Bewerbung. Schickt den Link mit, dann ist der Code im Formular schon eingetragen."
      />

      <section aria-labelledby="neu" className="mt-10 max-w-3xl border border-white p-6 md:p-8">
        <h2 id="neu" className="label text-white">
          Neuer Code
        </h2>
        <ActionForm action={createCode} submitLabel="Code anlegen" pendingLabel="Wird angelegt" resetOnSuccess className="mt-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="code"
              label="Code"
              optional
              maxLength={40}
              placeholder="z. B. SOMMER27"
              hint="Leer lassen, dann wird ein Code erzeugt."
              className="uppercase"
            />
            <TextField name="note" label="Notiz (intern)" optional maxLength={200} placeholder="z. B. Netzwerk-Event März" />
          </div>

          <Fieldset legend="Vorteile">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="discount" label="Rabatt in %" optional inputMode="numeric" placeholder="0" hint="100 = dauerhaft kostenlos." />
              <TextField name="freeMonths" label="Kostenlose erste Monate" optional inputMode="numeric" placeholder="0" hint="z. B. 3 = die ersten drei Monate frei." />
            </div>
            <div className="mt-3">
              <CheckField name="skip" label="Mitglied werden ohne Bewerbung (sofort angelegt)" />
            </div>
          </Fieldset>

          <Fieldset legend="Gilt für">
            <div className="grid gap-1 sm:grid-cols-2">
              {tiers.map((tier) => (
                <CheckField key={tier.value} name="tiers" value={tier.value} label={tier.label} defaultChecked />
              ))}
            </div>
          </Fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="maxUses" label="Wie oft einlösbar" optional inputMode="numeric" placeholder="unbegrenzt" />
            <TextField name="expires" label="Gültig bis einschließlich" optional type="date" />
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="liste" className="mt-14">
        <h2 id="liste" className="label text-white">
          Alle Codes
        </h2>
        {codes.length === 0 ? (
          <p className="mt-4 border border-line p-6 text-slate-light">Noch keine Codes angelegt.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {codes.map((code) => {
              const usable = isUsable(code);
              const link = `${siteUrl}/bewerbung?code=${encodeURIComponent(code.code)}${code.tiers.length === 1 ? `&kreis=${code.tiers[0]}` : ""}`;
              return (
                <li key={code.id} className={usable ? "card p-5 md:p-6" : "border border-line p-5 opacity-70 md:p-6"}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-3">
                        <span className="headline text-xl tracking-wider">{code.code}</span>
                        <Tag tone={usable ? "white" : "line"}>{usable ? "Aktiv" : code.active ? "Abgelaufen oder aufgebraucht" : "Deaktiviert"}</Tag>
                      </p>
                      <p className="mt-2 text-base text-white">{describeCode(code)}</p>
                      <p className="mt-1 text-sm text-slate-light">
                        Gilt für {describeTiers(code)} · eingelöst {code.uses}
                        {code.max_uses ? ` von ${code.max_uses}` : ""}
                        {code.expires_at ? ` · gültig bis ${formatDate(code.expires_at)}` : ""}
                        {code.note ? ` · ${code.note}` : ""}
                      </p>
                      <p className="mt-3 break-all text-sm">
                        <span className="label mr-2">Link</span>
                        <span className="select-all text-white">{link}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <form action={setCodeActive.bind(null, code.id, !code.active)}>
                        <ConfirmButton variant="link">{code.active ? "Deaktivieren" : "Aktivieren"}</ConfirmButton>
                      </form>
                      <form action={deleteCode.bind(null, code.id)}>
                        <ConfirmButton variant="link" confirm={`Code ${code.code} löschen? Bereits aufgenommene Mitglieder behalten ihren Rabatt.`}>
                          Löschen
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
