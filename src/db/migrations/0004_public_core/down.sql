DROP TRIGGER public_inquiry_no_change ON public_inquiry;
DROP FUNCTION public_inquiry_immutable();
DROP TABLE public_inquiry;
DROP TABLE catalog_service;
ALTER TABLE cms_page DROP CONSTRAINT cms_page_kind_check;
ALTER TABLE cms_page ADD CONSTRAINT cms_page_kind_check CHECK (kind IN ('page','landing'));
