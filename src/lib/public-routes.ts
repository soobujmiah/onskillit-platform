import type { Locale } from "@/i18n/locales";
import type { PublicPage } from "@/lib/public-content";

export const staticPagePaths = {
  home: "",
  services: "services",
  about: "about",
  contact: "contact",
  faq: "faq",
  privacy: "privacy",
  terms: "terms",
  accessibility: "accessibility",
} as const;

export type StaticPageKey = keyof typeof staticPagePaths;

export function publicPath(page: PublicPage, locale: Locale): string | null {
  if (page.kind === "service") return `/${locale}/services/${page.content.slug}`;
  if (page.key in staticPagePaths) return `/${locale}/${staticPagePaths[page.key as StaticPageKey]}`.replace(/\/$/, "");
  return null;
}
