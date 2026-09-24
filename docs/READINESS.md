# Phase 0 documentation readiness decision — 2026-09-25

**Current active phase:** PHASE-00, **IN PROGRESS**. **Gate:** DOCUMENTATION READY has **not** passed. No application implementation is authorized. The founding partner has accepted the canonical 16-phase / 74-V1-template baseline; ADR 0005 is accepted. This report uses only `PASS`, `PASS WITH OWNER DECISION`, `BLOCKED`, `NOT APPLICABLE` and `UNKNOWN` as gate dispositions. A documented recommendation is not a verified business fact or a deployed control.

## Gate matrix

| Phase 0 gate | Disposition | Evidence and remaining condition |
|---|---|---|
| Business requirements | PASS WITH OWNER DECISION | SPECIFICATION and TRACEABILITY cover scope; actual catalog and client-visible rules still need approval |
| Current-site research/integrity | UNKNOWN | SITE-AUDIT and 85-URL sample; authenticated CMS/Search Console/full URL inventory absent; cause of unrelated indexed article unknown |
| Offerings | BLOCKED | OFFERINGS separates zero verified actual offers from proposed/local-context and demo records; owner delivery evidence required |
| Legal identity/content rights | BLOCKED | LEGAL-IDENTITY records OnSkillIT public name only; registered issuer, contacts, rights and policies missing |
| Hosting capability | UNKNOWN | HOSTING-CAPABILITY verifies public Namecheap-registered IP and product options, not account plan/runtime/worker/DB; portable topology documented |
| Technology architecture | BLOCKED | TECHNOLOGY-EVALUATION and ADR 0006 compare options; actual host fit, budget, skills and owner selection pending |
| Database architecture | PASS WITH OWNER DECISION | DATA-MODEL and DOMAIN-CONSISTENCY define logical entities/cardinality/constraints; engine, physical schema and policy-dependent fields pending |
| API architecture | PASS WITH OWNER DECISION | API-CONTRACT and DOMAIN-CONSISTENCY define families, ownership, auth/idempotency; exact OpenAPI payloads/paths pending stack and policies |
| Authentication | PASS WITH OWNER DECISION | V1 email-or-mobile/password/no OTP owner-confirmed; ADRs 0003/0007 propose sessions; assisted proofing and assurance approval pending |
| RBAC | PASS WITH OWNER DECISION | Multi-admin scoped permission/delegation model documented; exact action matrix and owner/security approval pending |
| CMS | PASS WITH OWNER DECISION | Typed blocks, revisions, media, workflow and public-only publication documented; approvers/block schema/storage pending |
| CRM/client management | PASS WITH OWNER DECISION | Inquiry-to-lead and account isolation documented; client-visible fields/SLA pending |
| LMS | PASS WITH OWNER DECISION | Frozen editions, LearningAccess, progress/assessment documented; actual curriculum and certificate policy pending |
| TMS | PASS WITH OWNER DECISION | Program/batch/session/attendance model documented; actual schedules/capacity/trainer terms pending |
| Enrollment | PASS WITH OWNER DECISION | Capacity/state/idempotency and access link documented; repeat/transfer/cancel rules pending |
| Payments | BLOCKED | PAYMENTS and ADR 0008 define abstraction and SSLCOMMERZ public contract; bKash/Nagad merchant API access, legal/refund/settlement terms missing |
| UX architecture | PASS WITH OWNER DECISION | UX-CONCEPT-REVIEW covers task patterns and mobile behavior; no visual/tool/usability approval yet |
| Design system/brand | BLOCKED | Portfolio grading and independent motion documented; Superdesign authorization expired, no visual concept reviewed or tokens contrast-approved |
| Page architecture | PASS | PAGES canonical 74 V1 and 5 reserved; GitHub checker passed on previous baseline; no ID/count changes here |
| Phase architecture | PASS | PHASES canonical 16 phases and gates; ADR 0005 accepted by owner instruction |
| Sitemap/redirect policy | PASS WITH OWNER DECISION | SITEMAP and LEGACY-URL-DISPOSITION define rules/candidates; complete inventory and owner map approval pending |
| SEO | PASS WITH OWNER DECISION | SEO-CONTENT covers page groups, locale, schema, noindex, metadata and CWV; final legal/business content and URL strategy pending |
| Security | PASS WITH OWNER DECISION | SECURITY-ARCHITECTURE and ADRs 0007/0008 cover threats; recovery proofing, admin assurance, provider contracts and review pending |
| Testing | PASS | QUALITY-GATES defines GitHub-only test layers and acceptance evidence; application tests are future-phase work |
| CI/CD | PASS | OPERATIONS/QUALITY-GATES define protected GitHub flow; docs architecture checker already passes on main; app CI is PHASE-01 work |
| Deployment | UNKNOWN | Portable deployment design exists; target host/deploy mechanism and owner production choice unverified |
| Backup/recovery | PASS WITH OWNER DECISION | OPERATIONS defines scope, isolated restore and provisional RPO/RTO; targets and host ability pending |
| Observability | PASS WITH OWNER DECISION | OPERATIONS defines logs, alerts, uptime/queue/trace; vendor, retention and incident owner pending |
| Traceability | PASS | R01–R20 and all V1 page IDs mapped; DOMAIN-CONSISTENCY records resolved sequencing gaps and remaining contract decisions |
| Risk register | PASS | RISKS covers probability, impact, mitigation, owner and status across 22 risks |
| Documentation consistency | PASS | Cross-domain review recorded; [GitHub documentation check](https://github.com/soobujmiah/onskillit-platform/actions/runs/36041477068) passed on project main `0aead192829c3501f5a28174e7a7bc71fbf6f5f4`; physical/owner decisions are tracked in their separate gates |
| SKB synchronization | PASS | [SKB PR #25](https://github.com/soobujmiah/skb/pull/25) merged the evidence return at `1cd47997c1abdde128ef1db4837d6591ba065dde`; SKB main health/integrity/review-queue checks passed |

## Completed evidence

- Project and SKB remotes/heads verified; previous main documentation GitHub Action passed. Canonical phase/page IDs and counts were retained.
- Public current site and DNS/HTTP observed without production modification. ARIN identifies Namecheap as public IP-block registrant; Namecheap product docs were reviewed without claiming OnSkillIT account features.
- Official SSLCOMMERZ and bKash sources reviewed; official Nagad merchant API package remains unavailable to this research. NSDA/BTEB sources informed local training context without claiming accreditation.
- The domain review resolved early learning-access and inquiry-intake sequencing within existing phases and pages. No code, migration, provider credential, local build/test or deployment was created.

## Owner decisions

Confirm actual offers and delivery proof; registered legal issuer, address/contact, rights, policy and accreditation claims; hosting plan/budget; client portal fields; curriculum/certificates; assisted recovery; design concepts; database/runtime/auth/payment/deployment ADRs and production operator roles. “OnSkillIT” is confirmed as public name, not proof of a registered legal entity.

## External dependencies

Current-host account capability report or Namecheap support confirmation; merchant contracts and official bKash/Nagad integration packs/sandboxes; complete CMS/Search Console/analytics exports; rights and translation reviewers; legal/finance advice where required. Do not publish secret documents in this public repository.

## Unknowns and blockers

Full old URL/index inventory and cause of unrelated content remain **UNKNOWN**. Host plan, database/worker capacity, merchant access and budget remain **UNKNOWN**. Phase 0 is **BLOCKED** from gate passage by verified-offering, legal, technology, payment and visual-approval gaps. External merchant credentials can remain outstanding once integration contracts are sufficient, but no provider capability may be fabricated. A production cutover requires its own later owner gate.

## Exact next action

Obtain partner-approved offering and legal evidence plus redacted current-host plan/capability details; obtain direct merchant integration packs or written provider coverage; complete a design-tool visual review with the owner; finalize the physical data/API/security/hosting ADRs. Re-run the GitHub documentation checker, update this report with evidence and ask the gate owner to mark PHASE-00 READY FOR GATE only when every critical condition is met. **Do not start PHASE-01 in this task.**
