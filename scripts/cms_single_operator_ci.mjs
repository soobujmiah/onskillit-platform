// Exercises CMS_WORKFLOW_MODE=single_operator against a second synthetic server (port 3001).
// The default separated mode is covered by scripts/cms_ci.mjs against the first server.
import assert from "node:assert/strict";
import postgres from "postgres";

const db = postgres(process.env.DATABASE_URL, { max: 1 });
const base = "http://localhost:3001";
const password = "A secure sample password 123";
const email = "solo-operator@example.test";
async function identity(path, body, cookie = "", csrf = "") {
  const response = await fetch(`${base}/api/v1/identity/${path}`, { method: "POST",
    headers: { "content-type": "application/json", Origin: base, Cookie: cookie, "x-csrf-token": csrf }, body: JSON.stringify(body) });
  return { response, value: await response.json() };
}
function cookies(response) {
  const cookie = response.headers.getSetCookie().map((part) => part.split(";")[0]).join("; ");
  return { cookie, csrf: /onskillit_csrf=([^;]+)/.exec(cookie)?.[1] ?? "" };
}
async function cms(path, body, session) {
  const response = await fetch(`${base}/api/v1/cms/${path}`, { method: "POST",
    headers: { "content-type": "application/json", Origin: base, Cookie: session.cookie, "x-csrf-token": session.csrf }, body: JSON.stringify(body) });
  return { response, value: await response.json() };
}
const section = { type: "text", source: "synthetic-ci" };
const en = (slug) => ({ title: "Solo sample", slug, description: "Synthetic single operator page", seoTitle: "Solo sample",
  seoDescription: "Synthetic single operator page", sections: [{ ...section, heading: "Solo heading", body: "Synthetic solo body" }] });
const bn = (slug) => ({ title: "একক পরিচালক নমুনা", slug, description: "কৃত্রিম একক পরিচালকের পাতা", seoTitle: "একক নমুনা",
  seoDescription: "কৃত্রিম একক পরিচালকের পাতা", sections: [{ ...section, heading: "একক শিরোনাম", body: "কৃত্রিম অংশ" }] });

try {
  assert.equal((await identity("registrations", { contact: email, password })).response.status, 201);
  const [{ id: userId }] = await db`SELECT u.id FROM identity_user u JOIN identity_contact c ON c.user_id=u.id WHERE c.normalized=${email}`;
  // Fixture only: this disposable database already has its first owner, so grant directly.
  await db`INSERT INTO identity_assignment(user_id,role_id,scope_type,scope_id) VALUES (${userId},'owner','global','*')`;
  const login = await identity("sessions", { contact: email, password });
  assert.equal(login.response.status, 200);
  const session = cookies(login.response);

  const created = await cms("pages", { page_key: "solo-page", kind: "page", en: en("solo-en"), bn: bn("solo-bn") }, session);
  assert.equal(created.response.status, 201);
  const pageId = created.value.id;
  const detail = await (await fetch(`${base}/api/v1/cms/pages/${pageId}`, { headers: { Cookie: session.cookie } })).json();
  const revisionId = detail.revisions[0].id;

  // Publishing without any approved review is still refused in this mode.
  assert.equal((await cms(`pages/${pageId}/publish`, { revision_id: revisionId }, session)).response.status, 409);
  // The same authorized person may review and publish their own revision.
  assert.equal((await cms(`pages/${pageId}/reviews`, { revision_id: revisionId, decision: "approved", note: "Synthetic single operator review" }, session)).response.status, 200);
  assert.equal((await cms(`pages/${pageId}/publish`, { revision_id: revisionId }, session)).response.status, 200);

  const audited = await db`SELECT action,metadata->>'workflow_mode' AS mode FROM identity_audit
    WHERE actor_user_id=${userId} AND action IN ('cms.review','cms.publish') ORDER BY created_at`;
  assert.deepEqual(audited.map((row) => [row.action, row.mode]), [["cms.review", "single_operator"], ["cms.publish", "single_operator"]]);
  const [{ state }] = await db`SELECT state FROM cms_page WHERE id=${pageId}`;
  assert.equal(state, "published");
  // Site content changes follow the same mode: one authorized person may propose, review and publish.
  const proposed = await cms("site-changes", { kind: "text", locale: "en", key: "public.submit", value: "Solo wording" }, session);
  assert.equal(proposed.response.status, 201);
  assert.equal((await cms(`site-changes/${proposed.value.id}/publish`, {}, session)).response.status, 409, "still needs an approved review");
  assert.equal((await cms(`site-changes/${proposed.value.id}/reviews`, { decision: "approved", note: "Solo review" }, session)).response.status, 200);
  assert.equal((await cms(`site-changes/${proposed.value.id}/publish`, {}, session)).response.status, 200);
  const texts = await (await fetch(`${base}/api/v1/cms/site-texts`, { headers: { Cookie: session.cookie } })).json();
  assert.deepEqual(texts.texts.map((row) => [row.locale, row.key, row.value]), [["en", "public.submit", "Solo wording"]]);
  const changeAudit = await db`SELECT action,metadata->>'workflow_mode' AS mode FROM identity_audit
    WHERE actor_user_id=${userId} AND action LIKE 'cms.site_change_%' ORDER BY created_at`;
  assert.deepEqual(changeAudit.map((row) => [row.action, row.mode]), [["cms.site_change_propose", null], ["cms.site_change_review", "single_operator"], ["cms.site_change_publish", "single_operator"]]);
  console.log("CMS single-operator workflow passed: explicit approval step, audited mode, no separation requirement");
} finally { await db.end(); }
