import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/i18n/locales";
import { hasPermission } from "@/lib/identity";
import { privateIdentity } from "@/lib/identity-page";

export default async function StaffIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { db, session } = await privateIdentity(locale);
  try {
    for (const [section, permission] of [["users", "users.read"], ["roles", "roles.read"], ["audit", "audit.read"]]) {
      if (await hasPermission(db, session.userId, permission)) redirect(`/${locale}/staff/${section}`);
    }
    redirect(`/${locale}/forbidden`);
  } finally { await db.end(); }
}
