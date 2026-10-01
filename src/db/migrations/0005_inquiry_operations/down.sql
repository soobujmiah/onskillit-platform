DELETE FROM identity_assignment WHERE role_id='inquiry_staff';
DELETE FROM identity_role_permission WHERE permission_id IN ('inquiries.read','inquiries.redact') OR role_id='inquiry_staff';
DELETE FROM identity_role WHERE id='inquiry_staff';
DELETE FROM identity_permission WHERE id IN ('inquiries.read','inquiries.redact');

CREATE OR REPLACE FUNCTION public_inquiry_redaction_guard() RETURNS trigger LANGUAGE plpgsql AS $$
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
