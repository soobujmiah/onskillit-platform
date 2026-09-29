import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createDbClient, getDatabaseUrl } from "@/db/client";
import { isLocale } from "@/i18n/locales";

export const runtime = "nodejs";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(code: string, status: number) {
  return NextResponse.json({ code }, { status, headers: { "Cache-Control": "no-store" } });
}

function text(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.length <= max;
}

async function limitedBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 10000) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  const databaseUrl = getDatabaseUrl();
  const secret = process.env.INQUIRY_RATE_SECRET;
  if (!databaseUrl || !secret || secret.length < 32) return fail("UNAVAILABLE", 503);
  const origin = request.headers.get("origin");
  if (origin) {
    try { if (new URL(origin).host !== request.nextUrl.host) return fail("FORBIDDEN", 403); }
    catch { return fail("FORBIDDEN", 403); }
  }
  const body = await limitedBody(request);
  if (!body) return fail("INVALID_REQUEST", 400);
  if (body.website) return fail("INVALID_REQUEST", 400);
  if (!text(body.name, 2, 120) || !text(body.email, 3, 254) || !emailPattern.test(body.email) ||
    !text(body.message, 10, 4000) || typeof body.locale !== "string" || !isLocale(body.locale) || body.consent !== true ||
    (body.phone !== undefined && body.phone !== "" && (typeof body.phone !== "string" || !/^\+?[0-9 ()-]{7,25}$/.test(body.phone))) ||
    !text(body.consentVersion, 36, 36) || !/^[0-9a-f-]{36}$/i.test(body.consentVersion) ||
    body.sourcePath !== `/${body.locale}/contact`) return fail("INVALID_REQUEST", 400);

  const email = body.email.trim().toLowerCase();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const digest = (value: string) => createHmac("sha256", secret).update(value).digest("hex");
  const db = createDbClient(databaseUrl);
  try {
    const keys = [
      { key: digest(`public-inquiry:ip:${ip}`), limit: 10, minutes: 60 },
      { key: digest(`public-inquiry:email:${email}`), limit: 5, minutes: 60 },
    ];
    const result = await db.begin(async (tx) => {
      for (const rule of keys) {
        const rows = await tx<{ count: number }[]>`INSERT INTO identity_rate_limit(key_hash,count,window_start)
          VALUES (${rule.key},1,now()) ON CONFLICT (key_hash) DO UPDATE SET
            count=CASE WHEN identity_rate_limit.window_start < now() - (${rule.minutes} * interval '1 minute')
              THEN 1 ELSE identity_rate_limit.count + 1 END,
            window_start=CASE WHEN identity_rate_limit.window_start < now() - (${rule.minutes} * interval '1 minute')
              THEN now() ELSE identity_rate_limit.window_start END RETURNING count`;
        if (Number(rows[0]?.count ?? 0) > rule.limit) return "RATE_LIMITED";
      }
      const privacy = await tx`SELECT p.published_revision_id FROM cms_page p
        WHERE p.page_key='privacy' AND p.state='published' AND p.published_revision_id=${body.consentVersion as string} LIMIT 1`;
      const contact = await tx`SELECT 1 FROM cms_page WHERE page_key='contact' AND state='published' LIMIT 1`;
      if (!privacy.length || !contact.length) return "UNAVAILABLE";
      await tx`INSERT INTO public_inquiry(name,email,phone,message,locale,consent_version,source_path)
        VALUES (${(body.name as string).trim()},${email},${typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null},${(body.message as string).trim()},${body.locale as string},
          ${body.consentVersion as string},${body.sourcePath as string})`;
      return "OK";
    });
    if (result === "RATE_LIMITED") return fail("RATE_LIMITED", 429);
    if (result !== "OK") return fail("UNAVAILABLE", 503);
    return NextResponse.json({ status: "received" }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } finally { await db.end(); }
}
