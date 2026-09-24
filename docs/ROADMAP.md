# Development roadmap and milestone gates

Status: **proposed sequence**, subject to business/technical ADR approval. Phase 0 is in progress; phases 1–8 are not authorized implementation yet. Each phase produces a vertically usable slice and updates specification, ADRs, traceability, security/operations and handoff in the same PR. GitHub Actions/Codespaces provide all builds/tests.

| Phase | Deliverable | Exit evidence |
|---|---|---|
| 0 Research and decisions | verified business catalog, full old-site inventory, UX concept, approved requirements/ADRs, host/merchant capability | founding-partner documentation readiness sign-off |
| 1 Foundation | chosen stack repository structure, CI, preview/staging, database migrations, design token seed | GitHub clean build, migration/preview smoke, no secrets in public repo |
| 2 Identity and governance | registration/login/reset, session, roles/scopes, audit, staff shell | permission matrix, recovery procedure review, CI auth/security tests |
| 3 CMS and public core | typed page builder, media, service catalog, bilingual/theme shell, SEO baseline | editor publish/rollback, locale/theme/responsive gates, published-only sitemap |
| 4 Learning core | course editions, lessons, resources, student/instructor portals, assessment/progress | real curriculum test fixtures, progress and grade-scope CI evidence |
| 5 Training and enrollment | programs, batches, sessions, capacity, attendance, transfers, certificates per policy | concurrent capacity, schedule, attendance and eligibility evidence |
| 6 Client and finance | leads/accounts/activities, service engagement, invoices, online/offline payments, refunds/reconciliation | cross-client isolation; each contracted gateway sandbox end-to-end; finance audit |
| 7 Content and experience completion | approved blog/portfolio/team, search, notices, analytics, client portal scope, full design polish | real-content review; all P0/P1 routes/states in two languages/themes/viewports |
| 8 Hardening and release | security, performance, backup restore, incident/runbook, redirects, staging sign-off | GitHub checks, restore/rollback drill, merchant live validation, partner production approval |

Phase ordering can change if dependencies require it. V1 **includes** LMS, TMS, enrollment, CRM/client management, multi-admin CMS and real payments; placing them in later phases does not defer them beyond first production release. Do not deploy production from an incomplete middle phase. Use synthetic data in preview; no current-site migration until a separate approved plan. The exact first implementation slice after Phase 0 is an approved repository/CI skeleton followed by identity/RBAC/audit and one reviewed CMS page flow, not a random homepage component.

## Milestone acceptance and handoff

Each milestone has: owner, requirement IDs, ADRs, changed source/schema/API/UI, acceptance criteria, GitHub workflow/run/commit, defects, security/privacy review, updated docs and rollback path. A phase cannot be marked complete because files exist; it needs working behavior and evidence. Physical/production claims require evidence from the actual target environment. At handoff, the next agent reads repository HEAD and documentation, not conversation memory.

## Phase 0 decision order

1. Partners validate public brand/legal/entity and an initial set of actual services/courses with owners, instructors, prices and rights.
2. Owner-provided CMS/Search Console/hosting/merchant read-only evidence completes site, deployment and payment research.
3. Original design prototype validates portfolio-derived grading, independent interaction, Bangla/English, dark/light, accessibility and responsive matrix.
4. Domain schema/API/security/payment/hosting ADRs are compared against real workflows and approved.
5. Requirements matrix and readiness report are reviewed for gaps/contradictions and signed off.

The plan is intentionally ambitious; each V1 module must be coherently usable in real operations rather than present only as a navigation item.
