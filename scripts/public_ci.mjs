import assert from "node:assert/strict";
import postgres from "postgres";

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
async function page(key, kind, author, published = false, category = null) {
  const [record] = await db`INSERT INTO cms_page(page_key,kind,created_by) VALUES (${key},${kind},${author}) RETURNING id`;
  const [revision] = await db`INSERT INTO cms_revision(page_id,revision_no,en,bn,created_by)
    VALUES (${record.id},1,${db.json(fixture(key === "service-sample" ? "sample-service" : key, "en"))},
      ${db.json(fixture(key === "service-sample" ? "sample-service-bn" : key, "bn"))},${author}) RETURNING id`;
  if (category) await db`INSERT INTO catalog_service(page_id,category) VALUES (${record.id},${category})`;
  if (published) await db`UPDATE cms_page SET state='published',published_revision_id=${revision.id} WHERE id=${record.id}`;
  return { id: record.id, revisionId: revision.id };
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
  assert.equal((await inquiry(invalid)).status, 503);
  const privacy = await page("privacy", "page", author.id, true);
  const valid = { ...invalid, consentVersion: privacy.revisionId };
  assert.equal((await inquiry({ ...valid, consent: false })).status, 400);
  assert.equal((await inquiry({ ...valid, website: "bot.example" })).status, 400);
  assert.equal((await inquiry(valid)).status, 202);
  assert.equal((await db`SELECT count(*)::int AS count FROM public_inquiry`)[0].count, 1);
  assert.equal((await get("/en/services/sample-service")).status, 200);
  assert.equal((await get("/bn/services/sample-service-bn")).status, 200);
  assert.equal((await get("/bn/services/sample-service")).status, 404);
  assert.doesNotMatch(await (await get("/sitemap.xml")).text(), /sample-service/);
  await db`INSERT INTO cms_setting(key,value,updated_by) VALUES ('robots_enabled','true',${author.id})`;
  const sitemap = await (await get("/sitemap.xml")).text();
  assert.match(sitemap, /sample-service/);
  assert.doesNotMatch(sitemap, /\/en\/?<\/loc>/);
  assert.match(await (await get("/en/about")).text(), /Synthetic public title/);
  assert.equal((await db`SELECT category FROM catalog_service WHERE page_id=${service.id}`)[0].category, "synthetic-category");
  for (let i = 0; i < 3; i++) assert.equal((await inquiry(valid)).status, 202);
  assert.equal((await inquiry(valid)).status, 429);
  console.log("Public core integration passed: draft isolation, paired service routes, privacy consent, inquiry rate limit and sitemap");
} finally { await db.end(); }
