import { pgTable, serial, timestamp, uuid, text, boolean, jsonb, integer, primaryKey } from "drizzle-orm/pg-core";

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

export const identityUser = pgTable("identity_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const identityContact = pgTable("identity_contact", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => identityUser.id),
  kind: text("kind").notNull(),
  normalized: text("normalized").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const identityPassword = pgTable("identity_password", {
  userId: uuid("user_id").primaryKey().references(() => identityUser.id),
  passwordHash: text("password_hash").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});
export const identitySession = pgTable("identity_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => identityUser.id),
  tokenHash: text("token_hash").notNull().unique(),
  csrfHash: text("csrf_hash").notNull(),
  staff: boolean("staff").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
export const identityToken = pgTable("identity_token", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => identityUser.id),
  contactId: uuid("contact_id").notNull().references(() => identityContact.id),
  purpose: text("purpose").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const identityRole = pgTable("identity_role", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  staff: boolean("staff").notNull().default(false),
  privileged: boolean("privileged").notNull().default(false),
});
export const identityPermission = pgTable("identity_permission", { id: text("id").primaryKey() });
export const identityRolePermission = pgTable("identity_role_permission", {
  roleId: text("role_id").notNull().references(() => identityRole.id),
  permissionId: text("permission_id").notNull().references(() => identityPermission.id),
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]);
export const identityAssignment = pgTable("identity_assignment", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => identityUser.id),
  roleId: text("role_id").notNull().references(() => identityRole.id),
  scopeType: text("scope_type").notNull(),
  scopeId: text("scope_id").notNull(),
  grantedBy: uuid("granted_by").references(() => identityUser.id),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
export const identityAudit = pgTable("identity_audit", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => identityUser.id),
  operatorIdentity: text("operator_identity"),
  targetUserId: uuid("target_user_id").references(() => identityUser.id),
  action: text("action").notNull(),
  outcome: text("outcome").notNull(),
  reason: text("reason"),
  requestId: text("request_id").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const identityRateLimit = pgTable("identity_rate_limit", {
  keyHash: text("key_hash").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});
