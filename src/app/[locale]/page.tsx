import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, type Locale } from "@/i18n/locales";
import { notFound } from "next/navigation";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);

  return (
    <div style={{ maxWidth: "68ch", fontFamily: locale === "bn" ? "var(--font-bn)" : "var(--font-en)" }}>
      <h1 style={{ margin: 0, fontSize: "40px", lineHeight: 1.15, color: "var(--text-primary)" }}>
        {dictionary.placeholder.heading}
      </h1>
      <p style={{ fontSize: "16px", lineHeight: 1.6, color: "var(--text-secondary)" }}>
        {dictionary.placeholder.body}
      </p>
    </div>
  );
}
