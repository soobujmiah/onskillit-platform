# Security, privacy and content integrity architecture

Status: proposed control design, pending security/legal review. This is not evidence that the controls exist. OnSkillIT will process identity, learning, client and possibly payment data, so release requires threat-model and permission review.

## Trust boundaries

Untrusted public browser/API traffic → edge/application validation → authorized domain operations → database/private object storage. CMS-authored content is untrusted input even from staff. External payment, email/SMS and video providers are separate trust zones. Public GitHub PRs and CI jobs are untrusted relative to production credentials. Student/client data, private media and finance records may never be exposed through public routes, search indexes or build artifacts.

## Threat and control matrix

| Threat | Required design control | Verification |
|---|---|---|
| Credential stuffing/account takeover | rate limits, generic errors, strong password hashing, revocable sessions, risk alert | auth abuse tests and review |
| Assisted recovery misuse | restricted support role, documented proofing, second approver for privileged accounts, one-time handoff, audit | recovery scenario review |
| Horizontal/vertical privilege escalation | deny-by-default permission checks on every query/command, resource scope, delegation subset | exhaustive permission matrix and negative API tests |
| CSRF/XSS/SQL injection | SameSite/CSRF token strategy, output encoding/sanitization, parameterized DB calls | security tests and code review |
| CMS spam/unrelated publication | typed sections, approval, claim/source checks, revision/audit, anomaly alerts, no raw script | publish and rollback tests |
| Malicious upload | size/quota, extension and byte MIME validation, image/document processing isolation, private-by-default storage, malware policy | spoof/polyglot and access tests |
| Payment callback forgery/replay | provider-specific callback authentication and independent transaction query, event/reference uniqueness, amount/currency verification, state machine, idempotency | sandbox and replay tests |
| Client/student data leak | account-scoped queries, private asset URLs, no public caching, redacted logs | cross-account and cache tests |
| CI supply chain compromise | minimal workflow permissions, pinned actions, dependency review, no production secrets in PRs, protected environments | workflow review |
| Backup or log disclosure | encryption, separate credentials, retention, restore access controls, secret/PII redaction | restore and redaction inspection |

Use security headers including CSP, HSTS once HTTPS behavior is verified, frame restrictions, content-type protections and referrer policy. CORS should allow only intended origins. Sessions use secure HttpOnly cookies with rotation on login/privilege changes; logout and suspension revoke server-side state. Password reset tokens are random, hashed at rest, short-lived and single-use. Account deletion/deactivation and data retention require legal/business policy before launch. No raw card data is stored. Admin/finance access should use stronger assurance as soon as the product supports it; V1 without OTP raises operational risk and must be explicitly reviewed.

## Audit events and monitoring

Record actor, impersonation/delegation context, action, resource, UTC timestamp, outcome, request ID and minimal changed-field metadata for login/logout, recovery, grants, suspension, publication, deletion, financial changes, certificate issuance/revocation and settings. Ordinary admins cannot edit audit records. Exclude credentials, reset links, full PII and document contents. Monitor unusual publication volume, unrelated keywords/URLs, new privileged users, repeated failed logins and unexpected payment changes. Keep a named incident owner and private reporting path.

## Public repository and production separation

Source and docs are public; credentials, customer data, private curricula, provider contracts and incident evidence are not. GitHub Actions uses protected environments and short-lived credentials where possible. Preview uses synthetic records. Deployment configuration is externalized. The site's public API returns only explicitly published records. A security issue in the old site must be investigated by authorized operators with server/CMS evidence; the public article/link findings alone cannot prove compromise.

References: [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [GitHub Actions security](https://docs.github.com/en/actions/how-tos/secure-your-work).

## Final Phase 0 control review (architecture only)

- **Sessions and CSRF:** proposed opaque revocable session in Secure/HttpOnly/SameSite cookie, rotation and server-side expiry; use CSRF token plus origin checks for cookie-authenticated mutations. SameSite alone is defense in depth. No bearer token in browser storage. See [OWASP session](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) and [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
- **Authorization:** action/resource/scope checks on all reads and writes, including search and private media. Separate owner/security/finance/publisher powers; deny by default and limit delegation to held scope. Audit grant, revoke, impersonation, publication, money and recovery. See [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- **Injection/content:** parameterized DB calls, typed API/CMS fields, output encoding and rich-text sanitization; strict CSP and no executable page-builder blocks. Avoid SSRF in URL import, image fetch, document previews and payment/provider adapters through allowlisted destinations, DNS/IP validation and network egress policy. See [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).
- **Uploads and media:** allowlisted extensions and magic-byte MIME, limits, randomized names, processing isolation, malware policy, private default, signed access, rights/consent, immutable reference tracking and deletion review. See [OWASP file upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
- **Payment:** provider-specific callback authentication is not generic across bKash/Nagad/SSLCOMMERZ; independent transaction query, amount/currency/reference check, replay protection, idempotent ledger and risk hold are common. Provider contracts remain external dependencies.
- **Recovery/backups:** assisted mobile-only reset proofing and privileged second approval remain unapproved; no OTP is mandatory V1. Encrypt backups, separate credentials, rehearse restore, redact logs and protect GitHub PR workflows from production secrets.

[ADR 0007](decisions/0007-browser-auth-and-rbac.md) proposes the session/RBAC architecture. [ADR 0008](decisions/0008-payment-adapter-contract.md) proposes commerce trust boundaries. The technical design is specified, but security approval and the detailed proofing/retention policy remain **PASS WITH OWNER DECISION**; no deployed control has been tested.
