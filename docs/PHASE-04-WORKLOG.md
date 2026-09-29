# PHASE-04 work log — CMS and publishing core

Current phase: **IN PROGRESS**. Gate: **PUBLISHING CORE VERIFIED OPEN**. Branch `phase-04/cms-core` starts at Phase 3 merge `0428cfba56cfe0e77f4f15f82c425da9a6864ce9`. No public business page or live content is authorized by this phase.

| Field | Value |
|---|---|
| Current phase / gate | PHASE-04 / PUBLISHING CORE VERIFIED (open) |
| Task | Build typed, localized CMS publishing workflows and six staff pages |
| Modules | CMS, media, navigation, SEO, site settings, audit |
| Page IDs | ADMIN-CMS-PAGES, ADMIN-CMS-EDITOR, ADMIN-NAVIGATION, ADMIN-MEDIA, ADMIN-SEO, ADMIN-SITE-SETTINGS |
| Requirements | R03, R04, R05 partial, R13 partial, R15 partial; R16/R19/R20; R17 CI |
| Dependencies | PHASE-03 IDENTITY VERIFIED passed; owner/staff RBAC and audit are available |
| Acceptance | Immutable revisions, distinct review, permissioned publish/rollback/archive, locale completeness, safe typed sections, isolated noindex preview, private media/MIME/rights, scoped navigation/settings/SEO, audit, bilingual responsive staff UI, reviewed SQL up/down migration, OpenAPI and GitHub CI |

Design uses the approved Phase 2 token system. The Superdesign CLI login timed out on 2026-09-29, so the staff UI is implemented with the repository design system. Synthetic browser screenshots will be attached to GitHub CI. This branch does not deploy to a public host.

## GitHub evidence

The first [CMS run 36566863812](https://github.com/soobujmiah/onskillit-platform/actions/runs/36566863812) on `aeeaf04` failed at TypeScript: multipart fields and validated content were not narrowed across a transaction callback. The first Web run failed at the React effect lint rule. These are source-level CI defects; a follow-up commit fixes them and adds the OpenAPI contract and synthetic CMS integration. Final-head evidence remains pending. GitHub-only builds and tests are required; no local build/test results may pass the gate.

- All PR checks passed on `a9af6e9`, including [CMS run 36567295326](https://github.com/soobujmiah/onskillit-platform/actions/runs/36567295326): reviewed SQL migration up/down/reapply, OpenAPI validation, TypeScript, build and synthetic security/publishing integration. The follow-up browser/UI and documentation changes need final-head checks.
- The API exercises role denial, CSRF, version conflicts, distinct review/publish, locale completeness, immutable revision, rollback stability, private/public media, MIME rejection, preview isolation, navigation/settings/redirects and audit. Browser tests now cover all six staff pages in both locales at 320 px with axe checks and synthetic screenshots.
