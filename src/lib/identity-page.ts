import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database, readSessionToken, SESSION_COOKIE } from "@/lib/identity";
import type { Locale } from "@/i18n/locales";

export async function privateIdentity(locale: Locale) {
  const db = database();
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await readSessionToken(db, raw);
  if (!session) {
    await db.end();
    redirect(`/${locale}/account/sign-in`);
  }
  return { db, session };
}
