"use client";

import { useEffect } from "react";

/**
 * The root layout (src/app/layout.tsx) sets <html lang> once, from a
 * request header, on the initial render — correct for a fresh load,
 * but it does NOT re-render on a client-side navigation between two
 * locales, because Next.js keeps a shared layout mounted across
 * sibling-route navigations. [locale]/layout.tsx *does* re-render
 * when the locale param changes, so this effect is what keeps
 * <html lang> correct after clicking the language switcher instead
 * of a full page load.
 */
export function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
