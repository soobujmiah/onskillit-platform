# PHASE-03 work log — identity, RBAC and audit

Current phase: **IN PROGRESS**. Gate: **IDENTITY VERIFIED OPEN**. Source branch: `phase-03/identity-rbac-audit`, draft PR #12. No production deployment, production data migration, external mail delivery or owner role grant occurred.

## Decision and scope

The founding partner approved [PHASE-03-PLAN](PHASE-03-PLAN.md) on 2026-09-29 with three conditions: mobile-only recovery is deferred and disabled; first-owner assignment must be a reviewed and audited operator action; unverified email may register/sign in but cannot receive reset until mailbox control is verified. PHASES and TRACEABILITY record the same boundary. The assigned pages are AUTH-SIGN-IN, AUTH-REGISTER, AUTH-RECOVERY, AUTH-RESET, USER-PROFILE, ADMIN-USERS, ADMIN-ROLES, ADMIN-AUDIT and SYS-FORBIDDEN. Requirements are R01, R02, R10, R15 and the cross-cutting R16/R19/R20 with R17 CI.

## Implemented on the branch

- Reviewed SQL `0002_identity` up/down migration and matching Drizzle schema for users, contacts, passwords, revocable sessions, verified-email tokens, roles, permissions, assignments, append-only audit and rate limits. No mobile recovery table or token exists. Migration never grants an owner to a user.
- Node route handlers under `/api/v1/identity` for registration, sign-in/out, session/profile, email verification, verified-email reset, own-password change, scoped staff user/role/audit reads, non-privileged grant/revoke, two-person privileged grant request/approval, and account status. Direct privileged grants and changes to privileged account status are denied. The mobile-recovery route returns a disabled response.
- Argon2id hashing with 19 MiB, 2 iterations, 1 lane; high-entropy opaque hashed session tokens; Secure/HttpOnly/SameSite cookies when the configured public URL is HTTPS; server-side status/expiry checks, same-origin and session-bound CSRF checks, synthetic abuse limits, token single use, session revocation and auditable sensitive changes. Production tuning and deployment configuration remain later checks.
- Owner bootstrap script and [operator procedure](OWNER-OPERATOR-PROCEDURE.md) require a separate reviewer, protected operator context and approval marker. The action logs operator identity, target, reason, review reference, timestamp and resulting assignment atomically. It is not an HTTP route, migration seed or self-service operation. No real owner action has been run.
- Bilingual routes/forms and staff views for all nine Phase 3 page IDs; verification request is a USER-PROFILE state and the verification token uses the AUTH-RESET template, so no new page ID was added. `docs/openapi/identity.json` is the checked API contract. GitHub CI includes migration reversal, OpenAPI validation, build, synthetic PostgreSQL integration, synthetic SMTP delivery/recovery and new-page browser checks.

## GitHub evidence and defects

- First identity run on `4251178` reached the bootstrap step but failed because the TypeScript operator script used top-level await under `tsx` CommonJS output. This was corrected by wrapping the operation in `main()`.
- A following run on `7a561eb` failed typecheck because environment variable narrowing did not carry into the asynchronous function. Passing validated values as required arguments fixed it.
- GitHub identity run [36532625966](https://github.com/soobujmiah/onskillit-platform/actions/runs/36532625966) **passed** on source commit `2d2aaf8f320a14b0b14b61f94bccd8a265ebeaec`. That run exercised synthetic registration, duplicate normalized contact denial, unverified-email login/reset denial, token single use, session revocation, owner bootstrap audit, privileged grant denial, support grant and suspension. The later synthetic SMTP delivery test was added after that commit and needs its own CI evidence.
- GitHub identity run [36533035512](https://github.com/soobujmiah/onskillit-platform/actions/runs/36533035512) **passed** on `2e74fec7e1d56056fb1e83f62f15aee18c2d75a6`, including a synthetic SMTP server that delivered verification and reset links, then tested single-use redemption. This is synthetic delivery only; later browser checks and final-commit evidence are still pending.
- All PR checks **passed** at `c228581327100653a703380022e5adc17265bddd`, including [Identity run 36533139391](https://github.com/soobujmiah/onskillit-platform/actions/runs/36533139391) with browser checks. New scoped-list, two-person grant and immutable-audit checks were added after that commit and require a new final-commit run.

## Open gate items

- Rerun GitHub CI on the final source commit, including the synthetic SMTP delivery path, API schema validation and browser checks for the new pages. Record exact run URLs and failures.
- Review the final role delegation and two-person privileged grant path. A second owner/reviewer cannot be created by self-service; its provisioning remains a separately reviewed operator action. The new request/approval path needs final GitHub evidence.
- Review private/staff page mobile, keyboard, contrast and both-locale behavior with GitHub browser tests; the earlier PHASE-02 shell test alone does not prove these new pages.
- Confirm environment-managed SMTP and public URL at the eventual preview/staging environment. The synthetic CI mail sink is not evidence of external deliverability. Mobile-only recovery remains deferred beyond this gate by owner decision.
- Complete documentation/traceability/page status sync, security review and owner sign-off before changing the gate state or merging PR #12.
