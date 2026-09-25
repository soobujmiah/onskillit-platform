# Requirements traceability matrix

PHASE-01 work in progress: R15/R17, SYS-NOT-FOUND and SYS-ERROR map to `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/api/v1/health/route.ts`, `package.json` and `.github/workflows/foundation.yml`. GitHub CI run and commit evidence are pending; no row is CI-verified or released. See [PHASE-01-WORKLOG](PHASE-01-WORKLOG.md).

Status vocabulary: `requested`, `specified`, `approved`, `implemented`, `CI-verified`, `released`. Every row remains **specified for implementation**, not implemented or CI-verified; architectural choices are accepted in ADRs 0006–0009. Test entries are required future **GitHub** CI evidence, not a result. `ALL-V1` expands to all 74 V1 page IDs listed in [PAGES.md](PAGES.md). Future IDs are excluded. This shorthand covers cross-cutting responsive/accessibility, bilingual purity and theme rules. The page coverage table below gives an explicit reverse lookup for each page. Physical table names, exact endpoint payloads, source paths and test files are delivered and reviewed in their owning implementation phases.

| ID / priority | Requirement | Implementation phase(s) | Module | Page IDs | Design | Database | API | Required GitHub test | Documentation | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| R01 P0 | Register/login/reset | PHASE-03 | Identity | AUTH-SIGN-IN, AUTH-REGISTER, AUTH-RECOVERY, AUTH-RESET, USER-PROFILE | Contact recovery | User, Contact, Session | Auth routes | Duplicate, reset, abuse | SPECIFICATION, SECURITY-ARCHITECTURE | specified |
| R02 P0 | Multiple scoped admins | PHASE-03 | RBAC | ADMIN-USERS, ADMIN-ROLES, SYS-FORBIDDEN | Deny/default, delegated scope | Role, Permission, Assignment | Admin/role routes | Permission matrix | SPECIFICATION, ARCHITECTURE | specified |
| R03 P0 | Page builder/review/revisions | PHASE-04 | CMS | ADMIN-CMS-PAGES, ADMIN-CMS-EDITOR, ADMIN-NAVIGATION, ADMIN-SITE-SETTINGS | Typed blocks/workflow | Page, Revision, Section | CMS routes | Publish/rollback | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R04 P0 | Private/public media | PHASE-04, PHASE-06 | Media | ADMIN-MEDIA, ADMIN-CMS-EDITOR, USER-LESSON | Rights/derivatives | MediaAsset | Upload/download | MIME/access | SPECIFICATION, SECURITY-ARCHITECTURE | specified |
| R05 P0 | Verified services | PHASE-04, PHASE-05 | Catalog | PAGE-SERVICES, PAGE-SERVICE-DETAIL, PAGE-HOME, ADMIN-CMS-PAGES, ADMIN-CMS-EDITOR | Canonical records | Service, Category | Catalog routes | Visibility/SEO | SPECIFICATION, SEO-CONTENT | specified |
| R06 P0 | LMS curriculum/progress | PHASE-06, PHASE-10 | LMS | PAGE-COURSES, PAGE-COURSE-DETAIL, USER-LEARNING, USER-LESSON, USER-ASSESSMENTS, USER-COURSES, USER-PROGRESS, USER-RESULTS, USER-CERTIFICATES, ADMIN-COURSES, ADMIN-COURSE-EDITOR, ADMIN-ASSESSMENTS, ADMIN-INSTRUCTORS | Frozen edition | CourseEdition, Lesson, Submission | LMS routes | Progress/grade scope | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R07 P0 | TMS batches/attendance | PHASE-07, PHASE-10 | TMS | PAGE-PROGRAMS, PAGE-PROGRAM-DETAIL, PAGE-BATCH-DETAIL, USER-TRAINING, USER-RESULTS, ADMIN-PROGRAMS, ADMIN-BATCHES, ADMIN-SESSIONS, ADMIN-ATTENDANCE | Shared learner identity | Program, Batch, Session, Attendance | TMS routes | Capacity/attendance | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R08 P0 | Enrollment lifecycle | PHASE-06, PHASE-07, PHASE-08, PHASE-10 | Enrollment | PAGE-COURSE-DETAIL, PAGE-BATCH-DETAIL, USER-ENROLLMENTS, USER-DASHBOARD, ADMIN-ENROLLMENTS | State machine/history | Enrollment, Event | Enroll routes | Race/transfer | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R09 P0 | Leads/clients/activities | PHASE-05, PHASE-09, PHASE-10 | CRM | PAGE-CONTACT, CLIENT-DASHBOARD, CLIENT-PROFILE, CLIENT-PROJECTS, CLIENT-PROJECT-DETAIL, CLIENT-REQUESTS, ADMIN-LEADS, ADMIN-CLIENTS, ADMIN-PROJECTS, ADMIN-CRM-ACTIVITIES, ADMIN-SERVICE-REQUESTS | Account isolation | Lead, Account, Activity | CRM routes | Isolation/lifecycle | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R10 P0 | Sensitive-action audit | PHASE-03, PHASE-08 | Audit | ADMIN-AUDIT, ADMIN-USERS, ADMIN-ROLES, ADMIN-TRANSACTIONS | Append-only/redacted | AuditEvent | Restricted audit | Actor/outcome | ARCHITECTURE, SECURITY-ARCHITECTURE | specified |
| R11 P0 | Live/offline pay/refund | PHASE-08, PHASE-10 | Finance | USER-BILLING, CLIENT-BILLING, ADMIN-INVOICES, ADMIN-TRANSACTIONS, ADMIN-PAYMENT-SETTINGS | Provider adapters/ledger | Invoice, Intent, Transaction, Refund | Pay/finance routes | Sandbox/replay/refund | PAYMENTS, DOMAIN-WORKFLOWS | specified |
| R12 P1 | Learner/client portals | PHASE-10 | Portals | USER-DASHBOARD, USER-COURSES, USER-PROGRESS, USER-RESULTS, USER-CERTIFICATES, USER-NOTIFICATIONS, CLIENT-DASHBOARD, CLIENT-PROFILE, CLIENT-PROJECTS, CLIENT-PROJECT-DETAIL, CLIENT-REQUESTS, CLIENT-BILLING | Scoped task views | Domain joins | Portal routes | Cross-account/mobile | SPECIFICATION, DESIGN-SYSTEM | specified |
| R13 P1 | Blog/portfolio/team/SEO | PHASE-04, PHASE-05, PHASE-11 | Publishing | PAGE-ABOUT, PAGE-FAQ, PAGE-PRIVACY, PAGE-TERMS, PAGE-ACCESSIBILITY, PAGE-PORTFOLIO, PAGE-PROJECT-DETAIL, PAGE-TEAM, PAGE-BLOG, PAGE-ARTICLE, ADMIN-CMS-PAGES, ADMIN-CMS-EDITOR, ADMIN-SEO, ADMIN-CONTENT | Localized canonical records | Article, Case, Team, Seo | Public/CMS routes | Metadata/sitemap | SEO-CONTENT, SPECIFICATION | specified |
| R14 P1 | Search/analytics/notices | PHASE-05, PHASE-06, PHASE-07, PHASE-10, PHASE-11 | Cross-cutting | PAGE-SERVICES, PAGE-COURSES, PAGE-PROGRAMS, PAGE-BLOG, ADMIN-ANALYTICS, ADMIN-NOTIFICATIONS, USER-NOTIFICATIONS | Permission/consent | SearchIndex, Event, Attempt | Search/event routes | Scope/consent/retry | SPECIFICATION, ARCHITECTURE | specified |
| R15 P1 | Security/recovery/monitoring | PHASE-01, PHASE-03, PHASE-04 | Operations | SYS-NOT-FOUND, SYS-ERROR, SYS-FORBIDDEN, ADMIN-AUDIT, ADMIN-SITE-SETTINGS | Threat/recovery controls | Retention policies | Health/admin | Scan/restore/alert | SECURITY-ARCHITECTURE, OPERATIONS | specified |
| R16 P0 | Original visual, full responsiveness and accessibility | PHASE-02–PHASE-14 | Design | ALL-V1 | Guided-progress UI | Theme preference | Preference route | WCAG/responsive task matrix | DESIGN-SYSTEM, QUALITY-GATES | specified |
| R17 P1 | GitHub CI/portable deploy | PHASE-01 | DevOps | SYS-ERROR, SYS-NOT-FOUND | Protected release | External config | Health/deploy | CI/preview/rollback | OPERATIONS, QUALITY-GATES | specified |
| R18 P2 | OTP/2FA/extra gateways | PHASE-15 | Extensions | FUT-USER-SECURITY | Factors/adapters | Factor, ProviderConfig | Later routes | Compatibility | ARCHITECTURE, PAYMENTS | specified |
| R19 P0 | Full Bangla/English purity | PHASE-02–PHASE-14 | Localization | ALL-V1 | Locale parity/review | Localized fields | Locale contract | Script purity/parity | SPECIFICATION, DESIGN-SYSTEM | specified |
| R20 P0 | Dark/light toggle | PHASE-02–PHASE-14 | Design | ALL-V1 | Two token sets | Preference | Preference route | Contrast/no flash | DESIGN-SYSTEM, QUALITY-GATES | specified |

