import "server-only";
import nodemailer from "nodemailer";

export async function sendIdentityLink(to: string, path: string, subject: string, ignoreText: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  const base = process.env.PUBLIC_BASE_URL;
  if (!host || !from || !base) return false;
  const publicUrl = new URL(base);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(publicUrl.hostname);
  if (publicUrl.protocol !== "https:" && !(loopback && publicUrl.protocol === "http:")) return false;
  const url = new URL(path, publicUrl).toString();
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  await transport.sendMail({ from, to, subject, text: `${subject}\n\n${url}\n\n${ignoreText}` });
  return true;
}
