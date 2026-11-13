import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { mailEnv } from "@/lib/env";

export type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

let smtp: Transporter | undefined;

/**
 * Einziger Ort, der mit dem Mail-Dienst spricht.
 *
 * - Sind SMTP_USER und SMTP_PASS gesetzt, geht die Mail über Gmail (bzw. SMTP_HOST).
 *   Absender ist dann das Gmail-Konto selbst, ein App-Passwort von Google genügt.
 * - Sonst über Resend. Resend verschickt nur von einer dort bestätigten eigenen Domain.
 *
 * Ist nichts konfiguriert, wird die Mail übersprungen und geloggt, statt die Aktion
 * scheitern zu lassen. Die Daten liegen dann trotzdem in Supabase.
 */
export async function sendMail(mail: Mail): Promise<void> {
  let env: ReturnType<typeof mailEnv>;
  try {
    env = mailEnv();
  } catch (error) {
    console.warn(`Mail übersprungen ("${mail.subject}"):`, (error as Error).message);
    return;
  }
  const replyTo = mail.replyTo ?? env.MAIL_REPLY_TO;

  if (env.SMTP_USER && env.SMTP_PASS) {
    smtp ??= nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS.replace(/\s/g, "") },
    });
    try {
      await smtp.sendMail({ from: env.MAIL_FROM, to: mail.to, replyTo, subject: mail.subject, html: mail.html, text: mail.text });
    } catch (error) {
      throw new Error(`Mailversand fehlgeschlagen ("${mail.subject}"): ${(error as Error).message}`);
    }
    return;
  }

  if (!env.RESEND_API_KEY) {
    console.warn(`Mail übersprungen ("${mail.subject}"): weder SMTP noch Resend konfiguriert`);
    return;
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.MAIL_FROM,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo,
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
