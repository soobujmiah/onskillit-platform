DELETE FROM identity_role_permission WHERE permission_id IN
  ('pages.read','pages.write','pages.review','pages.publish','media.read','media.write','navigation.write','seo.write','settings.site');
DELETE FROM identity_role WHERE id IN ('cms_editor','cms_reviewer','cms_publisher','media_manager');
DELETE FROM identity_permission WHERE id IN
  ('pages.read','pages.write','pages.review','pages.publish','media.read','media.write','navigation.write','seo.write','settings.site');
DROP TABLE cms_redirect;
DROP TABLE cms_setting;
DROP TABLE cms_navigation;
DROP TABLE cms_media;
DROP TABLE cms_publication;
DROP TABLE cms_review;
ALTER TABLE cms_page DROP CONSTRAINT cms_page_published_revision_fk;
DROP TABLE cms_revision;
DROP TABLE cms_page;
DROP FUNCTION cms_immutable();
