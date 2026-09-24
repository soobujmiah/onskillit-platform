# Phase 0 documentation readiness — 2026-09-24

**State: IN PROGRESS. Gate: DOCUMENTATION READY has not passed.** This document tracks evidence and unresolved decisions; [PHASES.md](PHASES.md) owns the gate definition and [PAGES.md](PAGES.md) owns routes/phase assignments. No application development is authorized.

## Architecture status

The canonical proposed lifecycle now has PHASE-00 through PHASE-15. V1 has 74 page templates: 19 public (6 dynamic detail templates), 4 authentication, 13 student/user, 6 client, 29 admin and 3 system. Five additional templates are reserved for PHASE-15. Every V1 template has exactly one owning implementation phase. [SITEMAP.md](SITEMAP.md) projects public routes; [TRACEABILITY.md](TRACEABILITY.md) maps R01–R20 and every V1 page. [ROADMAP.md](ROADMAP.md) is a summary, not another sequence. ADR 0005 proposes this governance but awaits owner approval.

## Phase 0 evidence checklist

| Requirement | Current evidence / state | Gate disposition |
|---|---|---|
| Business discovery and present site audit | `SPECIFICATION.md`, `SITE-AUDIT.md`, dated link inventory; incomplete authenticated/Search Console audit | OPEN |
| Verified offerings and rights | Candidate taxonomy only; real catalog, instructors, prices, media rights unverified | OWNER DECISION REQUIRED |
| Legal identity | Domain/name authority confirmed; registered invoice/legal entity unknown; use OnSkillIT brand only | OWNER DECISION REQUIRED |
| Hosting/runtime capability | Current domain host intended later; Node/database/worker/storage/budget unverified | EXTERNAL DEPENDENCY |
| Payment providers | bKash/Nagad/SSLCOMMERZ researched conceptually; merchant eligibility, contract, refund/tax policy unknown | EXTERNAL DEPENDENCY / OWNER DECISION |
| Authentication/RBAC/CMS/CRM/LMS/TMS/enrollment/SEO/security | Conceptual architecture in existing docs; final ADRs and acceptance contracts pending | OPEN |
| Database/API architecture | Conceptual models/contracts exist; physical schemas and approved endpoint contracts pending | OPEN |
| Design/brand/UX | Portfolio color grading documented; independent motion, bilingual purity, theme/responsive specifications exist; original visual prototype/usability review pending | OPEN |
| Canonical sitemap and page inventory | `SITEMAP.md`, `PAGES.md`; route inventory internally mapped, business content still conditional | DRAFT COMPLETE |
| Phase architecture and gates | `PHASES.md`; ADR 0005 owner approval pending | DRAFT COMPLETE |
| Traceability/risk/quality/CI/deploy/backup/observability/agent workflow | Existing docs plus revised traceability and GitHub documentation checker; operational targets and host fit pending | OPEN |
| Cross-document and GitHub check | Automated docs checker must pass on GitHub commit; manual review must resolve contradictions | PENDING CI |
| SKB return | Durable milestone to be returned after project commit, with source SHA | PENDING |

## Material open decisions

- **OWNER DECISION REQUIRED:** approve actual service/course catalog and public claims; legal entity, privacy/terms, pricing/tax/refund/certificate policy, client portal visible scope, recovery proofing, design concepts, key stack/auth/database/payment/deployment ADRs, and this phase/page governance.
- **EXTERNAL DEPENDENCY:** current-host capability evidence, merchant agreements/sandbox, Search Console/CMS inventory, content/media rights and translation review resources.
- **UNKNOWN:** cause and full extent of unrelated indexed current-site content; complete old URL redirect disposition; actual hosting capacity and operating budget.
- **BLOCKED:** no Phase 1 start until DOCUMENTATION READY gate and required owner approvals; no production launch without separate PHASE-14 approval.

## Exact next step

Review the new phase/page registers and ADR 0005 with the founding partners while completing the verified catalog and hosting/merchant evidence. Commission original bilingual mobile UX concepts using an appropriate design tool, validate real content and accessibility, then approve physical data/API and key architecture ADRs. Run the documentation checker in GitHub CI and reconcile any failure. When every Phase 0 gate item is evidenced and signed off, change the phase state through READY FOR GATE and GATE PASSED; only then begin PHASE-01 GitHub foundation. No local build/test or production change.
