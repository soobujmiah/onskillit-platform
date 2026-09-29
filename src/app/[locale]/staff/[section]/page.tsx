import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { hasPermission } from "@/lib/identity";
import { privateIdentity } from "@/lib/identity-page";

export const metadata = { robots: { index: false, follow: false } };
const permissions = { users: "users.read", roles: "roles.read", audit: "audit.read" } as const;

export default async function StaffPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !(section in permissions)) notFound();
  const { db, session } = await privateIdentity(locale);
  try {
    const permission = permissions[section as keyof typeof permissions];
    if (!await hasPermission(db, session.userId, permission)) redirect(`/${locale}/forbidden`);
    const t = getDictionary(locale).identity;
    const title = section === "users" ? t.users : section === "roles" ? t.roles : t.audit;
    const rows = section === "users"
      ? await db`SELECT u.id,u.status,c.kind,c.normalized FROM identity_user u JOIN identity_contact c ON c.user_id=u.id ORDER BY u.created_at DESC LIMIT 50`
      : section === "roles"
        ? await db`SELECT id,label FROM identity_role ORDER BY id`
        : await db`SELECT action,outcome,created_at FROM identity_audit ORDER BY created_at DESC LIMIT 50`;
    return <section className="identity-panel"><h1>{title}</h1>
      {rows.length ? <ul>{rows.map((row, index) => <li key={index} className="identity-record">
        {section === "users" ? <>{row.normalized} ({row.status})</> : section === "roles" ? row.label : <>{row.action} — {row.outcome}</>}
      </li>)}</ul> : <p>{t.empty}</p>}
    </section>;
  } finally { await db.end(); }
}
