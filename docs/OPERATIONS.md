# Deployment, backup and observability design

PHASE-01 implementation note: `foundation.yml` checks lint, types, build and HTTP liveness with read-only repository permission. `database.yml` adds a synthetic `postgres:17-alpine` service container, applies the reviewed migration up/down, and smoke-tests the health endpoint's database check and the worker's DB connectivity. `container.yml` builds the versioned OCI image and, in an isolated runner network with no external host, smoke-tests both the web process and the worker process (`PROCESS_ROLE=worker`) started from that same image — the closest PHASE-01 can get to a "deploy smoke" without an external preview-hosting account/credentials. There is still **no external preview provider, no staging deployment and no production promotion** in this slice; the container smoke test proves the artifact runs, not that it is reachable anywhere. See [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md) and the secret review below.

PHASE-05 adds a GitHub Pages **static editorial preview** workflow on `phase-05/public-core`. It builds from the classified owner copy in GitHub Actions and publishes only public business/contact content. GitHub Pages does not run the Next.js server, CMS, sign-in, worker, inquiry endpoint or database. The workflow needs `pages: write` and `id-token: write` only for its deployment job; it uses no repository secrets, synthetic database or customer data. The preview is `noindex`, and external-domain deployment remains a later release action. See [PHASE-05-WORKLOG](PHASE-05-WORKLOG.md).

Status: **accepted portable operating architecture under ADRs 0006/0009**. No hosting or production action is authorized by this document.

PHASE-03 branch configuration: identity routes require `DATABASE_URL` and `PUBLIC_BASE_URL` (the exact trusted public origin for browser mutations). Email verification and verified-email reset additionally require protected `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM` and, when the relay requires authentication, `SMTP_USER`/`SMTP_PASSWORD`. Without mail configuration, the public request endpoint returns its generic response but issues no usable email link. The GitHub `Identity` workflow uses a synthetic local SMTP sink; it does not prove external delivery. Mobile-only recovery is disabled. No production secret is configured or stored in this public repository.

The production topology needs an HTTPS ingress, application service, background worker, relational database, private object storage, outgoing mail adapter and monitoring. **Confirmed intent:** production will later use the hosting associated with the current OnSkillIT domain. Before a production host is selected, obtain a read-only capability report: shell/container/Node/PHP/Python support, persistent process/worker support, available PostgreSQL/MySQL services, storage/object-storage access, cron/queue, TLS/proxy, environment secrets, backups, resource limits and deployment access. The current LiteSpeed/PHP headers do not prove those capabilities. If the host is insufficient, use a compatible upgraded or separate host while keeping the domain independent; any DNS/cutover remains owner-approved. Domain, provider, bucket and URLs are environment configuration, never embedded business logic. Preview/staging/production use separate data and credentials. A public GitHub repository does not require a public database or public storage bucket. Synthetic data is used in previews. Production data is never copied into public CI artifacts.

Deploy from a GitHub-built, versioned artifact. Preserve migration compatibility across rollout and rollback; take a pre-migration backup for risky schema changes. Deployment steps: approve artifact and change window, verify backup and migration plan, deploy to staging, smoke critical paths, promote to production through protected environment, check health/queue/error rate and rollback on defined thresholds. DNS/domain changes and the current site cutover need a separate owner-approved runbook after URL inventory and redirect mapping.

Backup scope: database, private media, configuration inventory and key references (never plaintext secrets in repository). Encrypt, separate privileges, retain offsite and test restore to an isolated environment. Provisional RPO 24h/RTO 8h; these are targets for business validation, not current capability claims. Record backup completion, restore duration, recovered object counts and application consistency. Media deletion/retention must follow privacy and contractual policies.

Observability: structured application logs with request/trace ID and release SHA; error monitoring; queue depth/failures; DB health/slow queries; uptime probes; web vitals; security alerts for admin/login/publication anomalies; immutable audit events. Redact passwords, reset links, tokens, personal documents and payment payloads. Assign an incident owner and escalation route before production. Define retention per data category and legal review.

## Phase 5 inquiry privacy requests

The public inquiry form remains disabled until the privacy notice is approved and published. A deletion request sent to `onskillitbd@gmail.com` requires an authenticated operator to verify the requester against the private inquiry record, record a request case reference, and obtain a separate review reference. Do not place the name, email, message or other personal data in those references or in GitHub issues, commits, logs or CI artifacts. In a protected operator environment with the target database configured, run `scripts/redact_public_inquiry.ts` through `tsx` with `INQUIRY_ID`, `OPERATOR_IDENTITY`, `PRIVACY_REQUEST_REFERENCE`, `PRIVACY_REVIEW_REFERENCE` and `PRIVACY_REDACTION_APPROVED=yes`. Never expose this script through an HTTP route or run it from public PR CI against real data.

The procedure clears name, email, phone and message in one transaction. A database trigger permits this transition once, preserves a minimal receipt and writes an append-only audit event with the case references. It denies ordinary updates and physical deletion. The operator must verify the redacted state and record completion in the private case system. Retention of the minimal receipt, backups, application logs, and any third-party copies still needs an approved policy and operational review before the form is enabled. GitHub CI exercises the procedure only with synthetic data.

## Current-host evidence boundary (2026-09-24)

[HOSTING-CAPABILITY.md](HOSTING-CAPABILITY.md) records the Namecheap-registered public IP, LiteSpeed/PHP response and Namecheap product-family documentation. The actual OnSkillIT plan, quotas, supported database, persistent worker, cron, secret management, deploy method and backup restore capability remain unknown. Namecheap's plan-dependent AutoBackup and shared-host process limits must be verified against the account before the production topology is approved. The application must remain portable to a compatible upgraded or separate host under the same domain if the current plan cannot meet transaction, queue and recovery requirements. No production or DNS action has occurred.

