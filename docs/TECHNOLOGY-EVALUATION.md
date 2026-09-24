# Technology evaluation and accepted stack

Status: **architecture accepted 2026-09-25** under the founding partner's Phase 0 delegation. This selects contracts, not a production hosting vendor or credentials. See ADRs 0006–0009 and OWNER-DECISIONS.

## Comparative decision

| Candidate | Strength | Material cost/risk | Outcome |
|---|---|---|---|
| Next.js/TypeScript modular monolith + PostgreSQL | Server-rendered SEO, one typed UI/API/domain stack, container self-hosting, relational consistency | Persistent Node, disciplined domain boundaries and worker | **Selected**; old host fit is account-dependent |
| Laravel/PHP + relational DB | Mature queues/data stack and possible PHP-host fit | React-grade bilingual UI likely adds a second stack; host worker/DB still unverified | Reserve if a genuine deployment constraint invalidates selected stack; ADR required |
| Django/Python + separate UI | Mature data/admin patterns | Two UI/runtime stacks and more integration surface | Not selected |
| Early microservices/SaaS modules | Independent vendor scaling | Distributed consistency, lock-in, localization/RBAC fragmentation | Not selected |

The current domain's public server header does not establish new-platform hosting capability. Next.js documents [Node/Docker self-hosting](https://nextjs.org/docs/app/getting-started/deploying); PostgreSQL publishes [support windows](https://www.postgresql.org/support/versioning/). Use currently supported LTS Node and PostgreSQL major/minor at implementation, pin versions in GitHub CI, and review upgrades. Never target the obsolete PostgreSQL 10 listed on a plan-dependent Namecheap product page.

## Final V1 technology contract

| Layer | Decision | Implementation evidence gate |
|---|---|---|
| Frontend | Next.js App Router, React, TypeScript, server rendering/cached generation for public, request-scoped private UI | GitHub build, bilingual/theme/responsive/SEO checks |
| Backend | Same TypeScript modular monolith; application/domain layers behind UI and `/api/v1`; separate worker artifact/process | Domain integration, auth and worker failure tests |
| Database/data layer | Supported PostgreSQL; Drizzle typed queries, reviewed SQL migrations, FK/unique/check constraints and explicit transactions | GitHub isolated PostgreSQL tests and migration review |
| API | JSON `/api/v1`, OpenAPI, schema validation, problem errors, cursor/page contracts, idempotency | Consumer/contract tests; no internal HTTP from server UI |
| Identity | Opaque revocable sessions, Argon2id, cookie + CSRF, scoped RBAC, audit | ADR 0007 and negative permission tests |
| CMS/LMS/TMS/CRM | First-party typed modules on shared IDs/transaction boundary | ADR 0009 and phase-specific workflows |
| Payments | Intent/attempt/provider adapters, verification, refund/reconciliation | ADR 0008 and provider contract suite |
| Storage/media | S3-compatible private object store, signed access, optimization/rights metadata | Upload abuse, privacy and derivative tests |
| Search | PostgreSQL indexed filters and normalized locale text; upgrade only on relevance/scale evidence | Bangla/English relevance test corpus |
| Jobs | Transactional PostgreSQL outbox, leased worker, retry/dead-letter; scheduled jobs in worker | Crash/replay/idempotency tests |
| Email/notifications | SMTP/transactional provider adapter plus persisted in-app delivery; future SMS | Sandbox delivery and no-secret-log tests |
| Caching | Public CDN/app response cache with publish invalidation; private no-store | Stale-content and authorization cache tests |
| Analytics | Consent-aware first-party events with aggregated admin reporting | Privacy review and deduplication tests |
| Logging/observability | Structured redacted logs, error/uptime/queue/DB monitoring, separate audit | Alert and incident drill |
| Testing | Vitest, isolated PostgreSQL integration, Playwright browser, axe accessibility, API/schema/security/performance checks | All builds/tests run only in GitHub Actions |
| CI/CD/deployment | Public GitHub repo, protected PR, pinned least-privilege Actions, versioned OCI image, preview/staging and protected production promotion | Release artifact, smoke, rollback and secret gate |
| Backup/recovery | Encrypted offsite DB/media/config backup, isolated restore drills; provisional RPO 24h/RTO 8h | Measured restore at release gate |

Provider/vendor choices for object storage, SMTP, monitoring and compatible host are operational procurement choices behind the specified interfaces. Select them against documented capability, cost and data handling during relevant phases; they do not reopen the architecture. Actual current-host compatibility and merchant access remain external facts.
