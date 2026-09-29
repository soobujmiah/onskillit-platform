import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// GitHub Actions validates the editorial import pack before a staff editor uses it.
const pack = JSON.parse(readFileSync(new URL("../docs/PHASE-05-CMS-COPY.json", import.meta.url), "utf8"));
assert.equal(pack.status, "editorial_draft");
assert.equal(pack.pages.length, 10);
const expected = new Set(["home", "about", "services", "contact", "faq", "hospital-clinic", "hotel-booking", "ecommerce", "custom-development", "it-training"]);
const seen = new Set();
for (const page of pack.pages) {
  assert(expected.has(page.page_key), `unexpected page ${page.page_key}`);
  assert(!seen.has(page.page_key), `duplicate page ${page.page_key}`);
  seen.add(page.page_key);
  assert.equal(page.kind, page.page_key === "home" ? "landing" : page.category ? "service" : "page");
  for (const locale of ["en", "bn"]) {
    const value = page[locale];
    assert(value && typeof value === "object", `${page.page_key}/${locale} missing`);
    for (const field of ["title", "description", "seoTitle", "seoDescription"]) {
      assert.equal(typeof value[field], "string", `${page.page_key}/${locale}/${field}`);
      assert(value[field].trim(), `${page.page_key}/${locale}/${field} empty`);
      assert(value[field].length <= (field.endsWith("Description") || field === "description" ? 500 : 160));
      assert(locale === "bn" ? !/[A-Za-z]/.test(value[field]) && /[\u0980-\u09ff]/u.test(value[field])
        : !/[\u0980-\u09ff]/u.test(value[field]) && /[A-Za-z]/.test(value[field]), `${page.page_key}/${locale}/${field} script`);
    }
    assert(/^[a-z0-9][a-z0-9-]{0,79}$/.test(value.slug), `${page.page_key}/${locale}/slug`);
    assert(Array.isArray(value.sections) && value.sections.length > 0 && value.sections.length <= 20);
    for (const section of value.sections) {
      assert(["hero", "text", "cta"].includes(section.type));
      assert.equal(section.source, "owner-brief-2026-09-29");
      for (const field of ["heading", "body"]) {
        assert.equal(typeof section[field], "string");
        assert(section[field].trim() && section[field].length <= (field === "heading" ? 160 : 4000));
        assert(locale === "bn" ? !/[A-Za-z]/.test(section[field]) && /[\u0980-\u09ff]/u.test(section[field])
          : !/[\u0980-\u09ff]/u.test(section[field]) && /[A-Za-z]/.test(section[field]), `${page.page_key}/${locale}/${field} script`);
      }
      assert(section.type === "cta" ? /^\/[a-z0-9/-]+$/.test(section.href) : section.href === undefined);
    }
  }
}
assert.deepEqual(seen, expected);
const serialized = JSON.stringify(pack.pages);
assert(!/\[CONFIRM\]|৳|30 days|7 days|working day|office hours/i.test(serialized), "unapproved terms in editorial pack");
console.log("Phase 5 editorial draft passed structure, locale and explicit-approval checks");
