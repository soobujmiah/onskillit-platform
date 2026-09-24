# Canonical page inventory

Status: **proposed for founding-partner approval**. This file alone assigns permanent page IDs, routes and implementation phases. A record marked NOT STARTED does not claim implementation. V1 has **74 page templates**: **19 public** (including **6 dynamic public detail templates**), **4 authentication**, **13 student/user**, **6 client**, **29 admin**, **3 system**. **5 future/reserved** templates are outside V1 and require a later approval. Dynamic public is a subset of public, not an extra category. A URL for each record is not counted as another template. Localized `/en` and `/bn` variants use the same template and are not counted twice. Actual locale URL strategy remains an ADR decision; routes below are canonical locale-neutral patterns.

A page is a route-level responsibility with its own loading, access, error and navigation behavior. Modal, drawer, tab, reusable form, section and editor component are not pages unless they have a distinct route-level task. `/unmatched-state` and `/error-boundary-state` denote framework states, not literal public paths. `conditional` future indexability needs approval. Staff, account and portals are always noindex. Staff permission strings are proposed capabilities, subject to RBAC ADR. All page IDs are permanent even if a later ADR retires a route.

## Master table

| Page ID | Page name | Route | Type/audience | Purpose | Parent | Module | Auth | Permission | SEO | Static/dynamic | Template | Priority | Implementation phase | Status | Dependencies |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PAGE-HOME | Home | / | Public | Introduce verified offers | root | CMS | none | public | index | static | PAGE-HOME | P1 | PHASE-05 | NOT STARTED | CMS, Service |
| PAGE-ABOUT | About | /about | Public | Explain verified organization | root | CMS | none | public | index | static | PAGE-ABOUT | P1 | PHASE-05 | NOT STARTED | Page |
| PAGE-SERVICES | Services | /services | Public | Browse services | root | Catalog | none | public | index | listing | PAGE-SERVICES | P0 | PHASE-05 | NOT STARTED | Service, Category |
| PAGE-SERVICE-DETAIL | Service detail | /services/{slug} | Public | Explain one service | PAGE-SERVICES | Catalog | none | public | index | dynamic | PAGE-SERVICE-DETAIL | P0 | PHASE-05 | NOT STARTED | Service, Media, SEO |
| PAGE-CONTACT | Contact | /contact | Public | Submit inquiry | root | CRM | none | public | index | static | PAGE-CONTACT | P1 | PHASE-05 | NOT STARTED | Inquiry, rate limit |
| PAGE-FAQ | FAQ | /faq | Public | Answer approved questions | root | CMS | none | public | index | static | PAGE-FAQ | P1 | PHASE-05 | NOT STARTED | FAQ, SEO |
| PAGE-PRIVACY | Privacy | /privacy | Public | Publish approved notice | footer | CMS | none | public | index | static | PAGE-PRIVACY | P1 | PHASE-05 | NOT STARTED | Approved legal text |
| PAGE-TERMS | Terms | /terms | Public | Publish approved terms | footer | CMS | none | public | index | static | PAGE-TERMS | P1 | PHASE-05 | NOT STARTED | Approved legal text |
| PAGE-ACCESSIBILITY | Accessibility | /accessibility | Public | Explain access support | footer | CMS | none | public | index | static | PAGE-ACCESSIBILITY | P1 | PHASE-05 | NOT STARTED | Approved support policy |
| PAGE-COURSES | Courses | /courses | Public | Browse real courses | root | LMS | none | public | index | listing | PAGE-COURSES | P0 | PHASE-06 | NOT STARTED | Course, Instructor |
| PAGE-COURSE-DETAIL | Course detail | /courses/{slug} | Public | Choose a course | PAGE-COURSES | LMS | none | public | index | dynamic | PAGE-COURSE-DETAIL | P0 | PHASE-06 | NOT STARTED | Course, Edition, Media, SEO |
| PAGE-PROGRAMS | Programs | /programs | Public | Browse training programs | root | TMS | none | public | index | listing | PAGE-PROGRAMS | P0 | PHASE-07 | NOT STARTED | Program |
| PAGE-PROGRAM-DETAIL | Program detail | /programs/{slug} | Public | Explain training path | PAGE-PROGRAMS | TMS | none | public | index | dynamic | PAGE-PROGRAM-DETAIL | P0 | PHASE-07 | NOT STARTED | Program, Course |
| PAGE-BATCH-DETAIL | Batch detail | /training/batches/{slug} | Public | Show schedule and capacity | PAGE-PROGRAM-DETAIL | TMS | none | public | index | dynamic | PAGE-BATCH-DETAIL | P0 | PHASE-07 | NOT STARTED | Batch, Session, Instructor |
| PAGE-PORTFOLIO | Portfolio | /portfolio | Public | Browse approved case work | root | Publishing | none | public | index | listing | PAGE-PORTFOLIO | P1 | PHASE-11 | NOT STARTED | Case, rights |
| PAGE-PROJECT-DETAIL | Case detail | /portfolio/{slug} | Public | Explain one approved case | PAGE-PORTFOLIO | Publishing | none | public | index | dynamic | PAGE-PROJECT-DETAIL | P1 | PHASE-11 | NOT STARTED | Case, Media, rights |
| PAGE-TEAM | Team | /team | Public | Show consented people | root | Publishing | none | public | index | listing | PAGE-TEAM | P1 | PHASE-11 | NOT STARTED | TeamMember, consent |
| PAGE-BLOG | Blog | /blog | Public | Browse approved articles | root | Publishing | none | public | index | listing | PAGE-BLOG | P1 | PHASE-11 | NOT STARTED | Article |
| PAGE-ARTICLE | Article | /blog/{slug} | Public | Read one article | PAGE-BLOG | Publishing | none | public | index | dynamic | PAGE-ARTICLE | P1 | PHASE-11 | NOT STARTED | Article, Media, SEO |
| AUTH-SIGN-IN | Sign in | /account/sign-in | Authentication | Start session | account | Identity | guest | public | noindex | static | AUTH-SIGN-IN | P0 | PHASE-03 | NOT STARTED | User, Session |
| AUTH-REGISTER | Register | /account/register | Authentication | Create account | account | Identity | guest | public | noindex | static | AUTH-REGISTER | P0 | PHASE-03 | NOT STARTED | User, Contact |
| AUTH-RECOVERY | Request reset | /account/recovery | Authentication | Start recovery | account | Identity | guest | public | noindex | static | AUTH-RECOVERY | P0 | PHASE-03 | NOT STARTED | Recovery policy |
| AUTH-RESET | Reset password | /account/reset/{token} | Authentication | Finish email reset | account | Identity | token | token holder | noindex | dynamic | AUTH-RESET | P0 | PHASE-03 | NOT STARTED | Reset token |
| USER-PROFILE | Profile and security | /learn/profile | Student | Manage own identity | learn | Identity | user | self | noindex | static | USER-PROFILE | P0 | PHASE-03 | NOT STARTED | User, Contact |
| USER-LEARNING | Learning library | /learn/learning | Student | Access assigned content | learn | LMS | user | own enrollment | noindex | listing | USER-LEARNING | P0 | PHASE-06 | NOT STARTED | CourseEdition, Enrollment |
| USER-LESSON | Lesson player | /learn/courses/{courseId}/lessons/{lessonId} | Student | Study one lesson | USER-LEARNING | LMS | user | own enrollment | noindex | dynamic | USER-LESSON | P0 | PHASE-06 | NOT STARTED | Lesson, Progress, Media |
| USER-ASSESSMENTS | Assessments | /learn/assessments | Student | Submit learning work | learn | LMS | user | own enrollment | noindex | listing | USER-ASSESSMENTS | P0 | PHASE-06 | NOT STARTED | Assessment, Submission |
| USER-TRAINING | Training calendar | /learn/training | Student | See sessions and attendance | learn | TMS | user | own enrollment | noindex | listing | USER-TRAINING | P0 | PHASE-07 | NOT STARTED | Batch, Session, Attendance |
| USER-ENROLLMENTS | Enrollments | /learn/enrollments | Student | Apply and track status | learn | Enrollment | user | self | noindex | listing | USER-ENROLLMENTS | P0 | PHASE-08 | NOT STARTED | Enrollment, Invoice |
| USER-BILLING | Billing | /learn/billing | Student | View invoices/payments | learn | Finance | user | self | noindex | listing | USER-BILLING | P0 | PHASE-08 | NOT STARTED | Invoice, Transaction |
| USER-DASHBOARD | Student dashboard | /learn | Student | Summarize tasks | learn | Portals | user | self | noindex | static | USER-DASHBOARD | P1 | PHASE-10 | NOT STARTED | LMS, TMS, Enrollment |
| USER-COURSES | My courses | /learn/courses | Student | Track courses | learn | Portals | user | own enrollment | noindex | listing | USER-COURSES | P0 | PHASE-10 | NOT STARTED | Course, Progress |
| USER-PROGRESS | Progress | /learn/progress | Student | Review learning history | learn | Portals | user | self | noindex | static | USER-PROGRESS | P0 | PHASE-10 | NOT STARTED | Progress, Attendance |
| USER-RESULTS | Results | /learn/results | Student | Review grades | learn | Portals | user | self | noindex | listing | USER-RESULTS | P0 | PHASE-10 | NOT STARTED | Result, Submission |
| USER-CERTIFICATES | Certificates | /learn/certificates | Student | Access earned credentials | learn | Portals | user | self | noindex | listing | USER-CERTIFICATES | P0 | PHASE-10 | NOT STARTED | Certificate, policy |
| USER-NOTIFICATIONS | Notifications | /learn/notifications | Student | See account notices | learn | Portals | user | self | noindex | listing | USER-NOTIFICATIONS | P1 | PHASE-10 | NOT STARTED | Notification |
| CLIENT-DASHBOARD | Client dashboard | /client | Client | Summarize engagements | client | Portals | client | own account | noindex | static | CLIENT-DASHBOARD | P1 | PHASE-10 | NOT STARTED | Account, Project |
| CLIENT-PROFILE | Client profile | /client/profile | Client | Manage contact details | client | Portals | client | own account | noindex | static | CLIENT-PROFILE | P1 | PHASE-10 | NOT STARTED | Account, Contact |
| CLIENT-PROJECTS | Projects | /client/projects | Client | Track authorized projects | client | Portals | client | own account | noindex | listing | CLIENT-PROJECTS | P1 | PHASE-10 | NOT STARTED | Project |
| CLIENT-PROJECT-DETAIL | Project detail | /client/projects/{id} | Client | Review one project | CLIENT-PROJECTS | Portals | client | own account | noindex | dynamic | CLIENT-PROJECT-DETAIL | P1 | PHASE-10 | NOT STARTED | Project, Activity |
| CLIENT-REQUESTS | Service requests | /client/requests | Client | Submit and track requests | client | Portals | client | own account | noindex | listing | CLIENT-REQUESTS | P1 | PHASE-10 | NOT STARTED | ServiceRequest |
| CLIENT-BILLING | Client billing | /client/billing | Client | View own invoices | client | Portals | client | own account | noindex | listing | CLIENT-BILLING | P1 | PHASE-10 | NOT STARTED | Invoice, Payment |
| ADMIN-USERS | Users | /staff/users | Admin | Manage accounts | staff | Identity | staff | users.read | noindex | listing | ADMIN-USERS | P0 | PHASE-03 | NOT STARTED | User, RBAC |
| ADMIN-ROLES | Roles and permissions | /staff/roles | Admin | Manage scoped grants | staff | RBAC | staff | roles.manage | noindex | listing | ADMIN-ROLES | P0 | PHASE-03 | NOT STARTED | Role, Permission |
| ADMIN-AUDIT | Audit log | /staff/audit | Admin | Review sensitive actions | staff | Audit | staff | audit.read | noindex | listing | ADMIN-AUDIT | P0 | PHASE-03 | NOT STARTED | AuditEvent |
| ADMIN-CMS-PAGES | CMS pages | /staff/content/pages | Admin | List and review pages | staff | CMS | staff | pages.read | noindex | listing | ADMIN-CMS-PAGES | P0 | PHASE-04 | NOT STARTED | Page, Revision |
| ADMIN-CMS-EDITOR | Page editor | /staff/content/pages/{id} | Admin | Edit and publish page | ADMIN-CMS-PAGES | CMS | staff | pages.write | noindex | dynamic | ADMIN-CMS-EDITOR | P0 | PHASE-04 | NOT STARTED | Page, Section, Revision |
| ADMIN-NAVIGATION | Navigation | /staff/content/navigation | Admin | Manage menus/footer | staff | CMS | staff | navigation.write | noindex | static | ADMIN-NAVIGATION | P0 | PHASE-04 | NOT STARTED | NavItem, SiteSetting |
| ADMIN-MEDIA | Media | /staff/content/media | Admin | Manage public/private assets | staff | Media | staff | media.read | noindex | listing | ADMIN-MEDIA | P0 | PHASE-04 | NOT STARTED | MediaAsset |
| ADMIN-SEO | SEO controls | /staff/content/seo | Admin | Manage redirects/metadata | staff | CMS | staff | seo.write | noindex | listing | ADMIN-SEO | P1 | PHASE-04 | NOT STARTED | Seo, Redirect |
| ADMIN-SITE-SETTINGS | Site settings | /staff/settings/site | Admin | Manage safe site config | staff | CMS | staff | settings.site | noindex | static | ADMIN-SITE-SETTINGS | P0 | PHASE-04 | NOT STARTED | SiteSetting |
| ADMIN-COURSES | Courses | /staff/learning/courses | Admin | Manage course catalog | staff | LMS | staff | courses.read | noindex | listing | ADMIN-COURSES | P0 | PHASE-06 | NOT STARTED | Course, Edition |
| ADMIN-COURSE-EDITOR | Course editor | /staff/learning/courses/{id} | Admin | Manage curriculum | ADMIN-COURSES | LMS | staff | courses.write | noindex | dynamic | ADMIN-COURSE-EDITOR | P0 | PHASE-06 | NOT STARTED | Module, Lesson |
| ADMIN-ASSESSMENTS | Assessments | /staff/learning/assessments | Admin | Manage quizzes/work | staff | LMS | staff | assessments.manage | noindex | listing | ADMIN-ASSESSMENTS | P0 | PHASE-06 | NOT STARTED | Assessment, Submission |
| ADMIN-INSTRUCTORS | Instructors | /staff/learning/instructors | Admin | Assign teachers | staff | LMS | staff | instructors.manage | noindex | listing | ADMIN-INSTRUCTORS | P0 | PHASE-06 | NOT STARTED | InstructorAssignment |
| ADMIN-PROGRAMS | Programs | /staff/training/programs | Admin | Manage training programs | staff | TMS | staff | programs.manage | noindex | listing | ADMIN-PROGRAMS | P0 | PHASE-07 | NOT STARTED | Program |
| ADMIN-BATCHES | Batches | /staff/training/batches | Admin | Manage capacity/calendar | staff | TMS | staff | batches.manage | noindex | listing | ADMIN-BATCHES | P0 | PHASE-07 | NOT STARTED | Batch |
| ADMIN-SESSIONS | Sessions | /staff/training/sessions | Admin | Manage sessions | staff | TMS | staff | sessions.manage | noindex | listing | ADMIN-SESSIONS | P0 | PHASE-07 | NOT STARTED | Session |
| ADMIN-ATTENDANCE | Attendance and results | /staff/training/attendance | Admin | Record attendance/results | staff | TMS | staff | attendance.manage | noindex | listing | ADMIN-ATTENDANCE | P0 | PHASE-07 | NOT STARTED | Attendance, Result |
| ADMIN-ENROLLMENTS | Enrollments | /staff/enrollments | Admin | Review enrollment lifecycle | staff | Enrollment | staff | enrollments.manage | noindex | listing | ADMIN-ENROLLMENTS | P0 | PHASE-08 | NOT STARTED | Enrollment, Event |
| ADMIN-INVOICES | Invoices | /staff/finance/invoices | Admin | Issue/reconcile invoices | staff | Finance | staff | finance.invoice | noindex | listing | ADMIN-INVOICES | P0 | PHASE-08 | NOT STARTED | Invoice |
| ADMIN-TRANSACTIONS | Transactions and refunds | /staff/finance/transactions | Admin | Reconcile money events | staff | Finance | staff | finance.transaction | noindex | listing | ADMIN-TRANSACTIONS | P0 | PHASE-08 | NOT STARTED | Transaction, Refund |
| ADMIN-PAYMENT-SETTINGS | Payment settings | /staff/finance/settings | Admin | Configure approved providers | staff | Finance | staff | finance.settings | noindex | static | ADMIN-PAYMENT-SETTINGS | P0 | PHASE-08 | NOT STARTED | ProviderConfig |
| ADMIN-LEADS | Leads | /staff/crm/leads | Admin | Qualify prospects | staff | CRM | staff | leads.manage | noindex | listing | ADMIN-LEADS | P0 | PHASE-09 | NOT STARTED | Lead |
| ADMIN-CLIENTS | Clients | /staff/crm/clients | Admin | Manage accounts | staff | CRM | staff | clients.manage | noindex | listing | ADMIN-CLIENTS | P0 | PHASE-09 | NOT STARTED | Account, Contact |
| ADMIN-PROJECTS | Projects | /staff/crm/projects | Admin | Track delivery | staff | CRM | staff | projects.manage | noindex | listing | ADMIN-PROJECTS | P0 | PHASE-09 | NOT STARTED | Project |
| ADMIN-CRM-ACTIVITIES | CRM activities | /staff/crm/activities | Admin | Log follow-ups | staff | CRM | staff | activities.manage | noindex | listing | ADMIN-CRM-ACTIVITIES | P0 | PHASE-09 | NOT STARTED | Activity |
| ADMIN-SERVICE-REQUESTS | Service requests | /staff/crm/requests | Admin | Triage client needs | staff | CRM | staff | requests.manage | noindex | listing | ADMIN-SERVICE-REQUESTS | P0 | PHASE-09 | NOT STARTED | ServiceRequest |
| ADMIN-CONTENT | Articles, cases and team | /staff/content/collections | Admin | Manage canonical records | staff | Publishing | staff | collections.manage | noindex | listing | ADMIN-CONTENT | P1 | PHASE-11 | NOT STARTED | Article, Case, TeamMember |
| ADMIN-ANALYTICS | Analytics | /staff/analytics | Admin | Review consented metrics | staff | Analytics | staff | analytics.read | noindex | static | ADMIN-ANALYTICS | P1 | PHASE-11 | NOT STARTED | Metric |
| ADMIN-NOTIFICATIONS | Notifications | /staff/notifications | Admin | Manage notices | staff | Notifications | staff | notifications.manage | noindex | listing | ADMIN-NOTIFICATIONS | P1 | PHASE-11 | NOT STARTED | Notification |
| SYS-NOT-FOUND | Not found | /{unmatched} | System | Explain missing route | system | Platform | none | public | noindex | dynamic | SYS-NOT-FOUND | P0 | PHASE-01 | NOT STARTED | Router |
| SYS-ERROR | Error | /{error-boundary} | System | Recover from error | system | Platform | any | public | noindex | dynamic | SYS-ERROR | P0 | PHASE-01 | NOT STARTED | Error boundary |
| SYS-FORBIDDEN | Access denied | /forbidden | System | Explain denied access | system | Identity | any | public | noindex | static | SYS-FORBIDDEN | P0 | PHASE-03 | NOT STARTED | RBAC |
| FUT-CAREERS | Careers | /careers | Future | Recruit with real process | root | Publishing | none | public | conditional | static | FUT-CAREERS | P2 | PHASE-15 | NOT STARTED | Hiring policy |
| FUT-INSTRUCTOR-DETAIL | Instructor profile | /instructors/{slug} | Future | Show consented trainer | PAGE-TEAM | Publishing | none | public | conditional | dynamic | FUT-INSTRUCTOR-DETAIL | P2 | PHASE-15 | NOT STARTED | Consent, Instructor |
| FUT-CLIENT-DOCUMENTS | Client documents | /client/documents | Future | Exchange scoped files | client | Portals | client | own account | noindex | listing | FUT-CLIENT-DOCUMENTS | P2 | PHASE-15 | NOT STARTED | Rights, storage |
| FUT-CLIENT-MESSAGES | Client messages | /client/messages | Future | Discuss service work | client | Portals | client | own account | noindex | listing | FUT-CLIENT-MESSAGES | P2 | PHASE-15 | NOT STARTED | Moderation, retention |
| FUT-USER-SECURITY | Advanced security | /learn/security | Future | Manage verified factors | learn | Identity | user | self | noindex | static | FUT-USER-SECURITY | P2 | PHASE-15 | NOT STARTED | OTP/2FA policy |

