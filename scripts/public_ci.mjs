import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { SMTPServer } from "smtp-server";

const db = postgres(process.env.DATABASE_URL, { max: 1 });
const base = "http://localhost:3000";
const fixture = (slug, locale) => locale === "en" ? {
  title: "Synthetic public title", slug, description: "Synthetic approved page description",
  seoTitle: "Synthetic search title", seoDescription: "Synthetic search description",
  sections: [{ type: "text", heading: "Sample section", body: "Synthetic CI content only", source: "ci-fixture" }],
} : {
  title: "কৃত্রিম পাতার শিরোনাম", slug, description: "শুধু পরীক্ষার জন্য কৃত্রিম বিবরণ",
  seoTitle: "কৃত্রিম অনুসন্ধান শিরোনাম", seoDescription: "কৃত্রিম অনুসন্ধান বিবরণ",
  sections: [{ type: "text", heading: "নমুনা অংশ", body: "শুধু পরীক্ষার বিষয়বস্তু", source: "ci-fixture" }],
};
async function page(key, kind, author, published = false, category = null, localized = null) {
  const [record] = await db`INSERT INTO cms_page(page_key,kind,created_by) VALUES (${key},${kind},${author}) RETURNING id`;
  const [revision] = await db`INSERT INTO cms_revision(page_id,revision_no,en,bn,created_by)
    VALUES (${record.id},1,${db.json(localized?.en ?? fixture(key === "service-sample" ? "sample-service" : key, "en"))},
      ${db.json(localized?.bn ?? fixture(key === "service-sample" ? "sample-service-bn" : key, "bn"))},${author}) RETURNING id`;
  if (category) await db`INSERT INTO catalog_service(page_id,category) VALUES (${record.id},${category})`;
  if (published) await db`UPDATE cms_page SET state='published',published_revision_id=${revision.id} WHERE id=${record.id}`;
  return { id: record.id, revisionId: revision.id };
}
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
  throw new Error("Synthetic inquiry notification was not delivered");
}
const get = (path) => fetch(`${base}${path}`, { cache: "no-store" });
const inquiry = (body) => fetch(`${base}/api/v1/public/inquiries`, {
  method: "POST", headers: { "content-type": "application/json", Origin: base }, body: JSON.stringify(body),
});

