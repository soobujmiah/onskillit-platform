import { cookies } from "next/headers";
import { isLocale } from "@/i18n/locales";
import { getSiteDictionary } from "@/lib/site-text";

export default async function NotFound() {
  const raw = (await cookies()).get("NEXT_LOCALE")?.value ?? "en";
  const t = (await getSiteDictionary(isLocale(raw) ? raw : "en")).public;
  return <main><h1>{t.notFoundTitle}</h1><p>{t.notFoundText}</p></main>;
}
