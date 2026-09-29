/**
 * Operator-only action. Run in an isolated, reviewed environment after a
 * separate human review. Never wire this to a public request or automatic
 * migration. Required env: DATABASE_URL, OPERATOR_IDENTITY,
 * OPERATOR_REVIEW_REFERENCE, OPERATOR_REASON, TARGET_USER_ID,
 * OWNER_BOOTSTRAP_APPROVED=yes.
 */
import postgres from "postgres";
import { randomUUID } from "node:crypto";

const url = process.env.DATABASE_URL;
const operator = process.env.OPERATOR_IDENTITY?.trim();
const review = process.env.OPERATOR_REVIEW_REFERENCE?.trim();
const reason = process.env.OPERATOR_REASON?.trim();
const target = process.env.TARGET_USER_ID?.trim();
if (!url || !operator || !review || !reason || !target || process.env.OWNER_BOOTSTRAP_APPROVED !== "yes") {
  throw new Error("Reviewed operator context and explicit approval marker are required");
}
if (operator.length > 200 || review.length > 200 || reason.length > 500 || !/^[0-9a-f-]{36}$/.test(target)) {
  throw new Error("Invalid operator context or target ID");
}

async function main() {
  const db = postgres(url!, { max: 1 });
  try {
    const assigned = await db.begin(async (tx) => {
    const users = await tx`SELECT id,status FROM identity_user WHERE id=${target} FOR UPDATE`;
    if (users.length !== 1 || users[0].status !== "active") throw new Error("Target account is not active");
    const exists = await tx`SELECT 1 FROM identity_assignment WHERE role_id='owner' AND revoked_at IS NULL LIMIT 1`;
    if (exists.length) throw new Error("Owner already exists; use the separately reviewed two-person grant process");
    const rows = await tx`INSERT INTO identity_assignment(user_id,role_id,scope_type,scope_id)
      VALUES (${target},'owner','global','*') RETURNING id`;
    await tx`INSERT INTO identity_audit(operator_identity,target_user_id,action,outcome,reason,request_id,metadata)
      VALUES (${operator},${target},'operator.bootstrap_owner','success',${reason},${randomUUID()},
        ${tx.json({ review_reference: review, assignment_id: rows[0].id, role: "owner" })})`;
    await tx`UPDATE identity_session SET revoked_at=now() WHERE user_id=${target} AND revoked_at IS NULL`;
    return rows[0].id;
    });
    process.stdout.write(`Owner assignment recorded: ${assigned}\n`);
  } finally { await db.end(); }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Owner bootstrap failed"}\n`);
  process.exitCode = 1;
});
