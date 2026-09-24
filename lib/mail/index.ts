import "server-only";
import { Resend } from "resend";
import { mailEnv } from "@/lib/env";

export type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * Einziger Ort, der mit dem Mail-Dienst spricht. Ein Wechsel von Resend zu einem
 * anderen Anbieter betrifft nur diese Datei.
 *
 * Ist Resend noch nicht konfiguriert, wird die Mail übersprungen und geloggt, statt
 * die Bewerbung scheitern zu lassen. Die Bewerbung selbst liegt dann trotzdem in Supabase.
 */
export async function sendMail(mail: Mail): Promise<void> {
  let env: ReturnType<typeof mailEnv>;
  try {
    env = mailEnv();
  } catch (error) {
    console.warn(`Mail übersprungen ("${mail.subject}"):`, (error as Error).message);
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.MAIL_FROM,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: mail.replyTo ?? env.MAIL_REPLY_TO,
  });
  if (error) {
    throw new Error(`Mailversand fehlgeschlagen ("${mail.subject}"): ${error.message}`);
  }
}

/** Empfängerinnen der internen Benachrichtigungen, leer wenn nicht konfiguriert */
export function notifyRecipients(): string[] {
  try {
    return mailEnv().MAIL_NOTIFY_TO;
  } catch {
    return [];
  }
}
