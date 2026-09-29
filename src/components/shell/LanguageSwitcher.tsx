"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/get-dictionary";

/** Preserve the current route when switching locale, including reset tokens. */
export function LanguageSwitcher({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const otherLocale: Locale = locale === "en" ? "bn" : "en";
  const pathname = usePathname();
  const suffix = pathname.replace(/^\/(en|bn)(?=\/|$)/, "");
  const target = /^\/services\/[^/]+$/.test(suffix) ? "/services" : suffix;
  return (
    <Link
      href={`/${otherLocale}${target}`}
      lang={otherLocale}
      aria-label={dictionary.language.switchToLabel}
      style={{
        color: "var(--text-primary)",
        fontSize: "14px",
        fontWeight: 600,
        textDecoration: "none",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-pill)",
        padding: "6px 14px",
      }}
    >
      {dictionary.language.switchTo}
    </Link>
  );
}
