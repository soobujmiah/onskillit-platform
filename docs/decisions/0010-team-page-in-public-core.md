# ADR 0010 — Start the public Team page in Phase 5

Status: accepted for source implementation on 2026-10-01 following the founding partner's request for a staff profiles page. Public profile publication still requires consent and editorial review.

## Decision

Move the existing `PAGE-TEAM` `/team` template from PHASE-11 to PHASE-05. Reuse the bilingual CMS PageRevision workflow and add a typed `profile` section containing a name, role, bio and non-sensitive approval reference. The page stays unpublished and unindexed until a complete revision is independently reviewed and published. Its navigation link appears only while published. Phase 11 retains the structured TeamMember collection and staff collection management; it may migrate the same public route to those records later.

## Reason

The owner requested a navigable staff profiles page during local review. The existing CMS already supplies draft, review, publish, localization and permission controls. Reusing it provides the page without storing invented staff identities or opening a new unreviewed publication path.

## Limits

No person, role, biography, photograph or consent is inferred from an identity account. Real profile text and approval evidence must come from the person and owner. Private consent records remain outside public CMS text. This initial template lists profile cards within one page revision; per-person lifecycle and collection editing remain Phase 11 work.
