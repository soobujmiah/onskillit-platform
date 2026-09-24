# Phase 0 domain, page, data and API consistency review

Reviewed 2026-09-24 against canonical [PHASES.md](PHASES.md), [PAGES.md](PAGES.md), [TRACEABILITY.md](TRACEABILITY.md), [DATA-MODEL.md](DATA-MODEL.md) and [API-CONTRACT.md](API-CONTRACT.md). **No phase or page IDs changed.** Logical contracts below are architecture; no migration, endpoint or UI exists. Exact physical schemas and payloads are a decision gate, not something to infer from conceptual names.

| Domain / requirements | Phase and page consumers | Owned logical data and API boundary | Security and GitHub acceptance | Remaining decision |
|---|---|---|---|---|
| Identity/RBAC/audit R01, R02, R10 | 03; AUTH-*, USER-PROFILE, ADMIN-USERS/ROLES/AUDIT, SYS-FORBIDDEN | User, ContactMethod, Session, Role, Permission, Assignment, AuditEvent; auth/user/role/audit commands | Unique normalized contact, staff recovery, session revocation, deny/default and scope/negative tests | Proofing, session lifetime, admin assurance |
| CMS/media R03, R04 | 04; ADMIN-CMS-PAGES/EDITOR, NAVIGATION, MEDIA, SEO, SITE-SETTINGS | Page, Revision, Section, MediaAsset/Variant/Usage, NavItem, SeoMetadata, Redirect, SiteSetting; CMS/media/SEO contracts | Publish permission, locale/rights gate, private preview, rollback, upload spoof tests | Workflow approvers, block schema and media storage |
| Services/inquiry R05 | 05; PAGE-SERVICES/DETAIL, PAGE-CONTACT; existing CMS work area | Service, Category and minimal Inquiry; public catalog and rate-limited inquiry; PHASE-09 converts Inquiry to Lead | Approved-only public queries, anti-spam, source/consent and no duplicate CRM write | Real catalog and inquiry retention |
| LMS R06 | 06; PAGE-COURSES/DETAIL, USER-LEARNING/LESSON/ASSESSMENTS, ADMIN-COURSES/EDITOR/ASSESSMENTS/INSTRUCTORS | Course, Edition, Module, Lesson, Asset, Assessment, Submission, Progress, staff-granted LearningAccess; course/learning/assessment/access commands | Frozen edition, access checks, instructor scope, progress/grade tests | Curriculum, assessment and certificate policy |
| TMS R07 | 07; PAGE-PROGRAMS/DETAIL/BATCH-DETAIL, USER-TRAINING, ADMIN-PROGRAMS/BATCHES/SESSIONS/ATTENDANCE | Program, Batch, Session, TrainerAssignment, TrainingParticipation, Attendance, Result; training/calendar/attendance commands | Trainer scope, time conflict, correction history | Capacity/schedule and trainer terms |
| Enrollment R08 | 08; USER-ENROLLMENTS, ADMIN-ENROLLMENTS and course/batch CTAs | Enrollment, Event, seat reservation/waitlist; request/admit/cancel/transfer commands link verified access | Concurrent capacity, idempotent admission, status history | Repeat/transfer policy |
| Finance R11 | 08; USER-BILLING, ADMIN-INVOICES/TRANSACTIONS/SETTINGS; CLIENT-BILLING consumes in 10 | Invoice/Line, Intent, Transaction, Refund, ReconciliationEntry; checkout, callback, refund and reports | Provider verification, idempotency, separation of duties, sandbox cases | Merchant/legal/tax/refund policy |
| CRM/client R09 | 09; ADMIN-LEADS/CLIENTS/PROJECTS/CRM-ACTIVITIES/SERVICE-REQUESTS; CLIENT-* consumes in 10 | Lead, Account/Contact, ServiceEngagement, Project, Activity, ServiceRequest; CRM and scoped client projections | Cross-account isolation, staff-note exclusion, conversion audit | Client-visible fields and SLA |
| Portals/notifications R12, R14 | 10–11; USER-DASHBOARD/COURSES/PROGRESS/RESULTS/CERTIFICATES/NOTIFICATIONS; CLIENT-*; ADMIN-NOTIFICATIONS/ANALYTICS | Certificate, Notification/Attempt, metrics and read models; `/me/*`, `/client/me/*`, notice/report contracts | Per-user/account projection, event deduplication, consent | Notification channels and certificate issuer |
| Publishing/search/SEO R13, R14 | 11; PAGE-PORTFOLIO/PROJECT-DETAIL/TEAM/BLOG/ARTICLE, ADMIN-CONTENT/SEO/ANALYTICS | Article, Case, TeamMember, SearchDocument, SeoMetadata, Redirect; published-only content/search | Rights/consent, no draft indexing, scoped search | Actual cases/team/article rights |
| Cross-cutting R15–R20 | 01–14; all V1 pages | Theme/locale preference, audit/health, external config, caches and logs | Both-language script purity, themes, WCAG, CWV, restore/rollback CI | Stack, targets, owner approval |

## Contradictions found and resolved in documentation

1. PHASE-06 learning pages depended on `Enrollment`, previously introduced only in PHASE-08. A minimal **LearningAccess** entitlement is now explicitly owned in PHASE-06 for staff-granted learning. PHASE-08 enrollment links to that entitlement after verified admission; it does not retroactively define Phase 6 checkout.
2. PHASE-07 attendance preceded PHASE-08 Enrollment. A staff-granted **TrainingParticipation** record is now explicitly owned in PHASE-07; PHASE-08 admitted enrollment links to it. Attendance is keyed to session plus participation.
3. PHASE-05 public inquiry preceded PHASE-09 CRM. A minimal **Inquiry** intake is now owned in PHASE-05, with audited conversion to Lead in PHASE-09. The PHASE-09 gate therefore depends on PHASE-05; this single dependency edge was added to PHASES.md without changing phase IDs or page ownership.
4. Service editing had no standalone admin page before PHASE-11. Existing ADMIN-CMS-PAGES/EDITOR typed collection views host Service records from PHASE-05; this is a tab/view in an existing route, not a new page template.
5. Staff landing is a role-scoped redirect to an authorized work queue; no ADMIN-DASHBOARD page exists in V1. Search is a query/state on existing listing pages, not a new route. These are deliberate page boundaries recorded in PAGES.md.

## Open contract decisions before implementation

- Exact database engine/version, IDs, table/column names, migration order, tenant/account keys, retention and legal finance fields.
- Exact `/api/v1` paths, OpenAPI payload/error schemas, actor/permission/scope matrix, idempotency expiry and webhook provider-specific verification.
- LearningAccess revocation rules when enrollment is refunded/transferred; instructor grading permissions; certificate eligibility and invalidation.
- CMS block versioning/export, locality of translated slugs, Bangla search relevance and media processor/storage design.
- Notification channel consent and client-visible project fields.

These are **owner/architecture decisions pending**, so conceptual alignment does not by itself pass physical database/API approval. Every endpoint family above has a page or external callback consumer; every data entity has a domain owner. The detailed acceptance criteria remain in [QUALITY-GATES.md](QUALITY-GATES.md) and [TRACEABILITY.md](TRACEABILITY.md).
