# Accepted platform architecture

Implementation note (PHASE-01 in progress): `src/app/` contains a minimal Next.js shell and system boundaries; `next.config.ts` selects standalone output. This foundation slice awaits GitHub CI and does not establish the full deployable topology. See [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md).

Status: **accepted Phase 0 blueprint, 2026-09-25**. ADRs [0006](decisions/0006-runtime-and-hosting-candidate.md), [0007](decisions/0007-browser-auth-and-rbac.md), [0008](decisions/0008-payment-adapter-contract.md) and [0009](decisions/0009-platform-services-and-operations.md) own the major decisions. This is documentation, not deployed software.

## System shape

A portable Next.js App Router/TypeScript modular monolith serves the public site, staff console, student and client portals and versioned `/api/v1` JSON API. Server-rendered UI calls application services directly. Domain modules are identity/RBAC, publishing/CMS, catalog, learning/LMS, training/TMS, enrollment, CRM, commerce, media, notifications, analytics and audit. Each module owns its data and mutations; cross-domain actions use explicit application services and a PostgreSQL transaction/outbox. The web process and worker are separately deployable from one versioned OCI artifact. PostgreSQL is authoritative, Drizzle supplies typed queries, and reviewed SQL migrations preserve constraints. S3-compatible private object storage holds media. Public search begins in PostgreSQL; cache is public-response/CDN with explicit publication invalidation. Email is a provider adapter; notifications and audit are persisted. No Redis, separate search engine or microservices are required initially.

## Trust and data boundaries

Browser session tokens are opaque, hashed server-side, revocable and delivered by Secure/HttpOnly/SameSite cookies with CSRF/origin defense. Passwords use Argon2id. The authorization layer enforces action/resource/scope for every command, query, search and media request. Client data is isolated by account, student data by learner access, finance by privileged role. Public content is only a published locale revision. Provider callbacks live at separate verified endpoints; independent provider query and immutable money state are required before admission. Background jobs use a durable outbox with leased retries and dead-letter review. Structured logs redact secrets/PII; audit is append-only and restricted. See [SECURITY-ARCHITECTURE](SECURITY-ARCHITECTURE.md) and [DATA-MODEL](DATA-MODEL.md).

## Contract map

[DATA-MODEL](DATA-MODEL.md) owns entities/cardinality/constraints; [API-CONTRACT](API-CONTRACT.md) owns API conventions and domain endpoint families; [DOMAIN-CONSISTENCY](DOMAIN-CONSISTENCY.md) owns the Phase-05 Inquiry → Phase-09 Lead and Phase-06/07 access → Phase-08 enrollment bridges. [TRACEABILITY](TRACEABILITY.md) maps requirement → phase → module → page → data/API → GitHub test. Each implementation phase writes exact OpenAPI schemas and migrations in its own PR. No generic CRUD may bypass domain transitions.

## Public experience and operations

Public canonical URLs use `/en/` and `/bn/`, translated slugs, self-canonicals and reciprocal hreflang only for published equivalents. The 74 V1 templates in [PAGES](PAGES.md) do not multiply by locale. Private routes are noindex and never publicly cached. [DESIGN-SYSTEM](DESIGN-SYSTEM.md) and [UX-CONCEPT-REVIEW](UX-CONCEPT-REVIEW.md) specify independent OnSkillIT motion, portfolio-informed grading, bilingual script purity, light/dark and mobile/accessibility states. GitHub Actions alone runs builds/tests and creates a versioned artifact. Preview, staging and production isolate data/secrets; production needs protected promotion, backup/restore proof, monitoring and an owner-controlled domain cutover. [OPERATIONS](OPERATIONS.md) owns topology, backup and rollback. Current Namecheap account compatibility is pending account-specific verification; a compatible separate/upgraded host may serve the same domain without redesign.

## Decision boundaries

The founding partner delegated architectural choices for final Phase 0 closure; [OWNER-DECISIONS](OWNER-DECISIONS.md) records those choices and later factual inputs. The public brand is OnSkillIT. Registered issuer, address, approved catalog/rights, merchant accounts/contracts and hosting quotas are external facts and must not be invented. They gate dependent publication, provider activation or cutover, not the blueprint. No application implementation occurred in Phase 0.
