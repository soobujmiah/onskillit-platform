"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";

function csrfCookie() {
  return document.cookie.split("; ").find((part) => part.startsWith("onskillit_csrf="))?.split("=")[1] ?? "";
}

export function ChangePassword({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.identity;
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/v1/identity/change-password", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfCookie() },
        body: JSON.stringify({ current_password: form.get("current"), new_password: form.get("next") }),
      });
      setMessage(response.ok ? t.passwordChanged : t.invalid);
      if (response.ok) event.currentTarget.reset();
    } catch { setMessage(t.invalid); }
  }
  return <form onSubmit={submit} className="identity-form">
    <h2>{t.changePassword}</h2>
    <label>{t.currentPassword}<input type="password" name="current" autoComplete="current-password" required /></label>
    <label>{t.newPassword}<input type="password" name="next" autoComplete="new-password" required minLength={12} maxLength={128} /></label>
    <button type="submit">{t.changePassword}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
