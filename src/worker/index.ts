import { createDbClient, getDatabaseUrl } from "@/db/client";

/**
 * PHASE-01 worker baseline. Proves the same versioned artifact can run
 * a separately deployable worker process (ADR 0006/0009): connects to
 * PostgreSQL, reports ready, and shuts down cleanly on SIGTERM/SIGINT.
 *
 * Deliberately out of scope: outbox job claiming/leasing/retry. There
 * is no OutboxEvent table yet — the first phase that writes to the
 * outbox owns that logic and its own migration (see docs/DATA-MODEL.md).
 */
async function main() {
  const databaseUrl = getDatabaseUrl();
  if (databaseUrl) {
    const sql = createDbClient(databaseUrl);
    await sql`select 1`;
    await sql.end({ timeout: 1 });
    console.log(JSON.stringify({ level: "info", msg: "worker ready", database: "ok" }));
  } else {
    console.log(JSON.stringify({ level: "info", msg: "worker ready", database: "not configured" }));
  }

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(JSON.stringify({ level: "info", msg: "worker shutting down", signal }));
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Heartbeat loop stands in for future outbox polling; it does no
  // domain work today. Intentionally not unref'd — a worker process
  // must stay alive on its own until it receives a shutdown signal.
  setInterval(() => {
    console.log(JSON.stringify({ level: "debug", msg: "worker heartbeat" }));
  }, 30_000);
}

main().catch((error) => {
  console.error(JSON.stringify({ level: "error", msg: "worker failed to start", error: String(error) }));
  process.exit(1);
});
