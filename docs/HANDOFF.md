# OnSkillIT canonical agent handoff

Updated: 2026-09-28 (Asia/Dhaka, per this session's actual system clock — see the calendar note under Confidence). Session: Claude Code, PHASE-01 close-out and gate decision. **This file is the canonical cross-agent handoff in this repository.** Recheck Git, GitHub CI and dated external facts before acting; the repository and its current CI evidence outrank this snapshot.

## State and source of truth

- Repository: public `soobujmiah/onskillit-platform`, default branch `main`. Local checkout: `/home/sbj/onskillit-platform-docs`; remote `origin` points to `https://github.com/soobujmiah/onskillit-platform.git`.
- **PHASE-01 is COMPLETE. FOUNDATION VERIFIED gate PASSED**, under the founding partner's explicit in-session instruction after this session presented full GitHub CI evidence (all six checks green on `main`) and a security-advisory close-out. Recorded in [PHASES.md](PHASES.md). PHASE-02 is the next phase and is **NOT STARTED** as of this handoff — a later session may have already begun it; check `git log`/`gh pr list` before assuming this file is current.
- `main`'s head as of this note: `d5398bb` (an automated `Repo Knowledge Sync` commit; the last substantive commit is `abfde44`). All CI (`Documentation architecture`, `Foundation`, `Database`, `Container`, `Repo Knowledge Sync`, `Repository State Contract`) is green on it. `main` now carries the PHASE-01 application scaffold — it is no longer documentation-only.
- **[PR #7](https://github.com/soobujmiah/onskillit-platform/pull/7) is merged** (merge commit `be5b1b6`), with the owner's explicit go-ahead after CI was confirmed green. `main` branch protection was explicitly asked about and **declined for now** by the owner — don't enable it without asking again, and don't assume "declined once" means "declined forever."

## PHASE-01 summary (full detail in [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md))

Two sessions. Session 1 (2026-09-25, Codex) audited the repo, found it documentation-only, and built the initial Next.js/TypeScript/React web-runtime shell, `SYS-NOT-FOUND`/`SYS-ERROR` pages, process-liveness health endpoint, and basic lint/typecheck/build/smoke CI. Session 2 (this session) closed every item that session 1 flagged as missing against the PHASES.md PHASE-01 contract:

- **Migration baseline:** `src/db/schema.ts` + hand-authored reviewed SQL pair `src/db/migrations/0001_foundation_probe/{up,down}.sql` — one infrastructure-only probe table, not domain schema (Identity/CMS/etc. stay owned by PHASE-03/04 per DATA-MODEL.md). Verified up→down→up against a synthetic `postgres:17-alpine` service container in `.github/workflows/database.yml`.
- **DB-aware health check:** `GET /api/v1/health` reports `checks.database` when `DATABASE_URL` is set, unchanged (liveness-only) when it isn't.
- **Worker baseline:** `src/worker/index.ts` — connects to Postgres if configured, logs ready, shuts down cleanly on SIGTERM/SIGINT. Deliberately no outbox job claiming — there's no `OutboxEvent` table yet; that belongs to whichever later phase first writes to the outbox.
- **Deploy smoke:** `Dockerfile` + `docker/entrypoint.sh` build one versioned OCI image that runs either the web process or the worker (`PROCESS_ROLE=worker`); `.github/workflows/container.yml` smoke-tests both in an isolated Docker network on the GitHub runner. This is the closest PHASE-01 can get to "isolated preview" without an external hosting account — no such account was created.
- **Least-privilege secret review:** documented in `docs/OPERATIONS.md` — all workflows are `permissions: contents: read` only, zero Actions secrets exist today, forward rule recorded for whoever adds the first one.
- **Docs:** ARCHITECTURE, DATA-MODEL, API-CONTRACT, OPERATIONS, TRACEABILITY (R17 now `CI-verified`; R15 stays `specified`, it also spans PHASE-03/04) updated to match.
- **Two post-merge security fixes**, also on `main`, also CI-green: GitHub's Dependabot flagged `drizzle-orm` (high, SQL injection via improperly escaped identifiers — not reachable by our current code, which has no dynamic identifiers, but patched anyway) and `esbuild` (medium, dev-server request exposure). Bumped `drizzle-orm`→`^0.45.3`, `drizzle-kit`→`^0.31.11` (commit `100d8e7`); the esbuild alert stayed open one more round because it was pinned *inside* `drizzle-kit`'s own deprecated `@esbuild-kit/core-utils` dependency at `0.18.20`, unreachable by a normal version bump — closed with an `overrides` entry forcing `esbuild` to `^0.25.0` everywhere (commit `abfde44`). `npm audit`: 0 vulnerabilities; 0 open Dependabot alerts, confirmed via `gh api .../dependabot/alerts`.

**Two real incidents worth knowing about, both explained in full in the WORKLOG:**
1. After the first push, GitHub Actions produced zero check-suites for ~10 minutes — caused by the PR's `mergeable` flipping to `CONFLICTING` (another session's repo-knowledge-sync rollout had moved `main` forward; one real conflict in `docs/OPERATIONS.md` blocked GitHub from building the merge ref a `pull_request` workflow needs). **If CI goes silent with zero check-suites on a long-lived branch, check `gh pr view --json mergeable` before assuming an Actions/billing problem** — public repos have no Actions spending limit, so that's not it either.
2. `Database`'s worker-shutdown CI step failed once because `timeout -s TERM 5s ...` returns its own 124 by default whenever it fires the signal, regardless of the child's real exit code. Fixed with `timeout --preserve-status`.

## Open items and decisions

- **Not done, not asked this session, still a founding-partner decision:** a *live* external preview/staging host (needs a new vendor account/credentials/billing).
- **Current-host account-specific Node/PostgreSQL/worker capability remains UNKNOWN** (OPERATIONS.md's current-host evidence boundary, unchanged since Phase 0) — the container smoke test proves portability in principle, not fitness of any specific host.
- The app shell, database probe table and worker are intentionally foundation placeholders — none of them are PHASE-02 design/localization, PHASE-03 identity/RBAC or PHASE-05 public site work, and must not be read as completing any of those.
- PAGES.md still shows `SYS-NOT-FOUND`/`SYS-ERROR` as `IN PROGRESS`, not `CI-VERIFIED` — deliberately not bumped: no CI step actually exercises a 404 path or triggers the error boundary at the HTTP level yet, only `next build`'s type/syntax check does. Don't read the phase-level COMPLETE as implying page-level CI verification for these two.

## Next: PHASE-02 — Design and localization shell

Per [PHASES.md](PHASES.md): dependency PHASE-01 (now satisfied). Scope: shared responsive public/private shells, tokens, typography, Bangla/English routing and script-purity pipeline, dark/light persistence, accessible patterns. Out of scope: populated business pages, copied portfolio motion. No new page IDs — design/i18n/theme infrastructure only. Gate: **EXPERIENCE FOUNDATION VERIFIED**. Contract explicitly requires **owner approval of the original design direction** before implementation — read [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) and [UX-CONCEPT-REVIEW.md](UX-CONCEPT-REVIEW.md) first, then bring a concrete direction to the founding partner rather than implementing a guessed one.

## Exact continuation order

1. Read `AI_ASSISTANT.md`; verify canonical SKB remote, `ASSISTANT_CONTEXT.md`, `profile/assistant-guidance.md`, and relevant standards. Read this handoff, [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md), [READINESS](READINESS.md), [PHASES](PHASES.md), [PAGES](PAGES.md), [TRACEABILITY](TRACEABILITY.md), [DESIGN-SYSTEM](DESIGN-SYSTEM.md), [UX-CONCEPT-REVIEW](UX-CONCEPT-REVIEW.md). Compare `main`'s current head and CI with this dated snapshot before trusting anything above.
2. Before writing PHASE-02 code, record Current Phase (PHASE-02), Phase Gate (EXPERIENCE FOUNDATION VERIFIED), Task, Module, Page IDs (`none` — infrastructure), Requirement IDs (R16, R19, R20 primarily), Dependencies (PHASE-01, satisfied) and Acceptance Criteria, per PHASES.md's own process — this file doesn't do that recording for you.
3. Get the founding partner's sign-off on the concrete design direction before implementing it — this is an explicit gate in PHASE-02's own contract, not optional.

Human review: PHASE-02 design direction approval, `main` branch protection, live preview/staging host selection, and later production host/domain/payment/legal gates. Confidence: repository/branch/PR/CI state above was directly verified this session via `gh` and `git`. **Calendar note:** this session's system-reported "today" was 2026-09-29, but the sandbox's actual clock and every GitHub timestamp observed this session read 2026-09-28 — treat GitHub API timestamps as ground truth over either date claim. No credential, private record or production export belongs in this public repository.
