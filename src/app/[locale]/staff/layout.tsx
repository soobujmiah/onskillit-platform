import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { hasAnyPermission } from "@/lib/identity";
import { privateIdentity } from "@/lib/identity-page";

export default async function StaffLayout({ children, params }: {
  children: React.ReactNode; params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { db, session } = await privateIdentity(locale);
  try {
    const t = getDictionary(locale).identity;
    const links = [
      { path: "users", label: t.users, permission: "users.read" },
      { path: "roles", label: t.roles, permission: "roles.read" },
      { path: "audit", label: t.audit, permission: "audit.read" },
      { path: "content/pages", label: getDictionary(locale).cms.pages, permission: "pages.read" },
      { path: "content/navigation", label: getDictionary(locale).cms.navigation, permission: "pages.read" },
      { path: "content/media", label: getDictionary(locale).cms.media, permission: "media.read" },
      { path: "content/seo", label: getDictionary(locale).cms.seo, permission: "pages.read" },
      { path: "settings/site", label: getDictionary(locale).cms.siteSettings, permission: "settings.site" },
    ];
    const allowed = [];
    for (const link of links) if (await hasAnyPermission(db, session.userId, link.permission)) allowed.push(link);
    return <div className="staff-shell"><nav aria-label={t.roles} className="staff-nav">
      {allowed.map((link) => <Link key={link.path} href={`/${locale}/staff/${link.path}`}>{link.label}</Link>)}
    </nav>{children}</div>;
  } finally { await db.end(); }
}
