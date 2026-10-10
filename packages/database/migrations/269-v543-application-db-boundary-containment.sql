-- 269-v543-application-db-boundary-containment.sql
-- v2026.10.10.543
-- Forward-only containment for direct DML / PUBLIC SECURITY DEFINER drift introduced
-- by post-243 feature migrations. This does not replace the v544 domain-function work.

BEGIN;

-- Future migrator-owned functions stay private by default.
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Every SECURITY DEFINER function must require an explicit role grant.
DO $$
DECLARE
  function_row record;
BEGIN
  FOR function_row IN
    SELECT pg_catalog.format(
      '%I.%I(%s)',
      namespace_row.nspname,
      procedure_row.proname,
      pg_catalog.pg_get_function_identity_arguments(procedure_row.oid)
    ) AS identity
    FROM pg_catalog.pg_proc AS procedure_row
    JOIN pg_catalog.pg_namespace AS namespace_row
      ON namespace_row.oid = procedure_row.pronamespace
    WHERE namespace_row.nspname = 'public'
      AND procedure_row.prosecdef
  LOOP
    EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || function_row.identity || ' FROM PUBLIC';
  END LOOP;
END;
$$;

-- Fail closed on direct application-table mutation. Domain writes belong behind
-- audited SECURITY DEFINER / Economy Core functions. Keep only the historically
-- approved session and explicitly authorized collaborative-domain table writes.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM moneyverse_app;

GRANT INSERT, UPDATE ON TABLE public.auth_sessions TO moneyverse_app;
GRANT INSERT, UPDATE ON TABLE public.oauth_challenges TO moneyverse_app;

GRANT INSERT, UPDATE, DELETE ON TABLE public.account_age_policy_state TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.clubs TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.club_members TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.club_projects TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.club_project_contributions TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.club_feed_posts TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.user_spaces TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.city_projects TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.city_project_contributions TO moneyverse_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public.emergency_content_takedowns TO moneyverse_app;
GRANT INSERT, UPDATE ON TABLE public.space_property_tax_payments TO moneyverse_app;
GRANT INSERT, UPDATE ON TABLE public.season_hall_of_fame TO moneyverse_app;
GRANT INSERT, UPDATE ON TABLE public.season_reward_claims TO moneyverse_app;

COMMIT;
