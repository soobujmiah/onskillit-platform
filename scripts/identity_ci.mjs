import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import postgres from "postgres";

const db = postgres(process.env.DATABASE_URL, { max: 1 });
const base = "http://localhost:3000";
const email = "member@example.test";
const ownerEmail = "owner@example.test";
const password = "A secure sample password 123";
const newPassword = "A changed sample password 456";
const hash = (value) => createHash("sha256").update(value).digest("hex");

async function call(path, body, cookie = "", csrf = "") {
  const response = await fetch(`${base}/api/v1/identity/${path}`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie, "x-csrf-token": csrf },
    body: JSON.stringify(body), redirect: "manual",
  });
  return { response, value: await response.json() };
}
function cookies(response) {
  const values = response.headers.getSetCookie();
  const cookie = values.map((part) => part.split(";")[0]).join("; ");
  const csrf = /onskillit_csrf=([^;]+)/.exec(cookie)?.[1] ?? "";
  return { cookie, csrf };
}

try {
  assert.equal((await call("registrations", { contact: email, password })).response.status, 201);
  assert.equal((await call("registrations", { contact: email.toUpperCase(), password })).response.status, 409);
  const login = await call("sessions", { contact: email, password });
  assert.equal(login.response.status, 200);
  const member = cookies(login.response);
  assert.ok(member.csrf);
  const profile = await fetch(`${base}/api/v1/identity/profile`, { headers: { Cookie: member.cookie } });
  assert.equal(profile.status, 200);
  assert.equal((await call("logout", {}, member.cookie, "wrong")).response.status, 403);
  assert.equal((await call("password-reset-requests", { email })).response.status, 202);
  assert.equal((await db`SELECT 1 FROM identity_token WHERE purpose='reset_password'`).length, 0);
  assert.equal((await call("mobile-recovery", { contact: "+8801700000000" })).response.status, 404);

  const user = (await db`SELECT u.id,c.id AS contact_id FROM identity_user u JOIN identity_contact c ON c.user_id=u.id WHERE c.normalized=${email}`)[0];
  const verifyToken = "verification-synthetic-token-01234567890123456789";
  await db`INSERT INTO identity_token(user_id,contact_id,purpose,token_hash,expires_at)
    VALUES (${user.id},${user.contact_id},'verify_email',${hash(verifyToken)},now()+interval '5 minutes')`;
  assert.equal((await call("email-verifications", { token: verifyToken })).response.status, 200);
  assert.equal((await call("email-verifications", { token: verifyToken })).response.status, 400);
  const resetToken = "password-reset-synthetic-token-0123456789012345";
  await db`INSERT INTO identity_token(user_id,contact_id,purpose,token_hash,expires_at)
    VALUES (${user.id},${user.contact_id},'reset_password',${hash(resetToken)},now()+interval '5 minutes')`;
  assert.equal((await call("password-resets", { token: resetToken, password: newPassword })).response.status, 200);
  assert.equal((await call("password-resets", { token: resetToken, password: newPassword })).response.status, 400);
  assert.equal((await fetch(`${base}/api/v1/identity/profile`, { headers: { Cookie: member.cookie } })).status, 401);
  assert.equal((await call("sessions", { contact: email, password: newPassword })).response.status, 200);

  assert.equal((await call("registrations", { contact: ownerEmail, password })).response.status, 201);
  const owner = (await db`SELECT u.id FROM identity_user u JOIN identity_contact c ON c.user_id=u.id WHERE c.normalized=${ownerEmail}`)[0];
  execFileSync("./node_modules/.bin/tsx", ["scripts/bootstrap_owner.ts"], { env: {
    ...process.env, OPERATOR_IDENTITY: "ci-operator", OPERATOR_REVIEW_REFERENCE: "synthetic-ci-review",
    OPERATOR_REASON: "Synthetic first-owner integration test", TARGET_USER_ID: owner.id,
    OWNER_BOOTSTRAP_APPROVED: "yes",
  } });
  const ownerLogin = await call("sessions", { contact: ownerEmail, password });
  assert.equal(ownerLogin.response.status, 200);
  const ownerCookie = cookies(ownerLogin.response);
  assert.equal((await fetch(`${base}/api/v1/identity/audit`, { headers: { Cookie: ownerCookie.cookie } })).status, 200);
  assert.equal((await call("role-assignments", { user_id: user.id, role_id: "owner", scope_type: "global", scope_id: "*" }, ownerCookie.cookie, ownerCookie.csrf)).response.status, 403);
  assert.equal((await call("role-assignments", { user_id: user.id, role_id: "support", scope_type: "global", scope_id: "*" }, ownerCookie.cookie, ownerCookie.csrf)).response.status, 201);
  const suspended = await fetch(`${base}/api/v1/identity/users/${user.id}`, { method: "PATCH",
    headers: { "Content-Type": "application/json", Origin: base, Cookie: ownerCookie.cookie, "x-csrf-token": ownerCookie.csrf },
    body: JSON.stringify({ status: "suspended" }) });
  assert.equal(suspended.status, 200);
  assert.equal((await call("sessions", { contact: email, password: newPassword })).response.status, 401);
  const audit = await db`SELECT action,operator_identity,target_user_id FROM identity_audit WHERE action='operator.bootstrap_owner'`;
  assert.equal(audit.length, 1);
  assert.equal(audit[0].operator_identity, "ci-operator");
  assert.equal(audit[0].target_user_id, owner.id);
  console.log("Identity integration checks passed");
} finally { await db.end(); }
