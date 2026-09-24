# ADR 0006 — Portable runtime and hosting candidate

Status: **proposed, not approved**. Date: 2026-09-24.

## Context and problem

OnSkillIT needs SSR public pages, transactions, CMS, LMS/TMS/CRM, background jobs and provider callbacks. The current site's IP is in a Namecheap-registered network and publicly responds through LiteSpeed/PHP, but the account plan, Node/DB/worker limits and deployment rights are unknown. Namecheap product docs describe possible Node/cPanel/PostgreSQL/cron support but do not prove account capability. See `HOSTING-CAPABILITY.md`.

## Options

1. Next.js/TypeScript modular monolith with supported relational database and separate job runner.
2. Laravel/PHP modular monolith with relational database and queue, if the actual host/skills fit.
3. Django/Python with separate frontend and worker.
4. Split the app across specialized hosted services now.

## Decision and rationale

**Propose** a portable modular monolith with server-rendered public routes, explicit domain modules, relational transactions and provider adapters. Next.js/TypeScript remains a candidate, not a final choice; Laravel is a serious alternative if the verified Namecheap plan favors PHP and can satisfy queue/API/UI operations. Do not choose a framework from an HTTP header. Avoid premature microservices. The deployment package, database, media and queue must be replaceable without changing the domain model.

## Trade-offs, consequences and gate

One repository simplifies cross-module transactions and agent handoff; workload separation still needs a worker and isolated secrets. A shared-host cPanel app may impose process, cron and old-PostgreSQL constraints. **Owner approval required** after plan/capability report, cost/skill comparison and a GitHub-built staging proof in PHASE-01. No runtime is approved by this ADR yet.
