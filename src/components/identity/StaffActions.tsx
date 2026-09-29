"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";

function csrfCookie() {
  return document.cookie.split("; ").find((part) => part.startsWith("onskillit_csrf="))?.split("=")[1] ?? "";
}
export function UserStatusAction({ userId, status, dictionary }: { userId: string; status: string; dictionary: Dictionary }) {
  const [message, setMessage] = useState("");
  const t = dictionary.identity;
  const next = status === "active" ? "suspended" : "active";
  async function update() {
    try {
      const response = await fetch(`/api/v1/identity/users/${userId}`, {
        method: "PATCH", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfCookie() },
        body: JSON.stringify({ status: next }),
      });
      setMessage(response.ok ? t.saved : t.invalid);
      if (response.ok) window.location.reload();
    } catch { setMessage(t.invalid); }
  }
  return <span><button type="button" onClick={update}>{next === "active" ? t.activate : t.suspend}</button>
    {message && <span role="status">{message}</span>}</span>;
}

export function GrantRoleAction({ dictionary }: { dictionary: Dictionary }) {
  const [message, setMessage] = useState("");
  const t = dictionary.identity;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/v1/identity/role-assignments", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfCookie() },
        body: JSON.stringify({ user_id: form.get("user_id"), role_id: form.get("role_id"),
          scope_type: "global", scope_id: "*", reason: form.get("reason") }),
      });
      setMessage(response.ok ? t.saved : t.invalid);
      if (response.ok) event.currentTarget.reset();
    } catch { setMessage(t.invalid); }
  }
  return <form onSubmit={submit} className="identity-form">
    <h2>{t.grant}</h2>
    <label>{t.targetId}<input name="user_id" required /></label>
    <label>{t.roleId}<select name="role_id" required><option value="support">{t.supportRole}</option><option value="member">{t.memberRole}</option></select></label>
    <label>{t.reason}<input name="reason" required maxLength={300} /></label>
    <button type="submit">{t.grant}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
