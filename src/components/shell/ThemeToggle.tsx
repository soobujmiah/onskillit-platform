"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";

const THEME_COOKIE = "theme";
const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * `initialTheme` is what the server knew from the `theme` cookie
 * (defaulting to "light" when absent). On a first-ever visit with no
 * cookie yet, the root layout's pre-paint script may apply the
 * system's dark preference to <html> before this button's
 * server-rendered label was generated — a known, minor, one-visit-only
 * cosmetic mismatch (the label briefly says the wrong action) that
 * self-corrects on the first click. Not corrected with a mount effect
 * on purpose: syncing local state from the DOM in an effect just to
 * catch this one edge case trades a real anti-pattern (state that can
 * drift from its own source of truth) for a cosmetic nicety.
 */
export function ThemeToggle({
  dictionary,
  initialTheme,
}: {
  dictionary: Dictionary;
  initialTheme: "light" | "dark";
}) {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dictionary.theme.toggleLabel}
      aria-pressed={theme === "dark"}
      style={{
        color: "var(--text-primary)",
        background: "transparent",
        fontSize: "14px",
        fontWeight: 600,
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-pill)",
        padding: "6px 14px",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {theme === "dark" ? dictionary.theme.light : dictionary.theme.dark}
    </button>
  );
}
