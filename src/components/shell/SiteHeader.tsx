import type { Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import Link from "next/link";
import type { PublicNavItem } from "@/lib/public-content";

function SiteLogo({ id, alt }: { id: string; alt: string }) {
  // Approved public CMS media is served by the CMS media route, so next/image optimization does not apply.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="site-logo" src={`/api/v1/cms/media/${id}/content`} alt={alt} height={32} />;
}

export function SiteHeader({
  locale,
  dictionary,
  initialTheme,
  navigation,
  brand,
  logo,
}: {
  locale: Locale;
  dictionary: Dictionary;
  initialTheme: "light" | "dark";
  navigation: PublicNavItem[];
  brand: string;
  logo: { id: string; alt: string } | null;
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
      <Link href={`/${locale}`} className="site-brand">{logo && <SiteLogo id={logo.id} alt={logo.alt} />}{brand}</Link>
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
