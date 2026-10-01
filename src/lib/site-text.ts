import "server-only";
import { cache } from "react";
import en from "@/i18n/dictionaries/en.json";
import bn from "@/i18n/dictionaries/bn.json";
import { createDbClient, getDatabaseUrl } from "@/db/client";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { localeProse } from "@/lib/cms";
import type { Locale } from "@/i18n/locales";

/**
 * Visitor-facing text that staff may override through the CMS (ADR 0013): the brand, skip link, theme and language
 * controls, public pages and the account pages. Staff-only screens (CMS, users, roles, audit, inquiries) are not
 * part of the public website and keep their built-in text.
 */
export const EDITABLE_GROUPS = ["brand", "skipLink", "theme", "language", "public", "identity"] as const;
/** The language switcher label is deliberately the other language's name, so either script is allowed there. */
const MIXED_SCRIPT_KEYS = new Set(["language.switchTo"]);
const dictionaries = { en, bn } as const;

function leaves(value: unknown, prefix: string[], out: Record<string, string>) {
  if (typeof value === "string") out[prefix.join(".")] = value;
  else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) leaves(child, [...prefix, key], out);
}
function editableLeaves(locale: Locale): Record<string, string> {
  const out: Record<string, string> = {};
  for (const group of EDITABLE_GROUPS) leaves((dictionaries[locale] as Record<string, unknown>)[group], [group], out);
  return out;
}
export function editableKeys(): string[] { return Object.keys(editableLeaves("en")); }
export function defaultTexts(locale: Locale): Record<string, string> { return editableLeaves(locale); }

export function textValid(locale: Locale, key: string, value: string): boolean {
  if (!(key in editableLeaves("en")) || typeof value !== "string") return false;
  if (!value.trim() || value.length > 600 || /[\u0000-\u001f]/.test(value)) return false;
  return MIXED_SCRIPT_KEYS.has(key) || localeProse(value, locale);
}

export const textOverrides = cache(async (locale: Locale): Promise<Record<string, string>> => {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return {};
  const db = createDbClient(databaseUrl);
  try {
    const rows = await db<{ key: string; value: string }[]>`SELECT key,value FROM cms_text WHERE locale=${locale}`;
    return Object.fromEntries(rows.filter((row) => textValid(locale, row.key, row.value)).map((row) => [row.key, row.value]));
  } catch { return {}; } finally { await db.end(); }
});

/** The built-in dictionary with CMS overrides applied to the visitor-facing groups. Falls back to defaults on any failure. */
export async function getSiteDictionary(locale: Locale): Promise<Dictionary> {
  const overrides = await textOverrides(locale);
  const keys = Object.keys(overrides);
  if (!keys.length) return getDictionary(locale);
  const copy = structuredClone(getDictionary(locale)) as Record<string, unknown>;
  for (const key of keys) {
    const path = key.split(".");
    let node: unknown = copy;
    for (const part of path.slice(0, -1)) node = node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined;
    const last = path[path.length - 1];
    if (node && typeof node === "object" && typeof (node as Record<string, unknown>)[last] === "string") (node as Record<string, unknown>)[last] = overrides[key];
  }
  return copy as Dictionary;
}
