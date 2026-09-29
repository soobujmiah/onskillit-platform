-- PHASE-03 identity. All IDs are generated in the application or by PostgreSQL.
CREATE TABLE identity_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended','deletion_pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL CHECK (kind IN ('email','mobile')),
  normalized TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, normalized),
  UNIQUE (user_id, kind)
);
CREATE INDEX identity_contact_user_idx ON identity_contact(user_id);

CREATE TABLE identity_password (
  user_id UUID PRIMARY KEY REFERENCES identity_user(id) ON DELETE RESTRICT,
  password_hash TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_hash TEXT NOT NULL,
  staff BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX identity_session_user_idx ON identity_session(user_id);

-- Used for email verification and verified-email password reset only.
-- There is intentionally no mobile-recovery token or case table.
CREATE TABLE identity_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES identity_contact(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify_email','reset_password')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX identity_token_user_purpose_idx ON identity_token(user_id, purpose);

CREATE TABLE identity_role (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  staff BOOLEAN NOT NULL DEFAULT false,
  privileged BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE identity_permission (
  id TEXT PRIMARY KEY
);
CREATE TABLE identity_role_permission (
  role_id TEXT NOT NULL REFERENCES identity_role(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES identity_permission(id) ON DELETE RESTRICT,
  PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE identity_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  role_id TEXT NOT NULL REFERENCES identity_role(id) ON DELETE RESTRICT,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('global','account','resource')),
  scope_id TEXT NOT NULL,
  granted_by UUID REFERENCES identity_user(id) ON DELETE RESTRICT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  CHECK ((scope_type = 'global' AND scope_id = '*') OR (scope_type <> 'global' AND scope_id <> '*'))
);
CREATE UNIQUE INDEX identity_assignment_active_idx ON identity_assignment(user_id, role_id, scope_type, scope_id) WHERE revoked_at IS NULL;
CREATE INDEX identity_assignment_user_idx ON identity_assignment(user_id) WHERE revoked_at IS NULL;

CREATE TABLE identity_grant_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  target_user_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  role_id TEXT NOT NULL REFERENCES identity_role(id) ON DELETE RESTRICT,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('global','account','resource')),
  scope_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by UUID REFERENCES identity_user(id) ON DELETE RESTRICT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  CHECK (requested_by <> target_user_id),
  CHECK (approved_by IS NULL OR (approved_by <> requested_by AND approved_by <> target_user_id))
);
CREATE INDEX identity_grant_request_pending_idx ON identity_grant_request(status,requested_at DESC);

CREATE TABLE identity_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES identity_user(id) ON DELETE RESTRICT,
  operator_identity TEXT,
  target_user_id UUID REFERENCES identity_user(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success','denied','failure')),
  reason TEXT,
  request_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (actor_user_id IS NOT NULL OR operator_identity IS NOT NULL OR action LIKE 'public.%')
);
CREATE INDEX identity_audit_created_idx ON identity_audit(created_at DESC);
CREATE FUNCTION identity_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'identity_audit is append-only';
END;
$$;
CREATE TRIGGER identity_audit_no_update BEFORE UPDATE OR DELETE ON identity_audit
  FOR EACH ROW EXECUTE FUNCTION identity_audit_immutable();

CREATE TABLE identity_rate_limit (
  key_hash TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO identity_role(id,label,staff,privileged) VALUES
  ('owner','Owner',true,true),('security_admin','Security administrator',true,true),
  ('support','Support',true,false),('member','Member',false,false);
INSERT INTO identity_permission(id) VALUES
  ('users.read'),('users.manage'),('roles.read'),('roles.manage'),
  ('audit.read'),('profile.read'),('profile.manage');
INSERT INTO identity_role_permission(role_id,permission_id)
SELECT 'owner', id FROM identity_permission;
INSERT INTO identity_role_permission(role_id,permission_id) VALUES
  ('security_admin','users.read'),('security_admin','users.manage'),
  ('security_admin','roles.read'),('security_admin','roles.manage'),
  ('security_admin','audit.read'),('support','users.read'),
  ('member','profile.read'),('member','profile.manage');
