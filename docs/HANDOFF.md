# OnSkillIT canonical agent handoff

Updated: 2026-09-25 (Asia/Dhaka). Session: Codex Phase 1 audit and foundation start. **This file is the canonical cross-agent handoff in this repository.** Recheck Git, GitHub CI and dated external facts before acting; the repository and its current CI evidence outrank this snapshot.

## State and source of truth

- Repository: public `soobujmiah/onskillit-platform`, default branch `main`. Local checkout: `/home/sbj/onskillit-platform-docs`; remote `origin` points to `https://github.com/soobujmiah/onskillit-platform.git`.
- `main` at the start of this work: `b3a9170` (Phase 0 closeout). PHASE-00 is COMPLETE; DOCUMENTATION READY gate PASSED. The accepted baseline is 16 phases, 74 V1 page templates plus 5 future templates, and ADRs 0005–0009.
- Active work: PHASE-01 IN PROGRESS on `phase-01/foundation-audit-scaffold` in [draft PR #7](https://github.com/soobujmiah/onskillit-platform/pull/7). Before this handoff edit, the remote branch and local HEAD both equaled `f1819cbf02678513f511466b28e604ccb8a35d85` and the working tree was clean. **The PR is unmerged, so `main` does not yet contain the application scaffold.** PHASE-01's FOUNDATION VERIFIED gate is OPEN. PHASE-02 through PHASE-15 are NOT STARTED.
- Current task contract: platform/config/CI foundation; page IDs `SYS-NOT-FOUND`, `SYS-ERROR`; requirements R15 and R17. Inherited R16/R19/R20 design/localization checks are later page acceptance work. Dependency: passed PHASE-00 gate. [PHASES](PHASES.md), [PAGES](PAGES.md), [TRACEABILITY](TRACEABILITY.md), and [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md) own exact scope/status.

## Completed in PR #7

- Audited repository state and prior GitHub documentation evidence. The repository was documentation-only before this branch. GitHub API returned **404 / branch not protected** for `main` on 2026-09-25; treat this as a current governance gap to recheck, not as proof of any future setting.
- Added pinned Node 24, Next.js 16, React 19 and TypeScript 6 dependencies with npm lockfile; a minimal Next.js App Router shell; noindex placeholder; `SYS-NOT-FOUND` and `SYS-ERROR` boundaries; and `GET /api/v1/health` process liveness (`{"status":"ok"}`, no-store). Added read-only GitHub CI for npm install, lint, typecheck, build and HTTP smoke. No local build or test was run, per the founder's GitHub-only rule.
- Updated the phase/page registers and relevant README, agent contract, architecture, API, data, operations, traceability and roadmap notes. The substantive commits before this handoff are `bbc0f58` (initial slice), `e3e9b5d` (TypeScript compatibility fix), and `f1819cb` (CI evidence record).
- GitHub CI on `e3e9b5d`: documentation run [36122971040](https://github.com/soobujmiah/onskillit-platform/actions/runs/36122971040) passed; foundation run [36122971028](https://github.com/soobujmiah/onskillit-platform/actions/runs/36122971028) passed. On `f1819cb`: documentation run [36123253154](https://github.com/soobujmiah/onskillit-platform/actions/runs/36123253154) and foundation run [36123253153](https://github.com/soobujmiah/onskillit-platform/actions/runs/36123253153) passed. This verifies CI for the web-runtime slice; it does not pass the full phase gate or prove production behavior.

## Failure preserved

The first foundation run [36122850968](https://github.com/soobujmiah/onskillit-platform/actions/runs/36122850968) failed during lint: the then-current `eslint-config-next`/`typescript-eslint` combination rejected TypeScript 7. The branch pins TypeScript 6.0.3; the subsequent GitHub runs passed. Do not upgrade TypeScript back to 7 without checking toolchain support in CI.

## Open gate, risks and decisions

- **Not yet done for PHASE-01:** isolated preview/deploy smoke, synthetic PostgreSQL migration up/down, database and worker baseline, complete least-privilege secret review, and a reviewed PR/merge with CI tied to the final commit. `GET /api/v1/health` checks only the web process, not database or worker readiness. System pages have not had interaction/accessibility review. No production deployment, migration, payment or `onskillit.com` change occurred.
- The current host's account-specific Node/PostgreSQL/worker capability is UNKNOWN. The accepted portable architecture permits a compatible separate or upgraded host; production host selection and domain cutover are later owner gates. Actual offerings, registered issuer/legal text, rights and merchant contracts remain unverified external inputs. Do not turn them into published claims.
- `main` branch protection is absent as observed above. Recommend configuring required PR review and passing checks before merge; preserve the founder's reviewed-PR contract. Do not infer that a passing check alone authorizes production or phase completion.
- The app shell is intentionally a foundation placeholder, not a public product page. It must not be treated as completion of PHASE-02 design/localization or PHASE-05 public site.

## Exact continuation order

1. Read `AI_ASSISTANT.md`; verify canonical SKB remote, `ASSISTANT_CONTEXT.md`, `profile/assistant-guidance.md`, and relevant standards. Read this handoff, [work log](PHASE-01-WORKLOG.md), [readiness](READINESS.md), the phase/page/traceability registers and task-relevant ADRs. Compare the current branch, PR head, `main`, status and CI with this dated snapshot.
2. Continue PHASE-01 in PR #7 or a reviewable successor branch. First close the missing foundation evidence: reviewed SQL migration baseline with synthetic PostgreSQL up/down in GitHub; isolated preview/OCI or equivalent deploy smoke; worker/readiness contract; and secret/permission review. Keep builds/tests on GitHub. Update source, registers, contracts, work log and this handoff together.
3. Review PR #7 and its final-commit CI. Only mark FOUNDATION VERIFIED and page/requirement rows CI-verified when their specific acceptance evidence exists. Record PR, commit and GitHub run IDs. Do not start PHASE-02 or production cutover merely because the current web CI is green.

Human review: branch protection/review policy configuration and later production host/domain/payment/legal gates. Confidence: repository branch, PR and CI statuses above were directly verified on 2026-09-25; external business/hosting facts remain unknown or dated as documented. No credential, private record or production export belongs in this public repository.
