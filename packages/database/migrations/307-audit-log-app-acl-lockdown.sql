-- Forward-only P0 repair for a drifted application audit-table ACL.
-- DEV PostgreSQL 17.11 has explicit direct moneyverse_app DML/SELECT/TRUNCATE
-- grants despite the earlier 007-admin-hardening.sql revocation.
-- Preserve existing SECURITY DEFINER audit entry points; they run as their
-- function owner, not as the untrusted application role.
-- Do not edit applied migrations or modify any audit/ledger rows.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.audit_logs FROM PUBLIC, moneyverse_app;

COMMIT;
