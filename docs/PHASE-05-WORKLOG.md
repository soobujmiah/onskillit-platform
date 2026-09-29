# PHASE-05 work log — public business site

Current phase: **IN PROGRESS**. Gate: **PUBLIC CORE VERIFIED OPEN**. Source work starts from `main` at `74a91a3` on branch `phase-05/public-core`. No Phase 5 page, service, inquiry, or legal copy is published on the production domain by creating this branch.

| Field | Value |
|---|---|
| Current phase / gate | PHASE-05 / PUBLIC CORE VERIFIED (open) |
| Task | Build the bilingual public core, published-only service catalog, inquiry intake, and SEO baseline |
| Modules | Public frontend, CMS delivery, Service, Inquiry, SEO |
| Page IDs | PAGE-HOME, PAGE-ABOUT, PAGE-SERVICES, PAGE-SERVICE-DETAIL, PAGE-CONTACT, PAGE-FAQ, PAGE-PRIVACY, PAGE-TERMS, PAGE-ACCESSIBILITY |
| Requirements | R05, R09, R13, R14, R16, R19, R20; R17 for CI |
| Dependencies | PHASE-02 EXPERIENCE FOUNDATION VERIFIED and PHASE-04 PUBLISHING CORE VERIFIED passed |
| Acceptance | Published-only bilingual rendering, no invented offerings or legal claims, two-theme responsive pages, semantic navigation, abuse-controlled inquiry, published-only metadata and sitemap, GitHub CI evidence |

## Publication inputs

I supplied exact **confirmed contact details** and a broader **draft content brief** on 2026-09-29; its classification and review needs are recorded in [PHASE-05-CONTENT-DRAFT](PHASE-05-CONTENT-DRAFT.md). The brief did not approve business/service claims or any policy for publication. Proposed offerings in `OFFERINGS.md` are not public facts. Public routes show a clear unpublished state and stay `noindex` until their CMS records are approved and published. The inquiry form is disabled until a privacy notice is published. Production indexing and domain cutover remain separate owner gates.

## Source and verification

The branch includes SQL pair `0004_public_core`, a published-only CMS reader, nine public route templates, a rate-limited inquiry endpoint, conditional sitemap/robots, bilingual content states and Hind Siliguri. The exact paths and requirement links are in [TRACEABILITY](TRACEABILITY.md). I used the approved Phase 2 token system for the UI; the Superdesign login session opened but expired without authorization, so no canvas draft or visual approval is claimed.

The first [Public Core run 36605215028](https://github.com/soobujmiah/onskillit-platform/actions/runs/36605215028) on `cd91a70` failed because the synthetic test counted an unavailable-privacy attempt outside the limiter, while the endpoint counted it. Browser checks in the earlier shell, identity and CMS workflows also found duplicate unlabeled navigation landmarks and old home/tab-order expectations. I corrected the test and navigation. On `7ef718d`, all eleven draft PR checks passed, including [Public Core 36606061038](https://github.com/soobujmiah/onskillit-platform/actions/runs/36606061038), [Identity 36606061114](https://github.com/soobujmiah/onskillit-platform/actions/runs/36606061114), [CMS 36606061052](https://github.com/soobujmiah/onskillit-platform/actions/runs/36606061052), and [locale/browser 36606061223](https://github.com/soobujmiah/onskillit-platform/actions/runs/36606061223). These are synthetic GitHub checks; a subsequent documentation/security refinement still needs final-head CI.

Final source commit `da963f4` passed all eleven [PR checks](https://github.com/soobujmiah/onskillit-platform/pull/17/checks), including [Public Core 36607281415](https://github.com/soobujmiah/onskillit-platform/actions/runs/36607281415), [Identity 36607281433](https://github.com/soobujmiah/onskillit-platform/actions/runs/36607281433), [CMS 36607281537](https://github.com/soobujmiah/onskillit-platform/actions/runs/36607281537), [locale/browser 36607281655](https://github.com/soobujmiah/onskillit-platform/actions/runs/36607281655), web build, migrations, documentation, repository checks and deploy smoke. Nine Phase 5 page templates are **CI-VERIFIED for synthetic source behavior**, not released. No local build or test has been run.

The phase gate remains **OPEN** because business and legal content lacks publication approval, a shareable preview host is unselected, manual visual/content review is outstanding, and the final documentation commit needs its own CI evidence. No production deployment, data migration or domain change occurred.
