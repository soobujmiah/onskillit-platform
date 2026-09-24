# Phase 0 risk register

Reviewed 2026-09-24. Probability is a planning estimate or **UNKNOWN** where evidence is missing; impact is potential project impact, not a claim that an event occurred. Owners are roles to assign, not named people. Status values: OPEN, MITIGATING, EVIDENCE PENDING. Review at every ADR and release gate.

| ID | Risk | Probability | Impact | Mitigation / evidence gate | Owner role | Status |
|---|---|---|---|---|---|---|
| K01 | Old site broken routes and unrelated indexed content | Observed issue; cause UNKNOWN | High | CMS/Search Console/log review, preserve evidence, approved redirect/410 map; no compromise claim | Domain owner/security | EVIDENCE PENDING |
| K02 | Demo content mistaken for real offering | High | High | Approved catalog, delivery proof and CMS publication checklist | Business owner/editor | OPEN |
| K03 | Current hosting cannot run selected app/database/worker reliably | UNKNOWN | Critical | Account-plan report, Namecheap support confirmation and GitHub-built staging proof | Technical owner | EVIDENCE PENDING |
| K04 | Legal issuer/merchant eligibility insufficient for live payment | UNKNOWN | Critical | Registered entity, provider contracts, tax/refund/legal review | Founding partners/finance | EVIDENCE PENDING |
| K05 | Unverified email/mobile or assisted recovery abused | High | High | Rate limits, assurance states, trained restricted support, proofing and second approval | Security owner | OPEN |
| K06 | Multiple payment methods diverge or fail reconciliation | Medium | High | Provider adapters, normalized ledger, idempotent callbacks and daily reconciliation | Finance/technical | OPEN |
| K07 | Bilingual/theme content drifts or script purity fails | High | High | Locale parity, native review, both-theme CI and editorial gate | Content/design | OPEN |
| K08 | Broad V1 CMS scope produces unsafe publishing | Medium | High | Typed blocks, rights/source approval, revision/rollback and anomaly monitoring | CMS owner | OPEN |
| K09 | LMS curriculum/progress/assessment inconsistent | Medium | High | Frozen editions, LearningAccess, grade events and domain tests | Learning owner | OPEN |
| K10 | TMS capacity, timetable or attendance conflict | Medium | High | Transactional seats, schedule constraints, correction history | Training owner | OPEN |
| K11 | CRM/client scope leaks staff notes or another account | Medium | Critical | Account-scoped projection and negative authorization tests | CRM/security | OPEN |
| K12 | Performance falls below mobile targets | Medium | High | SSR/cache/media strategy, realistic low-end device and CWV staging evidence | Frontend/operations | OPEN |
| K13 | SEO duplicates or indexes drafts/unrelated pages | High | High | Canonical records, sitemap/noindex gate, redirects and Search Console review | SEO/editorial | OPEN |
| K14 | Old implementation/data migration contaminates new platform | Medium | High | No bulk migration; owner-approved selective content/URL plan | Product/SEO | OPEN |
| K15 | Private student/client media or secrets exposed via public repo/cache | Medium | Critical | Private storage, protected CI, secret scan, scope/cache tests | Security/operations | OPEN |
| K16 | Backup exists but restore or rollback fails | Medium | Critical | Offsite encrypted backup, dated isolated restore and rollback drill | Operations | OPEN |
| K17 | Agent handoff changes phase/page scope or drifts docs | Medium | High | PHASES/PAGES canonical, ADR change control, GitHub docs checker and PR review | Maintainers | MITIGATING |
| K18 | Deployment/cutover fails or current host cannot receive artifact | UNKNOWN | Critical | Plan/deploy proof, staging, protected environment and owner cutover gate | Release owner | EVIDENCE PENDING |
| K19 | Third-party provider or dependency changes terms/API | Medium | High | Versioned adapter, official-doc monitoring, contract tests and exit path | Technical/finance | OPEN |
| K20 | Rights/accreditation or certificate claims are unsupported | UNKNOWN | High | License/consent register, NSDA/BTEB claim review and partner/legal sign-off | Business/legal | EVIDENCE PENDING |
| K21 | Visual ambition reduces usability/accessibility | Medium | High | Original concept review, WCAG/mobile task checks, reduced motion | Design/product | OPEN |
| K22 | Observability/incident ownership inadequate at launch | Medium | High | Redacted logs, alert routing, on-call/incident runbook and staging exercise | Operations | OPEN |

Open owner questions and evidence are tracked in [READINESS.md](READINESS.md), [OFFERINGS.md](OFFERINGS.md), [LEGAL-IDENTITY.md](LEGAL-IDENTITY.md) and [HOSTING-CAPABILITY.md](HOSTING-CAPABILITY.md). No risk is closed merely because a control has been designed.
