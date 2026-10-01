import "server-only";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";
import { hasPermission } from "@/lib/identity";
import { privateIdentity } from "@/lib/identity-page";
import { CmsWorkspace } from "@/components/cms/CmsWorkspace";
import { UUID } from "@/lib/cms";

export async function cmsPage(locale: string, section: "pages"|"editor"|"navigation"|"media"|"seo"|"settings", id?: string) {
  if (!isLocale(locale) || (id && !UUID.test(id))) notFound();
  const {db,session}=await privateIdentity(locale);
  try {
    const permission=section==="media"?"media.read":section==="settings"?"settings.site":"pages.read";
    if (!await hasPermission(db,session.userId,permission)) redirect(`/${locale}/forbidden`);
    const t=getDictionary(locale).cms;
    const title=section==="editor"?t.editor:section==="settings"?t.siteSettings:t[section];
    return <CmsWorkspace key={`${section}:${id ?? ""}`} locale={locale} section={section} id={id} t={t} title={title}/>;
  } finally { await db.end(); }
}
