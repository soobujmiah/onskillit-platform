import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import postgres from "postgres";

const db=postgres(process.env.DATABASE_URL,{max:1});
const base="http://localhost:3000";
const password="A secure sample password 123";
async function identity(path,body,cookie="",csrf="") {
  const response=await fetch(`${base}/api/v1/identity/${path}`,{method:"POST",headers:{"content-type":"application/json",Origin:base,Cookie:cookie,"x-csrf-token":csrf},body:JSON.stringify(body)});
  return {response,value:await response.json()};
}
function cookies(response) {const cookie=response.headers.getSetCookie().map(x=>x.split(";")[0]).join("; ");return {cookie,csrf:/onskillit_csrf=([^;]+)/.exec(cookie)?.[1]??""};}
async function account(email) { assert.equal((await identity("registrations",{contact:email,password})).response.status,201);
  return (await db`SELECT u.id FROM identity_user u JOIN identity_contact c ON c.user_id=u.id WHERE c.normalized=${email}`)[0].id; }
async function login(email) {const result=await identity("sessions",{contact:email,password});assert.equal(result.response.status,200);return cookies(result.response);}
async function cms(path,body,session,method="POST") {const headers={Origin:base,Cookie:session?.cookie??"","x-csrf-token":session?.csrf??""};
  if (!(body instanceof FormData)) headers["content-type"]="application/json";
  const response=await fetch(`${base}/api/v1/cms/${path}`,{method,headers,body:body instanceof FormData?body:JSON.stringify(body)});
  return {response,value:await response.json()}; }
