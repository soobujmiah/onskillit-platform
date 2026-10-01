DROP TABLE cms_text;
DELETE FROM cms_setting WHERE key NOT IN ('site_name_en','site_name_bn','contact_email','robots_enabled');
ALTER TABLE cms_setting DROP CONSTRAINT cms_setting_key_check;
ALTER TABLE cms_setting ADD CONSTRAINT cms_setting_key_check CHECK (key IN ('site_name_en','site_name_bn','contact_email','robots_enabled'));
