import "server-only";
import type { Locale } from "@/i18n/locales";
import en from "@/i18n/dictionaries/en.json";
import bn from "@/i18n/dictionaries/bn.json";

const dictionaries = { en, bn } as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