## Page relationships

```text
PUBLIC: HOME → ABOUT; SERVICES → SERVICE-DETAIL → CONTACT; COURSES → COURSE-DETAIL → REGISTER/ENROLLMENTS; PROGRAMS → PROGRAM-DETAIL → BATCH-DETAIL → ENROLLMENTS; PORTFOLIO → PROJECT-DETAIL; BLOG → ARTICLE; TEAM; FAQ; CONTACT; footer → PRIVACY/TERMS/ACCESSIBILITY.
AUTH: SIGN-IN ↔ REGISTER; SIGN-IN → RECOVERY → RESET → SIGN-IN; successful sign-in → role-authorized portal or staff landing.
STUDENT: DASHBOARD → COURSES → LEARNING → LESSON / ASSESSMENTS; DASHBOARD → TRAINING / ENROLLMENTS / BILLING / RESULTS / CERTIFICATES / NOTIFICATIONS / PROFILE.
CLIENT: DASHBOARD → PROJECTS → PROJECT-DETAIL; DASHBOARD → REQUESTS / BILLING / PROFILE.
STAFF: role-scoped landing → USERS/ROLES/AUDIT; CONTENT → PAGES → EDITOR and NAVIGATION/MEDIA/SEO/SETTINGS; LEARNING → COURSES → EDITOR and ASSESSMENTS/INSTRUCTORS; TRAINING → PROGRAMS/BATCHES/SESSIONS/ATTENDANCE; ENROLLMENTS; FINANCE → INVOICES/TRANSACTIONS/SETTINGS; CRM → LEADS/CLIENTS/PROJECTS/ACTIVITIES/REQUESTS; CONTENT COLLECTIONS; ANALYTICS; NOTIFICATIONS.
```

