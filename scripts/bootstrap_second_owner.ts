/**
 * Operator-only bridge from one active owner to two. The protected operator
 * environment must authenticate the operator and retain the existing owner's
 * independent approval record. Never wire this script to an HTTP route.
 */
import postgres from "postgres";
import { randomUUID } from "node:crypto";

const url = process.env.DATABASE_URL;
const operator = process.env.OPERATOR_IDENTITY?.trim();
const approval = process.env.OWNER_APPROVAL_REFERENCE?.trim();
const reason = process.env.OPERATOR_REASON?.trim();
const approver = process.env.OWNER_APPROVER_ID?.trim();
const target = process.env.TARGET_USER_ID?.trim();
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!url || !operator || !approval || !reason || !approver || !target ||
    process.env.SECOND_OWNER_BOOTSTRAP_APPROVED !== "yes") {
  throw new Error("Reviewed second-owner operator context and approval marker are required");
}
if (operator.length > 200 || approval.length > 200 || reason.length > 500 ||
    !uuid.test(approver) || !uuid.test(target) || approver === target) {
  throw new Error("Invalid second-owner operator context");
}

async function main(databaseUrl: string, operatorId: string, approvalRef: string,
  actionReason: string, approverId: string, targetId: string) {
  const db = postgres(databaseUrl, { max: 1 });
  try {
    const assigned = await db.begin(async (tx) => {
      // Share the first-owner lock so two operator procedures cannot cross.
      await tx`SELECT pg_advisory_xact_lock(93003, 1)`;
      const owners = await tx`SELECT a.user_id,u.status FROM identity_assignment a
        JOIN identity_user u ON u.id=a.user_id
        WHERE a.role_id='owner' AND a.scope_type='global' AND a.scope_id='*'
          AND a.revoked_at IS NULL`;
      if (owners.length !== 1 || owners[0].user_id !== approverId || owners[0].status !== "active") {
        throw new Error("Exactly one active owner must independently approve the second owner");
      }
      const users = await tx`SELECT id,status FROM identity_user WHERE id=${targetId} FOR UPDATE`;
      if (users.length !== 1 || users[0].status !== "active") throw new Error("Target account is not active");
      const rows = await tx`INSERT INTO identity_assignment(user_id,role_id,scope_type,scope_id,granted_by)
        VALUES (${targetId},'owner','global','*',${approverId}) RETURNING id`;
      await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${targetId} AND revoked_at IS NULL`;
      await tx`INSERT INTO identity_audit(actor_user_id,operator_identity,target_user_id,action,outcome,reason,request_id,metadata)
        VALUES (${approverId},${operatorId},${targetId},'operator.bootstrap_second_owner','success',
          ${actionReason},${randomUUID()},${tx.json({ approval_reference: approvalRef, assignment_id: rows[0].id, role: "owner" })})`;
      return rows[0].id;
    });
    process.stdout.write(`Second owner assignment recorded: ${assigned}\n`);
  } finally { await db.end(); }
}

main(url, operator, approval, reason, approver, target).catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Second owner bootstrap failed"}\n`);
  process.exitCode = 1;
});
