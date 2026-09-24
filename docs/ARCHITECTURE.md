# Architecture candidate and decision register

Status: **proposed, not approved**. This is a conceptual design, not a technology lock. Final stack, auth, payment, database and deployment require founding-partner approval after operational constraints are known.

## System shape

Prefer a modular monolith initially: one deployable application with explicit domains (`identity`, `authorization`, `publishing`, `catalog`, `learning`, `training`, `enrollment`, `crm`, `finance`, `media`, `notifications`, `analytics`, `audit`). Public website, staff admin, learner and client portals use the same domain contracts but separate route groups and permission checks. A queue handles mail, media processing, publishing schedules and provider callbacks. A relational database is authoritative; object storage holds media; caches/search indexes are derived and rebuildable. Domain events connect modules without permitting cross-module table writes. This reduces operational complexity while preserving future extraction boundaries.

## Conceptual data model

| Domain | Core entities and relationships | Integrity/lifecycle |
|---|---|---|
| Identity | User 1:N ContactMethod; User M:N Role via RoleAssignment; Role M:N Permission; Session; ResetToken | Normalized unique contacts, hashed secrets, scoped grants, revocation |
| Publishing | Page 1:N PageRevision 1:N SectionInstance; Navigation; MediaAsset; SeoMetadata; Redirect; SiteSetting | Published revision pointer, validated typed blocks, stable slug, approval history |
| Catalog | Service; Course 1:N CourseEdition 1:N Module 1:N Lesson; Program M:N CourseEdition | Versioned curriculum, public/private states |
| Learning | Enrollment links User to CourseEdition or Batch; LessonCompletion; Assessment; Submission; Grade; Certificate | Unique active enrollment, immutable grade/issuance history |
| Training | Program 1:N Batch 1:N TrainingSession; TrainerAssignment; Attendance; Result | Capacity lock, time-zone aware schedule, attendance by session/enrollment |
| CRM | Lead; Opportunity; ClientAccount 1:N ClientContact; Activity; FollowUp; ServiceEngagement; Project; SupportRequest | Event history, account isolation, no silent stage rewrite |
| Finance | Invoice 1:N InvoiceLine; PaymentIntent 1:N PaymentTransaction; Refund; ReconciliationEntry | Currency minor units, unique provider reference, immutable money events |
| Cross-cutting | Notification; DeliveryAttempt; AuditEvent; AnalyticsEvent | Retention, redaction, append-only audit |

Use UUID/ULID-style opaque identifiers, foreign keys and check constraints. Enforce unique email/mobile after normalization, scoped slug uniqueness, enrollment duplicate prevention and provider-event idempotency in the database. Index FKs, common status+date filters, normalized contacts, public slugs and search fields. Soft delete only where restoration has business value; financial/audit events are retained according to policy and corrected through compensating records. PII deletion/anonymization must respect retention obligations. Partitioning is not a V1 default.

## API contract

Versioned `/api/v1` JSON resources with explicit schemas. Route groups: auth/session/reset; users/roles/permissions; CMS/pages/revisions/media/SEO; services/catalog; courses/modules/lessons/assessment; programs/batches/sessions/attendance; enrollments/progress; leads/clients/activities/projects; invoices/payment-intents/transactions/refunds; notifications; analytics/audit. Each endpoint declares actor, permission, scope, validation, side effects, idempotency and error codes. Cursor pagination for changing lists, bounded page size, allowlisted filters/sorts, consistent error shape (`code`, `message`, `field_errors`, `request_id`), locale and timezone handling, optimistic revision checks for editorial edits. State-changing financial, enrollment and callback endpoints require idempotency keys. Webhooks verify signature, timestamp, replay protection and provider reference before mutation. Never reveal existence of private resources through differing errors.

## Security and privacy

Threats: account takeover, credential stuffing, privilege escalation, cross-client data exposure, stored XSS in CMS, malicious uploads, payment callback replay, SEO spam/content abuse and insider misuse. Controls: server-side deny-by-default authorization; password hashing; secure HttpOnly SameSite cookies; CSRF protection for cookie mutations; strict validation and output encoding; prepared queries; CSP and secure headers; allowlisted CORS; upload byte sniffing and processing isolation; rate limits; MFA-ready assurance model; private object storage; secret manager/Actions environments; encrypted transport and backups; tamper-evident append-only audit export; alerting for unusual admin/content activity. Regular dependency review and GitHub secret/code scanning. Legal privacy/retention/cookie requirements must be reviewed for actual jurisdictions before final policy.

## Technology evaluation

