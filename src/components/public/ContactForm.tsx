"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/locales";

type Copy = { name: string; email: string; phone: string; message: string; consent: string; submit: string; sent: string; invalid: string; privacy: string };

export function ContactForm({ locale, consentVersion, copy }: { locale: Locale; consentVersion: string; copy: Copy }) {
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "busy") return;
    setStatus("busy");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/v1/public/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), email: data.get("email"), phone: data.get("phone"), message: data.get("message"),
          website: data.get("website"), locale, consent: data.get("consent") === "on",
          consentVersion, sourcePath: `/${locale}/contact`,
        }),
      });
      setStatus(response.ok ? "sent" : "error");
      if (response.ok) form.reset();
    } catch { setStatus("error"); }
  }
  return <form className="public-contact-form" onSubmit={submit}>
    <label><span>{copy.name}</span><input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
    <label><span>{copy.email}</span><input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
    <label><span>{copy.phone}</span><input name="phone" type="tel" maxLength={25} autoComplete="tel" /></label>
    <label><span>{copy.message}</span><textarea name="message" required minLength={10} maxLength={4000} rows={6} /></label>
    <label className="public-honeypot" aria-hidden="true"><span>Website</span><input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="public-consent"><input name="consent" type="checkbox" required /> <span>{copy.consent} <a href={`/${locale}/privacy`}>{copy.privacy}</a></span></label>
    <button type="submit" disabled={status === "busy"}>{copy.submit}</button>
    <p role="status" aria-live="polite">{status === "sent" ? copy.sent : status === "error" ? copy.invalid : ""}</p>
  </form>;
}
