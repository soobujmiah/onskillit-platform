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
const localized=(slug)=>slug.endsWith("-bn") ? ({title:"যাচাই করা নমুনা শিরোনাম",slug,description:"কৃত্রিম সম্পাদনার বিবরণ",seoTitle:"কৃত্রিম অনুসন্ধান শিরোনাম",seoDescription:"কৃত্রিম অনুসন্ধান বিবরণ",sections:[{type:"text",heading:"নমুনা শিরোনাম",body:"শুধু কৃত্রিম বিষয়বস্তু",source:"ci-fixture"}]}) : ({title:"Verified sample title",slug,description:"Synthetic editorial description",seoTitle:"Synthetic search title",seoDescription:"Synthetic search description",sections:[{type:"text",heading:"Sample heading",body:"Synthetic content only",source:"ci-fixture"}]});
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
  assert.equal((await cms("pages",{page_key:"mixed-script",kind:"page",en:localized("mixed-en"),bn:localized("mixed-en")},author)).response.status,400);
  const profile=(lang,extra)=>({...localized(lang==="en"?"profile-en":"profile-bn"),sections:[{type:"profile",heading:lang==="en"?"Synthetic Person":"কৃত্রিম ব্যক্তি",role:lang==="en"?"Sample Role":"নমুনা ভূমিকা",body:lang==="en"?"Synthetic bio":"কৃত্রিম পরিচিতি",source:"synthetic-ci",...extra}]});
  const okEn={skills:["Sample Skill"],links:[{label:"Site",url:"https://example.test/x"}],relationship:"Sample relationship",status:"hidden"};
  const okBn={skills:["নমুনা দক্ষতা"],links:[{label:"সাইট",url:"https://example.test/x"}]};
  assert.equal((await cms("pages",{page_key:"profile-ok",kind:"page",en:profile("en",okEn),bn:profile("bn",okBn)},author)).response.status,201);
  const rejects=async(key,en,bn)=>assert.equal((await cms("pages",{page_key:key,kind:"page",en:profile("en",en),bn:profile("bn",bn)},author)).response.status,400,key);
  await rejects("profile-http",{links:[{label:"Site",url:"http://example.test/x"}]},okBn);
  await rejects("profile-js",{links:[{label:"Site",url:"javascript:alert(1)"}]},okBn);
  await rejects("profile-bn-latin",okEn,{skills:["Latin Skill"]});
  await rejects("profile-too-many",{skills:Array.from({length:13},(_,i)=>`Skill ${i}`)},okBn);
  await rejects("profile-bad-status",{status:"deleted"},okBn);
  await rejects("profile-extra-key",{links:[{label:"Site",url:"https://example.test/x",rel:"me"}]},okBn);
  const withSkillsOnText=(lang)=>({...localized(lang==="en"?"textskills-en":"textskills-bn"),sections:[{type:"text",heading:lang==="en"?"Heading":"শিরোনাম",body:lang==="en"?"Body":"বিষয়বস্তু",source:"synthetic-ci",skills:lang==="en"?["Sample"]:["নমুনা"]}]});
  assert.equal((await cms("pages",{page_key:"profile-on-text",kind:"page",en:withSkillsOnText("en"),bn:withSkillsOnText("bn")},author)).response.status,400);
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
  // Reviewed site content (ADR 0013/0014): proposals go through review and publication before anything is live.
  const logoForm=()=>{const f=new FormData();f.set("file",new File([Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0])],"logo.png",{type:"image/png"}));f.set("rights_reference","synthetic-ci-rights");f.set("alt_en","Synthetic logo");f.set("alt_bn","কৃত্রিম লোগো");return f;};
  const privateLogo=await cms("media",logoForm(),author);assert.equal(privateLogo.response.status,201);
  assert.equal((await cms("settings",{key:"contact_phone",value:"+8801700000001"},author)).value.code,"REVIEW_REQUIRED");
  assert.equal((await cms("site-texts",{locale:"en",key:"public.submit",value:"Send it now"},author)).value.code,"REVIEW_REQUIRED");
  assert.equal((await cms("settings",{key:"robots_enabled",value:"false"},author)).response.status,200);
  assert.equal((await cms("settings",{key:"robots_enabled",value:"maybe"},author)).response.status,400);
  const propose=(body,session=author)=>cms("site-changes",body,session);
  for (const [body,status] of [
    [{kind:"setting",key:"site_logo_media_id",value:privateLogo.value.id},400],[{kind:"setting",key:"contact_phone",value:"not a phone"},400],
    [{kind:"setting",key:"contact_whatsapp",value:"+88017"},400],[{kind:"setting",key:"facebook_url",value:"http://example.test/fb"},400],
    [{kind:"setting",key:"facebook_url",value:"javascript:alert(1)"},400],[{kind:"setting",key:"footer_text_en",value:"বাংলা"},400],
    [{kind:"setting",key:"footer_text_bn",value:"Latin"},400],[{kind:"setting",key:"contact_address_en",value:"কৃত্রিম"},400],
    [{kind:"setting",key:"unknown_key",value:"x"},400],[{kind:"setting",key:"robots_enabled",value:"true"},400],
    [{kind:"setting",key:"contact_phone",value:"+8801700000009",locale:"en"},400],[{kind:"text",locale:"bn",key:"public.submit",value:"Latin only"},400],
    [{kind:"text",locale:"en",key:"public.submit",value:"বাংলা"},400],[{kind:"text",locale:"en",key:"cms.save",value:"Staff text"},400],
    [{kind:"text",locale:"en",key:"public.nope",value:"x"},400],[{kind:"text",key:"public.submit",value:"No locale"},400],[{kind:"other",key:"x",value:"x"},400],
    [{kind:"setting",key:"contact_phone",value:"+8801700000001"},403]])
    assert.equal((await propose(body,body.value==="+8801700000001"?member:author)).response.status,status,JSON.stringify(body));
  assert.equal((await get("site-changes",member)).status,403);
  const liveSettings=async()=>Object.fromEntries((await (await get("settings",author)).json()).settings.map(r=>[r.key,r.value]));
  const liveTexts=async()=>(await (await get("site-texts",author)).json()).texts;
  const change=(id,action,body,session)=>cms(`site-changes/${id}/${action}`,body,session);

  const phone=await propose({kind:"setting",key:"contact_phone",value:"+8801700000001"});assert.equal(phone.response.status,201);
  assert.equal((await liveSettings()).contact_phone,undefined,"a proposal is not live");
  assert.equal((await change(phone.value.id,"reviews",{decision:"approved",note:"Own change"},author)).value.code,"SELF_REVIEW_DENIED");
  assert.equal((await change(phone.value.id,"publish",{},publisher)).value.code,"APPROVAL_REQUIRED");
  assert.equal((await change(phone.value.id,"reviews",{decision:"approved",note:"Looks right"},member)).response.status,403);
  assert.equal((await change(phone.value.id,"reviews",{decision:"approved",note:"Looks right"},reviewer)).response.status,200);
  assert.equal((await change(phone.value.id,"reviews",{decision:"rejected",note:"Again"},reviewer)).value.code,"ALREADY_DECIDED");
  assert.equal((await change(phone.value.id,"publish",{},member)).response.status,403);
  assert.equal((await change(phone.value.id,"publish",{},author)).value.code,"APPROVAL_REQUIRED","proposer cannot publish in separated mode");
  assert.equal((await change(phone.value.id,"publish",{},reviewer)).value.code,"APPROVAL_REQUIRED","reviewer cannot publish in separated mode");
  assert.equal((await change(phone.value.id,"publish",{},publisher)).response.status,200);
  assert.equal((await change(phone.value.id,"publish",{},publisher)).value.code,"ALREADY_PUBLISHED");
  assert.equal((await liveSettings()).contact_phone,"+8801700000001");

  const rejectedText=await propose({kind:"text",locale:"en",key:"public.submit",value:"Rejected wording"});assert.equal(rejectedText.response.status,201);
  assert.equal((await change(rejectedText.value.id,"reviews",{decision:"rejected",note:"Not approved"},reviewer)).response.status,200);
  assert.equal((await change(rejectedText.value.id,"publish",{},publisher)).value.code,"APPROVAL_REQUIRED");
  assert.equal((await liveTexts()).length,0,"a rejected change never applies");

  const send=await propose({kind:"text",locale:"en",key:"public.submit",value:"Send it now"});assert.equal(send.response.status,201);
  assert.equal((await change(send.value.id,"reviews",{decision:"approved",note:"Approved wording"},reviewer)).response.status,200);
  assert.equal((await change(send.value.id,"publish",{},publisher)).response.status,200);
  assert.deepEqual((await liveTexts()).map(r=>[r.locale,r.key,r.value]),[["en","public.submit","Send it now"]]);
  const mixed=await propose({kind:"text",locale:"en",key:"language.switchTo",value:"বাংলা"});assert.equal(mixed.response.status,201,"the language switcher label may use either script");
  const reset=await propose({kind:"text",locale:"en",key:"public.submit",value:""});assert.equal(reset.response.status,201);
  assert.equal((await change(reset.value.id,"reviews",{decision:"approved",note:"Restore default"},reviewer)).response.status,200);
  assert.equal((await change(reset.value.id,"publish",{},publisher)).response.status,200);
  assert.equal((await liveTexts()).length,0,"an approved empty value restores the built-in default");

  const logo=await propose({kind:"setting",key:"site_logo_media_id",value:mediaId});assert.equal(logo.response.status,201);
  assert.equal((await change(logo.value.id,"reviews",{decision:"approved",note:"Logo approved"},reviewer)).response.status,200);
  assert.equal((await change(logo.value.id,"publish",{},publisher)).response.status,200);
  assert.equal((await liveSettings()).site_logo_media_id,mediaId);
  const clearLogo=await propose({kind:"setting",key:"site_logo_media_id",value:""});
  assert.equal((await change(clearLogo.value.id,"reviews",{decision:"approved",note:"Remove logo"},reviewer)).response.status,200);
  assert.equal((await change(clearLogo.value.id,"publish",{},publisher)).response.status,200);
  assert.equal((await liveSettings()).site_logo_media_id,undefined);

  const listedChanges=await (await get("site-changes",author)).json();
  assert.equal(listedChanges.mode,"separated");assert(listedChanges.viewer.can_propose&&listedChanges.viewer.can_review);
  assert((await liveSettings()).contact_phone);
  assert.equal((await db`SELECT count(*)::int AS n FROM identity_audit WHERE action='cms.site_change_publish' AND metadata->>'workflow_mode'='separated'`)[0].n,5);
  await assert.rejects(db`UPDATE cms_site_change SET value='tampered' WHERE id=${phone.value.id}`);
  await assert.rejects(db`UPDATE cms_site_change SET decision='rejected',review_note='x',reviewed_by=${authorId},reviewed_at=now() WHERE id=${rejectedText.value.id}`);
  await assert.rejects(db`DELETE FROM cms_site_change WHERE id=${phone.value.id}`);
  await db`DELETE FROM cms_setting WHERE key='contact_phone'`;

  // Team profiles need a recorded consent reference before approval or publication.
  const profilePage=(await db`SELECT id FROM cms_page WHERE page_key='profile-ok'`)[0].id;
  const noConsent=(await (await get(`pages/${profilePage}`,author)).json()).revisions[0].id;
  const refused=await cms(`pages/${profilePage}/reviews`,{revision_id:noConsent,decision:"approved",note:"No consent reference"},reviewer);
  assert.equal(refused.response.status,409);assert.equal(refused.value.code,"CONSENT_REQUIRED");
  const withConsent=(lang)=>profile(lang,{...(lang==="en"?okEn:okBn),source:"approved consent:synthetic-ci-1"});
  const consented=await cms(`pages/${profilePage}/revisions`,{base_revision_id:noConsent,en:withConsent("en"),bn:withConsent("bn")},author);assert.equal(consented.response.status,201);
  assert.equal((await cms(`pages/${profilePage}/reviews`,{revision_id:consented.value.id,decision:"approved",note:"Consent reference present"},reviewer)).response.status,200);
  assert.equal((await cms(`pages/${profilePage}/publish`,{revision_id:consented.value.id},publisher)).response.status,200);
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
