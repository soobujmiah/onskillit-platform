import type { MetadataRoute } from "next";
import { publishedPage, publishedServices, indexingEnabled } from "@/lib/public-content";
import { staticPagePaths } from "@/lib/public-routes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!await indexingEnabled()) return [];
  let base: URL;
  try {
    base = new URL(process.env.PUBLIC_SITE_URL ?? "");
    if (base.protocol !== "https:") return [];
  } catch { return []; }
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of ["en", "bn"] as const) {
    for (const [key, suffix] of Object.entries(staticPagePaths)) {
      if (!await publishedPage(key, locale)) continue;
      entries.push({ url: new URL(`/${locale}${suffix ? `/${suffix}` : ""}`, base).toString() });
    }
    for (const service of await publishedServices(locale)) {
      entries.push({ url: new URL(`/${locale}/services/${service.content.slug}`, base).toString() });
    }
  }
  return entries;
}
