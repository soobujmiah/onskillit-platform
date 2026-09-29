import Link from "next/link";
import { notFound } from "next/navigation";
import { IdentityForm } from "@/components/identity/IdentityForm";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; mode: string }> }) {
  const { locale, mode } = await params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const t = getDictionary(locale).identity;
  return { title: mode === "sign-in" ? t.signIn : mode === "register" ? t.register : t.recovery,
    robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string; mode: string }> }) {
  const { locale, mode } = await params;
  if (!isLocale(locale) || !["sign-in", "register", "recovery"].includes(mode)) notFound();
  const dictionary = getDictionary(locale);
  const t = dictionary.identity;
  const heading = mode === "sign-in" ? t.signIn : mode === "register" ? t.register : t.recovery;
  return <section className="identity-panel"><h1>{heading}</h1>
    <IdentityForm mode={mode as "sign-in" | "register" | "recovery"} locale={locale} dictionary={dictionary} />
    <nav className="identity-links" aria-label={heading}>
      <Link href={`/${locale}/account/sign-in`}>{t.signIn}</Link>
      <Link href={`/${locale}/account/register`}>{t.register}</Link>
      <Link href={`/${locale}/account/recovery`}>{t.recovery}</Link>
    </nav>
  </section>;
}
