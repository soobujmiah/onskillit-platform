"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";

function csrfCookie() {
  return document.cookie.split("; ").find((part) => part.startsWith("onskillit_csrf="))?.split("=")[1] ?? "";
}

export function InquiryRedactionAction({ inquiryId, dictionary }: { inquiryId: string; dictionary: Dictionary }) {
  const [message, setMessage] = useState("");
  const t = dictionary.inquiries;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/v1/staff/inquiries/${inquiryId}/redactions`, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfCookie() },
        body: JSON.stringify({ request_reference: form.get("request_reference"), review_reference: form.get("review_reference") }),
      });
      setMessage(response.ok ? t.redacted : t.redactFailed);
      if (response.ok) window.location.reload();
    } catch { setMessage(t.redactFailed); }
  }
  return <details className="inquiry-redact"><summary>{t.redactAction}</summary>
    <form onSubmit={submit} className="identity-form">
      <p>{t.redactHelp}</p>
      <label>{t.requestReference}<input name="request_reference" required minLength={4} maxLength={100} pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{3,99}" /></label>
      <label>{t.reviewReference}<input name="review_reference" required minLength={4} maxLength={100} pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{3,99}" /></label>
      <button type="submit">{t.redactButton}</button>
      {message && <span role="status">{message}</span>}
    </form></details>;
}
