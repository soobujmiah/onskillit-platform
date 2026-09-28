# Migrations

Each migration is a reviewed SQL pair under `NNNN_name/up.sql` and
`down.sql`, applied directly with `psql` (see
`.github/workflows/database.yml`). `drizzle.config.ts` points
`drizzle-kit` at `src/db/schema.ts` for typed query generation only;
`drizzle-kit` does not generate down-migrations, so up/down pairs are
hand-authored and reviewed in the PR that introduces them, per ADR
0006.

GitHub CI applies `up.sql`, asserts the resulting state, applies
`down.sql`, asserts the reversal, then reapplies `up.sql` so the
database is left in the expected forward state. No migration runs
outside GitHub Actions against non-synthetic data.
