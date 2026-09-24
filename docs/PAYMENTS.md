# V1 payment architecture and provider evaluation

Status: **V1 real-payment workflow confirmed; bKash, Nagad and SSLCOMMERZ requested; merchant access and commercial/legal terms open**. This document is architecture research, not permission to open merchant accounts, move money or enable production checkout.

## Required real-life workflows

Paid course enrollment and service invoices must create a server-owned order/invoice with fixed line items, BDT minor-unit amount, tax/discount policy and expiration. Checkout creates a `PaymentIntent` with a unique idempotency key and provider reference. Customer redirect/success page is only UX feedback; the server confirms payment through provider notification and independent validation/query. The invoice/enrollment becomes paid/admitted only after matching provider status, amount, currency and merchant account. Pending and failed states remain visible with retry guidance. Duplicate or out-of-order callbacks never duplicate admission or money entries. A reconciliation job compares provider settlement/transaction reports to local ledger and raises exceptions for staff review.

Refund: authorized staff request with reason and policy check → optional second approval above threshold → provider request → pending/refunded/failed status confirmation → compensating ledger entry and enrollment/service impact. Partial payments, partial refunds, chargebacks and manual adjustments require explicit policy. Offline payment remains a controlled route: record method/reference/evidence, assign staff, second-person approval when appropriate, reconcile to bank/MFS statement. Do not collect/store card PAN, PIN or OTP. Financial reports separate gross, fees, refunds and net receipts.

## Provider abstraction

`PaymentProvider` contract: create checkout, validate notification, query transaction, request/query refund, normalize provider errors, report capabilities. Provider-specific IDs/raw payloads stay in a restricted adapter table; core invoice/enrollment state machine uses normalized events. Adapter is versioned and sandbox-tested. Webhooks/IPN have authentication/validation, replay protection, retry-safe response, minimal logs and no secret exposure. Payment amounts are immutable after intent creation; a changed invoice requires a new intent. Currency is explicit. Merchant credentials live in protected deployment secrets, never GitHub source or CI logs.

## Candidate review (official sources, accessed 2026-09-24)

| Candidate | Evidence | Decision requirement |
|---|---|---|
| SSLCOMMERZ hosted checkout | [Official integration docs](https://developer.sslcommerz.com/doc/v4/) describe session creation, IPN, required order validation and refund API; [sandbox docs](https://sandbox-gw.sslcommerz.com/docs) describe test environment | Confirm current merchant terms, supported methods/fees, contract, IPN/network requirements and API currency/version with provider |
| bKash online business/PGW | [Official business page](https://www.bkash.com/en/business) lists gateway and refunds; [merchant page](https://www.bkash.com/en/business/merchant) describes merchant account | Confirm merchant eligibility, API access, current docs, settlement, fees and refunds |
| Nagad merchant checkout | Requested by founding partner; public official integration documentation was not located in this research | Obtain official Nagad merchant documentation/sandbox/contract directly; verify API and refund/reconciliation capabilities before adapter design |

**Confirmed target coverage:** bKash, Nagad and SSLCOMMERZ, with room for other approved providers. These may be three direct adapters, or a smaller number of contracts if one gateway demonstrably supplies a method under acceptable commercial terms; the UI must show the actual processor and avoid duplicate/confusing choices. **Provisional evaluation order:** confirm SSLCOMMERZ method coverage and terms, direct bKash merchant access, and official Nagad integration access. This is an inference from official product descriptions and the partner's preference, not a contract or final integration choice. Merchant fees, settlement and legal eligibility are volatile and require direct current quotes. Never use personal-wallet transaction scraping or an unofficial relay as a substitute for an authorized merchant integration. Additional options need the same licensing, security, reconciliation and support review.

## Acceptance and release gate

In GitHub CI with sandbox fixtures: success, fail, cancel, pending, delayed callback, duplicate callback, mismatched amount/currency, unknown intent, refund request/status, reconciliation discrepancy and cross-account denial. In staging: provider sandbox end-to-end and manual/offline approval flow. Production requires merchant contract and credentials, verified registered legal-entity name, legal/tax/refund approval, customer-visible terms, finance-role review, backup/incident plan and owner approval. A payment provider sandbox pass is not proof that live settlement works.
