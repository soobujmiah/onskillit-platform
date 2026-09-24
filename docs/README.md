# Documentation map

This repository is in Phase 0. The documentation is a living specification, with explicit evidence states. No application behavior is implemented yet.

| Question | Document |
|---|---|
| Is documentation ready and what is missing? | `READINESS.md`, `RISKS.md`, `phases/PHASE-0.md` |
| What is the product and V1 scope? | `SPECIFICATION.md`, `ROADMAP.md`, `TRACEABILITY.md` |
| What was actually observed on the old site? | `SITE-AUDIT.md`, `current-site-link-inventory.csv` |
| What are the workflows and domain boundaries? | `DOMAIN-WORKFLOWS.md`, `DATA-MODEL.md`, `API-CONTRACT.md` |
| What are the candidate technical choices? | `ARCHITECTURE.md`, `TECHNOLOGY-EVALUATION.md`, `decisions/` |
| How will design, language and responsiveness work? | `DESIGN-SYSTEM.md` |
| How are content, SEO, security and payments governed? | `SEO-CONTENT.md`, `SECURITY-ARCHITECTURE.md`, `PAYMENTS.md` |
| What will prove readiness to release? | `QUALITY-GATES.md`, `OPERATIONS.md` |
| How does another agent continue? | `HANDOFF.md`, root `AI_ASSISTANT.md` |

Decision hierarchy: founding-partner confirmed direction → approved ADR/requirements → current repository source and GitHub CI evidence (once code exists). Dated observations are evidence for the stated time only. Proposed architecture is never silently treated as approved. Any implementation PR must update affected docs and the traceability row in the same change. Avoid duplicating a fact in multiple places; cross-link its canonical document.
