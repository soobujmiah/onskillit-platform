# ADR 0008 — Provider-neutral commerce and merchant gate

Status: **proposed integration architecture; merchant and owner approval pending**. Date: 2026-09-24.

## Context and problem

Founding partners require real V1 payments targeting bKash, Nagad and SSLCOMMERZ. Public SSLCOMMERZ integration docs exist; bKash public business pages establish product availability but not an OnSkillIT API contract; official Nagad merchant API docs were not obtained. Merchant/legal/hosting prerequisites are open.

## Options

1. Couple invoice/enrollment state directly to one provider response.
2. Use provider-neutral intent/transaction/refund/reconciliation state and independent adapters.
3. Use only staff-recorded payments.

## Decision and rationale

**Propose option 2.** Server-owned invoice/intent, immutable amount/currency and merchant reference, adapter capability query, authenticated callback plus independent provider query, normalized status, idempotent ledger/admission and reconciliation. An aggregator may cover methods only if licensed/contracted and verified; method branding must reflect actual processor. Never trust redirect success alone. Keep offline payment under approval and evidence.

## Trade-offs, consequences and gate

Adapters add contract tests and operational reconciliation but prevent commerce rewrites when providers change. Live provider selection, contract, credentials, fees, settlement, refund and tax policy require owner/merchant approval. No production payment or credentials in this phase. See `PAYMENTS.md` and ADR 0004 for the owner-confirmed product direction.
