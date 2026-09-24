# Technology evaluation and architecture selection gate

Status: preliminary research, not a stack decision. Reviewed 2026-09-24. The current domain host's actual runtime, database and worker capabilities have not been inspected. A partner-approved capability report and prototype are required before key technology ADRs can be accepted.

## Evaluation criteria

Assess candidates against: public SEO/server rendering, CMS workflow flexibility, LMS/TMS transactional complexity, RBAC, bilingual and dark/light UI, performance, security, maintainability, team skills, available hosting, deployment portability, cost, ecosystem health, documentation, migration/exit path and GitHub CI reproducibility. Weight hosting feasibility and team operation more heavily than popularity. Compare the smallest coherent production stack, not a list of independently fashionable tools.

| Architecture | Advantages supported by docs | Risks/unknowns | Prototype gate |
|---|---|---|---|
| Next.js + TypeScript full stack | [App Router](https://nextjs.org/docs/app) supports server-rendered routes and [metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata); [self-hosting](https://nextjs.org/docs/app/guides/self-hosting) is documented. Matches portfolio's existing tool ecosystem. | Needs persistent Node runtime, queue worker strategy, disciplined domain layer and DB transactions. Current host may lack Node/PostgreSQL. | Build one localized public page, scoped admin mutation, background notification and deployment to realistic target in GitHub CI/staging. |
| Laravel + PHP UI/API | [Laravel](https://laravel.com/docs/12.x) has documented database/migration and [queue](https://laravel.com/docs/12.x/queues) support; PHP fits the observed live LiteSpeed/PHP environment in principle. | Must verify installed PHP version/extensions, worker/cron, database, hosting limits, UI approach and staff skills. Current WordPress availability does not prove Laravel deployability. | Same vertical slice on target host capability profile. |
| Django + Python UI/API | [Django models/transactions](https://docs.djangoproject.com/en/5.2/topics/db/) and admin are mature starting points for data-heavy workflows. | Needs Python process/worker deployment and bespoke polished multi-portal UI; hosting/team fit unknown. | Same vertical slice and operations review. |

Database candidates: PostgreSQL preferred for strong relational constraints, transactions and native [full-text search](https://www.postgresql.org/docs/current/textsearch-intro.html), but Bangla search relevance and host support must be tested. MySQL/MariaDB may be practical if already available on current hosting; compare transaction/index/collation/search needs with actual version. SQLite is not the target for concurrent multi-admin/payment operations. No search engine or cache service should be introduced without a corpus/scale need. Object-storage adapter should work with a compatible service and allow private media; current host disk alone is not a portable long-term assumption.

CMS: compare a typed first-party CMS against a headless CMS through editor workflow, localization, versioning, scoped RBAC, page-builder validation and portable export. Authentication: use a well-maintained framework/library strategy; compare session model, future verification/2FA, account recovery and admin security. Payment: compare official merchant integration access, methods, settlement, fees, refunds and sandbox/live behavior, as in `PAYMENTS.md`. Do not select a vendor merely from an SDK's existence.

## Decision process

1. Obtain read-only current-host capability and cost report; document any production constraints.
2. Confirm actual business workflows, traffic expectations, data volumes and support staffing.
3. Build a small proof of concept **only after documentation review authorizes Phase 1**, with GitHub-only build/test and a realistic preview/staging target.
4. Score each candidate against criteria with evidence, cost and operational risks. Record rejected options and reasons.
5. Founding partners approve stack, database, authentication, CMS, payment and deployment ADRs.

The present recommendation is a **candidate**: modular monolith, server-rendered public UI, relational database, typed CMS, background jobs and provider adapters. The exact framework/database/host remain open.

## Decision register — Phase 0 closeout review, 2026-09-24

Status values here are **recommendation**, **conditional**, or **pending owner/host evidence**, never an implementation claim. [ADR 0006](decisions/0006-runtime-and-hosting-candidate.md), [ADR 0007](decisions/0007-browser-auth-and-rbac.md) and [ADR 0008](decisions/0008-payment-adapter-contract.md) record the major proposed decisions. [HOSTING-CAPABILITY.md](HOSTING-CAPABILITY.md) distinguishes Namecheap network/product documentation from actual account capability.

| Choice | Coherent candidate / alternative | Current disposition and evidence gate |
|---|---|---|
| Frontend and backend | One SSR-capable modular monolith; Next.js/TypeScript candidate, Laravel/PHP alternative, Django/Python alternative | **PENDING OWNER/HOST**; compare GitHub-built vertical slice, staff skills and actual host plan |
| Database | Supported PostgreSQL preferred for relational integrity; current MySQL/MariaDB alternative only after version/constraint review | **PENDING HOST**; Namecheap public listing mentions old, plan-dependent PostgreSQL 10.23, not account proof or an acceptable new production target |
| ORM/data layer | Framework-supported migration/query layer with explicit transactions and constraints; no generic CRUD bypass | **PENDING FRAMEWORK**; test capacity and finance concurrency in GitHub |
| API style | Versioned `/api/v1` JSON contracts plus server-side application services; OpenAPI and idempotency | **PROPOSED** in API-CONTRACT; exact payloads pending |
| Authentication/RBAC | Revocable cookie session, CSRF and scoped permission checks; future factor table | **PROPOSED** in ADR 0007; owner proofing/security review pending |
| CMS | First-party typed blocks and revisions within domain monolith; compare headless CMS only if editor/workflow and data portability improve | **PROPOSED**; block schema/editor proof pending |
| Media | Private-by-default object-storage adapter, derivative pipeline and rights metadata | **PROPOSED**; actual service, cost and host networking pending |
| Background jobs | Durable database-backed queue/outbox initially, separate worker where host supports it | **CONDITIONAL**; Namecheap shared cron policy limits sub-five-minute schedules and multiple simultaneous jobs; host plan/worker policy pending |
| Cache/search | Framework cache and database search initially; external cache/search only after corpus/load/Bangla relevance evidence | **PROPOSED**; no extra service assumed |
| Email/notifications | Transactional provider adapter; in-app channel with persisted attempts | **PENDING PROVIDER**; public MX does not prove transactional delivery |
| Analytics/logging | Privacy-aware events, structured logs, error/uptime monitoring and audit separation | **PROPOSED**; vendor/cost/retention pending |
| Testing | Domain/API/database/component/E2E/security/a11y/SEO/performance/restore in GitHub Actions | **OWNER-CONFIRMED GitHub-only**, concrete framework tools pending stack |
| CI/CD and deployment | Pinned, least-privilege GitHub Actions; versioned artifact to isolated preview/staging; protected production promotion | **PROPOSED**; current host deploy mechanism and domain cutover approval pending |

The operationally safe fallback if the current plan cannot host the selected runtime/worker/database is **not** to weaken LMS/TMS/finance guarantees. Choose an upgraded or separate compatible application/data host while keeping `onskillit.com` as a configurable domain, subject to owner approval. Namecheap's [Node app](https://www.namecheap.com/support/knowledgebase/article.aspx/10047/2182/how-to-work-with-nodejs-app/), [software versions](https://www.namecheap.com/support/knowledgebase/article.aspx/129/22/what-version-of-the-software-is-used-on-your-servers/) and [cron policy](https://www.namecheap.com/support/knowledgebase/article.aspx/9453/29/how-to-run-scripts-via-cron-jobs/) are product documentation, not this account's capabilities.
