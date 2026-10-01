import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/i18n/locales";
import { hasAnyPermission } from "@/lib/identity";
import { privateIdentity } from "@/lib/identity-page";

export default async function StaffIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { db, session } = await privateIdentity(locale);
  try {
    for (const [section, permission] of [
      ["users", "users.read"], ["roles", "roles.read"], ["audit", "audit.read"],
      ["content/pages", "pages.read"], ["content/media", "media.read"],
      ["crm/leads", "inquiries.read"], ["settings/site", "settings.site"],
    ]) {
      if (await hasAnyPermission(db, session.userId, permission)) redirect(`/${locale}/staff/${section}`);
    }
    redirect(`/${locale}/forbidden`);
  } finally { await db.end(); }
}
