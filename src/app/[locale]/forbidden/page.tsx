import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";

export const metadata = { robots: { index: false, follow: false } };
export default async function ForbiddenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <section className="identity-panel"><h1>{getDictionary(locale).identity.forbidden}</h1></section>;
}
