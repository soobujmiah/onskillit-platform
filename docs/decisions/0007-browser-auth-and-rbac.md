# ADR 0007 — Browser sessions, contact identity and scoped RBAC

Status: **ACCEPTED**, 2026-09-25, under founding-partner architectural delegation.

## Context and problem

V1 accepts email or mobile with password and no mandatory OTP. Multiple super admins, admins and sub-admins need bounded delegation. Phone-only password recovery is staff-assisted.

## Options

1. Server-side revocable opaque sessions in secure browser cookies.
2. Long-lived browser bearer tokens.
3. Outsourced identity provider as a hard dependency.

## Decision and rationale

Choose option 1. Store only a hash of a high-entropy session token server-side. Set `Secure`, `HttpOnly`, `SameSite=Lax` cookies; rotate on login and privilege change; revoke on logout, suspension and password reset. Initial expiry policy: 12-hour idle and 30-day absolute for members; 30-minute idle and 12-hour absolute for staff, configurable tighter by environment. State-changing browser requests require same-origin validation and CSRF token protection; cross-site provider callbacks use distinct verified endpoints. Passwords use Argon2id with at least current OWASP minimum parameters, tuned upward by GitHub benchmark before production. Normalize email and E.164 mobile separately with unique active-contact constraints. User identity is independent of contact and future verified factors.

Role assignments bind permission to resource and scope; all commands and data queries enforce scope server-side, deny by default and audit sensitive actions. Super-admin delegation cannot exceed the delegator's effective grants; a second approver is required for privilege escalation and privileged phone-only recovery. Staff-assisted recovery requires identity evidence recorded privately, dual control for privileged accounts, one-time reset token, session revocation and audit; the final evidence checklist is an operations procedure before that workflow goes live. Verification, OTP and 2FA extend factor/assurance tables later without changing user IDs.

## Trade-offs and consequences

Shared session persistence and cleanup are required; no stateless token shortcut. Assisted recovery has support cost and must remain unavailable until trained staff and a documented procedure exist. A browser cookie alone never authorizes a resource. Review [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) and [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) when implementing.
