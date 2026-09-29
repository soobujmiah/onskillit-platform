import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { privateIdentity } from "@/lib/identity-page";
import { LogoutButton } from "@/components/identity/LogoutButton";

export const metadata = { robots: { index: false, follow: false } };
export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { db, session } = await privateIdentity(locale);
  try {
    const contacts = await db`SELECT kind,normalized,verified_at FROM identity_contact WHERE user_id=${session.userId} ORDER BY kind`;
    const t = getDictionary(locale).identity;
    return <section className="identity-panel"><h1>{t.profile}</h1>
      <ul>{contacts.map((contact) => <li key={contact.normalized}>
        {contact.normalized} — {contact.verified_at ? t.contactVerified : t.contactUnverified}
      </li>)}</ul>
      <LogoutButton label={t.logout} locale={locale} />
    </section>;
  } finally { await db.end(); }
}
