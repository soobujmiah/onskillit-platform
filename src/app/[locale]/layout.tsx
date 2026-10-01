import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/i18n/locales";
import { getSiteDictionary } from "@/lib/site-text";
import { siteChrome } from "@/lib/site-settings";
import { SkipLink } from "@/components/shell/SkipLink";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { HtmlLangSync } from "@/components/shell/HtmlLangSync";
import { publishedNavigation } from "@/lib/public-content";
import Link from "next/link";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const dictionary = await getSiteDictionary(locale);
  const chrome = await siteChrome(locale);
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const initialTheme: "light" | "dark" = themeCookie === "dark" ? "dark" : "light";
  const navigation = await publishedNavigation(locale);

  return (
    <>
      <HtmlLangSync locale={locale} />
      <SkipLink label={dictionary.skipLink} />
      <SiteHeader locale={locale} dictionary={dictionary} initialTheme={initialTheme} navigation={navigation} brand={chrome.brand ?? dictionary.brand} logo={chrome.logoId ? { id: chrome.logoId, alt: chrome.logoAlt ?? "" } : null} />
      <main id="content" style={{ padding: "var(--space-xl) var(--space-lg)" }}>
        {children}
      </main>
      <footer className="site-footer"><small>{chrome.footer}</small>{navigation.some((item) => item.slot === "footer") && <nav aria-label={dictionary.public.footerNav}>
        {navigation.filter((item) => item.slot === "footer").map((item) => <Link key={item.id} href={item.href}>{item.label}</Link>)}
      </nav>}</footer>
    </>
  );
}
