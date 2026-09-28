import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

/**
 * PHASE-01 infrastructure-only table. It exists solely to prove the
 * reviewed SQL migration up/down pipeline and the health endpoint's
 * database check in GitHub CI. It is not a domain entity — Identity,
 * CMS and other business schema are introduced by their owning phases
 * (see docs/DATA-MODEL.md). Do not add business columns/relations here.
 */
export const foundationProbe = pgTable("foundation_probe", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
