# First-owner operator procedure

Status: implementation procedure for PHASE-03, **not executed against any real environment**. The founding partner approved this boundary on 2026-09-29: the initial owner role is assigned only by a reviewed and audited operator action. Public signup, a migration seed, and an authenticated browser request cannot create the first owner.

Before running `scripts/bootstrap_owner.ts` outside synthetic CI:

1. A named reviewer confirms the target account ID, the intended operator identity, the reason and the isolated environment. Keep the approval record outside this public repository. The operator and reviewer must be different people.
2. The operator uses a restricted database credential provided through protected environment configuration. Confirm the target account is active and no active owner assignment exists. Do not paste a password, token or production connection string into the command line, shell history, logs, issue or PR.
3. In the protected execution environment, set `DATABASE_URL`, `OPERATOR_IDENTITY`, `OPERATOR_REVIEW_REFERENCE`, `OPERATOR_REASON`, `TARGET_USER_ID`, and `OWNER_BOOTSTRAP_APPROVED=yes`, then run `tsx scripts/bootstrap_owner.ts`. The identity field must match the authenticated operator; the review reference must identify the independent approval. The script serializes simultaneous first-owner attempts with a transaction advisory lock, then refuses missing context, an inactive target and an existing owner.
4. Review the resulting `identity_assignment` and `identity_audit` records together. The audit record contains operator identity, target account, reason, review reference, timestamp and assignment ID. Existing target sessions are revoked. Preserve the approval and audit evidence under the private operations retention policy.

The application cannot authenticate the external database operator or reviewer; that trust boundary belongs to the protected operations environment. Do not run this procedure until the protected environment and reviewer record exist. A **second** owner or security administrator is not created by this first-owner script. Later privileged grants use the application's separate requester/approver workflow once two eligible administrators exist; provisioning a second eligible approver requires its own reviewed operator procedure and is an open operational gate.
