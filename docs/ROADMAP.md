# Execution roadmap

[PHASES.md](PHASES.md) is the sole canonical phase register, dependency graph and gate definition. This page is a human-readable projection; changing it alone cannot change project scope. PHASE-00 through PHASE-02 gates passed. PHASE-03 is in progress with its IDENTITY VERIFIED gate open; see [PHASE-03-WORKLOG](PHASE-03-WORKLOG.md).

```mermaid
flowchart LR
A[00 Discovery] --> B[01 Foundation] --> C[02 Design/localization] --> D[03 Identity/RBAC]
D --> E[04 CMS] --> F[05 Public core]
E --> G[06 LMS] --> H[07 TMS] --> I[08 Enrollment/finance]
E --> J[09 CRM]
F --> J
I --> K[10 Portals]
J --> K
F --> L[11 Content/operations]
K --> L --> M[12 Hardening] --> N[13 QA/staging] --> O[14 Launch/stabilization] --> P[15 Evolution]
```

| Phase | Milestone |
|---|---|
| PHASE-00 | Discovery and documentation |
| PHASE-01 | GitHub foundation |
| PHASE-02 | Design and localization shell |
| PHASE-03 | Identity, RBAC and audit |
| PHASE-04 | CMS and publishing core |
| PHASE-05 | Public business site |
| PHASE-06 | LMS and course catalog |
| PHASE-07 | TMS and training catalog |
| PHASE-08 | Enrollment and finance |
| PHASE-09 | CRM and client operations |
| PHASE-10 | Student and client portals |
| PHASE-11 | Content and business operations |
| PHASE-12 | Cross-system hardening |
| PHASE-13 | Integrated QA and staging |
| PHASE-14 | Production launch and stabilization |
| PHASE-15 | Governed evolution |

Parallel preparation is possible after the CMS gate: the LMS/TMS track and CRM track have separate domain work. The CRM gate also requires the public inquiry intake from PHASE-05. Their integration meets at portals and operations. The dependency graph in PHASES.md, not this display order, governs when work may start. V1 includes all P0/P1 modules through PHASE-14; PHASE-15 contains reserved future work. Every page's implementation phase is in [PAGES.md](PAGES.md), and every requirement's chain is in [TRACEABILITY.md](TRACEABILITY.md).

Milestone handoff: record owner role, requirement/page IDs, ADRs, changed source/schema/API, acceptance criteria, GitHub workflow/run/commit, defects, security/privacy review, docs and rollback path. A phase cannot pass because documents or navigation stubs exist; it needs its gate evidence. Physical and production claims require evidence from the target environment. No local builds or tests.

## Immediate work

Complete PHASE-03 identity/RBAC/audit source, synthetic GitHub CI, browser checks and review; reconcile the deferred mobile-only recovery boundary. Keep the gate open until evidence and founding-partner sign-off. PHASE-04 CMS follows the PHASE-03 gate. Production deployment remains a later phase.
