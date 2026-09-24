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
| Payment callback forgery/replay | signature/timestamp check, event ID uniqueness, amount/currency verification, state machine, idempotency | sandbox and replay tests |
| Client/student data leak | account-scoped queries, private asset URLs, no public caching, redacted logs | cross-account and cache tests |
| CI supply chain compromise | minimal workflow permissions, pinned actions, dependency review, no production secrets in PRs, protected environments | workflow review |
| Backup or log disclosure | encryption, separate credentials, retention, restore access controls, secret/PII redaction | restore and redaction inspection |

Use security headers including CSP, HSTS once HTTPS behavior is verified, frame restrictions, content-type protections and referrer policy. CORS should allow only intended origins. Sessions use secure HttpOnly cookies with rotation on login/privilege changes; logout and suspension revoke server-side state. Password reset tokens are random, hashed at rest, short-lived and single-use. Account deletion/deactivation and data retention require legal/business policy before launch. No raw card data is stored. Admin/finance access should use stronger assurance as soon as the product supports it; V1 without OTP raises operational risk and must be explicitly reviewed.

## Audit events and monitoring

Record actor, impersonation/delegation context, action, resource, UTC timestamp, outcome, request ID and minimal changed-field metadata for login/logout, recovery, grants, suspension, publication, deletion, financial changes, certificate issuance/revocation and settings. Ordinary admins cannot edit audit records. Exclude credentials, reset links, full PII and document contents. Monitor unusual publication volume, unrelated keywords/URLs, new privileged users, repeated failed logins and unexpected payment changes. Keep a named incident owner and private reporting path.

## Public repository and production separation

Source and docs are public; credentials, customer data, private curricula, provider contracts and incident evidence are not. GitHub Actions uses protected environments and short-lived credentials where possible. Preview uses synthetic records. Deployment configuration is externalized. The site's public API returns only explicitly published records. A security issue in the old site must be investigated by authorized operators with server/CMS evidence; the public article/link findings alone cannot prove compromise.

References: [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [GitHub Actions security](https://docs.github.com/en/actions/how-tos/secure-your-work).
