import "server-only";
import { cache } from "react";
import { createDbClient, getDatabaseUrl } from "@/db/client";
import { settingValid } from "@/lib/cms";
import type { Locale } from "@/i18n/locales";
import { getSiteDictionary } from "@/lib/site-text";

/**
 * Built-in defaults for the owner-confirmed public contact details (PHASE-05-CONTENT-DRAFT, confirmed 2026-09-30).
 * Any CMS site setting with a value replaces the matching default; clearing a setting restores it.
 */
export const CONTACT_DEFAULTS = {
  contact_email: "onskillitbd@gmail.com",
  contact_phone: "+8801617301184",
  contact_whatsapp: "8801617301184",
  contact_address_en: "40/1 Kalicharan Shaha Road, Gandaria, Dhaka-1204, Bangladesh",
  facebook_url: "https://www.facebook.com/onskillit",
  youtube_url: "https://www.youtube.com/@onskillit",
} as const;

export const siteSettings = cache(async (): Promise<Record<string, string>> => {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return {};
  const db = createDbClient(databaseUrl);
  try {
    const rows = await db<{ key: string; value: string }[]>`SELECT key,value FROM cms_setting`;
    return Object.fromEntries(rows.filter((row) => row.value !== "" && settingValid(row.key, row.value)).map((row) => [row.key, row.value]));
  } catch { return {}; } finally { await db.end(); }
});

export type SiteChrome = { brand: string | null; footer: string; logoId: string | null; logoAlt: string | null };

/** Brand name, footer line and logo for the shared header and footer; null/empty parts fall back to built-ins. */
export async function siteChrome(locale: Locale): Promise<SiteChrome> {
  const settings = await siteSettings();
  const footerTemplate = settings[`footer_text_${locale}`] ?? "© {year} OnSkillIT";
  const chrome: SiteChrome = { brand: settings[`site_name_${locale}`] ?? null,
    footer: footerTemplate.replaceAll("{year}", String(new Date().getFullYear())).replaceAll("{বছর}", String(new Date().getFullYear())), logoId: null, logoAlt: null };
  const logo = settings.site_logo_media_id;
  const databaseUrl = getDatabaseUrl();
  if (logo && databaseUrl) {
    const db = createDbClient(databaseUrl);
    try {
      const rows = await db<{ alt: string }[]>`SELECT ${db(locale === "en" ? "alt_en" : "alt_bn")} AS alt FROM cms_media
        WHERE id=${logo} AND public=true AND mime_type IN ('image/png','image/jpeg','image/webp') LIMIT 1`;
      if (rows[0]?.alt?.trim()) { chrome.logoId = logo; chrome.logoAlt = rows[0].alt; }
    } catch { /* fall back to the text brand */ } finally { await db.end(); }
  }
  return chrome;
}

/** Public brand name: the CMS site name for the language, else the (possibly CMS-overridden) dictionary brand. */
export async function brandName(locale: Locale): Promise<string> {
  const settings = await siteSettings();
  return settings[`site_name_${locale}`] ?? (await getSiteDictionary(locale)).brand;
}
