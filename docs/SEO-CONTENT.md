# SEO, content and current-site transition plan

Status: **accepted architecture under ADR 0009; content and redirect release evidence remain pending**. Search visibility and current index state must be checked with Search Console and a complete URL export before launch.

## Content model and quality gates

Each public offering has one canonical record with localized title, summary, body, category, outcome, eligibility, delivery mode, price/schedule status, owner, evidence source, review date and publication state. Cards, internal search, detail pages and structured data derive from that record. A page is never published to fill a menu gap. CMS authoring validates no placeholder/demo text, duplicate body, missing media rights/alt text, broken internal link, unsupported claim or incomplete locale. Reviewers see a diff and an approval checklist. Publication events and rollback are audited.

Legacy URL disposition uses owner-approved `keep`, `rewrite`, `301`, `410`, or `investigate`. A 301 requires genuine semantic replacement; unrelated spam should not redirect to the homepage. Preserve search-engine evidence and investigate old CMS records before removal. The old homepage-linked URL inventory is in `current-site-link-inventory.csv`; it is not a complete Search Console or CMS inventory. The unrelated casino article was indexed in a search result but returned 404 by direct request on 2026-09-24. Do not assert compromise or assume it has left the index.

## Technical SEO contract

Public SSR/HTML includes title, description, canonical, robots directive, Open Graph and structured data drawn from real fields. Sitemap contains only published indexable canonical routes. Draft/preview, admin, account, learner, client, internal search and duplicate filter URLs are noindex/non-sitemap. For bilingual pages, use separate stable locale URLs, reciprocal hreflang only when both equivalent translations are published, and locale-specific canonical/metadata. Breadcrumbs reflect hierarchy. Articles identify author/date when verified. Organization/local business/address schema uses partner-confirmed legal facts. Course schema uses actual curriculum and availability. FAQ markup does not guarantee search rich results. Redirects are versioned and tested; 404/410 pages help users recover without serving misleading content.

Performance and accessibility support search and usability: semantic headings, useful link text, image dimensions/alt, stable layout, mobile functionality, fast media, lazy loading below the fold, CDN/cache strategy where justified. Provisional CWV targets are in `SPECIFICATION.md`. Monitor index coverage, duplicate canonicals, broken links, sitemap fetch, structured-data validation, branded/unbranded query trends and lead/enrollment conversion with privacy care. Report dates and source, not only rankings.

## Editorial roles

Subject owner verifies services/courses; editor prepares copy; reviewer approves claims and language; SEO editor checks metadata and linking; publisher makes the approved revision live; security/admin monitors unusual publication. The same person may hold multiple roles only when policy permits. Testimonials, logos, team photos, certificates, metrics and client cases require proof/consent and can be withdrawn. Footer contact/legal attribution requires partner verification. Use natural Bangla, pure English on the English locale, and audited identifier exceptions as described in `SPECIFICATION.md`.

References: [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

## Canonical page-to-SEO policy review

[PAGES.md](PAGES.md) owns routes; [SITEMAP.md](SITEMAP.md) owns the public projection. `PAGE-*` routes are indexable only with approved, published, locale-complete content and a canonical URL. Six dynamic public templates derive metadata and structured data from their single source record. `AUTH-*`, `USER-*`, `CLIENT-*`, `ADMIN-*`, `SYS-*`, internal search/filter query variants and previews are noindex and omitted from XML sitemaps. FUT-* routes are absent until a separate release gate. Empty/unverified offer pages must not enter sitemap merely because templates exist.

| Page group | Structured data if true and visible | Internal links |
|---|---|---|
| PAGE-HOME/ABOUT/CONTACT | Organization only after legal identity/contact approval; avoid invented LocalBusiness facts | Verified service/course/program paths |
| PAGE-SERVICES and SERVICE-DETAIL | Service only for approved actual scope/provider | Service category → detail → contact |
| PAGE-COURSES and COURSE-DETAIL | Course only for approved curriculum, instructor and availability | Catalog → detail → program/batch/enrollment when real |
| PAGE-PROGRAMS/PROGRAM-DETAIL/BATCH-DETAIL | Appropriate Course/Event facts only where schema fits actual offering and schedule | Program → batch → enrollment |
| PAGE-PORTFOLIO/PROJECT-DETAIL/TEAM | No unsupported client/person claims | Case → relevant service; team → approved case/course |
| PAGE-BLOG/ARTICLE/FAQ | Article and Breadcrumb where facts match; FAQ markup only when eligible and useful | Article → canonical offer/resource |
| PAGE-PRIVACY/TERMS/ACCESSIBILITY | Basic metadata; legal content owner-approved | Footer |

Use stable English and Bangla URLs with self-canonical per language and reciprocal `hreflang` only when equivalent approved translations exist; the canonical locale prefixes are `/en/` and `/bn/` under ADR 0009. CMS controls title, description, Open Graph image, canonical override with review, robots directive, redirects, alt text and structured-data source fields. Pagination has distinct crawlable URLs only where content quality merits indexing; filter/search variants are noindex and canonicalized per approved policy. `robots.txt` is crawl guidance, not privacy control. Technical validation includes HTTP status, redirect chain, sitemap canonical equivalence, schema-vs-visible-claims, social previews, mobile CWV and broken links. The candidate legacy dispositions are in [LEGACY-URL-DISPOSITION.md](LEGACY-URL-DISPOSITION.md). No redirect is implemented during Phase 0.

## Accepted locale and publication contract — ADR 0009

Public canonical routes use `/en/` and `/bn/` prefixes over the existing PAGES route templates; this does not create additional templates. Root selects a preferred locale without treating one language as the other's canonical. Each published translation has a self-canonical URL, language-specific metadata and reciprocal hreflang only when both versions exist. Dynamic slugs are unique per locale/type and point to the same record identity. Private, staff, preview, search/filter and unpublished routes are noindex and excluded from XML sitemaps. CMS publication refuses unsupported Organization, Service, Course, Article or Breadcrumb schema facts. Verified legacy redirects require explicit owner sign-off at cutover; unrelated content has no automatic homepage redirect.
