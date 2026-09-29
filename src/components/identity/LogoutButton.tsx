"use client";

function csrfCookie() {
  return document.cookie.split("; ").find((part) => part.startsWith("onskillit_csrf="))?.split("=")[1] ?? "";
}

export function LogoutButton({ label, locale }: { label: string; locale: string }) {
  async function logout() {
    const response = await fetch("/api/v1/identity/logout", {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "x-csrf-token": csrfCookie() }, body: "{}",
    });
    if (response.ok) window.location.assign(`/${locale}/account/sign-in`);
  }
  return <button type="button" onClick={logout}>{label}</button>;
}
