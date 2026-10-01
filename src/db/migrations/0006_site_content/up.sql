-- Phase 5 CMS-managed site content (ADR 0013): more site settings and per-language visible-text overrides.
-- Overrides are optional; an absent row means the built-in default text.
ALTER TABLE cms_setting DROP CONSTRAINT cms_setting_key_check;
ALTER TABLE cms_setting ADD CONSTRAINT cms_setting_key_check CHECK (key IN (
  'site_name_en','site_name_bn','contact_email','robots_enabled',
  'contact_phone','contact_whatsapp','contact_address_en','contact_address_bn',
  'facebook_url','youtube_url','footer_text_en','footer_text_bn','site_logo_media_id'));

CREATE TABLE cms_text (
  locale TEXT NOT NULL CHECK (locale IN ('en','bn')),
  key TEXT NOT NULL CHECK (key ~ '^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)*$' AND char_length(key) <= 100),
  value TEXT NOT NULL CHECK (char_length(value) BETWEEN 1 AND 600),
  updated_by UUID NOT NULL REFERENCES identity_user(id) ON DELETE RESTRICT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, key)
);
