import "server-only";
import type { Db } from "@/lib/identity";

type Cursor = { at: string; id: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UTC_MICROSECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/;

export function decodeCursor(raw: string | null | undefined): Cursor | null | undefined {
  if (raw === null || raw === undefined) return undefined;
  try {
    if (raw.length > 300) return null;
    const value: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (!value || typeof value !== "object" || !("at" in value) || !("id" in value) ||
        typeof value.at !== "string" || typeof value.id !== "string" ||
        !UTC_MICROSECOND.test(value.at) || !Number.isFinite(Date.parse(value.at)) ||
        !UUID.test(value.id)) return null;
    return { at: value.at, id: value.id };
  } catch { return null; }
}
function encodeCursor(row: { id: string; cursor_at: string }): string {
  return Buffer.from(JSON.stringify({ at: row.cursor_at, id: row.id })).toString("base64url");
}

export async function listUsers(db: Db, actorId: string, cursor?: Cursor) {
  const after = cursor ? db`AND (u.created_at,u.id) < (${cursor.at}::timestamptz,${cursor.id}::uuid)` : db``;
  const rows = await db`SELECT u.id,u.status,u.created_at,
    to_char(u.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_at,
    c.kind,c.normalized,c.verified_at,
    EXISTS (SELECT 1 FROM identity_assignment am JOIN identity_role_permission rpm ON rpm.role_id=am.role_id
      WHERE am.user_id=${actorId} AND am.revoked_at IS NULL AND rpm.permission_id='users.manage'
        AND ((am.scope_type='global' AND am.scope_id='*') OR (am.scope_type='resource' AND am.scope_id=u.id::text))) AS can_manage
    FROM identity_user u LEFT JOIN LATERAL (
      SELECT kind,normalized,verified_at FROM identity_contact WHERE user_id=u.id ORDER BY kind LIMIT 1
    ) c ON true
    WHERE EXISTS (SELECT 1 FROM identity_assignment a JOIN identity_role_permission rp ON rp.role_id=a.role_id
      WHERE a.user_id=${actorId} AND a.revoked_at IS NULL AND rp.permission_id='users.read'
        AND ((a.scope_type='global' AND a.scope_id='*') OR (a.scope_type='resource' AND a.scope_id=u.id::text)))
    ${after} ORDER BY u.created_at DESC,u.id DESC LIMIT 51`;
  return { items: rows.slice(0, 50), nextCursor: rows.length > 50 ? encodeCursor(rows[49] as unknown as { id: string; cursor_at: string }) : null };
}

export async function listAudit(db: Db, cursor?: Cursor) {
  const after = cursor ? db`WHERE (created_at,id) < (${cursor.at}::timestamptz,${cursor.id}::uuid)` : db``;
  const rows = await db`SELECT id,actor_user_id,operator_identity,target_user_id,action,outcome,reason,request_id,created_at,
    to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_at
    FROM identity_audit ${after} ORDER BY created_at DESC,id DESC LIMIT 51`;
  return { items: rows.slice(0, 50), nextCursor: rows.length > 50 ? encodeCursor(rows[49] as unknown as { id: string; cursor_at: string }) : null };
}
