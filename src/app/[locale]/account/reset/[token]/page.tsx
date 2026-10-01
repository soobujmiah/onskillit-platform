import { notFound } from "next/navigation";
import { IdentityForm } from "@/components/identity/IdentityForm";
import Link from "next/link";
import { getSiteDictionary } from "@/lib/site-text";
import { isLocale } from "@/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const t = (await getSiteDictionary(locale)).identity;
  return { title: token.startsWith("v_") ? t.verify : t.reset, robots: { index: false, follow: false } };
}
export default async function ResetPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale) || !/^[vr]_[\w-]{40,128}$/.test(token)) notFound();
  const dictionary = (await getSiteDictionary(locale));
  const verify = token.startsWith("v_");
  return <section className="identity-panel"><h1>{verify ? dictionary.identity.verify : dictionary.identity.reset}</h1>
    {verify && <p>{dictionary.identity.verifySignInNote} <Link href={`/${locale}/account/sign-in`}>{dictionary.identity.signIn}</Link></p>}
    <IdentityForm mode={verify ? "verify" : "reset"} locale={locale} dictionary={dictionary} token={token} /></section>;
}