try {
  const [author] = await db`INSERT INTO identity_user DEFAULT VALUES RETURNING id`;
  const unpublished = await get("/en");
  assert.equal(unpublished.status, 200);
  assert.match(await unpublished.text(), /Approved information is being prepared/);
  assert.equal((await get("/en/services/sample-service")).status, 404);
  assert.match(await (await get("/robots.txt")).text(), /Disallow: \/$/m);

  await page("home", "landing", author.id, false);
  await page("about", "page", author.id, true);
  await page("contact", "page", author.id, true);
  await page("services", "page", author.id, true);
  const service = await page("service-sample", "service", author.id, true, "synthetic-category");
  const invalid = { name: "Synthetic Sender", email: "sender@example.test", message: "Synthetic inquiry message", locale: "en",
    consent: true, consentVersion: "00000000-0000-4000-8000-000000000000", sourcePath: "/en/contact", website: "" };
  assert.match(await (await get("/en/contact")).text(), /Inquiry intake is not available/);
  assert.equal((await inquiry(invalid)).status, 503);
  const privacy = await page("privacy", "page", author.id, true);
  const teamEn = { ...fixture("team", "en"), sections: [
    { type: "profile", heading: "Synthetic Person", role: "Sample Staff Role", body: "Synthetic staff bio for CI only", source: "ci-fixture consent:synthetic-ci-1",
      relationship: "Synthetic relationship", skills: ["Sample Skill One", "Sample Skill Two"],
      links: [{ label: "Sample Link", url: "https://example.test/profile" }] },
    { type: "profile", heading: "Hidden Synthetic Person", role: "Hidden Role", body: "Must not be shown", source: "ci-fixture consent:synthetic-ci-1", status: "hidden" },
  ] };
  const teamBn = { ...fixture("team", "bn"), sections: [
    { type: "profile", heading: "কৃত্রিম ব্যক্তি", role: "নমুনা কর্মীর ভূমিকা", body: "শুধু পরীক্ষার জন্য কৃত্রিম পরিচিতি", source: "ci-fixture consent:synthetic-ci-1",
      relationship: "কৃত্রিম সম্পর্ক", skills: ["নমুনা দক্ষতা এক", "নমুনা দক্ষতা দুই"],
      links: [{ label: "নমুনা সংযোগ", url: "https://example.test/profile" }] },
    { type: "profile", heading: "লুকানো কৃত্রিম ব্যক্তি", role: "লুকানো ভূমিকা", body: "দেখানো যাবে না", source: "ci-fixture consent:synthetic-ci-1", status: "hidden" },
  ] };
  await page("team", "page", author.id, true, null, { en: teamEn, bn: teamBn });
  const teamHtml = await (await get("/en/team")).text();
  assert.match(teamHtml, /Synthetic Person/);
  assert.match(teamHtml, /Sample Skill One/);
  assert.match(teamHtml, /href="https:\/\/example\.test\/profile"/);
  assert.match(teamHtml, /Synthetic relationship/);
  assert.doesNotMatch(teamHtml, /Hidden Synthetic Person|Must not be shown/);
  const teamBnHtml = await (await get("/bn/team")).text();
  assert.match(teamBnHtml, /নমুনা দক্ষতা এক/);
  assert.doesNotMatch(teamBnHtml, /লুকানো কৃত্রিম ব্যক্তি|দেখানো যাবে না/);
  const valid = { ...invalid, consentVersion: privacy.revisionId };
  assert.equal((await fetch(`${base}/api/v1/public/inquiries`, { method: "POST", headers: { "content-type": "application/json", Origin: "https://other.example.test" }, body: JSON.stringify(valid) })).status, 403);
  assert.equal((await inquiry({ ...valid, consent: false })).status, 400);
  assert.equal((await inquiry({ ...valid, website: "bot.example" })).status, 400);
  assert.equal((await inquiry(valid)).status, 202);
  assert.equal((await db`SELECT count(*)::int AS count FROM public_inquiry`)[0].count, 1);
  const [stored] = await db`SELECT id FROM public_inquiry`;
  const notice = (await nextMail()).replace(/=\r?\n/g, "");
  assert.match(notice, /Subject: New OnSkillIT website inquiry/);
  assert.match(notice, new RegExp(`Reference: ${stored.id}`));
  assert.match(notice, /\/en\/staff\/crm\/leads/);
  assert.doesNotMatch(notice, /sender@example\.test|Synthetic Sender|Synthetic inquiry message/, "notice must not carry visitor details");
  assert.equal((await get("/en/services/sample-service")).status, 200);
  assert.equal((await get("/bn/services/sample-service-bn")).status, 200);
  assert.equal((await get("/bn/services/sample-service")).status, 404);
  assert.doesNotMatch(await (await get("/sitemap.xml")).text(), /sample-service/);
  await db`INSERT INTO cms_setting(key,value,updated_by) VALUES ('robots_enabled','true',${author.id})`;
  const sitemap = await (await get("/sitemap.xml")).text();
  assert.match(sitemap, /sample-service/);
  assert.match(sitemap, /\/en\/team/);
  assert.doesNotMatch(sitemap, /\/en\/?<\/loc>/);
  assert.match(await (await get("/en/about")).text(), /Synthetic public title/);
  assert.equal((await db`SELECT category FROM catalog_service WHERE page_id=${service.id}`)[0].category, "synthetic-category");
  for (let i = 0; i < 3; i++) assert.equal((await inquiry(valid)).status, 202);
  assert.equal((await inquiry(valid)).status, 429);
  const [intake] = await db`SELECT id FROM public_inquiry ORDER BY created_at LIMIT 1`;
  await assert.rejects(db`UPDATE public_inquiry SET message='Tampered inquiry' WHERE id=${intake.id}`);
  const redactionEnv = { ...process.env, INQUIRY_ID: intake.id, OPERATOR_IDENTITY: "ci-operator",
    PRIVACY_REQUEST_REFERENCE: "synthetic-request-1", PRIVACY_REVIEW_REFERENCE: "synthetic-review-1" };
  assert.throws(() => execFileSync("./node_modules/.bin/tsx", ["scripts/redact_public_inquiry.ts"], { env: redactionEnv }));
  execFileSync("./node_modules/.bin/tsx", ["scripts/redact_public_inquiry.ts"], {
    env: { ...redactionEnv, PRIVACY_REDACTION_APPROVED: "yes" },
  });
  const [redacted] = await db`SELECT name,email,phone,message,redacted_at FROM public_inquiry WHERE id=${intake.id}`;
  assert.equal(redacted.name, null);
  assert.equal(redacted.email, null);
  assert.equal(redacted.phone, null);
  assert.equal(redacted.message, null);
  assert(redacted.redacted_at);
  const audits = await db`SELECT id FROM identity_audit WHERE action='operator.redact_public_inquiry'
    AND metadata->>'inquiry_id'=${intake.id}`;
  assert.equal(audits.length, 1);
  await assert.rejects(db`DELETE FROM public_inquiry WHERE id=${intake.id}`);
  // CMS-managed site content (ADR 0013): settings, text overrides and section images render, bad values are ignored.
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
  const [media] = await db`INSERT INTO cms_media(filename,mime_type,bytes,byte_length,sha256,rights_reference,alt_en,alt_bn,uploaded_by,public)
    VALUES ('synthetic.png','image/png',${png},${png.length},${"0".repeat(64)},'synthetic-rights','Synthetic image','কৃত্রিম ছবি',${author.id},true) RETURNING id`;
  const faqSection = (heading, body) => ({ type: "text", heading, body, source: "ci-fixture", mediaId: media.id });
  await page("faq", "page", author.id, true, null, {
    en: { ...fixture("faq", "en"), sections: [faqSection("Sample section", "Synthetic CI content only")] },
    bn: { ...fixture("faq", "bn"), sections: [faqSection("নমুনা অংশ", "শুধু পরীক্ষার বিষয়বস্তু")] } });
  const faqHtml = await (await get("/en/faq")).text();
  assert.match(faqHtml, new RegExp(`/api/v1/cms/media/${media.id}/content`));
  assert.match(faqHtml, /alt="Synthetic image"/);
  assert.match(await (await get("/bn/faq")).text(), /alt="কৃত্রিম ছবি"/);
  const served = await fetch(`${base}/api/v1/cms/media/${media.id}/content`);
  assert.equal(served.status, 200);
  assert.equal(served.headers.get("content-type"), "image/png");
  const year = String(new Date().getFullYear());
  const setting = (key, value) => db`INSERT INTO cms_setting(key,value,updated_by) VALUES (${key},${value},${author.id})
    ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`;
  await setting("contact_phone", "+8801700000000"); await setting("contact_email", "synthetic@example.test");
  await setting("footer_text_en", "Synthetic footer {year}"); await setting("site_name_en", "Synthetic Brand");
  await setting("site_logo_media_id", media.id); await setting("facebook_url", "http://insecure.example.test/fb");
  const contactHtml = await (await get("/en/contact")).text();
  assert.match(contactHtml, /tel:\+8801700000000/);
  assert.match(contactHtml, /mailto:synthetic@example\.test/);
  assert.doesNotMatch(contactHtml, /\+8801617301184|insecure\.example\.test/, "defaults replaced; non-https link ignored");
  assert.match(contactHtml, /https:\/\/www\.facebook\.com\/onskillit/, "invalid stored link falls back to the default");
  const homeHtml = await (await get("/en")).text();
  assert.match(homeHtml, new RegExp(`Synthetic footer ${year}`));
  assert.match(homeHtml, /Synthetic Brand/);
  assert.match(homeHtml, /class="site-logo"/);
  assert.match(homeHtml, /alt="Synthetic image"/);
  const text = (locale, key, value) => db`INSERT INTO cms_text(locale,key,value,updated_by) VALUES (${locale},${key},${value},${author.id})`;
  await text("en", "public.unpublished", "Synthetic custom unpublished message");
  await text("bn", "public.unpublished", "Latin letters are not allowed here");
  const bnDefault = JSON.parse(readFileSync(new URL("../src/i18n/dictionaries/bn.json", import.meta.url), "utf8")).public.unpublished;
  const customHome = await (await get("/en")).text();
  assert.match(customHome, /Synthetic custom unpublished message/);
  assert.doesNotMatch(customHome, /Approved information is being prepared/);
  const bnHome = await (await get("/bn")).text();
  assert.match(bnHome, new RegExp(bnDefault), "an invalid stored override is ignored");
  assert.doesNotMatch(bnHome, /Latin letters are not allowed here/);
  await db`DELETE FROM cms_text`;
  await db`DELETE FROM cms_setting WHERE key IN ('contact_phone','contact_email','footer_text_en','site_name_en','site_logo_media_id','facebook_url')`;
  assert.match(await (await get("/en")).text(), /Approved information is being prepared/, "clearing restores the default");

  // Render owner-supplied editorial drafts only inside this disposable CI database.
  // No policy draft is included or published by this fixture.
  await db`UPDATE cms_page SET state='archived',published_revision_id=NULL WHERE id=${service.id}`;
  const editorial = JSON.parse(readFileSync(new URL("../docs/PHASE-05-CMS-COPY.json", import.meta.url), "utf8"));
  for (const draft of editorial.pages) {
    let [stored] = await db`SELECT id FROM cms_page WHERE page_key=${draft.page_key}`;
    if (!stored) {
      [stored] = await db`INSERT INTO cms_page(page_key,kind,created_by)
        VALUES (${draft.page_key},${draft.kind},${author.id}) RETURNING id`;
    }
    if (draft.kind === "service") await db`INSERT INTO catalog_service(page_id,category)
      VALUES (${stored.id},${draft.category})`;
    const [version] = await db`SELECT coalesce(max(revision_no),0)::int + 1 AS next
      FROM cms_revision WHERE page_id=${stored.id}`;
    const [revision] = await db`INSERT INTO cms_revision(page_id,revision_no,en,bn,created_by)
      VALUES (${stored.id},${version.next},${db.json(draft.en)},${db.json(draft.bn)},${author.id}) RETURNING id`;
    await db`UPDATE cms_page SET state='published',published_revision_id=${revision.id}
      WHERE id=${stored.id}`;
  }
  console.log("Public core integration passed: publication, inquiry controls and reviewed personal-field redaction");
} finally { await new Promise((resolve) => smtp.close(resolve)); await db.end(); }
