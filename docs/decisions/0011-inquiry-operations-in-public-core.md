# ADR 0011 — Inquiry notification and a staff inquiry view in Phase 5

Status: accepted for source implementation on 2026-10-01 following the founding partner's decision that inquiries must be both notified by email and readable by authorized staff before the public form is enabled.

## Context

PHASE-05 added an append-only public inquiry intake with reviewed personal-field redaction. Review found that nobody could read or be told about an inquiry until PHASE-09 (`ADMIN-LEADS`). Enabling the form would have collected messages that no operator was alerted to.

## Decision

1. **Email notification.** After an inquiry is committed, the server sends a best-effort notice to the recipients in deployment configuration `INQUIRY_NOTIFY_TO` using the existing SMTP configuration. The notice carries only the inquiry reference, language, source page and a sign-in link to the staff view. It deliberately contains no name, email, phone or message, so personal data is not copied into a mailbox or provider unnecessarily. A delivery failure never changes the response or the stored inquiry and is logged without content, addresses or provider detail.
2. **Staff inquiry view.** `ADMIN-LEADS` (`/staff/crm/leads`) moves its first slice from PHASE-09 to PHASE-05, as ADR 0010 did for `PAGE-TEAM`. The page lists inquiries newest first behind the new `inquiries.read` permission; `inquiries.redact` additionally allows redaction. The owner role holds both; a non-privileged `inquiry_staff` role holds read only. Migration `0005_inquiry_operations` adds these and nothing else; it does not alter inquiry data.
3. **Redaction from the view** requires a privacy request reference and a different review reference, matching the operator script, and records `staff:<user id>` as the operator in the existing append-only audit trigger. The operator script remains.
4. **Retention.** The owner-approved rule is up to 12 months or earlier on request. `scripts/purge_expired_inquiries.ts` redacts inquiries older than 12 months through the same audited path with the audit reason "Retention period elapsed". It is an operator procedure that defaults to a dry run; the application does not schedule it. The staff view flags records past the period.
5. **Phase 9 compatibility.** PHASE-09 keeps the route and extends it with the `Lead` model and qualification, using the explicit Inquiry → Lead mapping already planned. This ADR adds no Lead table and no parallel route.

## Limits

No inquiry is read, notified or redacted in any real environment by this ADR. The public form still requires a published privacy notice, a published contact page and `INQUIRY_RATE_SECRET`. Notification needs deployment SMTP configuration and a recipient; without them the inquiry is still stored and visible in the staff view. Owner decisions on backups and the lifecycle of receipts, logs and application records remain open (see `PHASE-05-POLICY-REVIEW.md`).