Staff has no separate ADMIN-DASHBOARD route in V1: the authorized `/staff` landing redirects to the first permitted work queue, avoiding an empty dashboard. Separate admin/sub-admin pages are unnecessary because role assignment and scope live in ADMIN-ROLES and ADMIN-USERS. Quiz, assignment and exam management are views inside ADMIN-ASSESSMENTS; team/blog/portfolio management use ADMIN-CONTENT collection views; refunds use ADMIN-TRANSACTIONS. These are explicit page-boundary decisions, not omitted capabilities. A future standalone route requires change control.

## Dependency rules and implementation order

- Course detail → Course/Edition, Instructor, Category, Media, SEO; its enrollment CTA requires PHASE-08 and must be disabled or explain availability before that gate.
- Batch detail → Program, Batch, Session, trainer assignment, capacity; its enrollment CTA requires PHASE-08.
- Lesson player → identity, enrollment authorization, stable course edition, private media, progress API.
- Client project detail → account-scoped Project and Activity; no staff-only notes.
- CMS editor → typed Section, Revision, preview, RBAC, Media, localized SEO; public publication follows approval.
- Invoice/payment views → enrollment or client account, invoice, provider state, transaction history and finance permissions.
- Public article/case → approved localized content, media rights, metadata, published-only sitemap.

[PHASES.md](PHASES.md) owns phase scope and gates. [SITEMAP.md](SITEMAP.md) projects only public routes. [TRACEABILITY.md](TRACEABILITY.md) maps requirements to these IDs. Implementation order is **phase → module → page → API → database → GitHub test**, while architectural design and data/API contracts are approved before implementation. Do not create an independent page roadmap.

## Change control

Before a new route is coded: assign an unused ID here, phase and dependency; update public sitemap when relevant, requirements traceability, relationships, design pattern, and ADR for major impact. To move an existing page: change PHASES.md, this record, ROADMAP.md, dependencies and traceability, then reevaluate both gates. No undocumented pages.
