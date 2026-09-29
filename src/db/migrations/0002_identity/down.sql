-- Synthetic preview/CI rollback only. Production rollback requires data review.
DROP TABLE identity_rate_limit;
DROP TABLE identity_audit;
DROP FUNCTION identity_audit_immutable();
DROP TABLE identity_grant_request;
DROP TABLE identity_assignment;
DROP TABLE identity_role_permission;
DROP TABLE identity_permission;
DROP TABLE identity_role;
DROP TABLE identity_token;
DROP TABLE identity_session;
DROP TABLE identity_password;
DROP TABLE identity_contact;
DROP TABLE identity_user;
