import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  CSRF_COOKIE, SESSION_COOKIE, database, digest, hasAnyPermission, hasPermission, hashPassword,
  limited, normalizeContact, readSession, sameOrigin, secret, validCsrf, validPassword,
  verifyPassword, writeAudit,
} from "@/lib/identity";
import { sendIdentityLink } from "@/lib/identity-mail";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/locales";

export const runtime = "nodejs";
const GENERIC_RECOVERY = { status: "accepted" };
type Body = Record<string, unknown>;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
function error(code: string, status: number) { return json({ code }, status); }
async function bodyOf(request: NextRequest): Promise<Body | null> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const raw = new TextDecoder().decode(Buffer.concat(chunks));
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value as Body : null;
  } catch { return null; }
}
function only(body: Body, fields: readonly string[]) {
  return Object.keys(body).every((key) => fields.includes(key));
}
function pathOf(params: { path: string[] }) { return params.path.join("/"); }
function cookiesOn(response: NextResponse, token: string, csrf: string, maxAge: number) {
  const secure = process.env.PUBLIC_BASE_URL?.startsWith("https://") ?? false;
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge });
  response.cookies.set(CSRF_COOKIE, csrf, { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge });
  return response;
}
function clearCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(CSRF_COOKIE);
  return response;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = pathOf(await params);
  if (path === "mobile-recovery") return error("RECOVERY_DISABLED", 404);
  const db = database();
  try {
    const session = await readSession(db, request);
    if (!session) return error("UNAUTHENTICATED", 401);
    if (path === "session") {
      return json({ user_id: session.userId, staff: session.staff });
    }
    if (path === "profile") {
      const rows = await db`SELECT u.id,u.status,c.kind,c.normalized,c.verified_at FROM identity_user u
        JOIN identity_contact c ON c.user_id=u.id WHERE u.id=${session.userId} ORDER BY c.kind`;
      return json({ user_id: session.userId, contacts: rows.map((row) => ({ kind: row.kind, value: row.normalized, verified: !!row.verified_at })) });
    }
    if (path === "users" && await hasAnyPermission(db, session.userId, "users.read")) {
      const rows = await db`SELECT u.id,u.status,u.created_at,c.kind,c.normalized,c.verified_at
        FROM identity_user u LEFT JOIN identity_contact c ON c.user_id=u.id
        WHERE EXISTS (SELECT 1 FROM identity_assignment a JOIN identity_role_permission rp ON rp.role_id=a.role_id
          WHERE a.user_id=${session.userId} AND a.revoked_at IS NULL AND rp.permission_id='users.read'
            AND ((a.scope_type='global' AND a.scope_id='*') OR (a.scope_type='resource' AND a.scope_id=u.id::text)))
        ORDER BY u.created_at DESC LIMIT 50`;
      return json({ users: rows });
    }
    if (path === "roles" && await hasPermission(db, session.userId, "roles.read")) {
      const rows = await db`SELECT id,label,privileged FROM identity_role ORDER BY id`;
      return json({ roles: rows });
    }
    if (path === "grant-requests" && await hasPermission(db, session.userId, "roles.manage")) {
      const rows = await db`SELECT id,requested_by,target_user_id,role_id,scope_type,scope_id,reason,requested_at
        FROM identity_grant_request WHERE status='pending' ORDER BY requested_at DESC LIMIT 50`;
      return json({ requests: rows });
    }
    if (path === "audit" && await hasPermission(db, session.userId, "audit.read")) {
      const rows = await db`SELECT id,actor_user_id,operator_identity,target_user_id,action,outcome,reason,request_id,created_at
        FROM identity_audit ORDER BY created_at DESC LIMIT 50`;
      return json({ events: rows });
    }
    return error("FORBIDDEN", 403);
  } finally { await db.end(); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = pathOf(await params);
  if (path === "mobile-recovery") return error("RECOVERY_DISABLED", 404);
  if (!sameOrigin(request)) return error("ORIGIN_REQUIRED", 403);
  const body = await bodyOf(request);
  if (!body) return error("INVALID_BODY", 400);
  const allowed: Record<string, string[]> = {
    registrations: ["contact", "secondary_contact", "password"], sessions: ["contact", "password"],
    "email-verification-requests": ["email"], "password-reset-requests": ["email"],
    "email-verifications": ["token"], "password-resets": ["token", "password"],
    logout: [], "change-password": ["current_password", "new_password"],
    "role-assignments": ["user_id", "role_id", "scope_type", "scope_id", "reason"],
    "grant-requests": ["user_id", "role_id", "scope_type", "scope_id", "reason"],
  };
  const fields = allowed[path] ?? (/^grant-requests\/[0-9a-f-]{36}\/approve$/.test(path) ? [] : null);
  if (fields && !only(body, fields)) return error("UNKNOWN_FIELD", 400);
  const db = database();
  const requestId = randomUUID();
  try {
    if (path === "registrations") {
      const contact = typeof body.contact === "string" ? normalizeContact(body.contact) : null;
      const secondary = typeof body.secondary_contact === "string" && body.secondary_contact.trim()
        ? normalizeContact(body.secondary_contact) : null;
      if (!contact || !validPassword(body.password) ||
          (body.secondary_contact !== undefined && body.secondary_contact !== "" && !secondary) ||
          (secondary && secondary.kind === contact.kind)) return error("INVALID_INPUT", 400);
      if (!await limited(db, "register", contact.normalized, 5, 3600)) return error("RATE_LIMITED", 429);
      const hash = await hashPassword(body.password);
      let userId: string;
      try {
        userId = await db.begin(async (tx) => {
          const users = await tx`INSERT INTO identity_user DEFAULT VALUES RETURNING id`;
          const id: string = users[0].id;
          await tx`INSERT INTO identity_contact(user_id,kind,normalized) VALUES (${id},${contact.kind},${contact.normalized})`;
          if (secondary) await tx`INSERT INTO identity_contact(user_id,kind,normalized)
            VALUES (${id},${secondary.kind},${secondary.normalized})`;
          await tx`INSERT INTO identity_password(user_id,password_hash) VALUES (${id},${hash})`;
          await tx`INSERT INTO identity_assignment(user_id,role_id,scope_type,scope_id) VALUES (${id},'member','global','*')`;
          await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,request_id)
            VALUES (${id},${id},'public.register','success',${requestId})`;
          return id;
        });
      } catch (cause) {
        if (typeof cause === "object" && cause && "code" in cause && cause.code === "23505") return error("CONTACT_IN_USE", 409);
        throw cause;
      }
      return json({ user_id: userId }, 201);
    }

    if (path === "sessions") {
      const contact = typeof body.contact === "string" ? normalizeContact(body.contact) : null;
      if (!contact || typeof body.password !== "string" || body.password.length > 128) return error("INVALID_INPUT", 400);
      if (!await limited(db, "login", contact.normalized, 10, 900)) return error("RATE_LIMITED", 429);
      const rows = await db`SELECT u.id,u.status,p.password_hash FROM identity_contact c
        JOIN identity_user u ON u.id=c.user_id JOIN identity_password p ON p.user_id=u.id
        WHERE c.kind=${contact.kind} AND c.normalized=${contact.normalized} LIMIT 1`;
      const hash = rows[0]?.password_hash ?? await hashPassword(secret());
      const okay = await verifyPassword(hash, body.password);
      if (!rows.length || !okay || rows[0].status !== "active") {
        await writeAudit(db, { action: "public.login", outcome: "failure", requestId });
        return error("INVALID_CREDENTIALS", 401);
      }
      const userId: string = rows[0].id;
      const issued = await db.begin(async (tx) => {
        const staffRows = await tx`SELECT 1 FROM identity_assignment a JOIN identity_role r ON r.id=a.role_id
          WHERE a.user_id=${userId} AND a.revoked_at IS NULL AND r.staff=true LIMIT 1`;
        const staff = staffRows.length > 0;
        const maxAge = staff ? 12 * 3600 : 30 * 24 * 3600;
        const token = secret();
        const csrf = secret();
        await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${userId} AND revoked_at IS NULL`;
        await tx`INSERT INTO identity_session(user_id,token_hash,csrf_hash,staff,expires_at)
          VALUES (${userId},${digest(token)},${digest(csrf)},${staff},now() + ${maxAge} * interval '1 second')`;
        await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,request_id)
          VALUES (${userId},${userId},'auth.login','success',${requestId})`;
        return { token, csrf, maxAge };
      });
      return cookiesOn(json({ user_id: userId }), issued.token, issued.csrf, issued.maxAge);
    }

    if (path === "email-verification-requests" || path === "password-reset-requests") {
      const contact = typeof body.email === "string" ? normalizeContact(body.email) : null;
      if (!contact || contact.kind !== "email") return json(GENERIC_RECOVERY, 202);
      if (!await limited(db, path, contact.normalized, 5, 3600)) return json(GENERIC_RECOVERY, 202);
      const rows = await db`SELECT c.id AS contact_id,c.user_id,c.verified_at FROM identity_contact c
        JOIN identity_user u ON u.id=c.user_id WHERE c.kind='email' AND c.normalized=${contact.normalized}
        AND u.status='active' LIMIT 1`;
      const row = rows[0];
      const verify = path === "email-verification-requests";
      let delivered = false;
      if (row && (verify ? !row.verified_at : !!row.verified_at)) {
        const token = `${verify ? "v" : "r"}_${secret()}`;
        const purpose = verify ? "verify_email" : "reset_password";
        const minutes = verify ? 60 : 15;
        const inserted = await db`INSERT INTO identity_token(user_id,contact_id,purpose,token_hash,expires_at)
          VALUES (${row.user_id},${row.contact_id},${purpose},${digest(token)},now()+${minutes}*interval '1 minute') RETURNING id`;
        try {
          const rawLocale = request.cookies.get("NEXT_LOCALE")?.value ?? "en";
          const locale = isLocale(rawLocale) ? rawLocale : "en";
          const copy = getDictionary(locale).identity;
          const sent = await sendIdentityLink(contact.normalized,
            `/${locale}/account/reset/${token}`,
            verify ? copy.emailVerifySubject : copy.emailResetSubject, copy.emailIgnore);
          delivered = sent;
          if (!sent) await db`DELETE FROM identity_token WHERE id=${inserted[0].id}`;
        } catch {
          await db`DELETE FROM identity_token WHERE id=${inserted[0].id}`;
        }
      }
      if (row) await writeAudit(db, { target: row.user_id, action: verify ? "public.email_verification_request" : "public.password_reset_request",
        outcome: delivered ? "success" : "denied", requestId });
      return json(GENERIC_RECOVERY, 202);
    }

    if (path === "email-verifications" || path === "password-resets") {
      if (typeof body.token !== "string" || body.token.length > 128) return error("INVALID_TOKEN", 400);
      const verify = path === "email-verifications";
      if (!verify && !validPassword(body.password)) return error("INVALID_INPUT", 400);
      const purpose = verify ? "verify_email" : "reset_password";
      const applied = await db.begin(async (tx) => {
        const rows = await tx`SELECT t.id,t.user_id,t.contact_id,c.verified_at,u.status FROM identity_token t
          JOIN identity_contact c ON c.id=t.contact_id JOIN identity_user u ON u.id=t.user_id
          WHERE t.token_hash=${digest(body.token as string)} AND t.purpose=${purpose}
            AND t.consumed_at IS NULL AND t.expires_at>now() FOR UPDATE OF t`;
        if (!rows.length || rows[0].status !== "active" || (!verify && !rows[0].verified_at)) return false;
        const row = rows[0];
        await tx`UPDATE identity_token SET consumed_at=now() WHERE id=${row.id}`;
        if (verify) {
          await tx`UPDATE identity_contact SET verified_at=now() WHERE id=${row.contact_id} AND verified_at IS NULL`;
          await tx`UPDATE identity_token SET consumed_at=now() WHERE contact_id=${row.contact_id}
            AND purpose='verify_email' AND consumed_at IS NULL`;
        }
        else {
          const hash = await hashPassword(body.password as string);
          await tx`UPDATE identity_password SET password_hash=${hash},changed_at=now() WHERE user_id=${row.user_id}`;
          await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${row.user_id} AND revoked_at IS NULL`;
          await tx`UPDATE identity_token SET consumed_at=now() WHERE user_id=${row.user_id}
            AND purpose='reset_password' AND consumed_at IS NULL`;
        }
        await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,request_id)
          VALUES (${row.user_id},${row.user_id},${verify ? "auth.email_verified" : "auth.password_reset"},'success',${requestId})`;
        return true;
      });
      return applied ? json({ status: "ok" }) : error("INVALID_TOKEN", 400);
    }

    const session = await readSession(db, request);
    if (!session) return error("UNAUTHENTICATED", 401);
    if (!validCsrf(request, session)) return error("CSRF_REJECTED", 403);
    if (path === "logout") {
      await db.begin(async (tx) => {
        await tx`UPDATE identity_session SET revoked_at=now() WHERE id=${session.sessionId}`;
        await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,request_id)
          VALUES (${session.userId},${session.userId},'auth.logout','success',${requestId})`;
      });
      return clearCookies(json({ status: "ok" }));
    }
    if (path === "change-password") {
      if (typeof body.current_password !== "string" || !validPassword(body.new_password)) return error("INVALID_INPUT", 400);
      if (!await limited(db, "change-password", session.userId, 5, 3600)) return error("RATE_LIMITED", 429);
      const current = await db`SELECT password_hash FROM identity_password WHERE user_id=${session.userId}`;
      if (!current.length || !await verifyPassword(current[0].password_hash, body.current_password)) {
        await writeAudit(db, { actor: session.userId, target: session.userId, action: "auth.change_password", outcome: "failure", requestId });
        return error("INVALID_CREDENTIALS", 401);
      }
      const newHash = await hashPassword(body.new_password);
      await db.begin(async (tx) => {
        await tx`UPDATE identity_password SET password_hash=${newHash},changed_at=now() WHERE user_id=${session.userId}`;
        await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${session.userId} AND revoked_at IS NULL`;
        await tx`UPDATE identity_token SET consumed_at=now() WHERE user_id=${session.userId}
          AND purpose='reset_password' AND consumed_at IS NULL`;
        await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,request_id)
          VALUES (${session.userId},${session.userId},'auth.change_password','success',${requestId})`;
      });
      return clearCookies(json({ status: "ok" }));
    }
    if (path === "role-assignments") {
      const target = body.user_id;
      const role = body.role_id;
      const scopeType = body.scope_type;
      const scopeId = body.scope_id;
      if (typeof target !== "string" || !UUID_PATTERN.test(target) || typeof role !== "string" ||
          typeof body.reason !== "string" || !body.reason.trim() || body.reason.length > 300 ||
          (scopeType !== "global" && scopeType !== "account" && scopeType !== "resource") ||
          typeof scopeId !== "string" || scopeId.length > 100 ||
          (scopeType === "global" ? scopeId !== "*" : scopeId === "*")) return error("INVALID_INPUT", 400);
      if (!await hasPermission(db, session.userId, "roles.manage", scopeType, scopeId)) return error("FORBIDDEN", 403);
      const roleRows = await db`SELECT privileged FROM identity_role WHERE id=${role}`;
      if (!roleRows.length || roleRows[0].privileged) return error("SECOND_APPROVAL_REQUIRED", 403);
      const grantable = await db`SELECT p.permission_id FROM identity_role_permission p WHERE p.role_id=${role}`;
      for (const item of grantable) {
        if (!await hasPermission(db, session.userId, item.permission_id, scopeType, scopeId)) return error("DELEGATION_EXCEEDS_SCOPE", 403);
      }
      const exists = await db`SELECT 1 FROM identity_user WHERE id=${target} AND status='active'`;
      if (!exists.length) return error("USER_NOT_FOUND", 404);
      const result = await db.begin(async (tx) => {
        const assigned = await tx`INSERT INTO identity_assignment(user_id,role_id,scope_type,scope_id,granted_by)
          VALUES (${target},${role},${scopeType},${scopeId},${session.userId}) RETURNING id`;
        await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${target} AND revoked_at IS NULL`;
        await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,reason,request_id,metadata)
          VALUES (${session.userId},${target},'rbac.grant','success',${body.reason.trim()},
            ${requestId},${tx.json({ role, scopeType, scopeId })})`;
        return assigned[0].id;
      });
      return json({ assignment_id: result }, 201);
    }
    if (path === "grant-requests") {
      const target = body.user_id;
      const role = body.role_id;
      const scopeType = body.scope_type;
      const scopeId = body.scope_id;
      const reason = body.reason;
      if (typeof target !== "string" || !UUID_PATTERN.test(target) || target === session.userId ||
          typeof role !== "string" || typeof reason !== "string" || !reason.trim() || reason.length > 300 ||
          (scopeType !== "global" && scopeType !== "account" && scopeType !== "resource") ||
          typeof scopeId !== "string" || scopeId.length > 100 ||
          (scopeType === "global" ? scopeId !== "*" : scopeId === "*")) return error("INVALID_INPUT", 400);
      const roleRows = await db`SELECT privileged FROM identity_role WHERE id=${role}`;
      if (!roleRows.length || !roleRows[0].privileged) return error("INVALID_ROLE", 400);
      if (!await hasPermission(db, session.userId, "roles.manage", scopeType, scopeId)) return error("FORBIDDEN", 403);
      const grantable = await db`SELECT permission_id FROM identity_role_permission WHERE role_id=${role}`;
      for (const item of grantable) {
        if (!await hasPermission(db, session.userId, item.permission_id, scopeType, scopeId)) return error("DELEGATION_EXCEEDS_SCOPE", 403);
      }
      const created = await db.begin(async (tx) => {
        const targets = await tx`SELECT 1 FROM identity_user WHERE id=${target} AND status='active'`;
        if (!targets.length) return null;
        const rows = await tx`INSERT INTO identity_grant_request(requested_by,target_user_id,role_id,scope_type,scope_id,reason)
          VALUES (${session.userId},${target},${role},${scopeType},${scopeId},${reason.trim()}) RETURNING id`;
        await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,reason,request_id,metadata)
          VALUES (${session.userId},${target},'rbac.privileged_request','success',${reason.trim()},${requestId},
            ${tx.json({ request_id: rows[0].id, role, scopeType, scopeId })})`;
        return rows[0].id;
      });
      return created ? json({ request_id: created }, 201) : error("USER_NOT_FOUND", 404);
    }
    const approval = /^grant-requests\/([0-9a-f-]{36})\/approve$/.exec(path);
    if (approval) {
      if (!UUID_PATTERN.test(approval[1])) return error("INVALID_INPUT", 400);
      const result = await db.begin(async (tx) => {
        const rows = await tx`SELECT g.*,u.status AS target_status FROM identity_grant_request g
          JOIN identity_user u ON u.id=g.target_user_id WHERE g.id=${approval[1]} FOR UPDATE OF g`;
        if (!rows.length || rows[0].status !== "pending") return "missing";
        const item = rows[0];
        if (item.requested_by === session.userId || item.target_user_id === session.userId || item.target_status !== "active") return "denied";
        const required = await tx`SELECT rp.permission_id FROM identity_role_permission rp WHERE rp.role_id=${item.role_id}
          AND NOT EXISTS (SELECT 1 FROM identity_assignment a JOIN identity_role_permission own ON own.role_id=a.role_id
            WHERE a.user_id=${session.userId} AND a.revoked_at IS NULL AND own.permission_id=rp.permission_id
              AND ((a.scope_type='global' AND a.scope_id='*') OR (a.scope_type=${item.scope_type} AND a.scope_id=${item.scope_id})))`;
        const manager = await tx`SELECT 1 FROM identity_assignment a JOIN identity_role_permission rp ON rp.role_id=a.role_id
          WHERE a.user_id=${session.userId} AND a.revoked_at IS NULL AND rp.permission_id='roles.manage'
            AND ((a.scope_type='global' AND a.scope_id='*') OR (a.scope_type=${item.scope_type} AND a.scope_id=${item.scope_id})) LIMIT 1`;
        if (required.length || !manager.length) return "denied";
        await tx`INSERT INTO identity_assignment(user_id,role_id,scope_type,scope_id,granted_by)
          VALUES (${item.target_user_id},${item.role_id},${item.scope_type},${item.scope_id},${session.userId})`;
        await tx`UPDATE identity_grant_request SET status='approved',approved_by=${session.userId},decided_at=now() WHERE id=${item.id}`;
        await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${item.target_user_id} AND revoked_at IS NULL`;
        await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,reason,request_id,metadata)
          VALUES (${session.userId},${item.target_user_id},'rbac.privileged_approve','success',${item.reason},${requestId},
            ${tx.json({ request_id: item.id, role: item.role_id, scopeType: item.scope_type, scopeId: item.scope_id, requested_by: item.requested_by })})`;
        return "approved";
      });
      return result === "approved" ? json({ status: "ok" }) : error(result === "missing" ? "NOT_FOUND" : "FORBIDDEN", result === "missing" ? 404 : 403);
    }
    return error("NOT_FOUND", 404);
  } finally { await db.end(); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = pathOf(await params);
  const match = /^users\/([0-9a-f-]{36})$/.exec(path);
  if (!match) return error("NOT_FOUND", 404);
  if (!UUID_PATTERN.test(match[1])) return error("INVALID_INPUT", 400);
  if (!sameOrigin(request)) return error("ORIGIN_REQUIRED", 403);
  const body = await bodyOf(request);
  if (!body || !["active", "inactive", "suspended", "deletion_pending"].includes(String(body.status)) ||
      typeof body.reason !== "string" || !body.reason.trim() || body.reason.length > 300) return error("INVALID_INPUT", 400);
  if (!only(body, ["status", "reason"])) return error("UNKNOWN_FIELD", 400);
  const db = database();
  try {
    const session = await readSession(db, request);
    if (!session) return error("UNAUTHENTICATED", 401);
    if (!validCsrf(request, session)) return error("CSRF_REJECTED", 403);
    const target = match[1];
    if (!await hasPermission(db, session.userId, "users.manage", "resource", target)) return error("FORBIDDEN", 403);
    if (target === session.userId) return error("SELF_CHANGE_DENIED", 403);
    const targetPrivileged = await db`SELECT 1 FROM identity_assignment a JOIN identity_role r ON r.id=a.role_id
      WHERE a.user_id=${target} AND a.revoked_at IS NULL AND r.privileged=true LIMIT 1`;
    if (targetPrivileged.length) return error("SECOND_APPROVAL_REQUIRED", 403);
    const updated = await db.begin(async (tx) => {
      const rows = await tx`UPDATE identity_user SET status=${body.status as string},updated_at=now()
        WHERE id=${target} RETURNING id`;
      if (!rows.length) return false;
      if (body.status !== "active") {
        await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${target} AND revoked_at IS NULL`;
        await tx`UPDATE identity_token SET consumed_at=now() WHERE user_id=${target} AND consumed_at IS NULL`;
      }
      await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,reason,request_id,metadata)
        VALUES (${session.userId},${target},'identity.status_change','success',${body.reason as string},${randomUUID()},${tx.json({ status: body.status as string })})`;
      return true;
    });
    return updated ? json({ status: "ok" }) : error("USER_NOT_FOUND", 404);
  } finally { await db.end(); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = pathOf(await params);
  const match = /^role-assignments\/([0-9a-f-]{36})$/.exec(path);
  if (!match) return error("NOT_FOUND", 404);
  if (!UUID_PATTERN.test(match[1])) return error("INVALID_INPUT", 400);
  if (!sameOrigin(request)) return error("ORIGIN_REQUIRED", 403);
  const db = database();
  try {
    const session = await readSession(db, request);
    if (!session) return error("UNAUTHENTICATED", 401);
    if (!validCsrf(request, session)) return error("CSRF_REJECTED", 403);
    const rows = await db`SELECT a.user_id,a.role_id,a.scope_type,a.scope_id,r.privileged FROM identity_assignment a
      JOIN identity_role r ON r.id=a.role_id WHERE a.id=${match[1]} AND a.revoked_at IS NULL`;
    if (!rows.length) return error("NOT_FOUND", 404);
    const assignment = rows[0];
    if (assignment.privileged) return error("SECOND_APPROVAL_REQUIRED", 403);
    if (!await hasPermission(db, session.userId, "roles.manage", assignment.scope_type, assignment.scope_id)) return error("FORBIDDEN", 403);
    await db.begin(async (tx) => {
      await tx`UPDATE identity_assignment SET revoked_at=now() WHERE id=${match[1]} AND revoked_at IS NULL`;
      await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${assignment.user_id} AND revoked_at IS NULL`;
      await tx`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,request_id,metadata)
        VALUES (${session.userId},${assignment.user_id},'rbac.revoke','success',${randomUUID()},
          ${tx.json({ role: assignment.role_id, scopeType: assignment.scope_type, scopeId: assignment.scope_id })})`;
    });
    return json({ status: "ok" });
  } finally { await db.end(); }
}
