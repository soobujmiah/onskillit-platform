# OnSkillIT canonical agent handoff

Updated: 2026-09-29 (Asia/Dhaka). Session: Claude Code Phase 1 migration/worker/container/secret-review slice. **This file is the canonical cross-agent handoff in this repository.** Recheck Git, GitHub CI and dated external facts before acting; the repository and its current CI evidence outrank this snapshot.

## State and source of truth

- Repository: public `soobujmiah/onskillit-platform`, default branch `main`. Local checkout: `/home/sbj/onskillit-platform-docs`; remote `origin` points to `https://github.com/soobujmiah/onskillit-platform.git`.
- `main` remains at `b3a9170` (Phase 0 closeout) as of this session's start. PHASE-00 is COMPLETE; DOCUMENTATION READY gate PASSED.
- Active work: PHASE-01 IN PROGRESS on `phase-01/foundation-audit-scaffold`, still [draft PR #7](https://github.com/soobujmiah/onskillit-platform/pull/7), unmerged — **`main` does not yet contain any application scaffold.** Before this session, the branch/PR head was `18e94a9`. This session adds the migration/worker/container/secret-review slice described in [PHASE-01-WORKLOG session 2](PHASE-01-WORKLOG.md). PHASE-01's FOUNDATION VERIFIED gate is OPEN — see "Open gate" below for exactly what remains and who must close it.
- Current task contract unchanged from session 1: platform/config/CI foundation; page IDs `SYS-NOT-FOUND`, `SYS-ERROR`; requirements R15 and R17. [PHASES](PHASES.md), [PAGES](PAGES.md), [TRACEABILITY](TRACEABILITY.md) and [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md) own exact scope/status.

## Completed in this session (see PHASE-01-WORKLOG session 2 for full detail)

- Reviewed SQL migration up/down (`src/db/migrations/0001_foundation_probe/`) for one infrastructure-only probe table, applied/reverted/reapplied against a synthetic `postgres:17-alpine` service container in the new `database.yml` GitHub workflow. No Identity/CMS/etc. domain schema was created — that stays owned by PHASE-03/04 onward per DATA-MODEL.md.
- `GET /api/v1/health` now reports `checks.database` when `DATABASE_URL` is set, while staying byte-identical for the existing no-database `web` job.
- A minimal worker process (`src/worker/index.ts`) that connects to Postgres, logs ready, and shuts down cleanly on SIGTERM — smoke-tested directly (not through `npm run`, to keep signal delivery unambiguous) in `database.yml`. It intentionally does not implement outbox job claiming; there is no `OutboxEvent` table yet.
- A `Dockerfile` producing one versioned OCI image that runs either the web process (default) or the worker (`PROCESS_ROLE=worker`), smoke-tested end-to-end in a new `container.yml` workflow using an isolated Docker network on the GitHub runner — no external hosting account was created or used.
- A dated least-privilege secret review in `docs/OPERATIONS.md`: all four workflows are `permissions: contents: read` only, none references an Actions secret today, and a forward rule is recorded for whenever the first real secret is added.
- `docs/ARCHITECTURE.md`, `docs/DATA-MODEL.md`, `docs/API-CONTRACT.md`, `docs/TRACEABILITY.md` updated to match; `package-lock.json` refreshed via a local `npm install` for the new dependencies only (`drizzle-orm`, `drizzle-kit`, `postgres`, `tsx`) — no local build, lint, typecheck, start or docker command was run against this code; all of that ran only in GitHub Actions.
- GitHub CI on this session's commit(s): **[fill in exact commit SHA and run IDs for `Documentation architecture`, `Foundation`, `Database` and `Container` once the push lands and each run completes — do not mark this done from a local read of the YAML].**

## Open gate, risks and decisions

- **Not yet done for PHASE-01, and now the honest remainder:** a reviewed PR merge with all four workflows green on the final commit (mechanical — should close once CI is confirmed); nothing else is currently known-missing against the PHASES.md PHASE-01 contract (repo structure, CI, isolated deploy smoke, initial migrations, health endpoint, secret policy). Interaction/accessibility review of the system pages themselves is out of PHASE-01's scope (PHASE-02 design/localization territory).
- **Owner-gated, not something an agent should do unilaterally, unchanged from session 1:** (a) a *live* external preview/staging host — this needs a new vendor account, credentials and likely billing, which is a founding-partner decision, not something this session invented a substitute for beyond the isolated container smoke test; (b) `main` branch protection — still absent (confirm with a fresh GitHub API check, don't trust this note's age), still only a recommendation; (c) merging PR #7 itself — repo policy treats "reviewed PR" as part of the gate, and merging a public repo's default branch is a visible, semi-irreversible action that should get explicit go-ahead even when CI is green.
- The current host's account-specific Node/PostgreSQL/worker capability remains UNKNOWN, per session 1 and OPERATIONS.md's current-host evidence boundary — nothing in this session changes that; the container smoke test proves portability in principle, not fitness of any specific host.
- The app shell, database probe table and worker are intentionally foundation placeholders — none of them are PHASE-02 design/localization, PHASE-03 identity/RBAC or PHASE-05 public site work, and must not be read as completing any of those.

## Exact continuation order

1. Read `AI_ASSISTANT.md`; verify canonical SKB remote, `ASSISTANT_CONTEXT.md`, `profile/assistant-guidance.md`, and relevant standards. Read this handoff, [work log](PHASE-01-WORKLOG.md), [readiness](READINESS.md), the phase/page/traceability registers and task-relevant ADRs. Compare the current branch, PR head, `main`, status and CI with this dated snapshot — do not trust the run IDs above without checking `gh pr checks 7` yourself.
2. If all four PR #7 checks are green on its final commit and the founding partner has confirmed the merge, merge PR #7 into `main`, record the merge commit here and in the worklog, and only then evaluate whether PHASE-01's state can move past READY FOR GATE — `PHASES.md` reserves GATE PASSED for the gate reviewer, not the implementing agent.
3. If the founding partner wants a live preview/staging environment, that's a new decision (provider, account, credentials) requiring its own ADR-level or OWNER-DECISIONS entry before implementation, not an extension of this session's container smoke test.
4. Do not start PHASE-02 or any product page work merely because PHASE-01's CI is green; confirm the gate is actually marked passed by the appropriate reviewer first.

Human review: branch protection/review policy configuration, the PR #7 merge decision, and later production host/domain/payment/legal gates. Confidence: repository, branch and PR state above were directly verified this session via `gh`; CI run IDs are recorded only after the corresponding run completes, never asserted in advance. No credential, private record or production export belongs in this public repository.
