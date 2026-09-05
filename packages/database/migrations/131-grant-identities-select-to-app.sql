-- packages/database/migrations/131-grant-identities-select-to-app.sql
-- Grant SELECT on identities table to moneyverse_app for AdminGuard whitelist verification.

BEGIN;

GRANT SELECT ON TABLE public.identities TO moneyverse_app;

COMMIT;
