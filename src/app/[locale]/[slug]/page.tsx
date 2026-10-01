import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicContent, UnpublishedPage } from "@/components/public/PublicContent";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { publishedPage } from "@/lib/public-content";
import { publicMetadata } from "@/lib/public-seo";
import { ContactForm } from "@/components/public/ContactForm";
import { ContactDetails } from "@/components/public/ContactDetails";

const keys = ["about", "team", "contact", "faq", "privacy", "terms", "accessibility"] as const;
type Key = typeof keys[number];
function isKey(value: string): value is Key { return keys.includes(value as Key); }
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isKey(slug)) return { robots: { index: false } };
  return publicMetadata(await publishedPage(slug, locale), locale, `/${locale}/${slug}`);
}

export default async function PublicStaticPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isKey(slug)) notFound();
  const [page, privacy] = await Promise.all([publishedPage(slug, locale), slug === "contact" ? publishedPage("privacy", locale) : Promise.resolve(null)]);
  const t = getDictionary(locale).public;
  return <>
    {page ? <PublicContent page={page} locale={locale} /> : <UnpublishedPage title={t[slug]} message={t.unpublished} locale={locale} />}
    {slug === "contact" && <ContactDetails labels={t} />}
    {slug === "contact" && page && (privacy && (process.env.INQUIRY_RATE_SECRET?.length ?? 0) >= 32
      ? <ContactForm locale={locale} consentVersion={privacy.revisionId} copy={{ ...t, privacy: t.privacy }} />
      : <p className="public-empty-note">{t.unavailable}</p>)}
  </>;
}
