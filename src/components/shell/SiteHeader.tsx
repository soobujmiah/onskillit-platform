import type { Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import Link from "next/link";

export function SiteHeader({
  locale,
  dictionary,
  initialTheme,
}: {
  locale: Locale;
  dictionary: Dictionary;
  initialTheme: "light" | "dark";
}) {
  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-md)",
        padding: "var(--space-md) var(--space-lg)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>OnSkillIT</span>
      <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
        <Link href={`/${locale}/learn/profile`} style={{ color: "var(--text-primary)" }}>{dictionary.identity.account}</Link>
        <LanguageSwitcher locale={locale} dictionary={dictionary} />
        <ThemeToggle dictionary={dictionary} initialTheme={initialTheme} />
      </div>
    </header>
  );
}
