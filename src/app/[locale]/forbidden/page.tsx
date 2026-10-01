import { notFound } from "next/navigation";
import { getSiteDictionary } from "@/lib/site-text";
import { isLocale } from "@/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: isLocale(locale) ? (await getSiteDictionary(locale)).identity.forbidden : undefined,
    robots: { index: false, follow: false } };
}
export default async function ForbiddenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <section className="identity-panel"><h1>{(await getSiteDictionary(locale)).identity.forbidden}</h1></section>;
}
