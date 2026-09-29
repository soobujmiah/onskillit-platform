import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import postgres from "postgres";

// Runs after browser checks because this synthetic scenario revokes their owner fixtures.
const db = postgres(process.env.DATABASE_URL, { max: 1 });
function attemptBootstrap(targetId) {
  return new Promise((resolve) => {
    execFile("./node_modules/.bin/tsx", ["scripts/bootstrap_owner.ts"], { env: {
      ...process.env, OPERATOR_IDENTITY: "ci-operator", OPERATOR_REVIEW_REFERENCE: "synthetic-race-review",
      OPERATOR_REASON: "Synthetic concurrent first-owner test", TARGET_USER_ID: targetId,
      OWNER_BOOTSTRAP_APPROVED: "yes",
    } }, (error) => resolve(error === null));
  });
}

try {
  await db`UPDATE identity_assignment SET revoked_at=now() WHERE role_id='owner' AND revoked_at IS NULL`;
  const candidates = await db`INSERT INTO identity_user(status) VALUES ('active'),('active') RETURNING id`;
  const results = await Promise.all(candidates.map((candidate) => attemptBootstrap(candidate.id)));
  assert.equal(results.filter(Boolean).length, 1, "Concurrent bootstrap created more than one owner");
  assert.equal((await db`SELECT 1 FROM identity_assignment WHERE role_id='owner' AND revoked_at IS NULL`).length, 1);
  console.log("Concurrent first-owner bootstrap check passed");
} finally {
  await db.end();
}