## Page coverage (reverse lookup)

Every V1 route template appears below with at least one requirement. The global requirements R16/R19/R20 apply to every V1 page even where the compact row lists only its domain IDs. R17 applies to all implementation work through GitHub CI/deployment. Future pages remain reserved until change-specific requirements are approved.

| Page ID | Phase | Domain requirement IDs |
|---|---|---|
| PAGE-HOME | PHASE-05 | R05; R16; R19; R20 |
| PAGE-ABOUT | PHASE-05 | R13; R16; R19; R20 |
| PAGE-SERVICES | PHASE-05 | R05, R14; R16; R19; R20 |
| PAGE-SERVICE-DETAIL | PHASE-05 | R05; R16; R19; R20 |
| PAGE-CONTACT | PHASE-05 | R09; R16; R19; R20 |
| PAGE-FAQ | PHASE-05 | R13; R16; R19; R20 |
| PAGE-PRIVACY | PHASE-05 | R13; R16; R19; R20 |
| PAGE-TERMS | PHASE-05 | R13; R16; R19; R20 |
| PAGE-ACCESSIBILITY | PHASE-05 | R13; R16; R19; R20 |
| PAGE-COURSES | PHASE-06 | R06, R14; R16; R19; R20 |
| PAGE-COURSE-DETAIL | PHASE-06 | R06, R08; R16; R19; R20 |
| PAGE-PROGRAMS | PHASE-07 | R07, R14; R16; R19; R20 |
| PAGE-PROGRAM-DETAIL | PHASE-07 | R07; R16; R19; R20 |
| PAGE-BATCH-DETAIL | PHASE-07 | R07, R08; R16; R19; R20 |
| PAGE-PORTFOLIO | PHASE-11 | R13; R16; R19; R20 |
| PAGE-PROJECT-DETAIL | PHASE-11 | R13; R16; R19; R20 |
| PAGE-TEAM | PHASE-11 | R13; R16; R19; R20 |
| PAGE-BLOG | PHASE-11 | R13, R14; R16; R19; R20 |
| PAGE-ARTICLE | PHASE-11 | R13; R16; R19; R20 |
| AUTH-SIGN-IN | PHASE-03 | R01; R16; R19; R20 |
| AUTH-REGISTER | PHASE-03 | R01; R16; R19; R20 |
| AUTH-RECOVERY | PHASE-03 | R01; R16; R19; R20 |
| AUTH-RESET | PHASE-03 | R01; R16; R19; R20 |
| USER-PROFILE | PHASE-03 | R01; R16; R19; R20 |
| USER-LEARNING | PHASE-06 | R06; R16; R19; R20 |
| USER-LESSON | PHASE-06 | R04, R06; R16; R19; R20 |
| USER-ASSESSMENTS | PHASE-06 | R06; R16; R19; R20 |
| USER-TRAINING | PHASE-07 | R07; R16; R19; R20 |
| USER-ENROLLMENTS | PHASE-08 | R08; R16; R19; R20 |
| USER-BILLING | PHASE-08 | R11; R16; R19; R20 |
| USER-DASHBOARD | PHASE-10 | R08, R12; R16; R19; R20 |
| USER-COURSES | PHASE-10 | R06, R12; R16; R19; R20 |
| USER-PROGRESS | PHASE-10 | R06, R12; R16; R19; R20 |
| USER-RESULTS | PHASE-10 | R06, R07, R12; R16; R19; R20 |
| USER-CERTIFICATES | PHASE-10 | R06, R12; R16; R19; R20 |
| USER-NOTIFICATIONS | PHASE-10 | R12, R14; R16; R19; R20 |
| CLIENT-DASHBOARD | PHASE-10 | R09, R12; R16; R19; R20 |
| CLIENT-PROFILE | PHASE-10 | R09, R12; R16; R19; R20 |
| CLIENT-PROJECTS | PHASE-10 | R09, R12; R16; R19; R20 |
| CLIENT-PROJECT-DETAIL | PHASE-10 | R09, R12; R16; R19; R20 |
| CLIENT-REQUESTS | PHASE-10 | R09, R12; R16; R19; R20 |
| CLIENT-BILLING | PHASE-10 | R11, R12; R16; R19; R20 |
| ADMIN-USERS | PHASE-03 | R02, R10; R16; R19; R20 |
| ADMIN-ROLES | PHASE-03 | R02, R10; R16; R19; R20 |
| ADMIN-AUDIT | PHASE-03 | R10, R15; R16; R19; R20 |
| ADMIN-CMS-PAGES | PHASE-04 | R03, R05, R13; R16; R19; R20 |
| ADMIN-CMS-EDITOR | PHASE-04 | R03, R04, R05, R13; R16; R19; R20 |
| ADMIN-NAVIGATION | PHASE-04 | R03; R16; R19; R20 |
| ADMIN-MEDIA | PHASE-04 | R04; R16; R19; R20 |
| ADMIN-SEO | PHASE-04 | R13; R16; R19; R20 |
| ADMIN-SITE-SETTINGS | PHASE-04 | R03, R15; R16; R19; R20 |
| ADMIN-COURSES | PHASE-06 | R06; R16; R19; R20 |
| ADMIN-COURSE-EDITOR | PHASE-06 | R06; R16; R19; R20 |
| ADMIN-ASSESSMENTS | PHASE-06 | R06; R16; R19; R20 |
| ADMIN-INSTRUCTORS | PHASE-06 | R06; R16; R19; R20 |
| ADMIN-PROGRAMS | PHASE-07 | R07; R16; R19; R20 |
| ADMIN-BATCHES | PHASE-07 | R07; R16; R19; R20 |
| ADMIN-SESSIONS | PHASE-07 | R07; R16; R19; R20 |
| ADMIN-ATTENDANCE | PHASE-07 | R07; R16; R19; R20 |
| ADMIN-ENROLLMENTS | PHASE-08 | R08; R16; R19; R20 |
| ADMIN-INVOICES | PHASE-08 | R11; R16; R19; R20 |
| ADMIN-TRANSACTIONS | PHASE-08 | R10, R11; R16; R19; R20 |
| ADMIN-PAYMENT-SETTINGS | PHASE-08 | R11; R16; R19; R20 |
| ADMIN-LEADS | PHASE-09 | R09; R16; R19; R20 |
| ADMIN-CLIENTS | PHASE-09 | R09; R16; R19; R20 |
| ADMIN-PROJECTS | PHASE-09 | R09; R16; R19; R20 |
| ADMIN-CRM-ACTIVITIES | PHASE-09 | R09; R16; R19; R20 |
| ADMIN-SERVICE-REQUESTS | PHASE-09 | R09; R16; R19; R20 |
| ADMIN-CONTENT | PHASE-11 | R13; R16; R19; R20 |
| ADMIN-ANALYTICS | PHASE-11 | R14; R16; R19; R20 |
| ADMIN-NOTIFICATIONS | PHASE-11 | R14; R16; R19; R20 |
| SYS-NOT-FOUND | PHASE-01 | R15, R17; R16; R19; R20 |
| SYS-ERROR | PHASE-01 | R15, R17; R16; R19; R20 |
| SYS-FORBIDDEN | PHASE-03 | R02, R15; R16; R19; R20 |

