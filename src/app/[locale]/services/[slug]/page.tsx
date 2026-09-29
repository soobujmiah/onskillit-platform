import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicContent } from "@/components/public/PublicContent";
import { isLocale } from "@/i18n/locales";
import { publishedServiceBySlug } from "@/lib/public-content";
import { publicMetadata } from "@/lib/public-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return { robots: { index: false } };
  const page = await publishedServiceBySlug(slug, locale);
  return publicMetadata(page, locale, `/${locale}/services/${slug}`, page ? `/${locale === "en" ? "bn" : "en"}/services/${page.otherSlug}` : undefined);
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const page = await publishedServiceBySlug(slug, locale);
  if (!page) notFound();
  return <PublicContent page={page} locale={locale} />;
}