async function get(path,session) {return fetch(`${base}/api/v1/cms/${path}`,{headers:{Cookie:session?.cookie??""}});}
const localized=(slug)=>({title:"Verified sample title",slug,description:"Synthetic editorial description",seoTitle:"Synthetic search title",seoDescription:"Synthetic search description",sections:[{type:"text",heading:"Sample heading",body:"Synthetic content only",source:"ci-fixture"}]});
try {
  const authorId=await account("cms-author@example.test");
  const reviewerId=await account("cms-reviewer@example.test");
  const publisherId=await account("cms-publisher@example.test");
  await account("cms-member@example.test");
  execFileSync("./node_modules/.bin/tsx",["scripts/bootstrap_owner.ts"],{env:{...process.env,OPERATOR_IDENTITY:"ci-operator",OPERATOR_REVIEW_REFERENCE:"synthetic-review",OPERATOR_REASON:"CMS fixture",TARGET_USER_ID:authorId,OWNER_BOOTSTRAP_APPROVED:"yes"}});
  execFileSync("./node_modules/.bin/tsx",["scripts/bootstrap_second_owner.ts"],{env:{...process.env,OPERATOR_IDENTITY:"ci-operator",OWNER_APPROVAL_REFERENCE:"synthetic-second-owner",OPERATOR_REASON:"CMS fixture",OWNER_APPROVER_ID:authorId,TARGET_USER_ID:reviewerId,SECOND_OWNER_BOOTSTRAP_APPROVED:"yes"}});
  const author=await login("cms-author@example.test"), reviewer=await login("cms-reviewer@example.test"), member=await login("cms-member@example.test");
  const request=await identity("grant-requests",{user_id:publisherId,role_id:"cms_publisher",scope_type:"global",scope_id:"*",reason:"Synthetic CMS publication review"},author.cookie,author.csrf);
  assert.equal(request.response.status,201);
  assert.equal((await identity(`grant-requests/${request.value.request_id}/approve`,{},reviewer.cookie,reviewer.csrf)).response.status,200);
  const publisher=await login("cms-publisher@example.test");
  assert.equal((await get("pages",member)).status,403);
  assert.equal((await cms("pages",{page_key:"sample-page",kind:"page",en:localized("sample-en"),bn:localized("sample-bn")},member)).response.status,403);
  assert.equal((await cms("pages",{page_key:"sample-page",kind:"page",en:localized("sample-en"),bn:localized("sample-bn")},{cookie:author.cookie,csrf:"wrong"})).response.status,403);
  const created=await cms("pages",{page_key:"sample-page",kind:"page",en:localized("sample-en"),bn:localized("sample-bn")},author);
  assert.equal(created.response.status,201);const pageId=created.value.id;
  const initial=await (await get(`pages/${pageId}`,author)).json();const first=initial.revisions[0].id;
  assert.equal((await get(`preview/${pageId}`,member)).status,403);
  const preview=await get(`preview/${pageId}?revision=${first}`,author);assert.equal(preview.status,200);
  assert.match(preview.headers.get("x-robots-tag"),/noindex/);
  assert.equal((await cms(`pages/${pageId}/reviews`,{revision_id:first,decision:"approved",note:"Synthetic approval"},author)).response.status,409);
  const incomplete={...localized("sample-bn"),seoTitle:""};
  const newRevision=await cms(`pages/${pageId}/revisions`,{base_revision_id:first,en:localized("sample-en"),bn:incomplete},author);
  assert.equal(newRevision.response.status,201);
  assert.equal((await cms(`pages/${pageId}/revisions`,{base_revision_id:first,en:localized("sample-en"),bn:localized("sample-bn")},author)).response.status,409);
  assert.equal((await cms(`pages/${pageId}/reviews`,{revision_id:newRevision.value.id,decision:"approved",note:"Incomplete"},reviewer)).response.status,409);
  const complete=await cms(`pages/${pageId}/revisions`,{base_revision_id:newRevision.value.id,en:localized("sample-en"),bn:localized("sample-bn")},author);
  assert.equal(complete.response.status,201);
  assert.equal((await cms(`pages/${pageId}/publish`,{revision_id:complete.value.id},publisher)).response.status,409);
  assert.equal((await cms(`pages/${pageId}/reviews`,{revision_id:complete.value.id,decision:"approved",note:"Synthetic editorial approval"},reviewer)).response.status,200);
  assert.equal((await cms(`pages/${pageId}/publish`,{revision_id:complete.value.id},author)).response.status,409);
  assert.equal((await cms(`pages/${pageId}/publish`,{revision_id:complete.value.id},publisher)).response.status,200);
  assert.equal((await db`SELECT state,published_revision_id FROM cms_page WHERE id=${pageId}`)[0].published_revision_id,complete.value.id);
  await assert.rejects(db`UPDATE cms_revision SET revision_no=99 WHERE id=${first}`);
  const mediaForm=new FormData();mediaForm.set("file",new File([Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0])],"sample.png",{type:"image/png"}));mediaForm.set("rights_reference","synthetic-ci-rights");mediaForm.set("alt_en","Sample");mediaForm.set("alt_bn","নমুনা");
  const uploaded=await cms("media",mediaForm,author);assert.equal(uploaded.response.status,201);const mediaId=uploaded.value.id;
  assert.equal((await get(`media/${mediaId}/content`,member)).status,403);
  assert.equal((await cms(`media/${mediaId}/publish`,{},author)).response.status,409);
  assert.equal((await cms(`media/${mediaId}/publish`,{},reviewer)).response.status,200);
  assert.equal((await get(`media/${mediaId}/content`,member)).status,200);
  const fake=new FormData();fake.set("file",new File(["not an image"],"fake.png",{type:"image/png"}));fake.set("rights_reference","synthetic");fake.set("alt_en","Sample");fake.set("alt_bn","নমুনা");
  assert.equal((await cms("media",fake,author)).response.status,400);
  assert.equal((await cms("navigation",{slot:"header",position:1,page_id:pageId,label_en:"Sample",label_bn:"নমুনা"},author)).response.status,201);
  assert.equal((await cms("seo",{locale:"en",source_path:"/old-sample",target_page_id:pageId},author)).response.status,200);
  assert.equal((await cms("settings",{key:"robots_enabled",value:"true"},author)).response.status,200);
  const rollback=await cms(`pages/${pageId}/rollback`,{revision_id:first},publisher);assert.equal(rollback.response.status,201);
  assert.equal((await db`SELECT published_revision_id FROM cms_page WHERE id=${pageId}`)[0].published_revision_id,complete.value.id);
  assert.equal((await cms(`pages/${pageId}/archive`,{},reviewer)).response.status,200);
  assert.equal((await db`SELECT count(*)::int AS count FROM cms_navigation WHERE page_id=${pageId}`)[0].count,0);
  assert.ok((await db`SELECT 1 FROM identity_audit WHERE action='cms.publish' AND metadata->>'page_id'=${pageId}`).length);
  assert.equal((await cms("pages",{page_key:"cms-showcase",kind:"landing",en:localized("showcase-en"),bn:localized("showcase-bn")},author)).response.status,201);
  console.log("CMS integration passed: permissions, review/publish, revision stability, private media, MIME, preview and audit");
} finally {await db.end();}
