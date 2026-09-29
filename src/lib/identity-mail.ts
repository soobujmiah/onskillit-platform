import "server-only";
import nodemailer from "nodemailer";

export async function sendIdentityLink(to: string, path: string, subject: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  const base = process.env.PUBLIC_BASE_URL;
  if (!host || !from || !base) return false;
  const url = new URL(path, base).toString();
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  await transport.sendMail({ from, to, subject, text: `${subject}\n\n${url}\n\nIf you did not request this, ignore this message.` });
  return true;
}
