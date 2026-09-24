# Quality, testing and release gates

Status: proposed verification contract. All builds/tests execute in GitHub Actions or approved GitHub-hosted environments. This file defines future evidence; no test has run yet.

## Test layers and required evidence

| Layer | Examples | Required proof |
|---|---|---|
| Domain unit | enrollment transitions, pricing math, role delegation, progress calculation | CI pass with commit SHA |
| Database/integration | uniqueness, FKs, capacity race, migration up/down, audit transaction | isolated CI database, logs |
| API contract | validation, errors, pagination, idempotency, scope | versioned contract tests |
| UI component | forms, tables, dialogs, themes, locale states | browser/component CI run |
| End-to-end | visitor→enroll→learn; editor→publish; lead→client; batch→attendance; invoice→payment sandbox | seeded synthetic data, screenshots/traces with redaction |
| Security | auth brute force, CSRF, XSS, upload spoof, privilege escalation, cross-account access, callback replay | automated checks plus manual review notes |
| Accessibility | keyboard, focus, labels, contrast, screen reader sample, reduced motion | automated scan and human walkthrough |
| SEO/content | titles, canonical, hreflang, sitemap, structured data, redirects, broken links, script purity | generated-output CI validation |
| Responsive/performance | route/task matrix, CWV, load profile | browser viewport evidence and staging metrics |
| Operations | backup restore, rollback, alerts, queue retries | dated staging drill with RPO/RTO measurements |

## Responsive task matrix

At 320, 360, 390, 768, 1024, 1440 and ≥1920 CSS px, verify representative pages in both themes and both languages. Routes: home, service, course, program/batch, blog, registration/reset, student learning, instructor attendance, client request, CMS page editor, admin user/role table, CRM board, finance record. Critical tasks must complete by touch and keyboard. Check portrait/landscape when meaningful, 200% and 400% zoom, long Bangla text, slow network, error/loading/empty/populated states, overlays, virtual keyboard, safe areas and no horizontal page overflow. Every P0/P1 template must have a tracked result; one representative screenshot alone does not prove responsiveness.

## Feature acceptance samples

- **Identity:** multiple users may share no normalized email/mobile; credential reset is single-use and does not reveal account existence; suspended sessions cannot access resources; future assurance factors fit the same account.
- **RBAC:** a sub-admin can act only within resource and scope grants; unauthorized API requests fail even if crafted manually; grantor cannot delegate unheld powers; role changes are audited.
- **CMS:** only approved locale-complete revision becomes public; preview is private; rollback creates a new revision; demo/unrelated content is rejected by workflow, not solely by regex.
- **LMS/TMS:** enrollment maps to frozen course edition and optional batch; capacity is enforced under concurrency; attendance is session-specific; grades/progress/certificates follow approved rules.
- **CRM/client:** account contacts cannot read other clients; activities retain actor/time; staff-only notes are never included in client responses.
- **Finance:** amount/currency/provider reference are verified, callbacks are idempotent, money records are immutable or corrected by explicit entries, refunds require permission and reason.
- **SEO/localization:** only real published pages enter sitemap; translations are equivalent and script-pure; old URLs follow approved 301/410 decisions; structured data matches visible claims.
- **Security/operations:** private media is inaccessible without authorization; secrets never enter logs/artifacts; restore and rollback complete within approved objectives.

## GitHub workflow proposal

PR: format/lint/typecheck (once stack is approved), tests, schema migration test, script-purity/content validation, security/dependency scan, build, accessibility/SEO checks, preview deployment with synthetic data. Main: repeat checks and produce immutable build artifact/provenance. Staging: deploy exact artifact, browser smoke, performance and payment sandbox, restore drill as scheduled. Production: protected environment, owner approval, exact artifact promotion, health checks and rollback plan. Use minimal `GITHUB_TOKEN` permissions, pinned third-party actions, OIDC where possible and no secrets in fork PR jobs. GitHub public-repo environments can gate deploys [per GitHub documentation](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).

## Definition of done

A requirement is done only when its traceability row names source, schema/API/UI, documentation, test, CI run, commit and reviewer approval; all P0/P1 acceptance checks pass; no critical unresolved security/accessibility/content issue remains; backups/rollback are exercised; the owner approves production. CI pass does not prove real business claims or legal rights—those need separate owner evidence.
