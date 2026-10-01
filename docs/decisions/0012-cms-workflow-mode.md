# ADR 0012 — Single-operator and separated CMS workflow modes

Status: accepted for source implementation on 2026-10-01 following the founding partner's decision that the CMS must support one person acting as author, reviewer and publisher when chosen, and stronger separation when desired.

## Decision

A deployment-level setting `CMS_WORKFLOW_MODE` selects the publication workflow:

- `separated` (the default, and the fallback for any unrecognized value): a reviewer must differ from the author, and a publisher must differ from both; public media approval must differ from the uploader. This is the previous behavior.
- `single_operator`: the same authorized person may hold and use all three steps and approve their own media.

In both modes the roles `cms_editor`, `cms_reviewer` and `cms_publisher` and their permissions (`pages.write`, `pages.review`, `pages.publish`) remain, an explicit approved review record must exist before publication, locale completeness and public-media checks still apply, and every review and publication audit event records the `workflow_mode` in use. The setting is environment configuration rather than a database or web setting, so a staff account cannot weaken the workflow through the interface. Rollback still creates a new draft that needs its own approved review.

## Consequences

The owner can run a single-operator site now and switch to separated by changing the environment and restarting, without a migration. GitHub CI exercises the default mode in `scripts/cms_ci.mjs` and the single-operator mode on a second synthetic server in `scripts/cms_single_operator_ci.mjs`. A single-operator deployment gives up independent review; that is an owner choice, not a default.
