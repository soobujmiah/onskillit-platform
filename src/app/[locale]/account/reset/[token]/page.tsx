import { notFound } from "next/navigation";
import { IdentityForm } from "@/components/identity/IdentityForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";

export const metadata = { robots: { index: false, follow: false } };
export default async function ResetPage({ params, searchParams }: { params: Promise<{ locale: string; token: string }>; searchParams: Promise<{ purpose?: string }> }) {
  const { locale, token } = await params;
  const { purpose } = await searchParams;
  if (!isLocale(locale) || !/^[\w-]{40,128}$/.test(token)) notFound();
  const dictionary = getDictionary(locale);
  const verify = purpose === "verify";
  return <section className="identity-panel"><h1>{verify ? dictionary.identity.verify : dictionary.identity.reset}</h1>
    <IdentityForm mode={verify ? "verify" : "reset"} locale={locale} dictionary={dictionary} token={token} /></section>;
}
