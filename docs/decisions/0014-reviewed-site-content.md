# ADR 0014 — Reviewed publication for CMS-managed site content, and Team consent enforcement

Status: accepted for source implementation on 2026-10-01 following the founding partner's decision that all CMS-managed visitor-facing content must go through the appropriate review and publish workflow, while technical configuration and secrets must not.

## Decision

1. **Editorial content is reviewed and published.** A change to a visitor-facing site setting (brand names, footer text, logo, contact details, social links) or to a visitor-facing text override is a *proposed change* (`cms_site_change`). It becomes live only after an approved review and a publication, which are the only actions that write `cms_setting` or `cms_text`. Permissions reuse the page workflow: `pages.write` to propose, `pages.review` to review (approve or reject with a note) and `pages.publish` to publish. The staff Site settings screen is available to anyone with `pages.read` or `settings.site`.
2. **Separation follows ADR 0012.** In `separated` mode the reviewer must differ from the proposer and the publisher from both; in `single_operator` mode one authorized person may do all three, but an approved review record is still required. Every review and publication audit event records the mode. Proposals, decisions and publications are append-only in PostgreSQL (a trigger forbids edits to a proposal, changes to a final decision, edits after publication and deletion).
3. **Technical configuration is not editorial.** The search-engine switch (`robots_enabled`) stays a direct, audited `settings.site` edit. Secrets, SMTP and database settings, `INQUIRY_NOTIFY_TO`, `INQUIRY_RATE_SECRET`, `CMS_WORKFLOW_MODE` and other deployment values remain protected environment configuration and never enter the CMS or this repository.
4. **Team consent is enforced.** A profile section may be approved or published only if its approval-reference field contains a recorded consent token (`consent:<reference>`); the public reader also refuses to render a profile without it. The token is a reference, not the evidence, which stays private. The owner's profile draft deliberately carries no token, so it cannot be published until the owner records consent. Photos remain optional, functional and unrequired.

## Consequences

ADR 0013's statement that settings and text edits skip review is superseded by this ADR; ADR 0013's scope of editable content is unchanged. Resetting a value to the built-in default is itself a reviewed change. Proposals are never applied by the proposer alone in separated mode. This ADR publishes nothing.
