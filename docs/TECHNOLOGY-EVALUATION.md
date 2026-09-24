# Technology evaluation and architecture selection gate

Status: preliminary research, not a stack decision. Reviewed 2026-09-24. The current domain host's actual runtime, database and worker capabilities have not been inspected. A partner-approved capability report and prototype are required before ADRs 0101–0108 can be accepted.

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
