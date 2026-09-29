# First-owner operator procedure

Status: implementation procedure for PHASE-03, **not executed against any real environment**. The founding partner approved this boundary on 2026-09-29: the initial owner role is assigned only by a reviewed and audited operator action. Public signup, a migration seed, and an authenticated browser request cannot create the first owner.

Before running `scripts/bootstrap_owner.ts` outside synthetic CI:

1. A named reviewer confirms the target account ID, the intended operator identity, the reason and the isolated environment. Keep the approval record outside this public repository. The operator and reviewer must be different people.
2. The operator uses a restricted database credential provided through protected environment configuration. Confirm the target account is active and no active owner assignment exists. Do not paste a password, token or production connection string into the command line, shell history, logs, issue or PR.
3. In the protected execution environment, set `DATABASE_URL`, `OPERATOR_IDENTITY`, `OPERATOR_REVIEW_REFERENCE`, `OPERATOR_REASON`, `TARGET_USER_ID`, and `OWNER_BOOTSTRAP_APPROVED=yes`, then run `tsx scripts/bootstrap_owner.ts`. The identity field must match the authenticated operator; the review reference must identify the independent approval. The script serializes simultaneous first-owner attempts with a transaction advisory lock, then refuses missing context, an inactive target and an existing owner.
4. Review the resulting `identity_assignment` and `identity_audit` records together. The audit record contains operator identity, target account, reason, review reference, timestamp and assignment ID. Existing target sessions are revoked. Preserve the approval and audit evidence under the private operations retention policy.

The application cannot authenticate the external database operator or reviewer; that trust boundary belongs to the protected operations environment. Do not run this procedure until the protected environment and reviewer record exist. A **second** owner or security administrator is not created by this first-owner script. Later privileged grants use the application's separate requester/approver workflow once two eligible administrators exist.

## Second eligible approver

`scripts/bootstrap_second_owner.ts` is an operator-only, one-time bridge from exactly one active global owner to two. It is **not an automatic deployment step** and has not been run against a real environment. It assigns the second person the `owner` role so both administrators hold the same delegation ceiling required by the existing two-person privileged grant API.

1. The existing owner independently approves the target account ID, the owner role, the reason and the isolated environment. A protected approval record identifies that owner. A separately authenticated operator executes the action; the owner and operator must be different people. Store the approval outside this public repository.
2. Confirm the target is an active account distinct from the approving owner. Confirm exactly one active global owner currently exists. Use a restricted database credential supplied by protected environment configuration. Do not put credentials or private approval evidence in commands, logs, issues or PRs.
3. Set `DATABASE_URL`, `OPERATOR_IDENTITY`, `OWNER_APPROVER_ID`, `OWNER_APPROVAL_REFERENCE`, `OPERATOR_REASON`, `TARGET_USER_ID` and `SECOND_OWNER_BOOTSTRAP_APPROVED=yes` in the protected environment, then run `tsx scripts/bootstrap_second_owner.ts`. The script takes the same transaction lock as first-owner bootstrap, checks the owner and target, creates the assignment, revokes target sessions and appends an audit record atomically. It refuses missing context, self-assignment, an inactive target, zero owners or more than one owner.
4. The operator and owner independently verify the assignment, target session revocation and append-only audit record. Preserve the approval and audit evidence under the private operations retention policy. From this point, new privileged grants use the application's requester/approver workflow.

The script verifies database state, not the authenticity of human approval or the external operator identity; those must be enforced by the protected operations environment. Never run either operator script from a public request, CI against real data, or an unreviewed shell session.