When implementation starts, add exact source path, migration, endpoint, UI route, test file, PR and GitHub CI run to each relevant row. A row reaches `CI-verified` only with a passing run tied to its commit; `released` requires target-environment evidence and owner gate. New requirements and pages must enter this matrix before code. Requirement → phase → module → page → database → API → test → documentation is the review chain; the order here is traceability, not a substitute for approved data/API design.

## Reserved template traceability

These PHASE-15 templates are reservations, not approved V1 requirements. Their implementation needs a new requirement ID, approved scope and change-specific gate before code.

| Page ID | Proposed future capability | Current trace status |
|---|---|---|
| FUT-CAREERS | Recruitment workflow | requirement pending |
| FUT-INSTRUCTOR-DETAIL | Consented public trainer profile | requirement pending |
| FUT-CLIENT-DOCUMENTS | Scoped document exchange | requirement pending |
| FUT-CLIENT-MESSAGES | Retained client communications | requirement pending |
| FUT-USER-SECURITY | Optional verified factors, R18 | conceptual only |

## Phase 0 evidence additions

R05 business-offer verification is tracked in `OFFERINGS.md` and remains blocked for actual catalog proof. R06/R08 now use the PHASE-06 LearningAccess → PHASE-08 Enrollment link in `DOMAIN-CONSISTENCY.md`; R09 uses the PHASE-05 Inquiry → PHASE-09 Lead conversion. R11 official provider/merchant status is in `PAYMENTS.md`; R13 SEO/legacy disposition is in `SEO-CONTENT.md` and `LEGACY-URL-DISPOSITION.md`; R15 and R17 hosting/operations evidence is in `HOSTING-CAPABILITY.md`. R16/R19/R20 original UX, bilingual/theme review is in `UX-CONCEPT-REVIEW.md`. No requirement or page ID has been reassigned; all row statuses remain conceptual until implementation evidence exists.
