import { pgTable, serial, timestamp, uuid, text, boolean, jsonb, integer, primaryKey, customType } from "drizzle-orm/pg-core";

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
export const identityGrantRequest = pgTable("identity_grant_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestedBy: uuid("requested_by").notNull().references(() => identityUser.id),
  targetUserId: uuid("target_user_id").notNull().references(() => identityUser.id),
  roleId: text("role_id").notNull().references(() => identityRole.id),
  scopeType: text("scope_type").notNull(),
  scopeId: text("scope_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  approvedBy: uuid("approved_by").references(() => identityUser.id),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
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

// PHASE-04 CMS. SQL migration 0003 is authoritative; these definitions mirror it.
const bytea = customType<{ data: Buffer }>({ dataType() { return "bytea"; } });
export const cmsPage = pgTable("cms_page", {
  id: uuid("id").primaryKey().defaultRandom(), pageKey: text("page_key").notNull().unique(),
  kind: text("kind").notNull(), state: text("state").notNull().default("draft"),
  publishedRevisionId: uuid("published_revision_id"),
  createdBy: uuid("created_by").notNull().references(() => identityUser.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const cmsRevision = pgTable("cms_revision", {
  id: uuid("id").primaryKey().defaultRandom(), pageId: uuid("page_id").notNull().references(() => cmsPage.id),
  revisionNo: integer("revision_no").notNull(), en: jsonb("en").notNull(), bn: jsonb("bn").notNull(),
  createdBy: uuid("created_by").notNull().references(() => identityUser.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const cmsReview = pgTable("cms_review", {
  id: uuid("id").primaryKey().defaultRandom(), revisionId: uuid("revision_id").notNull().references(() => cmsRevision.id),
  reviewerId: uuid("reviewer_id").notNull().references(() => identityUser.id),
  decision: text("decision").notNull(), note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const cmsPublication = pgTable("cms_publication", {
  id: uuid("id").primaryKey().defaultRandom(), pageId: uuid("page_id").notNull().references(() => cmsPage.id),
  revisionId: uuid("revision_id").references(() => cmsRevision.id), action: text("action").notNull(),
  actorId: uuid("actor_id").notNull().references(() => identityUser.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const cmsMedia = pgTable("cms_media", {
  id: uuid("id").primaryKey().defaultRandom(), filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(), bytes: bytea("bytes").notNull(),
  byteLength: integer("byte_length").notNull(), sha256: text("sha256").notNull(),
  public: boolean("public").notNull().default(false), rightsReference: text("rights_reference").notNull(),
  altEn: text("alt_en").notNull(), altBn: text("alt_bn").notNull(),
  uploadedBy: uuid("uploaded_by").notNull().references(() => identityUser.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const cmsNavigation = pgTable("cms_navigation", {
  id: uuid("id").primaryKey().defaultRandom(), slot: text("slot").notNull(), position: integer("position").notNull(),
  pageId: uuid("page_id").notNull().references(() => cmsPage.id),
  labelEn: text("label_en").notNull(), labelBn: text("label_bn").notNull(),
  updatedBy: uuid("updated_by").notNull().references(() => identityUser.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const cmsSetting = pgTable("cms_setting", {
  key: text("key").primaryKey(), value: text("value").notNull(),
  updatedBy: uuid("updated_by").notNull().references(() => identityUser.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const cmsRedirect = pgTable("cms_redirect", {
  id: uuid("id").primaryKey().defaultRandom(), locale: text("locale").notNull(),
  sourcePath: text("source_path").notNull(), targetPageId: uuid("target_page_id").notNull().references(() => cmsPage.id),
  updatedBy: uuid("updated_by").notNull().references(() => identityUser.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
