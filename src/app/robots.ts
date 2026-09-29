import type { MetadataRoute } from "next";
import { indexingEnabled } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let base: URL | null = null;
  try { const url = new URL(process.env.PUBLIC_SITE_URL ?? ""); if (url.protocol === "https:") base = url; }
  catch { /* No public host has been approved. */ }
  if (!base || !await indexingEnabled()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/en/staff/", "/bn/staff/", "/en/account/", "/bn/account/", "/en/learn/", "/bn/learn/"] },
    sitemap: new URL("/sitemap.xml", base).toString(),
  };
}
