# Founding-partner decisions and factual inputs

As of 2026-09-25, the founding partner expressly delegated remaining Phase 0 **architectural and product** decisions to the agent, while forbidding invented external facts. This authority accepts the blueprint decisions below. It does not authorize production deployment, domain cutover, merchant enrollment, financial transactions, legal attestation or fabricated organizational data. Canonical phase/page registers and ADR 0005 remain frozen.

| Decision | Approved by founding partner | Date | ADR | Rationale |
|---|---|---|---|---|
| 16 phases / 74 V1 templates remain canonical | Yes, explicit freeze | 2026-09-25 | 0005 | Stable handoff and traceability |
| Portable Next.js/TypeScript modular monolith, supported PostgreSQL and Drizzle | Yes, via final architectural delegation | 2026-09-25 | 0006 | SEO, transactions, one stack, deployable independently of old hosting |
| Revocable browser sessions, Argon2id and scoped RBAC; email-or-mobile/no mandatory OTP | Yes, via delegation and prior account decisions | 2026-09-25 | 0003, 0007 | Secure V1 identity with later verification support |
| Provider-neutral payment intent/attempt/ledger and bKash, Nagad, SSLCOMMERZ adapter targets | Yes, via delegation and prior provider direction | 2026-09-25 | 0004, 0008 | Safe checkout and merchant independence |
| First-party typed CMS/LMS/TMS/CRM, durable outbox, API, media and operations choices | Yes, via delegation | 2026-09-25 | 0009 | Shared transactions, localization, RBAC and portability |
| Textual original UX and semantic design system as implementation blueprint | Yes, via final closure instruction | 2026-09-25 | 0002, 0009 | Distinct OnSkillIT experience; pixel-level review in implementation |
| OnSkillIT as public brand; legal fields configured, not invented | Yes, explicit instruction | 2026-09-25 | 0001, 0009 | Legal facts remain separate from architecture |

## Factual and operational input required later

| Input | Why | Needed before |
|---|---|---|
| Registered issuer/legal name, registration/tax data, address, official contact, copyright holder and rights | Truthful invoices, terms, privacy, footer and merchant onboarding | Public legal publication, invoicing or production payment |
| Partner-approved real offerings, course syllabi, fees, schedules, instructors, proof and licensed imagery | Avoid demo/fabricated catalog | Publishing related records in CMS or accepting enrollment |
| Current host account plan, limits and access; production budget and operator | Determine whether to use current account or a compatible separate/upgraded host | Production deployment planning/cutover, not PHASE-01 foundation |
| Merchant contracts, official bKash/Nagad packs, SSLCOMMERZ account, sandbox/live credentials, fees and settlement/refund policy | Enable and test provider adapters honestly | Provider-specific integration and live checkout |
| Legal review of privacy, terms, refund policy, consent and data retention | Jurisdiction-specific business obligations | Public policy publication and production launch |
| Current Search Console/CMS URL export and final redirect approval | Exact legacy URL dispositions | Production redirect/cutover |

No item above is a Phase 0 architecture blocker. A later phase gate may block its dependent feature until the factual input exists.
