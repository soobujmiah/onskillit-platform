# Public sitemap and navigation projection

[PAGES.md](PAGES.md) owns page IDs, template counts, phase assignments and route patterns. This file is the public URL/navigation projection only. Every published page has complete approved English and Bangla content; locale URL format is an open ADR. Public routes are proposals until real content/legal text is approved. No draft, private, auth or staff URL enters XML sitemap. Dynamic records create URLs only when published and indexable.

| Section | Page IDs / route templates | Navigation | Phase |
|---|---|---|---|
| Home | PAGE-HOME `/` | Primary | 05 |
| Organization | PAGE-ABOUT `/about`; PAGE-TEAM `/team` | About; team when approved | 05; 11 |
| Services | PAGE-SERVICES `/services`; PAGE-SERVICE-DETAIL `/services/{slug}` | Primary | 05 |
| Learning | PAGE-COURSES `/courses`; PAGE-COURSE-DETAIL `/courses/{slug}` | Primary | 06 |
| Training | PAGE-PROGRAMS `/programs`; PAGE-PROGRAM-DETAIL `/programs/{slug}`; PAGE-BATCH-DETAIL `/training/batches/{slug}` | Primary/program flow | 07 |
| Work | PAGE-PORTFOLIO `/portfolio`; PAGE-PROJECT-DETAIL `/portfolio/{slug}` | Primary only with approved cases | 11 |
| Insights | PAGE-BLOG `/blog`; PAGE-ARTICLE `/blog/{slug}` | Primary only with approved articles | 11 |
| Help/contact | PAGE-FAQ `/faq`; PAGE-CONTACT `/contact` | Footer and CTA | 05 |
| Policies | PAGE-PRIVACY `/privacy`; PAGE-TERMS `/terms`; PAGE-ACCESSIBILITY `/accessibility` | Footer | 05 |

Public account entry links to AUTH-SIGN-IN and AUTH-REGISTER, but those routes are noindex and excluded from XML sitemap. FUT-CAREERS and FUT-INSTRUCTOR-DETAIL are reserved and absent until PHASE-15 approval. All public detail URLs derive from one canonical localized record; duplicate headings/body copy and arbitrary CMS paths are prohibited. The final old-to-new redirect map requires the complete old-site URL inventory and owner approval. The current-site audit is [SITE-AUDIT.md](SITE-AUDIT.md).
