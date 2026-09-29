import "server-only";
import { createDbClient, getDatabaseUrl } from "@/db/client";
import { content, type LocaleContent } from "@/lib/cms";
import type { Locale } from "@/i18n/locales";
import { publicPath } from "@/lib/public-routes";

export type PublicPage = {
  key: string;
  revisionId: string;
  kind: "page" | "landing" | "service";
  content: LocaleContent;
  otherSlug: string;
  category?: string;
};

type PageRow = { page_key: string; kind: string; revision_id: string; en: unknown; bn: unknown; category: string | null };
const allowedKinds = new Set(["page", "landing", "service"]);

function record(row: PageRow, locale: Locale): PublicPage | null {
  const translated = locale === "en" ? row.en : row.bn;
  const other = locale === "en" ? row.bn : row.en;
  if (!allowedKinds.has(row.kind) || !content(translated, true, locale) || !content(other, true, locale === "en" ? "bn" : "en")) return null;
  return {
    key: row.page_key,
    revisionId: row.revision_id,
    kind: row.kind as PublicPage["kind"],
    content: translated,
    otherSlug: other.slug,
    ...(row.category ? { category: row.category } : {}),
  };
}

export async function publishedPage(key: string, locale: Locale): Promise<PublicPage | null> {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  const db = createDbClient(databaseUrl);
  try {
    const rows = await db<PageRow[]>`SELECT p.page_key,p.kind,r.id AS revision_id,r.en,r.bn,s.category
      FROM cms_page p JOIN cms_revision r ON r.id=p.published_revision_id
      LEFT JOIN catalog_service s ON s.page_id=p.id
      WHERE p.page_key=${key} AND p.state='published' LIMIT 1`;
    return rows[0] ? record(rows[0], locale) : null;
  } finally {
    await db.end();
  }
}

export async function publishedServices(locale: Locale): Promise<PublicPage[]> {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];
  const db = createDbClient(databaseUrl);
  try {
    const rows = await db<PageRow[]>`SELECT p.page_key,p.kind,r.id AS revision_id,r.en,r.bn,s.category
      FROM catalog_service s JOIN cms_page p ON p.id=s.page_id
      JOIN cms_revision r ON r.id=p.published_revision_id
      WHERE p.kind='service' AND p.state='published' ORDER BY s.category,p.page_key`;
    return rows.map((row) => record(row, locale)).filter((item): item is PublicPage => item !== null);
  } finally {
    await db.end();
  }
}

export async function publishedServiceBySlug(slug: string, locale: Locale): Promise<PublicPage | null> {
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug)) return null;
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return null;
  const db = createDbClient(databaseUrl);
  try {
    const rows = locale === "en"
      ? await db<PageRow[]>`SELECT p.page_key,p.kind,r.id AS revision_id,r.en,r.bn,s.category
          FROM catalog_service s JOIN cms_page p ON p.id=s.page_id
          JOIN cms_revision r ON r.id=p.published_revision_id
          WHERE p.kind='service' AND p.state='published' AND r.en->>'slug'=${slug} LIMIT 1`
      : await db<PageRow[]>`SELECT p.page_key,p.kind,r.id AS revision_id,r.en,r.bn,s.category
          FROM catalog_service s JOIN cms_page p ON p.id=s.page_id
          JOIN cms_revision r ON r.id=p.published_revision_id
          WHERE p.kind='service' AND p.state='published' AND r.bn->>'slug'=${slug} LIMIT 1`;
    return rows[0] ? record(rows[0], locale) : null;
  } finally {
    await db.end();
  }
}

export async function indexingEnabled(): Promise<boolean> {
  if (process.env.PUBLIC_INDEXING_ENABLED !== "true") return false;
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return false;
  const db = createDbClient(databaseUrl);
  try {
    const rows = await db<{ value: string }[]>`SELECT value FROM cms_setting WHERE key='robots_enabled' LIMIT 1`;
    return rows[0]?.value === "true";
  } finally {
    await db.end();
  }
}

export type PublicNavItem = { id: string; label: string; href: string; slot: "header" | "footer" };

export async function publishedNavigation(locale: Locale): Promise<PublicNavItem[]> {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];
  const db = createDbClient(databaseUrl);
  try {
    const rows = await db<(PageRow & { id: string; slot: string; label_en: string; label_bn: string })[]>`
      SELECT n.id,n.slot,n.label_en,n.label_bn,p.page_key,p.kind,r.id AS revision_id,r.en,r.bn,s.category
      FROM cms_navigation n JOIN cms_page p ON p.id=n.page_id
      JOIN cms_revision r ON r.id=p.published_revision_id
      LEFT JOIN catalog_service s ON s.page_id=p.id
      WHERE p.state='published' ORDER BY n.slot,n.position`;
    return rows.flatMap((row) => {
      const page = record(row, locale);
      const href = page && publicPath(page, locale);
      if (!href || (row.slot !== "header" && row.slot !== "footer")) return [];
      return [{ id: row.id, label: locale === "en" ? row.label_en : row.label_bn, href,
        slot: row.slot as "header" | "footer" }];
    });
  } finally { await db.end(); }
}
