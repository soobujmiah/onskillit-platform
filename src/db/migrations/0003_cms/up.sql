-- PHASE-04 CMS. Paired locales are stored in each immutable revision.
CREATE TABLE cms_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE CHECK (page_key ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  kind TEXT NOT NULL CHECK (kind IN ('page','landing')),
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','published','archived')),
  published_revision_id UUID,
  created_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE cms_revision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES cms_page(id) ON DELETE RESTRICT,
  revision_no INTEGER NOT NULL CHECK (revision_no > 0),
  en JSONB NOT NULL,
  bn JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_id,revision_no), UNIQUE(page_id,id)
);
ALTER TABLE cms_page ADD CONSTRAINT cms_page_published_revision_fk
  FOREIGN KEY(id,published_revision_id) REFERENCES cms_revision(page_id,id) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE cms_review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id UUID NOT NULL REFERENCES cms_revision(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected')),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX cms_review_revision_idx ON cms_review(revision_id,created_at DESC);
CREATE TABLE cms_publication (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES cms_page(id) ON DELETE RESTRICT,
  revision_id UUID REFERENCES cms_revision(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN ('publish','archive')),
  actor_id UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE cms_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png','image/jpeg','image/webp','application/pdf')),
  bytes BYTEA NOT NULL,
  byte_length INTEGER NOT NULL CHECK (byte_length > 0 AND byte_length <= 5242880),
  sha256 TEXT NOT NULL,
  public BOOLEAN NOT NULL DEFAULT false,
  rights_reference TEXT NOT NULL,
  alt_en TEXT NOT NULL,
  alt_bn TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE cms_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL CHECK (slot IN ('header','footer')),
  position INTEGER NOT NULL CHECK (position BETWEEN 0 AND 99),
  page_id UUID NOT NULL REFERENCES cms_page(id) ON DELETE RESTRICT,
  label_en TEXT NOT NULL,
  label_bn TEXT NOT NULL,
  updated_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slot,position), UNIQUE(slot,page_id)
);
CREATE TABLE cms_setting (
  key TEXT PRIMARY KEY CHECK (key IN ('site_name_en','site_name_bn','contact_email','robots_enabled')),
  value TEXT NOT NULL,
  updated_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE cms_redirect (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL CHECK (locale IN ('en','bn')),
  source_path TEXT NOT NULL CHECK (source_path ~ '^/[a-z0-9/-]+$'),
  target_page_id UUID NOT NULL REFERENCES cms_page(id) ON DELETE RESTRICT,
  updated_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(locale,source_path)
);
CREATE FUNCTION cms_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  RAISE EXCEPTION 'CMS history is append-only';
END; $$;
CREATE TRIGGER cms_revision_no_change BEFORE UPDATE OR DELETE ON cms_revision FOR EACH ROW EXECUTE FUNCTION cms_immutable();
CREATE TRIGGER cms_review_no_change BEFORE UPDATE OR DELETE ON cms_review FOR EACH ROW EXECUTE FUNCTION cms_immutable();
CREATE TRIGGER cms_publication_no_change BEFORE UPDATE OR DELETE ON cms_publication FOR EACH ROW EXECUTE FUNCTION cms_immutable();
INSERT INTO identity_permission(id) VALUES
  ('pages.read'),('pages.write'),('pages.review'),('pages.publish'),
  ('media.read'),('media.write'),('navigation.write'),('seo.write'),('settings.site');
INSERT INTO identity_role(id,label,staff,privileged) VALUES
  ('cms_editor','CMS editor',true,false),('cms_reviewer','CMS reviewer',true,false),
  ('cms_publisher','CMS publisher',true,true),('media_manager','Media manager',true,false);
INSERT INTO identity_role_permission(role_id,permission_id)
SELECT 'owner',id FROM identity_permission WHERE id IN
  ('pages.read','pages.write','pages.review','pages.publish','media.read','media.write','navigation.write','seo.write','settings.site');
INSERT INTO identity_role_permission(role_id,permission_id) VALUES
  ('cms_editor','pages.read'),('cms_editor','pages.write'),('cms_editor','media.read'),
  ('cms_reviewer','pages.read'),('cms_reviewer','pages.review'),('cms_reviewer','media.read'),
  ('cms_publisher','pages.read'),('cms_publisher','pages.publish'),
  ('media_manager','media.read'),('media_manager','media.write');
