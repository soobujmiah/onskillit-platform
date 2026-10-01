// Staff inquiry operations (ADR 0011): protected view, read-only vs redacting staff, audited redaction and retention.
// Runs against the synthetic public-core server after scripts/public_ci.mjs; uses disposable CI data only.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import postgres from "postgres";

const db = postgres(process.env.DATABASE_URL, { max: 1 });
const base = "http://localhost:3000";
const password = "A secure sample password 123";
async function identity(path, body) {
  const response = await fetch(`${base}/api/v1/identity/${path}`, { method: "POST",
    headers: { "content-type": "application/json", Origin: base }, body: JSON.stringify(body) });
  return { response, value: await response.json() };
}
function cookies(response) {
  const cookie = response.headers.getSetCookie().map((part) => part.split(";")[0]).join("; ");
  return { cookie, csrf: /onskillit_csrf=([^;]+)/.exec(cookie)?.[1] ?? "" };
}
async function account(email, role) {
  assert.equal((await identity("registrations", { contact: email, password })).response.status, 201);
  const [{ id }] = await db`SELECT u.id FROM identity_user u JOIN identity_contact c ON c.user_id=u.id WHERE c.normalized=${email}`;
  // Fixture grant before sign-in so the session is created as a staff session.
  if (role) await db`INSERT INTO identity_assignment(user_id,role_id,scope_type,scope_id) VALUES (${id},${role},'global','*')`;
  const login = await identity("sessions", { contact: email, password });
  assert.equal(login.response.status, 200);
  return { id, ...cookies(login.response) };
}
const view = (session) => fetch(`${base}/en/staff/crm/leads`, { headers: session ? { Cookie: session.cookie } : {}, redirect: "manual" });
const redact = (id, body, session, csrf = session?.csrf ?? "") => fetch(`${base}/api/v1/staff/inquiries/${id}/redactions`, {
  method: "POST", headers: { "content-type": "application/json", Origin: base, Cookie: session?.cookie ?? "", "x-csrf-token": csrf }, body: JSON.stringify(body) });

try {
  const [privacy] = await db`SELECT published_revision_id AS id FROM cms_page WHERE page_key='privacy'`;
  const insert = async (name, message, createdAt) => (await db`INSERT INTO public_inquiry(name,email,phone,message,locale,consent_version,source_path,created_at)
    VALUES (${name},${`${name.toLowerCase().replace(/\W+/g, "-")}@example.test`},NULL,${message},'en',${privacy.id},'/en/contact',${createdAt})
    RETURNING id`)[0].id;
  const recent = await insert("Ops Recent", "Synthetic recent operations message", new Date());
  const old = await insert("Ops Old", "Synthetic expired operations message", new Date(Date.now() - 400 * 24 * 3600 * 1000));
  const duplicate = await insert("Ops Second", "Synthetic second operations message", new Date());

  const reader = await account("inquiry-reader@example.test", "inquiry_staff");
  const owner = await account("inquiry-owner@example.test", "owner");
  const member = await account("inquiry-member@example.test", null);

  // Never public: anonymous visitors are sent to sign-in, non-staff members to the forbidden page.
  const anonymous = await view(null);
  assert([302, 303, 307, 308].includes(anonymous.status));
  assert.match(anonymous.headers.get("location") ?? "", /\/en\/account\/sign-in/);
  const denied = await view(member);
  assert([302, 303, 307, 308].includes(denied.status));
  assert.match(denied.headers.get("location") ?? "", /\/en\/forbidden/);
  assert.equal((await redact(recent, { request_reference: "synthetic-req-1", review_reference: "synthetic-rev-1" }, null)).status, 401);

  // Read-only staff can read but never see or use the redaction control.
  const readerView = await view(reader);
  assert.equal(readerView.status, 200);
  const readerHtml = await readerView.text();
  assert.match(readerHtml, /Synthetic recent operations message/);
  assert.match(readerHtml, /noindex/);
  assert.doesNotMatch(readerHtml, /class="inquiry-redact"/);
  assert.equal((await redact(recent, { request_reference: "synthetic-req-1", review_reference: "synthetic-rev-1" }, reader)).status, 403);

  // Redacting staff see the control and the retention warning for the expired record.
  const ownerHtml = await (await view(owner)).text();
  assert.match(ownerHtml, /class="inquiry-redact"/);
  assert.match(ownerHtml, /12-month retention period has elapsed/);
  assert.equal((await redact(recent, { request_reference: "synthetic-req-1", review_reference: "synthetic-rev-1" }, owner, "wrong")).status, 403);
  assert.equal((await redact("not-a-uuid", { request_reference: "synthetic-req-1", review_reference: "synthetic-rev-1" }, owner)).status, 404);
  assert.equal((await redact(recent, { request_reference: "same-reference", review_reference: "same-reference" }, owner)).status, 400);
  assert.equal((await redact(recent, { request_reference: "x", review_reference: "synthetic-rev-1" }, owner)).status, 400);
  assert.equal((await redact(recent, { request_reference: "synthetic-req-1", review_reference: "synthetic-rev-1", extra: 1 }, owner)).status, 400);
  assert.equal((await redact(recent, { request_reference: "synthetic-req-1", review_reference: "synthetic-rev-1" }, owner)).status, 200);
  assert.equal((await redact(recent, { request_reference: "synthetic-req-2", review_reference: "synthetic-rev-2" }, owner)).status, 409);
  const [done] = await db`SELECT name,email,message,redacted_by,redaction_request_reference FROM public_inquiry WHERE id=${recent}`;
  assert.equal(done.name, null); assert.equal(done.email, null); assert.equal(done.message, null);
  assert.equal(done.redacted_by, `staff:${owner.id}`);
  const audit = await db`SELECT reason FROM identity_audit WHERE action='operator.redact_public_inquiry' AND metadata->>'inquiry_id'=${recent}`;
  assert.deepEqual(audit.map((row) => row.reason), ["Reviewed privacy request"]);
  assert.doesNotMatch(await (await view(owner)).text(), /Synthetic recent operations message/);

  // Retention: the 12-month rule is applied by the operator procedure, with an honest audit reason.
  const env = { ...process.env, OPERATOR_IDENTITY: "ci-operator", OPERATOR_REVIEW_REFERENCE: "synthetic-retention-review" };
  assert.match(execFileSync("./node_modules/.bin/tsx", ["scripts/purge_expired_inquiries.ts"], { env }).toString(), /Dry run: 1 inquiry/);
  assert.equal((await db`SELECT redacted_at FROM public_inquiry WHERE id=${old}`)[0].redacted_at, null);
  assert.match(execFileSync("./node_modules/.bin/tsx", ["scripts/purge_expired_inquiries.ts"], { env: { ...env, INQUIRY_PURGE_APPLY: "yes" } }).toString(), /applied to 1 inquiry/);
  const [expired] = await db`SELECT message,redacted_at FROM public_inquiry WHERE id=${old}`;
  assert.equal(expired.message, null); assert(expired.redacted_at);
  const [kept] = await db`SELECT message FROM public_inquiry WHERE id=${duplicate}`;
  assert.equal(kept.message, "Synthetic second operations message", "recent inquiries are untouched");
  const retention = await db`SELECT reason FROM identity_audit WHERE action='operator.redact_public_inquiry' AND metadata->>'inquiry_id'=${old}`;
  assert.deepEqual(retention.map((row) => row.reason), ["Retention period elapsed"]);
  console.log("Inquiry operations passed: protected staff view, read-only vs redacting access, audited redaction and retention");
} finally { await db.end(); }
