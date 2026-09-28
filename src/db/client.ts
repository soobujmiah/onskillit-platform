import postgres from "postgres";

/**
 * Lazily creates a postgres-js client from DATABASE_URL. Callers must
 * treat an absent DATABASE_URL as "database not configured", not an
 * error — PHASE-01's web CI job intentionally runs without a database.
 */
export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function createDbClient(databaseUrl: string) {
  return postgres(databaseUrl, { max: 1, connect_timeout: 5, idle_timeout: 5 });
}
