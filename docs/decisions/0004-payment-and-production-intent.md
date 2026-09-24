# ADR 0004 — Real payments and production-host intent

Status: **accepted product direction; integration/deployment decisions pending**, 2026-09-24.

Context/problem: The first release is intended for real operations. Payment cannot remain only a conceptual future feature. The current domain's hosting will be used when the new platform is ready.

Options: defer payment to future; support manual records only; deliver complete live online and offline payment workflows. Decision from founding partner: make V1 complete for real-life payment use and target bKash, Nagad and SSLCOMMERZ, with room for other suitable options. The documented interpretation is checkout, invoice, validation, reconciliation, refunds and offline handling through approved provider adapters. Merchant access and commercial/legal terms remain open. Production is intended for the current domain hosting later, after readiness review. No cutover or current-site change is authorized now.

Rationale: operationally usable V1 and continuity of the existing domain/hosting plan. Trade-offs: payment increases security, legal, support and QA burden; the current host may not support the candidate runtime/database. Consequences: provider/merchant and hosting capability checks are blocking gates before final stack and production architecture. GitHub builds/tests remain authoritative; production deployment needs separate owner approval.
