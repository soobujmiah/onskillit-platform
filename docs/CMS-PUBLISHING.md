# Phase 4 CMS publishing contract

Status: implementation CI-verified on `phase-04/cms-core`; PUBLISHING CORE VERIFIED gate passed on synthetic GitHub evidence. The physical contract is reviewed SQL migration `0003_cms`, matching Drizzle definitions, `/api/v1/cms` and [CMS OpenAPI](openapi/cms.json). Public business pages and published-content rendering belong to Phase 5.

## Editorial model

A `cms_page` has a stable key and zero or one published revision. Each `cms_revision` stores a paired English and Bangla snapshot with the same revision number, typed sections and SEO fields. Valid types are hero, text and call to action. Text is plain; executable HTML, remote imports and arbitrary scripts are refused. Each section carries a source/evidence reference. Revision, review and publication rows are append-only in PostgreSQL. Editing creates a new revision after the caller supplies the current revision ID; stale writes return conflict. A rollback copies an older revision into a new draft. It requires fresh independent review before publication and does not silently replace the current published revision.

Only an actor with `pages.write` may create drafts, an actor with `pages.review` may review someone else's revision, and an actor with `pages.publish` may publish the latest approved complete revision. The publisher must differ from both author and reviewer. Both locales require title, slug, description, SEO title/description and valid sourced sections before approval. Authored prose, navigation labels and media alt text reject mixed scripts in either locale; slugs, paths and source identifiers are documented data exceptions. Published slug uniqueness is checked per locale. Archive detaches navigation and redirects in the same transaction. All successful sensitive commands append identity audit events atomically.

The preview API is session bound to `pages.read`, returns `no-store` and `X-Robots-Tag: noindex, nofollow`, and has no public page route or sitemap entry. The editor's preview panel renders authored plain text for staff. A later Phase 5 public renderer will read only `cms_page.published_revision_id` and enforce approved business claims and legal copy.

## Media and safe settings

Upload accepts bounded files with PNG, JPEG, WebP or PDF signatures and matching MIME, private by default. It records checksum, rights reference, English/Bangla alt text, uploader and bytes. A different actor with `pages.publish` must approve public use. Private download requires `media.read`; the response is `no-store`, `nosniff` and sandboxed. Content is stored as a 5 MiB capped PostgreSQL bytea in this phase to preserve GitHub CI portability and avoid an unselected external object store. It is an explicit temporary architectural limit: production-scale object storage, antivirus/derivative processing and retention require a reviewed adapter and environment gate before broad document uploads. No media deletion route exists, so a referenced asset cannot be silently removed.

Navigation and redirects can target only published pages and are removed on archive. Site settings are limited to bilingual site names, contact email and a robots enable flag. They cannot change authentication, payments, deployment configuration or legal identity. `cms_publisher` is a privileged identity role and uses Phase 3's two-person grant workflow. Other editorial roles remain scoped by explicit permissions.

## Phase boundary

This implementation supplies six staff pages and a synthetic, authenticated preview. It does not make the public business site visible on a live domain. Phase 5 owns public home/about/services/contact/legal pages, public published-content API, sitemap and verified owner-provided copy; Phase 14 owns production cutover. A preview host can be provisioned separately when the owner selects a provider and supplies protected environment configuration.

## Workflow mode (ADR 0012)

The statements above about a different reviewer and a different publisher describe the default `separated` mode. A deployment may instead set `CMS_WORKFLOW_MODE=single_operator`, which lets one authorized person hold the author, reviewer and publisher steps and approve their own media. An explicit approved review record, locale completeness, public-media and slug checks, and audit logging still apply, and review and publication audit events record the mode in use. The setting is environment configuration only; it cannot be changed through the staff interface.

## Team profile sections

A `profile` section carries a name, role and biography and may carry skills (up to 12), public links (up to 6, `https` only, per-language label), a relationship to OnSkillIT, a visibility of `active` or `hidden`, and an optional public photo reference. Profiles appear in section order, and hidden profiles remain in revision history but are not rendered. Names, roles, skills, labels and relationships obey the same per-language script rules as other prose. A photo shows publicly only when its media record has been approved public and carries alt text. A real person's profile needs that person's explicit approval, recorded privately outside the repository. The approval reference field holds only a non-sensitive reference and must contain `consent:<reference>`; without it the revision cannot be approved or published and the public reader will not render it.

## Site settings, visible text and images (ADRs 0013 and 0014)

Brand names, footer text, the logo, contact details, social links and any visitor-facing label or message are CMS-managed. Staff with `pages.write` propose a change; staff with `pages.review` approve or reject it with a note; staff with `pages.publish` publish it, and only publication makes it live. Separation follows the workflow mode above. An empty value proposes restoring the built-in default. Only the technical search-engine switch is edited directly. Images attached to any section render publicly only when the media is approved public with alt text in both languages. Staff-only screens, the client error boundary and email text are not CMS-managed, and secrets and deployment configuration are never CMS content.
