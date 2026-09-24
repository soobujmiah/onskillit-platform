# Documentation readiness report — 2026-09-24

## Documented and researched

Drafts cover product vision, personas, capability hypothesis, V1/future scope, sitemap, CMS/RBAC/identity, CRM, LMS/TMS/enrollment, payment abstraction, portals, content/SEO, design system and independent motion, domain workflows, conceptual data/API/security architecture, detailed data/API contracts, quality gates, deployment, backups, observability, ADR queue, phased roadmap and requirements matrix. The public site audit records concrete template remnants, duplicate navigation, a dated 85-URL link inventory (84 returned HTTP 404 by HEAD; three sampled GET routes also 404) and an unrelated indexed article. Portfolio source design documentation informed color grading. Official framework and GitHub documentation informed the technology candidates. No application implementation, local build, local test, deployment or migration occurred.

## Decision state

**Confirmed by founding partner:** new original OnSkillIT platform; documentation before implementation; GitHub builds/tests only; public repository with safety precautions; portfolio color grading but independent animation/interaction; exceptionally high design quality; full responsiveness; complete Bangla/English versions with two-way script purity; dark/light toggle; email-or-mobile registration with staff-assisted recovery for mobile-only accounts; request for a proposed service/course catalog; real V1 payments targeting bKash, Nagad and SSLCOMMERZ; eventual use of current domain hosting. **Proposed, not approved:** the specific catalog entries, modular monolith, Next.js/TypeScript, PostgreSQL, typed CMS, `/api/v1`, object-storage adapter, phase sequence, performance and recovery targets. No production architecture, legal-entity name, merchant integration or database selection is final.

## Critical gaps before an implementation green light

1. Name/domain authority is confirmed. Use only “OnSkillIT” publicly until the exact registered legal-entity name is verified; invoices, payment contracts and legal notices require the legal-name gate. Partners must approve the proposed service/course taxonomy, pricing, instructor permissions, certificates and rights to images/testimonials. Candidate offerings are recommendations, not current-business claims.
2. Complete current-site URL/content/security inventory; review of unrelated indexed gambling page and off-domain links. This is an integrity concern, **not** proof of compromise.
3. Registration policy is confirmed as email **or** mobile. Staff-assisted mobile-only reset is confirmed in principle; the identity-proofing, privacy, staffing and escalation procedure still needs security/partner approval before launch.
4. Payment/tax/refund/legal policy and provider availability, if live collection is V1.
5. Current domain hosting is intended for production later, but its Node/database/worker/resource capabilities and budget are unverified. Translation staffing/review, data retention/privacy obligations and client portal V1 tasks also need confirmation. Both Bangla and English are confirmed for launch.
6. Usability and visual concept review with real content on mobile, including Bangla and accessibility; full responsive task matrix at 320–1920+ CSS px. Portfolio live interaction could not be visually audited with current web tool.
7. Technology ADRs, database/API schemas and detailed acceptance cases need partner review after gaps 1–6. The current architecture is conceptual, not production-ready.

## Recommended next phase and exact starting point

Continue Phase 0. Founding partners should answer the open questions in the specification and provide read-only business/content inventories. Then complete a URL-by-URL audit, create original UX wireframes and visual concepts, validate the domain model and technology ADRs, and sign off the requirements matrix. Only after that approval should Phase 1 start with repository CI and an empty application foundation. First implementation slice: account/RBAC/audit plus a single approved CMS page workflow, with GitHub CI proving it. No production deployment in that slice.

## Open decision register

| Decision | Owner evidence needed | Gate |
|---|---|---|
| Final technology/database/hosting | current domain-host capability report, budget, team skills | founding partners |
| Recovery proofing procedure | acceptable evidence, retention and support staffing | security/partners |
| Payment/finance | provider contract, taxes, refund policy | partners/legal |
| Content publication and certificates | named approvers, issuer policy, evidence | partners |
| Public repository license | intended reuse/contribution terms | owner |
| Production domain/migration | verified old URL inventory and release plan | owner |

This report is **not a declaration of full documentation readiness**. It identifies the remaining research and decisions required by the original request before architecture can be locked or development authorized.
