import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import postgres from "postgres";
import { SMTPServer } from "smtp-server";

const db = postgres(process.env.DATABASE_URL, { max: 1 });
const base = "http://localhost:3000";
const email = "member@example.test";
const ownerEmail = "owner@example.test";
const password = "A secure sample password 123";
const newPassword = "A changed sample password 456";
const delivered = [];
const smtp = new SMTPServer({ authOptional: true, disabledCommands: ["AUTH", "STARTTLS"],
  onData(stream, _session, callback) {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => { delivered.push(Buffer.concat(chunks).toString("utf8")); callback(); });
    stream.on("error", callback);
  },
});
await new Promise((resolve, reject) => { smtp.once("error", reject); smtp.listen(2525, "127.0.0.1", resolve); });
async function nextMail() {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (delivered.length) return delivered.shift();
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Synthetic SMTP message not delivered");
}
function tokenFromMail(message, verify) {
  const normalized = message.replace(/=\r?\n/g, "");
  const match = /\/account\/reset\/([vr]_[A-Za-z0-9_-]+)/.exec(normalized);
  assert.ok(match, "Missing reset route in synthetic mail");
  assert.equal(match[1].startsWith("v_"), verify);
  return match[1];
}

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
  assert.equal((await call("registrations", { contact: "both@example.test", secondary_contact: "+8801700000000", password })).response.status, 201);
  const bothLogin = await call("sessions", { contact: "+8801700000000", password });
  assert.equal(bothLogin.response.status, 200);
  const bothCookie = cookies(bothLogin.response);
  assert.equal((await call("registrations", { contact: "+8801700000000", password })).response.status, 409);
  const login = await call("sessions", { contact: email, password });
  assert.equal(login.response.status, 200);
  const loginRequestId = login.response.headers.get("x-request-id");
  assert.ok(loginRequestId);
  const member = cookies(login.response);
  assert.ok(member.csrf);
  const profile = await fetch(`${base}/api/v1/identity/profile`, { headers: { Cookie: member.cookie } });
  assert.equal(profile.status, 200);
  assert.equal((await call("logout", {}, member.cookie, "wrong")).response.status, 403);
  assert.equal((await call("password-reset-requests", { email })).response.status, 202);
  assert.equal((await db`SELECT 1 FROM identity_token WHERE purpose='reset_password'`).length, 0);
  assert.equal((await call("mobile-recovery", { contact: "+8801700000000" })).response.status, 404);
  const disabledBn = await fetch(`${base}/api/v1/identity/mobile-recovery`, { headers: { Cookie: "NEXT_LOCALE=bn" } });
  assert.equal(disabledBn.status, 404);
  const disabledMessage = await disabledBn.json();
  assert.equal(disabledMessage.code, "RECOVERY_DISABLED");
  assert.ok(disabledMessage.request_id);
  assert.match(disabledMessage.message, /[\u0980-\u09ff]/);

  const user = (await db`SELECT u.id,c.id AS contact_id FROM identity_user u JOIN identity_contact c ON c.user_id=u.id WHERE c.normalized=${email}`)[0];
  assert.equal((await db`SELECT 1 FROM identity_audit WHERE action='auth.login' AND target_user_id=${user.id}
    AND request_id=${loginRequestId}`).length, 1);
  assert.equal((await call("email-verification-requests", { email })).response.status, 202);
  const verifyToken = tokenFromMail(await nextMail(), true);
  assert.equal((await call("email-verifications", { token: verifyToken })).response.status, 401);
  assert.equal((await call("email-verifications", { token: verifyToken }, bothCookie.cookie, bothCookie.csrf)).response.status, 400);
  assert.equal((await call("email-verifications", { token: verifyToken }, member.cookie, member.csrf)).response.status, 200);
  assert.equal((await call("email-verifications", { token: verifyToken }, member.cookie, member.csrf)).response.status, 400);
  assert.equal((await call("password-reset-requests", { email })).response.status, 202);
  const resetToken = tokenFromMail(await nextMail(), false);
  assert.equal((await call("password-reset-requests", { email })).response.status, 202);
  const alternateResetToken = tokenFromMail(await nextMail(), false);
  assert.equal((await call("password-resets", { token: resetToken, password: newPassword })).response.status, 200);
  assert.equal((await call("password-resets", { token: resetToken, password: newPassword })).response.status, 400);
  assert.equal((await call("password-resets", { token: alternateResetToken, password: newPassword })).response.status, 400);
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
  assert.equal((await call("role-assignments", { user_id: user.id, role_id: "owner", scope_type: "global", scope_id: "*", reason: "Synthetic unauthorized direct grant" }, ownerCookie.cookie, ownerCookie.csrf)).response.status, 403);
  assert.equal((await call("role-assignments", { user_id: user.id, role_id: "support", scope_type: "global", scope_id: "*", reason: "Synthetic support assignment" }, ownerCookie.cookie, ownerCookie.csrf)).response.status, 201);
  assert.equal((await call("registrations", { contact: "reviewer@example.test", password })).response.status, 201);
  const reviewerId = (await db`SELECT u.id FROM identity_user u JOIN identity_contact c ON c.user_id=u.id WHERE c.normalized='reviewer@example.test'`)[0].id;
  // Synthetic CI setup only. Real additional-owner provisioning requires a reviewed operator procedure.
  await db`INSERT INTO identity_assignment(user_id,role_id,scope_type,scope_id) VALUES (${reviewerId},'owner','global','*')`;
  const reviewerLogin = await call("sessions", { contact: "reviewer@example.test", password });
  assert.equal(reviewerLogin.response.status, 200);
  const reviewerCookie = cookies(reviewerLogin.response);
  assert.equal((await call("registrations", { contact: "scoped@example.test", password })).response.status, 201);
  const scopedId = (await db`SELECT u.id FROM identity_user u JOIN identity_contact c ON c.user_id=u.id WHERE c.normalized='scoped@example.test'`)[0].id;
  assert.equal((await call("role-assignments", { user_id: scopedId, role_id: "support", scope_type: "resource", scope_id: user.id, reason: "Synthetic resource scope" }, ownerCookie.cookie, ownerCookie.csrf)).response.status, 201);
  const scopedLogin = await call("sessions", { contact: "scoped@example.test", password });
  assert.equal(scopedLogin.response.status, 200);
  const scopedCookie = cookies(scopedLogin.response);
  const scopedUsersResponse = await fetch(`${base}/api/v1/identity/users`, { headers: { Cookie: scopedCookie.cookie } });
  assert.equal(scopedUsersResponse.status, 200);
  const scopedUsers = (await scopedUsersResponse.json()).users;
  assert.ok(scopedUsers.length > 0);
  assert.ok(scopedUsers.every((item) => item.id === user.id));
  assert.equal((await call("role-assignments", { user_id: user.id, role_id: "support", scope_type: "global", scope_id: "*", reason: "Denied delegation check" }, scopedCookie.cookie, scopedCookie.csrf)).response.status, 403);
  const requested = await call("grant-requests", { user_id: scopedId, role_id: "security_admin", scope_type: "global", scope_id: "*", reason: "Synthetic two-person review" }, ownerCookie.cookie, ownerCookie.csrf);
  assert.equal(requested.response.status, 201);
  const approvalPath = `grant-requests/${requested.value.request_id}/approve`;
  assert.equal((await call(approvalPath, {}, ownerCookie.cookie, ownerCookie.csrf)).response.status, 403);
  assert.equal((await call(approvalPath, {}, reviewerCookie.cookie, reviewerCookie.csrf)).response.status, 200);
  assert.equal((await call(approvalPath, {}, reviewerCookie.cookie, reviewerCookie.csrf)).response.status, 404);
  assert.equal((await fetch(`${base}/api/v1/identity/users?cursor=invalid`, { headers: { Cookie: ownerCookie.cookie } })).status, 400);
  await db`INSERT INTO identity_audit(actor_user_id,target_user_id,action,outcome,request_id,created_at)
    SELECT ${owner.id},${owner.id},'ci.pagination','success',gen_random_uuid()::text,
      now()+series.i*interval '1 microsecond' FROM generate_series(1,55) AS series(i)`;
  const auditFirst = await fetch(`${base}/api/v1/identity/audit`, { headers: { Cookie: ownerCookie.cookie } });
  assert.equal(auditFirst.status, 200);
  const firstPage = await auditFirst.json();
  assert.equal(firstPage.events.length, 50);
  assert.ok(firstPage.next_cursor);
  const auditSecond = await fetch(`${base}/api/v1/identity/audit?cursor=${encodeURIComponent(firstPage.next_cursor)}`, { headers: { Cookie: ownerCookie.cookie } });
  assert.equal(auditSecond.status, 200);
  const secondPage = await auditSecond.json();
  assert.ok(secondPage.events.length > 0);
  assert.ok(!secondPage.events.some((event) => firstPage.events.some((first) => first.id === event.id)));
  assert.equal(firstPage.events.length + secondPage.events.length,
    Number((await db`SELECT count(*)::int AS total FROM identity_audit`)[0].total));
  const suspended = await fetch(`${base}/api/v1/identity/users/${user.id}`, { method: "PATCH",
    headers: { "Content-Type": "application/json", Origin: base, Cookie: ownerCookie.cookie, "x-csrf-token": ownerCookie.csrf },
    body: JSON.stringify({ status: "suspended", reason: "Synthetic suspension check" }) });
  assert.equal(suspended.status, 200);
  assert.equal((await call("sessions", { contact: email, password: newPassword })).response.status, 401);
  let blocked = false;
  for (let attempt = 0; attempt < 11; attempt++) {
    const result = await call("sessions", { contact: "unknown@example.test", password: "Incorrect sample password" });
    if (attempt === 10) blocked = result.response.status === 429;
  }
  assert.ok(blocked, "Login rate limit did not block the eleventh attempt");
  const audit = await db`SELECT action,operator_identity,target_user_id,reason,created_at,metadata FROM identity_audit WHERE action='operator.bootstrap_owner'`;
  assert.equal(audit.length, 1);
  assert.equal(audit[0].operator_identity, "ci-operator");
  assert.equal(audit[0].target_user_id, owner.id);
  assert.equal(audit[0].reason, "Synthetic first-owner integration test");
  assert.ok(audit[0].created_at);
  assert.equal(audit[0].metadata.role, "owner");
  assert.ok(audit[0].metadata.assignment_id);
  let immutable = false;
  try { await db`UPDATE identity_audit SET reason='tampered' WHERE action='operator.bootstrap_owner'`; }
  catch { immutable = true; }
  assert.ok(immutable, "Audit table allowed mutation");
  console.log("Identity integration checks passed");
} finally {
  await db.end();
  await new Promise((resolve) => smtp.close(resolve));
}