## Accepted deployable runtime contract — ADRs 0006/0009

Required: supported Node LTS web process; same-version separate worker with persistent execution and scheduler; supported patched PostgreSQL; private S3-compatible object storage; HTTPS reverse proxy with request limits; environment-managed secrets; outbound transactional email; health/readiness probes; offsite encrypted database/media backup; restore-capable staging; structured logging, error/queue/uptime monitoring. DNS and public base URL are configuration. `DATABASE_URL`, session/encryption keys, object-storage credentials, email credentials and provider secrets are protected environment values; exact names are implementation details. Static CDN is optional and must respect publish invalidation/private no-store. A PostgreSQL outbox provides durable work without assuming Redis. OCI images built in GitHub make runtime portable; production promotion uses GitHub protected environments with required review and rollback. Current-host compatibility remains pending account-specific verification and is not the Phase 0 architecture gate.

## Deterministic repository state (2026-09-25, infrastructure — no Page ID)

**Observed:** this repository has `.repo/` — a machine-generated, non-LLM record of the exact
head commit, build status, and event history, produced by `tools/repo_knowledge/` (vendored
from canonical `soobujmiah/skb`, see `tools/repo_knowledge/README.md`) and kept current by
`.github/workflows/repo-knowledge-sync.yml` on every push to `main`. Canonical policy:
`soobujmiah/skb` → `governance/DETERMINISTIC_STATE_SYNC_POLICY.md`.

At this Phase 0 stage, `main` carries no application code — `build.status` in `.repo/project.yaml`
reflects `scripts/check_docs_architecture.py` (the same register check `docs-architecture.yml`
already runs), and `test.status` is deliberately left `unknown` rather than padded with a
duplicate of the same check, since no test suite exists yet on `main`. This does not change any
phase/page gate: it is infrastructure with no Page ID per `AI_ASSISTANT.md`, and does not touch
the unmerged `phase-01/foundation-audit-scaffold` branch. When PHASE-01's application code and
test suite merge into `main`, this workflow should be extended to reflect them — not done here
(this branch now carries that application code and test/CI suite; see PHASE-01-WORKLOG for what
was added and note below for what still needs doing to this sync tooling once merged).

## PHASE-01 least-privilege secret review — 2026-09-29

All four PHASE-01 CI workflows (`docs-architecture.yml`, `foundation.yml`, `database.yml`, `container.yml`) declare `permissions: contents: read` and nothing broader. None references a GitHub Actions secret: `database.yml`'s PostgreSQL service container uses a fixed synthetic username/password that exists only for the life of the job and touches no real data; `container.yml`'s containers run with no credentials at all. There is currently no `DATABASE_URL`, object-storage, email or payment-provider secret stored in this repository's Actions configuration, so there is nothing yet to over-scope. This review's finding is that the current zero-secret state already satisfies least privilege by having no privilege to misuse.

Forward-looking rule for whoever adds the first real secret (a preview/staging `DATABASE_URL`, an object-storage key, and so on): it must be scoped to a specific GitHub Environment with required reviewers, never a repository- or organization-wide secret, and never referenced by a workflow that also runs on unreviewed forked-repository pull requests. This is a rule for that later change, not a claim that such a secret exists today.

## Phase 5 inquiry operations and deployment configuration (2026-10-01)

Deployment-specific services are **configuration**, not a fixed provider list (owner decision 2026-10-01): hosting, database, email, storage, analytics and payment are chosen per deployment through protected environment variables, and the privacy notice refers to the services configured for the deployment. Inquiry-related settings: `INQUIRY_RATE_SECRET` (32+ characters; form stays disabled without it), `INQUIRY_NOTIFY_TO` (comma-separated recipients, at most five; without it, or without `SMTP_HOST`, `SMTP_FROM` and `PUBLIC_BASE_URL`, no notice is sent and the inquiry is still stored and visible to staff), the existing `SMTP_*` settings, and `CMS_WORKFLOW_MODE` (`separated` default or `single_operator`, ADR 0012). No credential belongs in this repository.

The notification contains only a reference, language, source page and a sign-in link; it never carries the visitor's name, email, phone or message. Authorized staff read inquiries at `/staff/crm/leads` (`inquiries.read`; `inquiries.redact` to redact). Redaction from the view needs a privacy request reference and a different review reference and records `staff:<user id>` in the append-only audit trail.

**Retention (owner decision, up to 12 months or earlier on request).** Run `scripts/purge_expired_inquiries.ts` on a regular schedule chosen by the operator, with `DATABASE_URL`, `OPERATOR_IDENTITY` and `OPERATOR_REVIEW_REFERENCE` set; it is a dry run unless `INQUIRY_PURGE_APPLY=yes`. It redacts personal fields of inquiries older than 12 months through the same audited path (audit reason "Retention period elapsed"). The application does not schedule it, and this repository does not claim it is scheduled anywhere. The lifecycle of redaction receipts, application records, logs and backups is **not yet defined**; the privacy draft therefore makes no instant-deletion claim for backups, and the owner must approve the real cycle once it is known.

## CMS-managed site content (2026-10-01)

Apply migration `0006_site_content` before using the Site settings screen. Contact details, brand, footer, logo and visitor-facing text can be changed from the CMS without a deployment; the built-in values are only defaults. Because settings and text edits are not reviewed like page content (ADR 0013), grant `settings.site` only to people trusted to publish those changes.
