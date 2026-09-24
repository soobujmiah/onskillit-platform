# Requirements traceability matrix

Status vocabulary: `requested`, `specified`, `approved`, `implemented`, `CI-verified`, `released`. All rows are currently `specified` at conceptual level; none is implemented or approved. “Test” names the required future CI evidence, not a test result. IDs persist across documents and implementation.

| ID / priority | Requirement → module | Design / DB | API / UI | Required GitHub test | Status |
|---|---|---|---|---|---|
| R01 P0 | Registration/login/reset → Identity | User, ContactMethod, Session, ResetToken | auth endpoints; account screens | duplicate contacts, brute force, reset replay | specified |
| R02 P0 | Multiple admins/sub-admins → RBAC | Role, Permission, RoleAssignment | scoped admin endpoints/UI | permission matrix, delegation denial | specified |
| R03 P0 | Pages/sections/revisions/approval → CMS | Page, Revision, Section | CMS endpoints/editor/preview | publish, rollback, unauthorized publish | specified |
| R04 P0 | Media with rights/access → Media | MediaAsset, derivative metadata | upload/download/picker | MIME spoof, private access, alt requirement | specified |
| R05 P0 | Services/public catalog → Catalog | Service, Category | list/detail and staff editor | approved-only visibility, SEO | specified |
| R06 P0 | Courses/lessons/assessment → LMS | CourseEdition, Module, Lesson, Assessment, Submission | course/learn/instructor UI | progress, grade scope, edition stability | specified |
| R07 P0 | Programs/batches/sessions/attendance → TMS | Program, Batch, Session, Attendance | timetable/staff UI | capacity, assignment, attendance scope | specified |
| R08 P0 | Enrollment/cancel/transfer → Enrollment | Enrollment, state events | enroll/student/staff UI | concurrency, duplicate, transfer history | specified |
| R09 P0 | Leads/clients/activities → CRM | Lead, Account, Contact, Activity | CRM/client UI | client isolation, lifecycle events | specified |
| R10 P0 | Audit sensitive actions → Audit | AuditEvent | restricted audit UI/export | actor/outcome completeness, tamper check | specified |
| R11 P1 | Invoice/payment/refund model → Finance | Invoice, Intent, Transaction, Refund | finance/payment adapter UI | callback replay, amount mismatch, refund authorization | specified |
| R12 P1 | Student/instructor/client portals → Portals | scoped joins to learning/CRM | portal routes | cross-account denial, mobile journeys | specified |
| R13 P1 | Blog/portfolio/team/SEO → Publishing | Article, PortfolioCase, TeamMember, SeoMetadata, Redirect | public/CMS routes | metadata, canonical, sitemap, redirect | specified |
| R14 P1 | Search/analytics/notifications → Cross-cutting | Index/Event/DeliveryAttempt | search/dashboard/preferences | permission filtering, event consent, retry | specified |
| R15 P1 | Security, backup, observability → Operations | retention and recovery policies | CI/staging/monitoring | dependency scan, restore drill, alert smoke | specified |
| R16 P1 | Original visual quality and accessibility → Design | OnSkillIT tokens and motion spec | public/admin/portals | WCAG, responsive, reduced motion, partner design review | specified |
| R17 P1 | Public GitHub and portable deployment → DevOps | config and deployment contracts | Actions/environments | CI build, preview, release approval, rollback | specified |
| R18 P2 | OTP/2FA/multiple providers → Extensions | assurance factors/provider adapters | later UI/API | compatibility contract | specified |
| R19 P0 | Complete Bangla/English and two-way script purity → Localization | localized fields, exception registry, publication gate | all public/admin/portal UI and metadata | CI script purity, parity, native-language review | specified |
| R20 P0 | Dark/light toggle throughout → Design | two semantic theme token sets, persisted choice | all route groups | both-theme visual/contrast checks, persistence, no-flash | specified |

When implementation starts, add exact source path, schema migration, endpoint, UI route, test file, documentation section, PR and CI run to each row. A row reaches `CI-verified` only with a passing run tied to its commit. It reaches `released` only with production evidence and owner gate.
