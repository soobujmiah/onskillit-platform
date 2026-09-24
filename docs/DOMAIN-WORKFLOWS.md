# Business workflow and data contracts

Status: proposed domain design. These are requirements to validate with OnSkillIT operators, not claims about current practice.

## Content and publication

Editor creates a localized draft from approved section types → schema/rights/SEO validation → reviewer approval → scheduled or immediate publication → immutable revision recorded → page enters sitemap/search. An approved revision remains stable even while a later draft is edited. Rollback publishes a copy of an earlier revision and records actor/reason. Homepage, price, legal policy, certificate claim and instructor biography may need stricter approval. All published claims carry a source/approver and expiry review date where appropriate. Unrelated/demo content can be quarantined without deletion. CMS cannot inject arbitrary script or edit authorization rules.

Page ownership: one canonical content record supplies cards, detail page, search and structured data. A `Page` owns layout; a `Service` or `Course` owns business facts. Section instances reference canonical records instead of copying data. Section schema versions support migrations and prevent rendering unsupported old blocks. Media assets have rights, alt text by locale, derivatives and public/private status. Deletion is blocked while an asset is referenced; replacement preserves history.

## Enrollment and learning

Visitor selects a published course edition or an open batch → registration/login → prerequisites and capacity check → enrollment request → payment state if required → admission/confirmation → learner dashboard. Enrollment source and time are recorded. Private lesson access requires an active `LearningAccess` entitlement. In PHASE-06 staff may grant it for approved learning; in PHASE-08 admitted/active enrollment creates or links it after capacity/payment checks. Training-session access additionally requires an active `TrainingParticipation` batch assignment, staff-granted in PHASE-07 or linked to admitted enrollment in PHASE-08. Revocation is audited and policy-driven. Course edition freezes syllabus for existing learners; later catalog edits create a new edition. Lesson completion is idempotent and stores actor/time; assessment attempts respect policy; instructor grading is scoped; certificate issuance follows an approved rule and can be revoked with reason. Cancellation, transfer and waitlist are explicit transitions with history, refund impact and notification.

TMS shares learning identity and enrollment. Program may group courses; Batch schedules course/program delivery with location or meeting link, trainer assignment, capacity and session calendar. Attendance belongs to a specific session and TrainingParticipation and can be corrected with reason. Online lesson progress is separate from attendance. Results combine assessment evidence according to policy; do not infer certificate eligibility from mere enrollment. Timezone is stored and displayed explicitly. Batch schedule changes notify affected learners/instructors through configured channels.

## CRM and client delivery

Inquiry captures minimal contact and consent → sales triage → qualified lead → opportunity/proposal → won/lost. Won creates or links a client account; duplicate matching needs human review. Client contacts receive access only after invitation/acceptance. Service engagement records scope, owner, status, documents, key dates and support. Internal notes never appear in client portal; documents are classified as internal or client-visible. Follow-ups have due dates and assignees; history is append-only for accountability. Project board depth is future unless actual delivery needs justify V1.

## Finance and payment

Invoice is issued from approved line items and currency/tax policy → payment intent created → provider or manual evidence received → transaction validated/reconciled → invoice balance updated → receipt/notification. Provider callback alone is not trusted: apply the provider-specific authentication contract, then independently validate event/reference, intent, amount, currency and state. Do not assume all providers use signatures. A duplicate callback has no duplicate financial effect. Refund request requires permission, reason and policy checks; refund records reverse balance through explicit events. Staff cannot overwrite historical provider references. No card number or authentication secret enters application storage. Payment provider and regulatory treatment remain decisions for partners and legal review.

## Identity, recovery and roles

V1 uses email or mobile plus password, without OTP. A person may have multiple roles through scoped assignments. Owner/admin roles are not inferred from account age or who created the account. Mobile-only password recovery is staff-assisted under approved identity-proofing rules; staff cannot view old passwords or silently take over a session. Recovery request, approval, one-time handoff, session revocation and notification are audited. Privileged-account recovery requires separate reviewer. Future email/phone verification and 2FA attach to the same identity and can increase assurance for high-risk actions.

## Notifications and analytics

Domain events generate notification intents (enrollment, schedule change, publication approval, invoice, recovery). Delivery attempts are retried with bounded policy and do not duplicate the underlying transaction. User preferences and consent determine marketing communication; essential transactional notices have a separate basis. Analytics uses aggregate public events and business-domain facts with documented metric definitions. Audit logging is security evidence, not a marketing analytics source.

## Cross-cutting invariants

Every mutation has an authenticated actor or named system/public principal, server-side permission or public-route policy check, validated input, atomic transaction where needed, request ID and relevant audit/event record. The anonymous PHASE-05 contact inquiry is rate-limited and stores minimal consent/source before PHASE-09 Lead conversion. Client/learner data is scoped before search and pagination. Financial and certificate records are corrected by explicit follow-up records. Public content never exposes private drafts. Background jobs must be idempotent. Deletions follow retention/rights policy rather than a generic soft-delete flag everywhere.
