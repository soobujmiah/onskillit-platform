import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Links to the other locale's root. PHASE-02 has exactly one page
 * per locale, so there is no deeper path to preserve yet; once real
 * routes exist under [locale], this should map to the equivalent
 * path in the target locale rather than always going to its root.
 */
export function LanguageSwitcher({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  const otherLocale: Locale = locale === "en" ? "bn" : "en";
  return (
    <Link
      href={`/${otherLocale}`}
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
