# ADR 0008 — Provider-neutral commerce and merchant gate

Status: **ACCEPTED**, 2026-09-25, under founding-partner architectural delegation. Merchant access remains an external dependency.

## Context and problem

V1 requires real payment architecture targeting bKash, Nagad and SSLCOMMERZ. OnSkillIT has no verified merchant contract, API pack or credentials. Provider response is not proof of settlement.

## Options

1. Couple invoice/enrollment to one provider redirect.
2. Provider-neutral intent, attempt, transaction, refund and reconciliation with separate adapters.
3. Record offline payments only.

## Decision and rationale

Choose option 2. Core commerce owns immutable invoice line items, BDT minor-unit amount, currency, payer/account, unique merchant reference, intent lifecycle and one or more attempts. An adapter implements `capabilities`, `createPayment`, `verifyPayment`, `getStatus`, `handleCallback`, `handleWebhook`, `refund` and `reconcile`; unsupported capabilities return an explicit typed result. Only server-side independent verification of merchant, amount, currency, reference and provider status may transition an intent to paid. Callback/webhook authentication is provider-specific; raw payload and secrets remain restricted. Duplicate or out-of-order messages are idempotently recorded and never duplicate a ledger entry, enrollment or service delivery. Retry uses a new attempt under the same unpaid intent; refunds and settlement use compensating entries, not mutation of paid history. Reconciliation flags mismatches for finance review. Provider credentials live only in environment-managed secrets.

Implement the SSLCOMMERZ adapter from its current official merchant contract first if access is granted, then direct bKash/Nagad adapters when their official packages and merchant approvals are available. An approved aggregator may represent a method if contractually verified; the displayed processor must be accurate. Every adapter must pass the same GitHub-hosted contract suite and provider sandbox tests before live enablement. Merchant contracts, credentials, fees, tax/refund rules and live authorization are external dependencies for those provider releases, not Phase 0 architecture blockers.

## Trade-offs and consequences

Adapters and reconciliation cost more than redirect-only checkout but protect money and admission state. V1 cannot claim a specific payment method is live until approved by its provider and PHASE-14 production gate. Official [SSLCOMMERZ integration](https://developer.sslcommerz.com/doc/v4/), [bKash business](https://www.bkash.com/en/business) and [Nagad merchant payment](https://nagad.com.bd/services/?service=merchant-payment) sources are product evidence, not OnSkillIT account evidence.
