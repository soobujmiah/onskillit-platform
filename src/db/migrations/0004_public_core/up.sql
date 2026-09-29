-- Phase 5 service catalog and append-only public inquiry intake.
ALTER TABLE cms_page DROP CONSTRAINT cms_page_kind_check;
ALTER TABLE cms_page ADD CONSTRAINT cms_page_kind_check CHECK (kind IN ('page','landing','service'));

CREATE TABLE catalog_service (
  page_id UUID PRIMARY KEY REFERENCES cms_page(id) ON DELETE RESTRICT,
  category TEXT NOT NULL CHECK (category ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public_inquiry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 25),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 4000),
  locale TEXT NOT NULL CHECK (locale IN ('en','bn')),
  service_page_id UUID REFERENCES catalog_service(page_id) ON DELETE SET NULL,
  consent_version TEXT NOT NULL,
  source_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX public_inquiry_created_idx ON public_inquiry(created_at DESC);
CREATE FUNCTION public_inquiry_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  RAISE EXCEPTION 'Inquiry intake is append-only';
END; $$;
CREATE TRIGGER public_inquiry_no_change BEFORE UPDATE OR DELETE ON public_inquiry
  FOR EACH ROW EXECUTE FUNCTION public_inquiry_immutable();
