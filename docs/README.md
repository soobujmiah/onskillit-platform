# Documentation map

This repository is in Phase 0. The documentation is a living specification, with explicit evidence states. No application behavior is implemented yet.

| Question | Document |
|---|---|
| Is documentation ready and what is missing? | `READINESS.md`, `RISKS.md`, `phases/PHASE-0.md` |
| What is the product and V1 scope? | `SPECIFICATION.md`, `OFFERINGS.md`, `PHASES.md`, `ROADMAP.md`, `TRACEABILITY.md` |
| What pages and routes exist, and when? | `PAGES.md` (canonical IDs/routes/phase), `SITEMAP.md` (public projection) |
| What was actually observed on the old site? | `SITE-AUDIT.md`, `current-site-link-inventory.csv`, `LEGACY-URL-DISPOSITION.md` |
| What are the workflows and domain boundaries? | `DOMAIN-WORKFLOWS.md`, `DATA-MODEL.md`, `API-CONTRACT.md`, `DOMAIN-CONSISTENCY.md` |
| What are the candidate technical choices? | `ARCHITECTURE.md`, `TECHNOLOGY-EVALUATION.md`, `HOSTING-CAPABILITY.md`, `decisions/` |
| How will design, language and responsiveness work? | `DESIGN-SYSTEM.md`, `UX-CONCEPT-REVIEW.md` |
| How are content, SEO, security and payments governed? | `SEO-CONTENT.md`, `SECURITY-ARCHITECTURE.md`, `PAYMENTS.md`, `LEGAL-IDENTITY.md` |
| What will prove readiness to release? | `QUALITY-GATES.md`, `OPERATIONS.md` |
| How does another agent continue? | `HANDOFF.md`, root `AI_ASSISTANT.md` |

Decision hierarchy: founding-partner confirmed direction → approved ADR/requirements → current repository source and GitHub CI evidence (once code exists). Dated observations are evidence for the stated time only. Proposed architecture is never silently treated as approved. Any implementation PR must update affected docs and the traceability row in the same change. Avoid duplicating a fact in multiple places; cross-link its canonical document.

Canonical ownership: `PHASES.md` owns lifecycle/dependencies/gates; `PAGES.md` owns page templates, IDs, routes and their single implementation phase; `SITEMAP.md` projects public URLs; `TRACEABILITY.md` maps requirements to phases/pages/data/API/tests; `ROADMAP.md` is a readable projection. Do not maintain an independent page/phase sequence elsewhere. The architecture consistency check runs in GitHub Actions (`.github/workflows/docs-architecture.yml`), not locally.

The filenames in this repository are `DATA-MODEL.md` (database), `API-CONTRACT.md` (API), `PAYMENTS.md` (payment), `SECURITY-ARCHITECTURE.md` (security), and `SEO-CONTENT.md` (SEO). CMS, CRM, LMS and TMS are documented across `SPECIFICATION.md`, `DOMAIN-WORKFLOWS.md`, `DATA-MODEL.md`, `API-CONTRACT.md`, `PHASES.md` and `DOMAIN-CONSISTENCY.md`; no duplicate thin files are maintained solely to match a suggested filename.
