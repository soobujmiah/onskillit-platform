# ADR 0009 — Platform services, data contracts and operations

Status: **ACCEPTED**, 2026-09-25, under founding-partner architectural delegation.

## Context and problem

The chosen modular monolith needs CMS, LMS, TMS and CRM consistency without binding V1 to many proprietary services. Phase 0 must specify deployable service boundaries and the data/API contract.

## Options

1. First-party typed domain modules on PostgreSQL, with provider adapters and a durable database outbox.
2. Separate headless CMS, LMS and CRM SaaS products with cross-system synchronization.
3. Microservices and dedicated cache, search and queue infrastructure from day one.

## Decision and rationale

Choose option 1. CMS uses typed validated sections, per-locale content, revision and review/publish workflow. LMS course editions freeze published lesson/material references for enrolled students. TMS owns batch, session, attendance and trainer allocation and shares program/enrollment identity with LMS. CRM owns lead/client/project/activity history, with authorization-scoped portal projections. The domain application layer is the only mutation path; it writes business state and an outbox event in one PostgreSQL transaction. A separate worker claims outbox jobs with leases, retry/backoff and dead-letter review. Search starts with indexed PostgreSQL filters and locale-aware normalized text; benchmark Bangla relevance in GitHub before adding a specialist engine. Cache starts with application/CDN public-response caching and explicit publish invalidation; no Redis requirement in V1. Media uses private-by-default S3-compatible object storage with signed access, derivatives and rights metadata. Email uses an SMTP/transactional-provider adapter; in-app notification is stored, SMS remains a later adapter. Analytics uses consent-aware first-party events and aggregate reports. Logs are structured/redacted with correlation IDs, error and uptime monitoring; audit records are separate, append-only and access controlled.

`/api/v1` JSON is the external contract with OpenAPI, schema validation, stable resource IDs, cursor pagination where data grows, explicit scopes, problem-style errors and idempotency keys for monetary/enrollment mutations. Server-rendered pages call the same application services without internal HTTP. Public locale URLs are `/en/...` and `/bn/...`; localized slugs and canonical/hreflang links are generated from published translations, while private routes are noindex. Schema, API, page and phase linkage is maintained in TRACEABILITY. See DATA-MODEL, API-CONTRACT, DOMAIN-CONSISTENCY, SEO-CONTENT and TRACEABILITY.

GitHub Actions is the only build/test execution environment. Use TypeScript typecheck, lint/format, Vitest unit/domain/component/API integration, isolated PostgreSQL integration tests, Playwright browser flows with axe accessibility checks, dependency/secret scanning, artifact attestation and staged deployments. Production uses an OCI web process, separate worker, supported PostgreSQL, private object storage, HTTPS reverse proxy, outbound email and offsite encrypted backups. Preview/staging/production use separate secrets/data; production promotion is protected. Backup targets are RPO 24h and RTO 8h until measured and accepted at production gate. Restore drills are required before live cutover. Deployment target/vendor is configurable; current Namecheap account fit remains unknown.

## Trade-offs and consequences

First-party modules require more implementation than SaaS wiring but preserve coherent transactions, bilingual workflow, RBAC and export. PostgreSQL-backed queue/search are enough at initial scale; monitoring thresholds trigger a separate scaling ADR. Search relevance, email deliverability, hosting quotas and vendor selection need implementation-time evidence, not new Phase 0 architecture. Operational providers may change without changing domain contracts. No provider credentials or production deployment are authorized by this ADR.
