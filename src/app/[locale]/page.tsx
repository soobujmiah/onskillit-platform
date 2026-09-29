import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { publishedPage } from "@/lib/public-content";
import { publicMetadata } from "@/lib/public-seo";
import { PublicContent, UnpublishedPage } from "@/components/public/PublicContent";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { robots: { index: false } };
  return publicMetadata(await publishedPage("home", locale), locale, `/${locale}`);
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const page = await publishedPage("home", locale);
  const t = getDictionary(locale).public;
  return page ? <PublicContent page={page} locale={locale} /> : <UnpublishedPage title={t.home} message={t.unpublished} />;
}
