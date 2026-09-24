# SEO, content and current-site transition plan

Status: proposed. Search visibility and current index state must be checked with Search Console and a complete URL export before launch.

## Content model and quality gates

Each public offering has one canonical record with localized title, summary, body, category, outcome, eligibility, delivery mode, price/schedule status, owner, evidence source, review date and publication state. Cards, internal search, detail pages and structured data derive from that record. A page is never published to fill a menu gap. CMS authoring validates no placeholder/demo text, duplicate body, missing media rights/alt text, broken internal link, unsupported claim or incomplete locale. Reviewers see a diff and an approval checklist. Publication events and rollback are audited.

Legacy URL disposition uses owner-approved `keep`, `rewrite`, `301`, `410`, or `investigate`. A 301 requires genuine semantic replacement; unrelated spam should not redirect to the homepage. Preserve search-engine evidence and investigate old CMS records before removal. The old homepage-linked URL inventory is in `current-site-link-inventory.csv`; it is not a complete Search Console or CMS inventory. The unrelated casino article was indexed in a search result but returned 404 by direct request on 2026-09-24. Do not assert compromise or assume it has left the index.

## Technical SEO contract

Public SSR/HTML includes title, description, canonical, robots directive, Open Graph and structured data drawn from real fields. Sitemap contains only published indexable canonical routes. Draft/preview, admin, account, learner, client, internal search and duplicate filter URLs are noindex/non-sitemap. For bilingual pages, use separate stable locale URLs, reciprocal hreflang only when both equivalent translations are published, and locale-specific canonical/metadata. Breadcrumbs reflect hierarchy. Articles identify author/date when verified. Organization/local business/address schema uses partner-confirmed legal facts. Course schema uses actual curriculum and availability. FAQ markup does not guarantee search rich results. Redirects are versioned and tested; 404/410 pages help users recover without serving misleading content.

Performance and accessibility support search and usability: semantic headings, useful link text, image dimensions/alt, stable layout, mobile functionality, fast media, lazy loading below the fold, CDN/cache strategy where justified. Provisional CWV targets are in `SPECIFICATION.md`. Monitor index coverage, duplicate canonicals, broken links, sitemap fetch, structured-data validation, branded/unbranded query trends and lead/enrollment conversion with privacy care. Report dates and source, not only rankings.

## Editorial roles

Subject owner verifies services/courses; editor prepares copy; reviewer approves claims and language; SEO editor checks metadata and linking; publisher makes the approved revision live; security/admin monitors unusual publication. The same person may hold multiple roles only when policy permits. Testimonials, logos, team photos, certificates, metrics and client cases require proof/consent and can be withdrawn. Footer contact/legal attribution requires partner verification. Use natural Bangla, pure English on the English locale, and audited identifier exceptions as described in `SPECIFICATION.md`.

References: [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).
