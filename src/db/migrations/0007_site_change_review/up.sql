-- Phase 5: editorial review for CMS-managed site content (ADR 0014). A proposed change to a visitor-facing site
-- setting or text override is reviewed and then published; only publication writes the live cms_setting/cms_text row.
CREATE TABLE cms_site_change (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('setting','text')),
  locale TEXT CHECK (locale IN ('en','bn')),
  key TEXT NOT NULL CHECK (char_length(key) BETWEEN 1 AND 100),
  value TEXT NOT NULL CHECK (char_length(value) <= 600),
  proposed_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  proposed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decision TEXT CHECK (decision IN ('approved','rejected')),
  review_note TEXT CHECK (review_note IS NULL OR char_length(review_note) <= 500),
  reviewed_by UUID REFERENCES identity_user(id) ON DELETE RESTRICT,
  reviewed_at TIMESTAMPTZ,
  published_by UUID REFERENCES identity_user(id) ON DELETE RESTRICT,
  published_at TIMESTAMPTZ,
  CONSTRAINT cms_site_change_shape CHECK ((kind = 'text' AND locale IS NOT NULL) OR (kind = 'setting' AND locale IS NULL)),
  CONSTRAINT cms_site_change_review_state CHECK (
    (decision IS NULL AND reviewed_by IS NULL AND reviewed_at IS NULL AND review_note IS NULL)
    OR (decision IS NOT NULL AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL AND review_note IS NOT NULL)),
  CONSTRAINT cms_site_change_publish_state CHECK (
    (published_at IS NULL AND published_by IS NULL) OR (published_at IS NOT NULL AND published_by IS NOT NULL AND decision = 'approved'))
);
CREATE INDEX cms_site_change_recent_idx ON cms_site_change(proposed_at DESC);

CREATE FUNCTION cms_site_change_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Site change records cannot be deleted'; END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.kind IS DISTINCT FROM OLD.kind OR NEW.locale IS DISTINCT FROM OLD.locale
    OR NEW.key IS DISTINCT FROM OLD.key OR NEW.value IS DISTINCT FROM OLD.value
    OR NEW.proposed_by IS DISTINCT FROM OLD.proposed_by OR NEW.proposed_at IS DISTINCT FROM OLD.proposed_at THEN
    RAISE EXCEPTION 'A proposed site change cannot be edited';
  END IF;
  IF OLD.published_at IS NOT NULL THEN RAISE EXCEPTION 'A published site change is final'; END IF;
  IF OLD.decision IS NOT NULL AND (NEW.decision IS DISTINCT FROM OLD.decision OR NEW.review_note IS DISTINCT FROM OLD.review_note
    OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at) THEN
    RAISE EXCEPTION 'A review decision is final';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER cms_site_change_no_edit BEFORE UPDATE OR DELETE ON cms_site_change
  FOR EACH ROW EXECUTE FUNCTION cms_site_change_guard();
