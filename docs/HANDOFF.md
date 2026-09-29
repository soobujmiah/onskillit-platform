# OnSkillIT canonical agent handoff

Updated: 2026-09-29 (Asia/Dhaka). **This file is the canonical cross-agent handoff in this repository.** Recheck Git, GitHub CI and dated external facts before acting; source and current CI evidence outrank this snapshot.

## State and source of truth

- Public repository: `soobujmiah/onskillit-platform`, default branch `main`; local checkout `/home/sbj/onskillit-platform-docs` has the verified `origin` remote. Use a fresh branch from current `main` for new work.
- PHASE-00 through PHASE-03 are **COMPLETE**. PHASE-03 IDENTITY VERIFIED passed after [gate-closure Identity CI](https://github.com/soobujmiah/onskillit-platform/actions/runs/36562919856), all nine PR checks at `5f21544`, synthetic browser screenshots and the founding partner's 2026-09-29 instruction to complete PHASE-03 before PHASE-04. [PR #14](https://github.com/soobujmiah/onskillit-platform/pull/14) merged as `0428cfb`; [post-merge Identity CI](https://github.com/soobujmiah/onskillit-platform/actions/runs/36565770895) and the other `main` checks passed. [PHASE-03-WORKLOG](PHASE-03-WORKLOG.md) has the detailed evidence and boundaries.
- PHASE-04 PUBLISHING CORE VERIFIED **PASSED** on synthetic GitHub evidence in [PR #15](https://github.com/soobujmiah/onskillit-platform/pull/15). Source commit `53954c5` passed all ten PR checks, including [CMS integration/browser run 36570696266](https://github.com/soobujmiah/onskillit-platform/actions/runs/36570696266), migration, identity, locale, web and deploy smoke. The six Phase 4 staff routes are CI-verified. Final gate documentation and merge verification follow this source evidence. PHASE-05 through PHASE-15 are NOT STARTED. Public business pages belong to PHASE-05. See [PHASES](PHASES.md), [PAGES](PAGES.md), [API-CONTRACT](API-CONTRACT.md), [DATA-MODEL](DATA-MODEL.md) and [TRACEABILITY](TRACEABILITY.md).
- The owner declined `main` branch protection during PHASE-01; do not enable it without a new instruction.

## Delivered and remaining boundaries

- PHASE-01 established the Next.js runtime, database-aware health endpoint, reviewed SQL migration pipeline, worker, OCI smoke and GitHub CI. PHASE-02 established bilingual routing, theme, design tokens and browser/locale checks. PHASE-03 delivered identity migration/API, bilingual account and staff pages, scoped RBAC, append-only audit, reviewed operator bootstraps, OpenAPI, and synthetic PostgreSQL/mail/browser CI.
- No real owner grant, external SMTP delivery, production deployment, production data migration or change to `onskillit.com` occurred. Mobile-only recovery remains deferred and disabled. The protected operator context must authenticate the operator and retain independent approval before any live owner bootstrap; those scripts are never HTTP routes or migration seeds.
- A live public preview/staging host still needs owner selection and environment configuration. GitHub browser CI currently supplies synthetic screenshots, not a shareable site. A full manual accessibility pass remains a later cross-system gate.

## Exact continuation order

1. Verify the Phase 4 gate-documentation commit in GitHub, merge PR #15 after checks pass, and confirm `main` post-merge checks. Then begin PHASE-05 public core on a fresh branch using owner-verified content and the existing CMS contracts.
2. Keep real content claims, external mail, preview hosting and production/domain changes at their respective gates. Never place credentials or private records in this public repository.
