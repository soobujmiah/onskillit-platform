# Risk register and discovery questions

Status: open. Owners are roles to assign, not named people. Review at each Phase 0 decision and each release gate.

| ID | Risk | Likelihood / impact | Mitigation and evidence gate | Owner role |
|---|---|---|---|---|
| K01 | Old site has pervasive broken routes and indexed unrelated content | Observed / high | Complete CMS/Search Console inventory and private incident review; approve redirect/410 plan | Domain owner/security |
| K02 | Demo content is mistaken for real business offerings | High / high | Partner-approved catalog and rights register before publication | Business owner/editor |
| K03 | Current hosting cannot run selected framework/DB/worker | Unknown / high | Read-only capability report and realistic staging deployment before ADR | Technical owner |
| K04 | No verified legal entity/merchant contract for live payments | Unknown / critical | Verify registered entity, provider terms, tax/refund policy and sandbox/live contract | Founding partners/finance |
| K05 | Email-or-mobile accounts without OTP allow contact squatting/recovery abuse | High / high | Restricted recovery, proofing, audit, rate limits, future verification plan | Security owner |
| K06 | Three payment methods multiply integration/reconciliation complexity | Medium / high | Shared ledger, provider adapters, sandbox cases, merchant access check | Finance/technical |
| K07 | Full bilingual content and two themes delay content/design readiness | High / medium | Locale parity, native-language editors, both-theme component matrix | Content/design |
| K08 | Broad V1 scope causes incomplete LMS/TMS/CRM quality | High / high | Vertical slices with P0/P1 traceability and release acceptance | Product owner |
| K09 | Private client/student media leaks through public repo/cache | Medium / critical | Private storage, scope tests, CI secret controls, public-repo review | Security/operations |
| K10 | Backup exists but restore fails during incident | Medium / high | Scheduled staging restore drill and measured RPO/RTO | Operations |
| K11 | Visual ambition harms usability/performance | Medium / high | Real-content prototype, WCAG/CWV/task review and reduced-motion mode | Design/product |
| K12 | Public repository exposes third-party assets or unsupported claims | Medium / high | Rights register, source review, no-license default, PR content checks | Maintainers |

Open questions requiring owner evidence: exact registered entity name and jurisdiction; actual services/courses, instructors, prices, certificates and course delivery; content/image/testimonial rights; current host details; merchant access and provider fees; terms/refunds/taxes; client portal V1 tasks; primary locale URL scheme and editorial staffing; privacy/retention rules; traffic/support budget; current CMS and Search Console exports. These are gates, not reasons to invent facts.
