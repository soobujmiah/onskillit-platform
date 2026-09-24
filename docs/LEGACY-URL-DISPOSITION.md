# Current-site URL inventory and redirect decision policy

Evidence date: 2026-09-24. The [85-URL homepage-link inventory](current-site-link-inventory.csv) is **not** a complete site/CMS/Search Console inventory. At that observation, homepage HEAD was 200, the other 84 same-domain URLs returned 404, and three sampled GET routes returned 404. Public GETs for `/robots.txt`, `/wp-sitemap.xml`, `/sitemap_index.xml`, `/sitemap.xml`, `/wp-json/` and `/wp-json/wp/v2/pages` also returned 404 in a later read-only check. These observations do not establish the server cause or permanent absence of those URLs. No redirect has been implemented.

## Decision rule

A 301/308 needs an owner-verified legitimate old page and a semantically equivalent approved new page. A changed slug with the same offering may qualify; a demo route, unrelated article or obsolete product must not be redirected to the homepage to manufacture SEO continuity. Use 404 for unknown/nonexistent URLs and 410 for confirmed intentionally removed content after owner review. Keep a preserved evidence record before takedown/noindex requests. Do not migrate old code, CMS database or body copy in bulk. Domain cutover, DNS and redirect deployment require separate approval in PHASE-14.

| Old URL / family | Present evidence | Candidate target/action | Approval condition |
|---|---|---|---|
| `/` | 200 public homepage | New PAGE-HOME at `/` | Owner approves new public content |
| `/about-us/`, `/about-us-02/` | Homepage links, HEAD 404; first sampled GET 404 | Conditional 301 to `/about` | Legitimate old content/SEO value and equivalent new about page verified |
| `/contact/` | Homepage link, HEAD/GET 404 | Conditional 301 to `/contact` | Official contact details verified; old URL in index or backlinks |
| `/faqs/` | Homepage link, HEAD 404 | Conditional 301 to `/faq` | Questions genuinely applicable and rewritten |
| `/privacy-policy-2/`, `/term-conditions/` | Homepage links, HEAD 404 | Conditional 301 to `/privacy`, `/terms` | Legal text approved; preserve historical obligations separately |
| `/our-team/`, `/team-grid-02/` | Homepage links, HEAD 404 | Conditional 301 to `/team` for genuine team page only | People/consent and semantic equivalence verified |
| `/blog/` | Homepage link, HEAD 404 | Conditional 301 or canonical continuation to `/blog` | Actual articles approved; no empty archive |
| `/courses/android-app-development/`, `/courses/digital-teacher-training/`, `/courses/wordpress-website-development-course/` | Homepage links, HEAD 404; WordPress course sampled GET 404 | Conditional mapping to PAGE-COURSE-DETAIL or PAGE-PROGRAM-DETAIL | Course actually offered, new record published, old SEO value checked |
| Other `/courses/*`, `/course-category/*` | Mixed demo content, 404 in link inventory | 404 or approved 410; no mass redirect | Classify each URL from CMS/Search Console first |
| `/home-*-tutor/`, `/tut-*/`, layout/pricing/shop/demo product families | Edubin/theme remnants, 404 in inventory | 404 or approved 410 | Confirm not legitimate business history |
| `/programs-01/`, `/programs-02/`, `/program-details/` | Theme-like labels, HEAD 404 | Investigate; conditional semantic mapping only | Real program evidence and indexed value |
| `/esports-betting-guide-for-malaysia-bonuses-payment-methods-mobile-app-security/` | Search result displayed unrelated betting content; direct access previously 404 | Preserve evidence, investigate, then 404/410 and index-removal request as appropriate; **no homepage redirect** | Owner reviews CMS account/revisions/logs and Search Console; cause unknown |
| Any URL absent from homepage crawl | Unknown | Investigate | CMS export, XML sitemap history, Search Console, analytics, backlinks |

## Owner investigation and migration input

Obtain read-only CMS posts/pages/media/redirect exports, Search Console indexed URL and coverage reports, server/access logs where retained, analytics landing pages and backlinks. For each URL capture status by GET, redirect chain, canonical, title/H1, content hash, author/date, traffic/backlinks, business owner, rights, class and disposition. The unrelated article is an **observed indexed content mismatch**; possible explanations include unauthorized publication, old import, SEO spam or search-cache inconsistency, but none is established. Do not claim compromise without authenticated evidence. Preserve audit artifacts privately when they contain account or log details. Final redirect map requires business/SEO/security owner approval before implementation.
