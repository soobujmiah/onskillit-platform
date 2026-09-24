# ADR 0005 — Canonical phase and page registers

Status: **accepted by founding partner as canonical baseline**. Date: 2026-09-24. Approval evidence: owner instructed agents to keep the documented 16 phases and 74 V1 page templates fixed unless genuine new evidence creates an architectural contradiction.

## Context and problem

The initial Phase 0 roadmap described phases 0–8 but did not assign route templates to phases or distinguish production launch, stabilization and later evolution. Multiple agents could independently invent incompatible sequences or routes.

## Options

1. Keep the short roadmap and let each agent select the next slice.
2. Create one numbered lifecycle and one route-template inventory with permanent IDs; project other views from them.
3. Predefine separate roadmaps per frontend/backend domain.

## Decision

Recommend option 2. [PHASES.md](../PHASES.md) owns phases/dependencies/gates and [PAGES.md](../PAGES.md) owns page IDs/routes/phase assignments. [SITEMAP.md](../SITEMAP.md) and [ROADMAP.md](../ROADMAP.md) are projections. PHASE-00 through PHASE-14 cover V1 through accepted production; PHASE-15 reserves governed evolution. All changes pass the change-control rules in PHASES.md. The owner has accepted the phase/page baseline; this does **not** pass the separate Phase 0 documentation readiness gate or authorize implementation.

## Rationale, trade-offs and consequences

The registers make handoff, sequencing, traceability and route review explicit. More maintenance is required when scope changes, so documentation consistency is a CI gate. Numbering does not force a false linear dependency: the graph allows prepared parallel domain tracks. A reserved page is not a commitment to build it. Existing roadmap references must point to this decision; no application work follows from proposing it.

## 2026-09-24 consistency amendment

Phase/page numbers, template count and ownership remain unchanged. The domain audit found one genuine dependency omission: PHASE-09 inquiry-to-lead conversion requires PHASE-05 Inquiry intake. PHASE-05 → PHASE-09 was added to the phase dependency graph and master register; CRM domain work can still be prepared after PHASE-04, but its gate needs PHASE-05. The same audit documented early LearningAccess and TrainingParticipation contracts inside existing PHASE-06/07 to avoid referring to not-yet-built PHASE-08 enrollment. See `DOMAIN-CONSISTENCY.md`.
