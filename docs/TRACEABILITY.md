# Requirements traceability matrix

Status vocabulary: `requested`, `specified`, `approved`, `implemented`, `CI-verified`, `released`. All rows are currently `specified` at conceptual level; none is implemented or approved. “Test” names the required future CI evidence, not a test result. IDs persist across documents and implementation.

| ID / priority | Requirement | Module | Design | Database | API | UI | Required GitHub test | Documentation | Status |
|---|---|---|---|---|---|---|---|---|---|
| R01 P0 | Register/login/reset | Identity | Contact recovery | User, Contact, Session | Auth routes | Account | Duplicate, reset, abuse | SPECIFICATION, SECURITY-ARCHITECTURE | specified |
| R02 P0 | Multiple scoped admins | RBAC | Deny/default, delegated scope | Role, Permission, Assignment | Admin/role routes | Staff | Permission matrix | SPECIFICATION, ARCHITECTURE | specified |
| R03 P0 | Page builder/review/revisions | CMS | Typed blocks/workflow | Page, Revision, Section | CMS routes | Editor/preview | Publish/rollback | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R04 P0 | Private/public media | Media | Rights/derivatives | MediaAsset | Upload/download | Picker | MIME/access | SPECIFICATION, SECURITY-ARCHITECTURE | specified |
| R05 P0 | Verified services | Catalog | Canonical records | Service, Category | Catalog routes | Public/staff | Visibility/SEO | SPECIFICATION, SEO-CONTENT | specified |
| R06 P0 | LMS curriculum/progress | LMS | Frozen edition | CourseEdition, Lesson, Submission | LMS routes | Learn/instructor | Progress/grade scope | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R07 P0 | TMS batches/attendance | TMS | Shared learner identity | Program, Batch, Session, Attendance | TMS routes | Schedule/staff | Capacity/attendance | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R08 P0 | Enrollment lifecycle | Enrollment | State machine/history | Enrollment, Event | Enroll routes | Student/staff | Race/transfer | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R09 P0 | Leads/clients/activities | CRM | Account isolation | Lead, Account, Activity | CRM routes | Staff/client | Isolation/lifecycle | SPECIFICATION, DOMAIN-WORKFLOWS | specified |
| R10 P0 | Sensitive-action audit | Audit | Append-only/redacted | AuditEvent | Restricted audit | Audit view | Actor/outcome | ARCHITECTURE, SECURITY-ARCHITECTURE | specified |
| R11 P0 | Live/offline pay/refund | Finance | Provider adapters/ledger | Invoice, Intent, Transaction, Refund | Pay/finance routes | Checkout/finance | Sandbox/replay/refund | PAYMENTS, DOMAIN-WORKFLOWS | specified |
| R12 P1 | Learner/client portals | Portals | Scoped task views | Domain joins | Portal routes | Portal | Cross-account/mobile | SPECIFICATION, DESIGN-SYSTEM | specified |
| R13 P1 | Blog/portfolio/team/SEO | Publishing | Localized canonical records | Article, Case, Team, Seo | Public/CMS routes | Public/editor | Metadata/sitemap | SEO-CONTENT, SPECIFICATION | specified |
| R14 P1 | Search/analytics/notices | Cross-cutting | Permission/consent | SearchIndex, Event, Attempt | Search/event routes | Search/dashboard | Scope/consent/retry | SPECIFICATION, ARCHITECTURE | specified |
| R15 P1 | Security/recovery/monitoring | Operations | Threat/recovery controls | Retention policies | Health/admin | Operations | Scan/restore/alert | SECURITY-ARCHITECTURE, OPERATIONS | specified |
| R16 P0 | Original visual, full responsiveness and accessibility | Design | Guided-progress UI | Theme preference | Preference route | All | WCAG/responsive task matrix | DESIGN-SYSTEM, QUALITY-GATES | specified |
| R17 P1 | GitHub CI/portable deploy | DevOps | Protected release | External config | Health/deploy | N/A | CI/preview/rollback | OPERATIONS, QUALITY-GATES | specified |
| R18 P2 | OTP/2FA/extra gateways | Extensions | Factors/adapters | Factor, ProviderConfig | Later routes | Later | Compatibility | ARCHITECTURE, PAYMENTS | specified |
| R19 P0 | Full Bangla/English purity | Localization | Locale parity/review | Localized fields | Locale contract | All | Script purity/parity | SPECIFICATION, DESIGN-SYSTEM | specified |
| R20 P0 | Dark/light toggle | Design | Two token sets | Preference | Preference route | All | Contrast/no flash | DESIGN-SYSTEM, QUALITY-GATES | specified |

When implementation starts, add exact source path, schema migration, endpoint, UI route, test file, documentation section, PR and CI run to each row. A row reaches `CI-verified` only with a passing run tied to its commit. It reaches `released` only with production evidence and owner gate.
