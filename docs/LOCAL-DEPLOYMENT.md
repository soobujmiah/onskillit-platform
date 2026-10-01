# Local deployment guide

Status: **owner review aid, written 2026-10-01, not CI-verified.** This guide describes how to run the server application on one machine so the founding partner can review pages, the CMS, sign-in and the inquiry form with **synthetic data**. A local run is a manual exploratory check only. It never replaces GitHub Actions evidence, and it must not be used to claim a phase gate (see `AI_ASSISTANT.md`: GitHub is the authoritative build and test environment). It is not a production or staging deployment, and it does not change `onskillit.com`.

Evidence labels used below: **Observed** = read from repository source on this date; **Unknown** = not verified here.

## Local run record, 2026-10-01 (MANUALLY TESTED, non-authoritative)

An agent ran the steps below on the owner's Termux/PRoot machine with the owner's explicit permission, on commit `0f4bd1a` plus the uncommitted test fix. Environment differed from CI: Node 22.23.2 (CI: 24), PostgreSQL 18.6 (CI: 17), no Docker, no Chromium.

| Check | Result |
|---|---|
| Migrations `0001`–`0004` apply on an empty database | passed |
| `check:locale`, `check:api`, `check:docs`, editorial-copy check, `tsc --noEmit` | passed |
| `npm run build` and `npm start`, `/api/v1/health` | passed |
| `scripts/public_ci.mjs` (publication, inquiry controls, redaction) | passed |
| `scripts/cms_ci.mjs` | passed |
| `scripts/identity_ci.mjs` (needs `SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_FROM=...` in the server's environment, and a fresh database) | passed |
| Public pages, robots and sitemap return HTTP 200 in both locales; footer shows the OnSkillIT copyright | passed |
| Playwright browser tests | **NOT TESTED**: no Chromium available; they run on GitHub only |

**Lightpanda (text-only headless browser) addendum.** Used against the same local build for public pages only. Header, footer and Privacy links render for published pages in both locales (`/en`, `/bn`, `/en/team`, `/bn/team`): About, Team, Services, Contact, Account (Bangla label corrected), language switch and the footer Privacy link; the footer shows the OnSkillIT copyright. Limits, observed: Lightpanda sends **no `Origin` header on same-origin POST requests** (verified with a header-logging test server), and the identity API requires a matching `Origin`, so sign-in and every other browser POST return 403 under Lightpanda. That is a tool limitation, not an application fault. It also has no CSS layout or screenshots, so the 320 px staff menu, overflow and contrast checks are **NOT TESTED** locally. It may reuse the first load of an identical URL, so add a query string when re-checking a page.

Pitfalls seen: a server left running from an earlier run keeps its old environment (port 3000 stays taken and new settings are silently ignored); `npm run build` rewrites the tracked `next-env.d.ts`, so revert it before committing; `public_ci.mjs` and `identity_ci.mjs` create fixtures, so use a throwaway database and recreate it between scripts.

## Rules for a local run

- Use synthetic accounts and test text only. Never import production exports, student or client records, real passwords or real mail credentials.
- Never commit `.env` files, database dumps or logs (`.gitignore` already excludes `.env`, `.env.*`, `*.sql` outside migrations, `*.log` and `.next/`).
- Local databases are disposable. Do not point `DATABASE_URL` at any shared or production database.
- Record what you saw in `docs/PHASE-05-WORKLOG.md` labeled "local, non-authoritative".

## Requirements

| Item | Value | Source |
|---|---|---|
| Node.js | 24.x (`>=24 <25`) | `package.json` engines |
| npm | the version bundled with Node 24 | `package-lock.json` |
| PostgreSQL | 17 (CI uses `postgres:17-alpine`) | `.github/workflows/public-core.yml` |
| `psql` client | any recent version, used to apply SQL migrations | same |

Only the database is required for the public pages. Sign-in email (verification and password reset) needs an SMTP relay; see "Email" below.

## 1. Install dependencies

```sh
npm ci
```

## 2. Start a disposable PostgreSQL

Either a local server or a container works. Example with Docker (same credentials CI uses, local only):

```sh
docker run -d --name onskillit-pg -p 5432:5432 \
  -e POSTGRES_USER=onskillit -e POSTGRES_PASSWORD=onskillit -e POSTGRES_DB=onskillit \
  postgres:17-alpine
```

Reset by removing the container (`docker rm -f onskillit-pg`) and repeating.

## 3. Environment variables

Export these in the shell that runs the app (or keep them in an untracked `.env.local`, which Next.js loads automatically). There is no `.env.example`; the list below is taken from `process.env` use in `src/`.

| Variable | Needed for | Local value |
|---|---|---|
| `DATABASE_URL` | all database pages and APIs | `postgres://onskillit:onskillit@localhost:5432/onskillit` |
| `PUBLIC_BASE_URL` | sign-in/CSRF origin and mail links; must equal the exact browser origin | `http://localhost:3000` |
| `PUBLIC_SITE_URL` | sitemap, robots, canonical URLs; only `https` is honored for robots | optional locally |
| `PUBLIC_INDEXING_ENABLED` | indexing switch | leave unset locally |
| `INQUIRY_RATE_SECRET` | inquiry form; at least 32 characters, otherwise the form stays disabled | any random 32+ character string for local use only |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM` | verification and reset email | see "Email" |
| `SMTP_USER`, `SMTP_PASSWORD` | only if the relay requires authentication | never write real values into the repository |

Mail links are only issued when `PUBLIC_BASE_URL` is `https`, or `http` on `localhost`, `127.0.0.1` or `[::1]` (Observed: `src/lib/identity-mail.ts`).

## 4. Apply the database migrations

Apply in order. Each directory also has a reviewed `down.sql`.

```sh
for m in 0001_foundation_probe 0002_identity 0003_cms 0004_public_core; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "src/db/migrations/$m/up.sql"
done
```

## 5. Run the application

Development server with hot reload:

```sh
npm run dev
```

Or a production-style build:

```sh
npm run build
npm start
```

Open `http://localhost:3000/en` and `http://localhost:3000/bn`. A health endpoint is at `/api/v1/health`.

The background worker is optional for review. It currently only reports readiness (`npm run worker`; no job processing exists yet).

## 6. What you will see on an empty database

Public routes show an explicit "unpublished" state and stay `noindex` until a CMS page is published. Header and footer links come from published core pages. The inquiry form stays disabled until a privacy notice page is published and `INQUIRY_RATE_SECRET` is set. This is intended Phase 5 behavior, not a fault.

To see the owner-confirmed editorial drafts rendered, load the ten records in `docs/PHASE-05-CMS-COPY.json` through the CMS as an editor, review and publish them. CI loads the same file into a throwaway database using `scripts/public_ci.mjs`; that script also creates synthetic users and test fixtures, so do not run it against a database you want to keep. The policy proposals in `docs/PHASE-05-POLICY-REVIEW.md` are not part of that file and must not be published until the owner and a qualified reviewer approve them.

## 7. Create a first staff account

1. Register at `/en/account/register` (use a test address such as `owner@example.test`).
2. Email verification is required for reset flows. Use the "Email" section so the link can be delivered, then open the link from the message.
3. Staff access is not granted by signing up. The first owner is assigned only by the audited operator script, never by the browser. Follow `docs/OWNER-OPERATOR-PROCEDURE.md`. For a disposable local database, with `TARGET_USER_ID` set to the new account's ID from the `identity_user` table:

```sh
export OPERATOR_IDENTITY="local-reviewer"
export OPERATOR_REVIEW_REFERENCE="local-review-note"
export OPERATOR_REASON="Local synthetic review environment"
export TARGET_USER_ID="<uuid of the new account>"
export OWNER_BOOTSTRAP_APPROVED=yes
npx tsx scripts/bootstrap_owner.ts
```

   The script refuses to run if an owner already exists and writes an append-only audit row. Do not use it against any real environment without the separate human review described in the procedure.
4. Sign in again. The profile shows a "Staff workspace" link. Content editing, review and publication require different people for author, reviewer and publisher (see `docs/CMS-PUBLISHING.md`), so create additional synthetic staff accounts and grant roles through the staff screens to try the full workflow.

## Email

Without SMTP settings the registration and reset endpoints answer normally but send nothing. For local review, run any SMTP sink that accepts unauthenticated mail on localhost (for example a tool such as MailHog or Mailpit) and set:

```sh
export SMTP_HOST=127.0.0.1
export SMTP_PORT=1025          # the sink's port
export SMTP_SECURE=false
export SMTP_FROM=no-reply@example.test
```

CI uses an in-process sink on port 2525 for the same purpose. External delivery to real mailboxes is **Unknown** and not covered by this guide.

## Container option

`Dockerfile` builds the same image that CI smoke-tests. The web process is the default; `PROCESS_ROLE=worker` selects the worker.

```sh
docker build -t onskillit-platform:local .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=postgres://onskillit:onskillit@host.docker.internal:5432/onskillit \
  -e PUBLIC_BASE_URL=http://localhost:3000 \
  onskillit-platform:local
```

Use a container network name instead of `host.docker.internal` where that name is not available. Migrations are not applied by the image; run step 4 first.

## Verification boundary

- Automated build, typecheck, lint, accessibility, browser and database checks are defined in `.github/workflows/` and their results on a commit are the evidence of record. Do not run `npm run test:e2e`, `typecheck` or `lint` locally to claim a gate.
- If the local run and CI disagree, CI plus the source is authoritative and the difference is a finding to record.
- Items outside this guide: external domain, TLS, production mail relay, backups, monitoring and cutover. Those belong to later phases and named human gates (`docs/OPERATIONS.md`, PHASE-12 to PHASE-14).
