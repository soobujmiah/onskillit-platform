import type { Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import Link from "next/link";
import type { PublicNavItem } from "@/lib/public-content";

export function SiteHeader({
  locale,
  dictionary,
  initialTheme,
  navigation,
}: {
  locale: Locale;
  dictionary: Dictionary;
  initialTheme: "light" | "dark";
  navigation: PublicNavItem[];
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
      <Link href={`/${locale}`} className="site-brand">{dictionary.brand}</Link>
      {navigation.some((item) => item.slot === "header") && <nav className="site-nav" aria-label={dictionary.public.primaryNav}>
        {navigation.filter((item) => item.slot === "header").map((item) => <Link key={item.id} href={item.href}>{item.label}</Link>)}
      </nav>}
      <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
        <Link href={`/${locale}/learn/profile`} style={{ color: "var(--text-primary)" }}>{dictionary.identity.account}</Link>
        <LanguageSwitcher locale={locale} dictionary={dictionary} />
        <ThemeToggle dictionary={dictionary} initialTheme={initialTheme} />
      </div>
    </header>
  );
}
