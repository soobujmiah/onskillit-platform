import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/i18n/locales";
import { getDictionary } from "@/i18n/get-dictionary";
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

  const dictionary = getDictionary(locale);
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("theme")?.value;
  const initialTheme: "light" | "dark" = themeCookie === "dark" ? "dark" : "light";
  const navigation = await publishedNavigation(locale);

  return (
    <>
      <HtmlLangSync locale={locale} />
      <SkipLink label={dictionary.skipLink} />
      <SiteHeader locale={locale} dictionary={dictionary} initialTheme={initialTheme} navigation={navigation} />
      <main id="content" style={{ padding: "var(--space-xl) var(--space-lg)" }}>
        {children}
      </main>
      <footer className="site-footer"><span>{dictionary.brand}</span><nav aria-label={dictionary.public.footer}>
        {navigation.filter((item) => item.slot === "footer").map((item) => <Link key={item.id} href={item.href}>{item.label}</Link>)}
      </nav></footer>
    </>
  );
}
