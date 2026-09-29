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
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/v1/identity/users/${userId}`, {
        method: "PATCH", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfCookie() },
        body: JSON.stringify({ status: next, reason: form.get("reason") }),
      });
      setMessage(response.ok ? t.saved : t.invalid);
      if (response.ok) window.location.reload();
    } catch { setMessage(t.invalid); }
  }
  return <form onSubmit={update} className="identity-form"><label>{t.reason}<input name="reason" required maxLength={300} /></label>
    <button type="submit">{next === "active" ? t.activate : t.suspend}</button>
    {message && <span role="status">{message}</span>}</form>;
}

export function GrantRoleAction({ dictionary }: { dictionary: Dictionary }) {
  const [message, setMessage] = useState("");
  const [scopeType, setScopeType] = useState<"global" | "resource">("global");
  const t = dictionary.identity;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const role = String(form.get("role_id") ?? "");
      const privileged = role === "owner" || role === "security_admin";
      const response = await fetch(`/api/v1/identity/${privileged ? "grant-requests" : "role-assignments"}`, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfCookie() },
        body: JSON.stringify({ user_id: form.get("user_id"), role_id: role,
          scope_type: scopeType, scope_id: scopeType === "global" ? "*" : form.get("scope_id"), reason: form.get("reason") }),
      });
      setMessage(response.ok ? t.saved : t.invalid);
      if (response.ok) event.currentTarget.reset();
    } catch { setMessage(t.invalid); }
  }
  return <form onSubmit={submit} className="identity-form">
    <h2>{t.grant}</h2>
    <label>{t.targetId}<input name="user_id" required /></label>
    <label>{t.roleId}<select name="role_id" required><option value="support">{t.supportRole}</option><option value="member">{t.memberRole}</option><option value="security_admin">{t.securityRole}</option><option value="owner">{t.ownerRole}</option></select></label>
    <label>{t.scope}<select value={scopeType} onChange={(event) => setScopeType(event.target.value as "global" | "resource")}>
      <option value="global">{t.globalScope}</option><option value="resource">{t.resourceScope}</option>
    </select></label>
    {scopeType === "resource" && <label>{t.scopeId}<input name="scope_id" required maxLength={100} /></label>}
    <label>{t.reason}<input name="reason" required maxLength={300} /></label>
    <button type="submit">{t.grant}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}

export function ApproveGrantAction({ requestId, dictionary }: { requestId: string; dictionary: Dictionary }) {
  const [message, setMessage] = useState("");
  const t = dictionary.identity;
  async function approve() {
    try {
      const response = await fetch(`/api/v1/identity/grant-requests/${requestId}/approve`, {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "x-csrf-token": csrfCookie() },
        body: "{}",
      });
      setMessage(response.ok ? t.saved : t.invalid);
      if (response.ok) window.location.reload();
    } catch { setMessage(t.invalid); }
  }
  return <span><button type="button" onClick={approve}>{t.approveGrant}</button>{message && <span role="status">{message}</span>}</span>;
}
