# ADR 0003 — V1 account contacts and recovery

Status: **accepted product direction; security procedure pending**, 2026-09-24.

Context/problem: V1 requires email/mobile/password accounts without mandatory OTP. A phone-only account cannot use an email reset link.

Options: require both contacts; require email; allow either and provide assisted recovery. Decision from founding partner: allow either email or mobile and use staff-assisted reset for mobile-only accounts. No mandatory OTP in V1; future email/phone verification and 2FA must fit the identity model.

Rationale: lower registration friction and broader access. Trade-offs: unverified contact ownership creates squatting/recovery risk; manual recovery needs trained staff, identity proofing, audit and abuse controls. Consequences: before launch, approve a precise proofing procedure, staff permissions, second-person review for privileged accounts, retention and notification rules. Unverified email/mobile must never be represented as verified, and sensitive invitations or disclosures require separate assurance. [OWASP recovery guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
