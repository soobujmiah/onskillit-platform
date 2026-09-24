# Conceptual database architecture

Status: **accepted logical model and physical design rules** under ADRs 0006/0009. PostgreSQL and Drizzle are selected; exact migration files are PHASE-01 and later implementation artifacts. No production data has been inspected or migrated.

## Core principles

One identity spans learner, client contact, instructor and staff roles; do not create separate login tables. Use foreign keys and explicit join tables instead of JSON for relationships. Store money in integer minor units plus ISO currency; timestamps in UTC with original timezone where schedule meaning depends on it. Every table has stable opaque ID, creation/update metadata and a clear owning domain. Use transactional state transitions for enrollment, capacity and finance. Do not version every row: content, curriculum, financial and certificate history need different models.

## Entity groups and cardinality

| Aggregate | Entities and cardinality | Ownership and lifecycle |
|---|---|---|
| Identity | User 1:N ContactMethod, User 1:N Session, User M:N Role through RoleAssignment; Role M:N Permission | Contact value normalized+unique by type; role assignments scoped, time-bounded if needed; user status controls sessions |
| CMS | Page 1:N PageRevision; PageRevision 1:N SectionInstance; SectionInstance N:1 SectionDefinition/version; Page 1:1 active published revision; Navigation N:M page/URL item | Draft/review/approved/published/archived; revisions immutable after save; rollback copies prior revision |
| Media | MediaAsset 1:N MediaVariant; MediaUsage N:1 MediaAsset; media owned by uploader/organization | Asset rights, checksum, MIME, locale alt, private/public state; referenced assets cannot be deleted silently |
| Catalog | Service N:1 Category; Course 1:N CourseEdition; CourseEdition 1:N Module 1:N Lesson; Lesson N:M MediaAsset through LearningAsset | Public offer only after approval; course edition freezes syllabus for enrollment |
| Programs/TMS | Program N:M CourseEdition; Program 1:N Batch; Batch 1:N TrainingSession; Batch M:N Instructor through TrainerAssignment | Batch state planned/open/running/closed; session changes retain history |
| Enrollment/LMS | User 1:N Enrollment; Enrollment N:1 CourseEdition and optional Batch; Enrollment 1:N LessonCompletion/AssessmentAttempt; LearningAccess N:1 User and N:1 CourseEdition, optionally linked to Enrollment; Attempt 1:N Submission/GradeEvent | One active enrollment per user+offer under defined repeat policy; progress and completion derived from events |
| Training records | TrainingSession 1:N AttendanceRecord; AttendanceRecord N:1 TrainingParticipation; TrainingParticipation N:1 User and N:1 Batch, optionally linked to Enrollment after PHASE-08; Batch 1:N Result; Certificate N:1 Enrollment | Unique attendance per session/participation; corrections and revocation append events |
| CRM | Lead 1:N LeadActivity; ClientAccount 1:N ClientContact; ClientAccount 1:N ServiceEngagement; Engagement 1:N Project/SupportRequest/DocumentGrant | Lead conversion links history; client records isolated by account; internal notes never client-visible |
| Finance | Invoice 1:N InvoiceLine; Invoice 1:N PaymentIntent; Intent 1:N PaymentTransaction; Transaction 1:N Refund; Invoice 1:N ReconciliationEntry | Issued invoice/transaction history immutable; correction uses credit/adjustment events |
| Cross-cutting | User 1:N Notification; Notification 1:N DeliveryAttempt; AuditEvent references actor/resource; Redirect, SeoMetadata, SiteSetting | Notification retries idempotent; audit append-only; settings change audited |

## Key constraints and indexes

- Unique normalized email and mobile across active identities; define policy for reusing contact after account deletion. Verification state is separate from value. Registration accepts one or both.
- Unique slug by locale and content type, with a redirect record on approved slug change. Public search indexes only published revisions/offerings.
- Course edition/content identity cannot be overwritten after a learner enrolls; new curriculum version gets a new edition.
- Batch capacity reservation and enrollment admission occur under a transaction/lock or equivalent atomic compare-and-set. Unique active enrollment prevents duplicate seats. Waitlist order and transfer policy must be specified before implementation.
- Attendance uniqueness: `(training_session_id, training_participation_id)`; instructor can update only assigned batch/session. Grade changes create GradeEvent with reason.
- Payment provider event ID and merchant reference have unique constraints; intent amount/currency cannot change after checkout begins. Callback processing and enrollment admission share an idempotent transaction/outbox pattern.
- Common indexes: foreign keys, `(status, created_at)` for operational queues, `(owner/account_id, status)` for scoped lists, locale+slug, batch+session date, invoice+due date, and search expressions chosen after query review. Avoid speculative indexes on every field.

