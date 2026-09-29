import type { Metadata } from "next";
import type { Locale } from "@/i18n/locales";
import type { PublicPage } from "@/lib/public-content";
import { indexingEnabled } from "@/lib/public-content";

function siteUrl(): URL | null {
  try {
    const url = new URL(process.env.PUBLIC_SITE_URL ?? "");
    return url.protocol === "https:" ? url : null;
  } catch { return null; }
}

export async function publicMetadata(page: PublicPage | null, locale: Locale, path: string, alternatePath?: string): Promise<Metadata> {
  if (!page) return { title: "OnSkillIT", robots: { index: false, follow: false } };
  const c = page.content;
  const base = siteUrl();
  const index = !!base && await indexingEnabled();
  const canonical = base ? new URL(path, base).toString() : undefined;
  const other = locale === "en" ? "bn" : "en";
  const alternate = alternatePath ?? path.replace(`/${locale}/`, `/${other}/`).replace(new RegExp(`^/${locale}$`), `/${other}`);
  return {
    title: c.seoTitle,
    description: c.seoDescription,
    robots: { index, follow: index },
    ...(index && canonical ? {
      alternates: { canonical, languages: { [locale]: canonical, [other]: new URL(alternate, base).toString() } },
      openGraph: { title: c.seoTitle, description: c.seoDescription, url: canonical, locale },
    } : {}),
  };
}
