import "server-only";
import nodemailer from "nodemailer";

export type InquiryNotice = { id: string; locale: "en" | "bn"; sourcePath: string };
const emailPattern = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

/** Recipients come from deployment configuration (`INQUIRY_NOTIFY_TO`, comma separated, at most five). */
function recipients(): string[] {
  return (process.env.INQUIRY_NOTIFY_TO ?? "").split(",").map((item) => item.trim())
    .filter((item) => item.length <= 254 && emailPattern.test(item)).slice(0, 5);
}

/**
 * Best-effort notice that an inquiry was received. It deliberately carries no visitor name, email, phone or
 * message: the staff inquiry view is the only place those are shown. The stored inquiry is never affected by a
 * delivery failure, and failures are logged without content, addresses or provider details.
 */
export async function sendInquiryNotice(notice: InquiryNotice): Promise<"sent" | "skipped" | "failed"> {
  const to = recipients();
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  const base = process.env.PUBLIC_BASE_URL;
  if (!to.length || !host || !from || !base) return "skipped";
  try {
    const publicUrl = new URL(base);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(publicUrl.hostname);
    if (publicUrl.protocol !== "https:" && !(loopback && publicUrl.protocol === "http:")) return "skipped";
    const link = new URL(`/${notice.locale}/staff/crm/leads`, publicUrl).toString();
    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
      connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 8000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    await transport.sendMail({
      from, to,
      subject: "New OnSkillIT website inquiry",
      text: ["A new website inquiry was received.", `Reference: ${notice.id}`, `Language: ${notice.locale}`,
        `Page: ${notice.sourcePath}`, "", `Review it in the staff workspace (sign-in required): ${link}`, "",
        "This message intentionally contains no visitor details."].join("\n"),
    });
    return "sent";
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error && typeof error.code === "string" ? error.code : "unknown";
    console.error(JSON.stringify({ level: "error", msg: "inquiry notification failed", code }));
    return "failed";
  }
}
