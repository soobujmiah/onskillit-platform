# OnSkillIT canonical agent handoff

Updated: 2026-09-28 (Asia/Dhaka, sandbox clock — see prior HANDOFF history for the "session said 2026-09-29" calendar note). Session: Claude Code, PHASE-02 design and localization shell. **This file is the canonical cross-agent handoff in this repository.** Recheck Git, GitHub CI and dated external facts before acting; the repository and its current CI evidence outrank this snapshot.

## State and source of truth

- Repository: public `soobujmiah/onskillit-platform`, default branch `main`. Local checkout: `/home/sbj/onskillit-platform-docs`; remote `origin` points to `https://github.com/soobujmiah/onskillit-platform.git`.
- **PHASE-01 is COMPLETE, FOUNDATION VERIFIED gate PASSED** (`main` head at PHASE-01 close: `b4382ec`; see prior HANDOFF history preserved in git log for full detail, and [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md)).
- Active work: PHASE-02 (design and localization shell) on branch `phase-02/design-localization-shell`, **not yet pushed as of this file's first version in the branch**. The founding partner reviewed a static reference board (a Claude Artifact, not part of this repository) built strictly from the already-accepted `docs/DESIGN-SYSTEM.md`/`docs/UX-CONCEPT-REVIEW.md` token baseline and said "start" — that is PHASE-02's own required "owner approves original design direction" gate, satisfied before any code was written. Full implementation detail, scope decisions and rationale are in [PHASE-02-WORKLOG](PHASE-02-WORKLOG.md) — read it before this section goes stale.
- **GitHub CI evidence: [fill in exact commit SHA and run IDs for `Documentation architecture`, `Foundation`, `Database`, `Container`, `Shell` (new) once pushed and each run completes — do not mark this done from a local read of the YAML, same discipline as PHASE-01].**

## PHASE-02 summary (full detail in PHASE-02-WORKLOG)

Locale routing (`/en`/`/bn`, already fixed by ADR 0009 — not decided here) via `src/middleware.ts` + `src/app/[locale]/`; cookie-based theme with a documented no-flash mechanism; DESIGN-SYSTEM.md's token table implemented verbatim as CSS custom properties (no Tailwind/UI-library decision made); `next/font/google` for Inter/Noto Sans Bengali (self-hosted at build time, SIL-OFL licensed — satisfies DESIGN-SYSTEM.md's "self-hosted ... if license verified" without inventing a licensing claim); a minimal first-party `src/i18n/` dictionary pipeline (shell-chrome strings only); a new `scripts/check_locale_purity.py` and a real Playwright + axe-core E2E suite (`playwright/shell.spec.ts`, new `.github/workflows/shell.yml`) covering locale/theme/keyboard/viewport/contrast — PHASE-02's own exit criteria, not optional extras. `src/app/page.tsx` (PHASE-01's placeholder) is deleted and relocated/translated to `src/app/[locale]/page.tsx`; `foundation.yml`/`container.yml`'s root-path smoke curls get `--location` added since `/` now redirects.

**Deliberately out of scope this slice** (see PHASE-02-WORKLOG for the reasoning): a distinct authenticated/staff shell variant (deferred to PHASE-03, the first phase with an actual authenticated route); the full DESIGN-SYSTEM.md component contract table beyond what the shell itself needs (built by the pages that need them, PHASE-05+).

## Open items and decisions

- **Gate not yet claimed passed.** PHASE-02's EXPERIENCE FOUNDATION VERIFIED gate needs real GitHub CI evidence first (this session hasn't pushed yet as of this file version), then the founding partner's explicit sign-off — same two-step process this session used for PHASE-01, not something an agent self-declares.
- **Owner-gated, unchanged and not raised this session:** a *live* external preview/staging host; `main` branch protection (still declined as of the PHASE-01 close-out).
- A visually distinct private/staff shell remains undelivered — expected, not forgotten; PHASE-03 is its natural owner.

## Exact continuation order

1. Read `AI_ASSISTANT.md`, this handoff, [PHASE-02-WORKLOG](PHASE-02-WORKLOG.md), [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md), [PHASES](PHASES.md), [PAGES](PAGES.md), [TRACEABILITY](TRACEABILITY.md), [DESIGN-SYSTEM](DESIGN-SYSTEM.md). Compare the branch/PR head and CI with this dated snapshot before trusting anything above — don't trust run IDs without checking `gh pr checks` yourself.
2. If CI is green on the final commit, present the evidence to the founding partner and ask before marking PHASE-02's gate passed or merging — do not self-declare either, matching the PHASE-01 precedent this repository now has on record twice.
3. Do not start PHASE-03 (or any page implementation) merely because PHASE-02's CI is green; get the gate actually marked passed first.

Human review: PHASE-02 gate-passed decision, the eventual merge decision, `main` branch protection, live preview/staging host selection, later production/domain/payment/legal gates. No credential, private record or production export belongs in this public repository.
