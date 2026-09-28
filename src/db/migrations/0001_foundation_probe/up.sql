-- Reviewed SQL migration — PHASE-01 foundation probe table.
-- Purpose: prove the up/down migration pipeline and back the health
-- endpoint's database check. Not a domain entity; see src/db/schema.ts.
CREATE TABLE IF NOT EXISTS foundation_probe (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
