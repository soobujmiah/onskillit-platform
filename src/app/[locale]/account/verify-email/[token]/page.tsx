import { notFound } from "next/navigation";
import { IdentityForm } from "@/components/identity/IdentityForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";

export const metadata = { robots: { index: false, follow: false } };
export default async function VerifyPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale) || !/^[\w-]{40,128}$/.test(token)) notFound();
  const dictionary = getDictionary(locale);
  return <section className="identity-panel"><h1>{dictionary.identity.verify}</h1>
    <IdentityForm mode="verify" locale={locale} dictionary={dictionary} token={token} /></section>;
}
