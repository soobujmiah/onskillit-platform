# PHASE-02 work log — design and localization shell

Current phase: PHASE-02 IN PROGRESS. Phase gate: EXPERIENCE FOUNDATION VERIFIED remains OPEN until GitHub CI evidence for all exit criteria exists and the founding partner marks it passed. Task: shared responsive public/private shells, tokens, typography, Bangla/English routing and script-purity pipeline, dark/light persistence, accessible patterns. Modules: design/i18n/theme. Page IDs: none (infrastructure). Requirement IDs: R16, R19, R20. Dependency: PHASE-01, FOUNDATION VERIFIED gate passed at commit `abfde44` (documented in [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md)).

Before writing any code, the founding partner reviewed a static reference board (a Claude Artifact, not committed to this repository) built from the already-accepted `docs/DESIGN-SYSTEM.md`/`docs/UX-CONCEPT-REVIEW.md` token baseline — nothing new was invented on that board — and said "start," satisfying PHASE-02's own contract requirement that the founding partner approve the original design direction before implementation.

## Scope decisions made explicit (so a later session doesn't have to re-derive them)

- **"Public/private shells" (plural) is scoped down to one shared shell** for this slice: skip link, header with language switcher and theme toggle, `<main>`. A visually distinct authenticated/staff shell variant is deliberately deferred to PHASE-03, the first phase with an actual authenticated route to hang it on — building one now with no auth context and nothing to render in it would be speculative, the same restraint PHASE-01 applied to outbox job logic.
- **Component contract is scoped to what the shell itself needs** (skip link, toggle, switcher, header) rather than the full DESIGN-SYSTEM.md table (buttons/cards/fields/tables/dialogs/...). Those get built by whichever page first needs them, starting PHASE-05.
- **No CSS/UI-library dependency was added.** Tokens are plain CSS custom properties (`src/styles/tokens.css`), values copied verbatim from DESIGN-SYSTEM.md's table. No ADR has chosen Tailwind or a component library, and this phase doesn't make that choice unilaterally.
- **Fonts use `next/font/google`** (Inter, Noto Sans Bengali) rather than vendoring font binaries. This is the one place DESIGN-SYSTEM.md's "self-hosted ... if license verified" is actually satisfiable without inventing a licensing claim: Google Fonts are SIL-OFL (verified, open), and `next/font` self-hosts them at build time with zero runtime request to Google and zero vendored binaries in this public repository.
- **No new i18n library.** `src/i18n/dictionaries/{en,bn}.json` + a typed loader, matching this repo's first-party-over-proprietary-service default (ADR 0009). The dictionaries currently hold only shell-chrome strings (skip link, theme toggle, language switcher, the relocated placeholder heading/body) — real page copy is out of scope until a phase actually needs it.

## Locale routing and the root-layout `<html lang>` problem

Canonical prefixes `/en`/`/bn` are already fixed by ADR 0009 (`docs/SEO-CONTENT.md`), not decided here. `src/middleware.ts` resolves locale (`NEXT_LOCALE` cookie → `Accept-Language` → default `en`), redirects any request lacking a valid locale prefix, and refreshes the cookie every request. It also sets an `x-locale` request header — the standard workaround for the fact that Next.js's true root layout (`src/app/layout.tsx`, the sole owner of `<html>`/`<body>`) sits *above* the `[locale]` route segment and therefore cannot read `params.locale` directly; without this header the outer `<html lang>` would be stuck at a hardcoded value. `src/app/not-found.tsx`/`error.tsx` (PHASE-01's SYS-NOT-FOUND/SYS-ERROR) are untouched — they still render through the same root layout for genuinely unmatched paths, so nothing about their already-CI-verified behavior changes.

`middleware.ts` was placed at `src/middleware.ts`, not the repo root — this project uses the `src/` convention (`src/app/`), and Next.js requires middleware to live under `src/` in that case, not at the project root.

## Theme: cookie-based, no first-paint flash

`theme` cookie, read server-side in `app/layout.tsx` to set `data-theme` on `<html>` before paint. For the one case SSR genuinely cannot resolve — a first-ever visit with no cookie yet — a small synchronous inline `<script>` in `<head>` checks `prefers-color-scheme` and applies it before the browser paints; this is the standard, industry-accepted no-flash technique, not a novel one. `ThemeToggle` (client component) flips both the cookie and `document.documentElement.dataset.theme` directly on click, no server round trip.

**Known, accepted, one-time cosmetic limitation:** on that same first-ever/no-cookie visit, if the inline script applies a dark system preference, the server-rendered toggle button label (computed from the cookie-derived default of "light") can briefly say the wrong action until the first click, which immediately corrects it. A `useEffect` that reads `document.documentElement.dataset.theme` on mount and calls `setState` to fix this was tried and removed — `eslint-plugin-react-hooks`'s `react-hooks/set-state-in-effect` rule correctly flags synchronous `setState` in an effect body as the real anti-pattern it is (state that can drift from its own source of truth), and that's a more durable problem than the one-visit cosmetic mismatch it would have hidden. Documented in a code comment in `ThemeToggle.tsx`, not silently dropped.

## Root page relocation

`src/app/page.tsx` (PHASE-01's locale-neutral "OnSkillIT platform foundation" placeholder) is deleted; its content moves to `src/app/[locale]/page.tsx`, translated per locale via the dictionary. It becomes unreachable at its old path once `/` always redirects to a locale prefix — PHASE-01's own docs already called it an intentional, temporary placeholder, so this relocation is exactly the job, not scope creep.

**CI impact, fixed in the same commit:** `foundation.yml` and `container.yml`'s existing smoke-test steps curl bare `/` expecting `200` with the placeholder text; with the redirect in place that would now 30x. Both get `--location` added to follow the redirect to `/en`. `database.yml` only curls `/api/v1/health`, unaffected.

## New CI: locale purity and the shell E2E suite

`scripts/check_locale_purity.py` (same style as `check_docs_architecture.py`): scans `en.json` for Bengali-range characters and `bn.json` for Latin letters, and checks the two dictionaries have identical key sets. One narrow, documented exception — `language.switchTo`, the language switcher's own endonym label (an English page names its Bangla target "বাংলা"; the Bangla page names its English target "English") — mirrors how the accepted docs already treat URLs/identifiers as data exceptions to script purity.

New `.github/workflows/shell.yml`: locale purity check, then a real Playwright + `@axe-core/playwright` suite (`playwright/shell.spec.ts`) against the built app — locale redirect/switch correctness, the no-flash claim proven by fetching the raw SSR response with a theme cookie set (not just checking post-hydration DOM state), keyboard tab order through skip link → language switcher → theme toggle, a 320/768/1440px no-horizontal-overflow sweep, and zero axe violations (which covers the contrast-check exit criterion) in both themes on both locale pages. Kept as its own workflow, separate from `foundation.yml`/`database.yml`/`container.yml`, so a Playwright/CI-environment surprise can't destabilize PHASE-01's already-green checks.

## Status

[Filled in once pushed and CI evidence exists — not asserted in advance.]
