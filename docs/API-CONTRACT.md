# API architecture and endpoint contract

Status: **proposed interface design**, not implemented. Final routes and schemas follow approved workflows, database and authentication ADRs. API-first means each domain command/query has an explicit contract; server-rendered pages may call application services directly without making an HTTP loopback request.

## Global conventions

External JSON API prefix `/api/v1`; UTF-8; ISO 8601 UTC timestamps and explicit schedule timezone; opaque resource IDs. Authentication via secure session cookie for browser clients, with CSRF defense on mutations. Future token/mobile clients require a separate approved threat model. Authorization is checked server-side per resource and scope. Validate body, query and path; reject unknown write fields; bounded payload sizes. Cursor pagination for changing lists, capped `limit`, allowlisted filters/sorts. Search endpoints filter by authorization **before** ranking and pagination. Mutations use optimistic revision/ETag where edit conflicts matter. All requests get a request ID and rate-limit policy. Response errors use a stable shape: `code`, safe localized `message`, optional `field_errors`, `request_id`; never expose stack traces, private existence or raw provider errors.

## Endpoint families (illustrative)

| Family | Queries | Commands | Permission/contract note |
|---|---|---|---|
| Auth | `GET /session` | `POST /registrations`, `/sessions`, `/logout`, `/password-reset-requests`, `/password-resets` | Generic recovery response; one-time reset; rate limits |
| User/admin | `GET /users`, `/users/{id}`, `/roles` | `PATCH /users/{id}`, `POST /role-assignments`, `DELETE /role-assignments/{id}` | Scope-limited list and delegation; audit |
| CMS | `GET /pages`, `/pages/{id}/revisions` | `POST /pages`, `/revisions`, `/reviews`, `/publish`, `/rollback` | Revision precondition; approval and locale gate |
| Media | `GET /media`, `/media/{id}` | `POST /media-uploads`, `PATCH /media/{id}`, `DELETE /media/{id}` | Private-by-default; signed download/processing |
| Public content/catalog | published page/service/course/program/article/case queries and detail by locale+slug | staff create/update/publish through typed CMS/domain commands | Public queries return only approved offers and no private draft |
| LMS | `GET /courses/{id}/curriculum`, `/me/learning`, `/assessments` | staff-grant/revoke access, complete lesson, submit assessment, grade | Edition-stable, LearningAccess or admitted Enrollment authorization, instructor scope |
| TMS | `GET /batches`, `/sessions`, `/attendance` | create batch/session, staff-grant/revoke participation, assign trainer, mark/correct attendance | Capacity and time conflict policy |
| Enrollment | `GET /me/enrollments`, `/enrollments/{id}` | request, admit, cancel, transfer | Idempotency, transaction, eligibility |
| CRM/client | `GET /leads`, `/clients`, `/activities`, `/projects`, `/client/me/*` | create/qualify/convert/follow-up/support | Account isolation, explicit client-visible projection, staff-only fields excluded |
| Finance | `GET /invoices`, `/payment-intents`, `/transactions`, `/refunds` | create invoice, start checkout, approve offline, request refund | Amount/currency fixed; finance permissions |
| Provider callbacks | N/A | `POST /webhooks/payments/{provider}` | Provider authentication, independent query, replay prevention |
| SEO/settings | `GET /redirects`, `/seo`, `/settings` | authorized update | Publication and settings audit |
| Notices/analytics/audit | `GET /notifications`, `/reports`, `/audit` | mark read, preferences | Audit read restricted; aggregate privacy |

These are endpoint **families**, not a promise to expose every CRUD operation. Public website pages may use separate read-only route handlers; staff API should avoid generic update endpoints that bypass domain transitions. Versioning policy: nonbreaking additions stay in v1; breaking semantics require a new version and migration window. Document OpenAPI schemas and examples once endpoint behavior is approved.

## Idempotency and state transitions

Enrollment request, checkout creation, refund request and provider callback carry or derive a stable idempotency key. Repeating a request returns the same logical result; conflicting payload under the same key is rejected. State transitions return explicit conflict errors when stale or forbidden. Webhooks acknowledge safe receipt only after durable processing or enqueueing, then retry internally; customer redirect cannot mark payment complete. Background jobs use an outbox/inbox or equivalent durable event mechanism to avoid lost notifications and duplicate admissions.

## Public/private separation

Public API serves only published localized content, verified metadata and intentionally public team/instructor profiles. Student, client, instructor, staff and finance routes are separate permission surfaces. Do not cache private responses publicly. Prevent ID guessing from revealing whether another account's resource exists. Media routes return only authorized signed access to private assets. Audit/report exports require explicit scope, pagination and redaction.

## Contract verification

GitHub CI will validate schema compatibility, input errors, auth/permission negative cases, pagination/filter bounds, idempotency and cross-account isolation. Payment sandbox tests are in `PAYMENTS.md`. API and UI acceptance evidence maps to `TRACEABILITY.md`. No API check has run yet because no API exists.

## Cross-phase API ownership

PHASE-05 owns a rate-limited public inquiry command; PHASE-09 owns the explicit inquiry-to-lead conversion, rather than letting the form write directly into unbuilt CRM tables. PHASE-06 owns staff-granted learning-access commands/queries and lesson authorization; PHASE-07 owns staff-granted batch participation for attendance; PHASE-08 owns customer-facing enrollment/payment transitions and links admitted enrollment to learning access and/or training participation. Public details never expose private draft or price claims without approval. `/client/me/*` returns only account-scoped projections; staff notes are excluded. Search is a query on existing listing/work-queue routes, not a new page. These are contract families; exact paths, payload schemas and permission tables remain an approval item before code.
