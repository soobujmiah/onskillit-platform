# PHASE-03 implementation plan — identity, RBAC and audit

Status: **IN PROGRESS; IDENTITY VERIFIED gate open**. Prepared on `phase-03/identity-rbac-audit` from `main` at `0cbc135` on 2026-09-29. The founding partner approved the plan with the decisions below on 2026-09-29. This is not a gate claim. The canonical phase and page registers remain [PHASES.md](PHASES.md) and [PAGES.md](PAGES.md).

## Work contract

| Field | Value |
|---|---|
| Current phase / gate | PHASE-03 / IDENTITY VERIFIED (open) |
| Task | Implement one identity for public members and scoped staff, with recoverable sessions and auditable sensitive actions |
| Modules | Identity, Session, Recovery, RBAC, Audit; private/staff shell |
| Dependencies | PHASE-01 and PHASE-02 complete, per PHASES.md and HANDOFF.md |
| Page IDs | AUTH-SIGN-IN, AUTH-REGISTER, AUTH-RECOVERY, AUTH-RESET, USER-PROFILE, ADMIN-USERS, ADMIN-ROLES, ADMIN-AUDIT, SYS-FORBIDDEN |
| Requirements | R01, R02, R10, R15; global R16, R19, R20 and CI/deployment R17 |
| Excluded | Mandatory OTP/2FA, finance grants, production data, live deployment, unapproved recovery proofing |

## Proposed implementation contract

1. **Accounts and contacts.** Create `User`, `ContactMethod`, `PasswordCredential`, `Session`, `PasswordReset`, `Role`, `Permission`, `RoleAssignment` and append-only `AuditEvent` tables with reviewed SQL migrations and matching Drizzle schema. A mobile recovery case is deferred and no mobile recovery table or endpoint is enabled. User IDs are opaque and independent of contact values. Normalize email and E.164 mobile before unique active-contact checks. Store verification state separately. Register with either contact and a password; registration never creates a staff grant. Account states are active, inactive, suspended and deletion-pending. No public route can create or infer an owner/admin role.
2. **Passwords and sessions.** Use a maintained Argon2id package at no less than the current OWASP minimum, with a CI benchmark before choosing production parameters. Store only a hash of a high-entropy opaque session token. Set Secure, HttpOnly, SameSite=Lax cookies; rotate on login and privilege change; revoke on logout, suspension and reset. Initial idle/absolute limits follow ADR 0007: members 12 hours/30 days, staff 30 minutes/12 hours. Check status, expiry and permissions on every private request. Browser mutations require same-origin checks and CSRF protection.
3. **Recovery.** Return the same public response whether a contact exists or not, with abuse limits. Unverified email may register and sign in, but email reset is available only after mailbox control has been established through a verification link. A one-time, short-lived reset token is stored hashed and revokes existing sessions when redeemed. Mobile-only recovery is **deferred and disabled**: no workflow, endpoint or staff action may issue a mobile-only reset until the founding partner separately approves the proofing method, staff approval roles and evidence-retention policy.
4. **RBAC and audit.** Permission checks use action, resource and scope on both commands and queries, with deny by default. Delegation is limited to the grantor's effective grants; privileged elevation requires a second approver. Bootstrap the first owner only through an isolated, auditable operator procedure, never public signup or a seeded password. Audit login outcomes, reset events, session revocation, account status and role changes with actor, target, result, request ID and minimal metadata. Exclude passwords, tokens, reset links and unnecessary personal data. Audit reads are separately scoped.
5. **Routes and UI.** Build the nine assigned page IDs under existing locale routing, preserving full Bangla/English keys, theme, keyboard access, mobile layout and noindex. Add the deferred private/staff shell only for authorized routes. UI visibility does not substitute for server authorization. Publish checked OpenAPI contracts for `/api/v1` identity endpoints and map each method to a permission, page consumer and negative test.

## GitHub-only verification and exit

- Add an isolated PostgreSQL CI job for migration up/down, uniqueness, reset-token single use, session revocation, scope denial, delegation ceiling and audit transaction checks. Add browser checks for both locales, themes, keyboard navigation, 320–1440px viewports and access denial. Run no local build or test.
- Keep CI secrets synthetic and least privilege. Link each passing workflow run to its exact commit in the work log and TRACEABILITY. Review source, migration, API schema, security/privacy notes and rollback before proposing a merge.
- The IDENTITY VERIFIED gate needs GitHub evidence for duplicate contacts, rate limits, recovery abuse, suspended-account denial, delegated-permission denial, audit completeness and private-route isolation. The founding partner reviews evidence and explicitly decides gate passage.

## Founding-partner decisions — 2026-09-29

1. **Mobile-only recovery:** deferred for PHASE-03. It must remain explicitly disabled until identity proofing, staff approval roles and evidence-retention policy are defined and approved. No identity document or private evidence belongs in this public repository.
2. **Initial owner bootstrap:** approved only through a reviewed, audited operator action. Record operator identity, target account, reason/context, timestamp and resulting role change. No self-service, automatic assignment or seeded owner password.
3. **Email contact assurance:** unverified email may register and sign in. Email password reset is unavailable until a verification link establishes mailbox control.

ADRs [0003](decisions/0003-v1-account-contact-policy.md) and [0007](decisions/0007-browser-auth-and-rbac.md) already approve the overall account/session/RBAC architecture. This plan makes their implementation boundaries explicit. Exact proofing evidence and retention remain human-controlled security/privacy policy inputs.