| Candidate | Strength | Main cost/risk | Decision state |
|---|---|---|---|
| Next.js + TypeScript full-stack | Strong server rendering and metadata support; portfolio code is in this ecosystem; one language across UI/API. [Next docs](https://nextjs.org/docs/app), [self-hosting](https://nextjs.org/docs/app/guides/self-hosting) | Domain-heavy LMS/TMS/RBAC needs strict server architecture and long-running queue worker; hosting must support Node, not static-only | Leading candidate, **proposed** |
| Laravel + PHP + server-rendered UI | Mature auth/policy/queue patterns and broad hosting options. [Laravel queues](https://laravel.com/docs/12.x/queues), [structure](https://laravel.com/docs/12.x/structure) | Separate design-system integration choice; PHP expertise and target hosting need validation | Alternative |
| Django + Python + server-rendered UI | Mature admin and data modeling, transactional DB support. [Django DB docs](https://docs.djangoproject.com/en/5.2/topics/db/) | Custom polished multi-portal UX still substantial; Python deployment operations need validation | Alternative |
| PostgreSQL | Relational constraints, transactions and text-search base. [PostgreSQL search](https://www.postgresql.org/docs/current/textsearch-intro.html) | Actual host support/cost and Bangla ranking quality need validation | Leading DB candidate, **proposed** |

Recommended **candidate**, subject to approvals: Next.js/TypeScript modular monolith, PostgreSQL, standards-compatible object storage, background worker and GitHub Actions. **Confirmed deployment intent:** use the current domain's hosting when the new platform is ready. Its capabilities have not been verified; the live site's LiteSpeed/PHP response is evidence of current behavior, not proof that Node or PostgreSQL processes are available. Do not lock Next.js/PostgreSQL until the hosting capability/budget check; if the existing host cannot run the selected stack, the partner must approve either a compatible stack or a separate application host while retaining the domain. Do not select ORM, auth package, CMS library, payment provider, mail/SMS service or analytics vendor until requirements and constraints are confirmed. Evaluate licensing, maintenance, security history, deployment cost and exit path before dependency adoption. A simple custom typed CMS over project domain records may fit better than adopting a generic headless CMS, but must be prototyped against editor workflow and permission requirements. No microservices, Redis, dedicated search or CDN dependency by default; add only with measured need.

## Design and deployment boundaries

Portfolio **color grading** is an input to OnSkillIT's independent design tokens. OnSkillIT motion and interaction patterns are specified separately in the product spec; implementation must not import portfolio motion constants or components. Shared OnSkillIT visual vocabulary applies to public/staff/portals; components may differ by task density. Public pages should be server-rendered or cached, while private areas are personalized and never publicly cached. Domain/base URL comes from environment. Deploy application, queue, database and media separately so hosting and domain can change. Preview/staging/production have isolated credentials and data. CI from public GitHub repo uses minimal permissions, pinned actions, dependency review, protected branches and environment approval for production; do not expose secrets to untrusted PR workflows. [GitHub deployment environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments), [Actions security](https://docs.github.com/en/actions/how-tos/secure-your-work).

Backup design: encrypted database snapshot plus point-in-time recovery where supported, versioned private media, configuration inventory and documented restoration. Run restore drills in staging and measure RPO/RTO. Observability: structured request IDs, redacted app logs, error tracking, job queue metrics, audit events, uptime, Core Web Vitals and deployment provenance. Alerts have an assigned human responder.

## ADR queue (all pending)

| ADR | Context/options | Provisional direction | Approval gate |
|---|---|---|---|
| 0101 application framework | Next/Laravel/Django | Next/TypeScript candidate | Final stack |
| 0102 database | PostgreSQL/MySQL-compatible | PostgreSQL candidate | Database/hosting |
| 0103 identity implementation | custom vs managed service; session/MFA | first-party account model with hardened library | Auth/security |
| 0104 CMS | custom typed CMS vs headless | evaluate with editor prototype | CMS architecture |
| 0105 API | internal server calls + versioned JSON | versioned JSON for external/portal contracts | API architecture |
| 0106 media/search | object storage and DB search vs services | portable adapters; corpus test | Storage/search |
| 0107 payment | manual records + provider adapter | provider-neutral ledger | Legal/provider/payment |
| 0108 hosting/deployment | managed Node/container/PHP/Python | portable container-capable target | Production architecture |

Each accepted ADR will contain context, problem, options, decision, rationale, trade-offs, consequences, status, evidence and approval date. No queued ADR above is accepted yet. Accepted project-direction ADRs 0001–0004 live under `docs/decisions/`.
