-- Phase 5 service catalog and privacy-redactable public inquiry intake.
ALTER TABLE cms_page DROP CONSTRAINT cms_page_kind_check;
ALTER TABLE cms_page ADD CONSTRAINT cms_page_kind_check CHECK (kind IN ('page','landing','service'));

CREATE TABLE catalog_service (
  page_id UUID PRIMARY KEY REFERENCES cms_page(id) ON DELETE RESTRICT,
  category TEXT NOT NULL CHECK (category ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public_inquiry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT CHECK (name IS NULL OR char_length(name) BETWEEN 2 AND 120),
  email TEXT CHECK (email IS NULL OR char_length(email) BETWEEN 3 AND 254),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 25),
  message TEXT CHECK (message IS NULL OR char_length(message) BETWEEN 10 AND 4000),
  locale TEXT NOT NULL CHECK (locale IN ('en','bn')),
  service_page_id UUID REFERENCES catalog_service(page_id) ON DELETE SET NULL,
  consent_version TEXT NOT NULL,
  source_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redacted_at TIMESTAMPTZ,
  redacted_by TEXT,
  redaction_request_reference TEXT,
  redaction_review_reference TEXT,
  CONSTRAINT public_inquiry_redaction_state CHECK (
    (redacted_at IS NULL AND name IS NOT NULL AND email IS NOT NULL AND message IS NOT NULL
      AND redacted_by IS NULL AND redaction_request_reference IS NULL AND redaction_review_reference IS NULL)
    OR
    (redacted_at IS NOT NULL AND name IS NULL AND email IS NULL AND phone IS NULL AND message IS NULL
      AND nullif(btrim(redacted_by), '') IS NOT NULL
      AND nullif(btrim(redaction_request_reference), '') IS NOT NULL
      AND nullif(btrim(redaction_review_reference), '') IS NOT NULL)
  )
);
CREATE INDEX public_inquiry_created_idx ON public_inquiry(created_at DESC);
CREATE FUNCTION public_inquiry_redaction_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Inquiry receipt cannot be deleted'; END IF;
  IF OLD.redacted_at IS NOT NULL OR NEW.redacted_at IS NULL OR NEW.name IS NOT NULL
    OR NEW.email IS NOT NULL OR NEW.phone IS NOT NULL OR NEW.message IS NOT NULL
    OR NEW.id IS DISTINCT FROM OLD.id OR NEW.locale IS DISTINCT FROM OLD.locale
    OR NEW.service_page_id IS DISTINCT FROM OLD.service_page_id
    OR NEW.consent_version IS DISTINCT FROM OLD.consent_version
    OR NEW.source_path IS DISTINCT FROM OLD.source_path
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Inquiry update must redact personal fields once';
  END IF;
  INSERT INTO identity_audit(operator_identity,action,outcome,reason,request_id,metadata)
    VALUES (NEW.redacted_by,'operator.redact_public_inquiry','success','Reviewed privacy request',
      gen_random_uuid()::text,
      jsonb_build_object('inquiry_id',NEW.id,'request_reference',NEW.redaction_request_reference,
        'review_reference',NEW.redaction_review_reference));
  RETURN NEW;
END;
$$;
CREATE TRIGGER public_inquiry_no_change BEFORE UPDATE OR DELETE ON public_inquiry
  FOR EACH ROW EXECUTE FUNCTION public_inquiry_redaction_guard();
