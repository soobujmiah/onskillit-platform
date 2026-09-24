# ADR 0007 — Browser sessions, contact identity and scoped RBAC

Status: **proposed security architecture; owner/security approval pending**. Date: 2026-09-24.

## Context and problem

V1 must accept email or mobile with password, no mandatory OTP, and multiple scoped admins. Phone-only recovery is staff-assisted. The chosen framework is not final.

## Options

1. Server-side revocable session with secure browser cookie and CSRF protection.
2. Long-lived browser bearer tokens.
3. Outsourced identity provider.

## Decision and rationale

**Propose option 1** for browser UI: opaque revocable server session; Secure/HttpOnly/SameSite cookie, rotation on login/privilege change, idle/absolute expiry, CSRF token/origin checks on state changes. A well-maintained framework/library owns hashing/session primitives. User identity is independent of ContactMethod and verification factors; normalized email/mobile uniqueness is enforced server-side. RoleAssignment combines permission, resource and scope; deny by default, delegation subset, every query/command checked and audited. Future verified email/phone, OTP and 2FA add assurance factors without new user identity.

## Trade-offs, consequences and gate

Server sessions need shared persistence and cleanup. A phone-only account cannot self-reset in V1; restricted staff proofing, second approval for privileged accounts and audit are mandatory, with exact evidence/retention pending. Final cookie lifetime, password policy, recovery procedure and admin assurance require owner/security approval before implementation. See `SPECIFICATION.md`, `SECURITY-ARCHITECTURE.md` and [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
