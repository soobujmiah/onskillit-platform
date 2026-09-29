"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/locales";

type Mode = "sign-in" | "register" | "recovery" | "verify-request" | "reset" | "verify";

export function IdentityForm({ mode, locale, dictionary, token }: {
  mode: Mode; locale: Locale; dictionary: Dictionary; token?: string;
}) {
  const t = dictionary.identity;
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const needsContact = mode === "sign-in" || mode === "register";
  const needsEmail = mode === "recovery" || mode === "verify-request";
  const needsPassword = mode === "sign-in" || mode === "register" || mode === "reset";
  const path = ({
    "sign-in": "sessions", register: "registrations", recovery: "password-reset-requests",
    "verify-request": "email-verification-requests", reset: "password-resets", verify: "email-verifications",
  } as const)[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {};
    if (needsContact) payload.contact = String(form.get("contact") ?? "");
    if (mode === "register" && form.get("secondary_contact")) payload.secondary_contact = String(form.get("secondary_contact"));
    if (needsEmail) payload.email = String(form.get("email") ?? "");
    if (needsPassword) payload.password = String(form.get("password") ?? "");
    if (token) payload.token = token;
    try {
      const response = await fetch(`/api/v1/identity/${path}`, {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { setMessage(t.invalid); return; }
      if (mode === "sign-in") { window.location.assign(`/${locale}/learn/profile`); return; }
      if (mode === "register") { window.location.assign(`/${locale}/account/sign-in`); return; }
      setMessage(mode === "recovery" || mode === "verify-request" ? t.genericSent : mode === "reset" ? t.resetDone : t.verified);
    } catch { setMessage(t.invalid); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="identity-form">
      {needsContact && <label>{t.contact}<input name="contact" autoComplete="username" required maxLength={254} /></label>}
      {mode === "register" && <label>{t.optionalSecondContact}<input name="secondary_contact" maxLength={254} /></label>}
      {needsEmail && <label>{t.email}<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
      {needsPassword && <label>{mode === "reset" ? t.newPassword : t.password}
        <input name="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required minLength={12} maxLength={128} /></label>}
      {mode === "recovery" && <p>{t.recoveryNote}</p>}
      <button type="submit" disabled={busy}>{mode === "verify-request" ? t.verificationRequest : t.submit}</button>
      {message && <p role="status" aria-live="polite">{message}</p>}
    </form>
  );
}
