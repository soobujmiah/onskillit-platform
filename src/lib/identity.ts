import "server-only";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";
import type { NextRequest } from "next/server";
import { createDbClient, getDatabaseUrl } from "@/db/client";

export const SESSION_COOKIE = "onskillit_session";
export const CSRF_COOKIE = "onskillit_csrf";
export type Db = ReturnType<typeof createDbClient>;

export function database(): Db {
  const url = getDatabaseUrl();
  if (!url) throw new Error("Identity database is not configured");
  return createDbClient(url);
}

export function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function secret(): string {
  return randomBytes(32).toString("base64url");
}

export function normalizeContact(value: string): { kind: "email" | "mobile"; normalized: string } | null {
  const input = value.trim();
  if (input.includes("@")) {
    const normalized = input.toLowerCase();
    if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return null;
    return { kind: "email", normalized };
  }
  if (!/^\+[1-9]\d{7,14}$/.test(input)) return null;
  return { kind: "mobile", normalized: input };
}

export function validPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 12 && value.length <= 128;
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try { return await argon2.verify(hash, password); } catch { return false; }
}

export async function limited(db: Db, category: string, identity: string, maximum: number, seconds: number): Promise<boolean> {
  const key = digest(`${category}:${identity}`);
  const rows = await db`
    INSERT INTO identity_rate_limit(key_hash,count,window_start) VALUES (${key},1,now())
    ON CONFLICT (key_hash) DO UPDATE SET
      count = CASE WHEN identity_rate_limit.window_start < now() - ${seconds} * interval '1 second'
        THEN 1 ELSE identity_rate_limit.count + 1 END,
      window_start = CASE WHEN identity_rate_limit.window_start < now() - ${seconds} * interval '1 second'
        THEN now() ELSE identity_rate_limit.window_start END
    RETURNING count`;
  return Number(rows[0].count) <= maximum;
}

export type Session = { userId: string; sessionId: string; staff: boolean; csrfHash: string };

export async function readSession(db: Db, request: NextRequest): Promise<Session | null> {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  return readSessionToken(db, raw);
}

export async function readSessionToken(db: Db, raw: string | undefined): Promise<Session | null> {
  if (!raw || raw.length > 128) return null;
  const rows = await db`
    SELECT s.id, s.user_id, s.staff, s.csrf_hash FROM identity_session s
    JOIN identity_user u ON u.id=s.user_id
    WHERE s.token_hash=${digest(raw)} AND s.revoked_at IS NULL AND s.expires_at>now()
      AND u.status='active'
      AND s.last_seen_at > now() - (CASE WHEN s.staff THEN interval '30 minutes' ELSE interval '12 hours' END)
    LIMIT 1`;
  if (!rows.length) return null;
  await db`UPDATE identity_session SET last_seen_at=now() WHERE id=${rows[0].id}`;
  return { userId: rows[0].user_id, sessionId: rows[0].id, staff: rows[0].staff, csrfHash: rows[0].csrf_hash };
}

export function validCsrf(request: NextRequest, session: Session): boolean {
  const fromHeader = request.headers.get("x-csrf-token");
  const fromCookie = request.cookies.get(CSRF_COOKIE)?.value;
  if (!fromHeader || !fromCookie || fromHeader !== fromCookie) return false;
  const actual = Buffer.from(digest(fromHeader), "hex");
  const expected = Buffer.from(session.csrfHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const configured = process.env.PUBLIC_BASE_URL;
  if (!origin || !configured) return false;
  try { return new URL(origin).origin === new URL(configured).origin; } catch { return false; }
}

export async function hasPermission(db: Db, userId: string, permission: string, scopeType = "global", scopeId = "*"): Promise<boolean> {
  const rows = await db`
    SELECT 1 FROM identity_assignment a
    JOIN identity_role_permission rp ON rp.role_id=a.role_id
    WHERE a.user_id=${userId} AND a.revoked_at IS NULL AND rp.permission_id=${permission}
      AND ((a.scope_type='global' AND a.scope_id='*') OR (a.scope_type=${scopeType} AND a.scope_id=${scopeId}))
    LIMIT 1`;
  return rows.length > 0;
}

export async function hasAnyPermission(db: Db, userId: string, permission: string): Promise<boolean> {
  const rows = await db`SELECT 1 FROM identity_assignment a
    JOIN identity_role_permission rp ON rp.role_id=a.role_id
    WHERE a.user_id=${userId} AND a.revoked_at IS NULL AND rp.permission_id=${permission} LIMIT 1`;
  return rows.length > 0;
}

export async function writeAudit(db: Db, input: {
  actor?: string; operator?: string; target?: string; action: string;
  outcome: "success" | "denied" | "failure"; reason?: string; requestId?: string;
  metadata?: Record<string, string>;
}) {
  await db`INSERT INTO identity_audit(actor_user_id,operator_identity,target_user_id,action,outcome,reason,request_id,metadata)
    VALUES (${input.actor ?? null},${input.operator ?? null},${input.target ?? null},${input.action},
      ${input.outcome},${input.reason ?? null},${input.requestId ?? randomUUID()},${db.json(input.metadata ?? {})})`;
}
