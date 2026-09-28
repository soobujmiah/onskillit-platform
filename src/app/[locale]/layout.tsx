import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/i18n/locales";
import { getDictionary } from "@/i18n/get-dictionary";
import { SkipLink } from "@/components/shell/SkipLink";
import { SiteHeader } from "@/components/shell/SiteHeader";

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

  return (
    <>
      <SkipLink label={dictionary.skipLink} />
      <SiteHeader locale={locale} dictionary={dictionary} initialTheme={initialTheme} />
      <main id="content" style={{ padding: "var(--space-xl) var(--space-lg)" }}>
        {children}
      </main>
    </>
  );
}