## Retention, deletion and audit

Soft delete applies to user-facing recoverable content and selected CRM records only where useful. Never soft delete every table by default. Financial, certificate and audit records follow legal retention and correction policy. Deactivation revokes sessions/access; privacy deletion may anonymize personal fields while preserving lawful aggregate/financial history. Public content removal and 410/redirect decisions are separate from database deletion. Media deletion requires reference and rights checks. AuditEvent contains actor, action, resource, UTC time, outcome and minimal metadata, never passwords, reset tokens, full payment payloads or private documents.

## Policy inputs and implementation details

Exact legal invoice fields, learner repeat-enrollment policy, program/course relation, grading/certificate rules, organization/multi-tenant needs, Bangla text-search strategy, CMS block version migrations, consent/retention and the target database version remain open. Resolve with real workflows and approved ADRs before physical migrations.

## Cross-phase baseline contracts

PHASE-05 stores public `Inquiry` with source/service reference and consent metadata before PHASE-09 CRM exists; an audited `Lead` conversion maps it without losing original timestamp/source. PHASE-06 stores staff-granted `LearningAccess` as the sole lesson authorization link before PHASE-08 self-service enrollment exists; PHASE-07 stores staff-granted `TrainingParticipation` for batch attendance; PHASE-08 links verified admitted enrollment to the same LearningAccess and/or TrainingParticipation records through idempotent transitions. Access revocation, course-edition immutability and audit apply in both phases. These are logical entities and lifecycle contracts, not physical migrations. The current page and phase IDs are unchanged.

## Accepted physical contract and chain

PostgreSQL is the V1 source of truth. Drizzle may generate typed access, but migrations are reviewed SQL in GitHub and must preserve the constraints below. Domain modules own tables and expose application services; cross-module foreign keys reference stable IDs rather than duplicating identity. `OrganizationSetting` stores brand name, optional legal name, copyright holder, invoice issuer, address, email, phone, social links and privacy contact with bilingual public display fields and audit. Missing legal fields block publication of dependent claims/invoices, not schema creation. `ProductPackage` is a catalog composition/pricing record managed through existing service/catalog CMS routes; it does not create a new public page template. Add `PaymentAttempt`, `ProviderEvent`, `SettlementEntry`, `OutboxEvent` and `JobLease` to the finance/operations groups, with unique provider event/reference keys. `Invoice` has immutable issued snapshot fields; `Refund` and `ReconciliationEntry` are append-only corrections.

| Requirement chain | Domain records and invariant | API consumer/owner | Page family / phase | GitHub acceptance |
|---|---|---|---|---|
| Identity/RBAC | User, ContactMethod, Session, RoleAssignment; normalized unique contacts and scoped grants | Auth and user endpoints, identity module | AUTH/ADMIN-USER, PHASE-03 | session/recovery/denial/audit |
| CMS/catalog/SEO | PageRevision, SectionInstance, Service, CourseEdition, Program, ProductPackage, MediaAsset, SeoMetadata; published locale revision only | CMS/public catalog, publishing module | PAGE/ADMIN-CMS, PHASE-04/05 | locale/rights/publish/preview |
| LMS/TMS/enrollment | LearningAccess, TrainingParticipation, Enrollment, Batch, Attendance, Assessment; capacity and edition immutable | learning/training/enrollment commands, respective owners | USER/ADMIN-LMS/TMS, PHASE-06/07/08 | concurrent admission, access, attendance |
| CRM/client | Inquiry, Lead, ClientAccount, Project, SupportRequest; account-scoped client projection | inquiry/CRM/client APIs | CLIENT/ADMIN-CRM, PHASE-05/09/10 | conversion, isolation |
| Commerce | Invoice, PaymentIntent, PaymentAttempt, ProviderEvent, Transaction, Refund, SettlementEntry; unique reference and idempotency | finance/provider APIs, commerce module | USER/CLIENT/ADMIN-PAYMENT, PHASE-08/10 | replay, mismatch, reconciliation |
| Cross-cutting | OrganizationSetting, Notification, DeliveryAttempt, OutboxEvent, AuditEvent | settings/notifications/audit APIs | ADMIN-SETTINGS and relevant routes, PHASE-03 onward | redaction, retry, audit completeness |

Policy inputs such as repeat enrollment, grading thresholds and retention are configurable and require approved operational values before dependent features go live. They do not change the schema or page architecture. No migration is created in Phase 0.
