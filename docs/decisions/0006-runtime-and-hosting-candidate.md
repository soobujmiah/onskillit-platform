# ADR 0006 — Portable runtime and hosting

Status: **ACCEPTED**, 2026-09-25, under the founding partner's final Phase 0 architectural delegation.

## Context and problem

The 74-template V1 needs server-rendered bilingual public pages, transactional CMS/LMS/TMS/CRM, background work and provider callbacks. Public LiteSpeed/PHP headers and a Namecheap-registered IP do not establish the current account's Node, PostgreSQL or worker capabilities.

## Options

1. Next.js/TypeScript modular monolith with PostgreSQL and a separately deployable worker.
2. Laravel/PHP with server-rendered UI and a queue.
3. Django/Python with a separate UI and worker.
4. Independent microservices from day one.

## Decision and rationale

Choose option 1: Next.js App Router with TypeScript on a supported Node LTS, packaged as a versioned OCI image. Keep UI, `/api/v1`, application services and domain modules in one repository and web service; run a distinct worker process from the same versioned artifact for outbox jobs. Use PostgreSQL on a supported major version with current minor patches, Drizzle for typed queries and reviewed SQL migrations, and explicit database constraints and transactions. Module boundaries follow CMS, identity, learning, training, enrollment/commerce, CRM and operations. Public rendering uses server rendering or cacheable generation according to content freshness; private routes are request-scoped and never shared-cached.

This gives one language/toolchain, a predictable SEO surface, transactional cross-module workflows and self-hosting portability. Next.js officially supports Node/Docker deployments; its self-hosting guide recommends a reverse proxy. Drizzle documents SQL transactions. PostgreSQL publishes support windows. See [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying), [self-hosting](https://nextjs.org/docs/app/guides/self-hosting), [Drizzle transactions](https://orm.drizzle.team/docs/transactions) and [PostgreSQL support](https://www.postgresql.org/support/versioning/).

## Trade-offs and consequences

Laravel may fit a PHP-only plan more easily, but the existing host is not a constraint on the new platform. Django would add a second UI stack. Microservices add distributed consistency and operations cost before scale warrants it. Next.js still requires a persistent Node process, supported PostgreSQL, worker execution and disciplined server-only module boundaries. **Current-host compatibility: pending account-specific verification.** If it cannot meet the runtime contract, deploy to a compatible separate/upgraded host and point `onskillit.com` to it only at the later owner-approved cutover. Do not downgrade data, security or queue guarantees to fit old shared hosting. Version selections are pinned and security-reviewed in PHASE-01 CI; this ADR is not a deployment.
