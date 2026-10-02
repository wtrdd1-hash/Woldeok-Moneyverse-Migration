-- 243-treasury-security-boundary-repair.sql
-- v2026.10.02.508
-- Restores the treasury privilege boundary after migrations 240-242:
-- - no SECURITY DEFINER routine is executable by PUBLIC;
-- - moneyverse_app cannot write treasury settlement/tax evidence tables directly;
-- - citizen budget voting is exposed through one narrow SECURITY DEFINER function.

BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

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

REVOKE INSERT ON public.treasury_disbursements FROM moneyverse_app;
REVOKE INSERT, UPDATE ON public.treasury_citizen_budget_votes FROM moneyverse_app;
REVOKE INSERT ON public.treasury_wealth_tax_assessments FROM moneyverse_app;

CREATE OR REPLACE FUNCTION public.treasury_cast_citizen_budget_vote(
  p_user_id uuid,
  p_quarter text,
  p_priority_choice text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'authenticated user id is required';
  END IF;

  IF p_quarter IS NULL OR p_quarter !~ '^[0-9]{4}-Q[1-4]$' THEN
    RAISE EXCEPTION 'quarter must use YYYY-QN format';
  END IF;

  IF p_priority_choice NOT IN (
    'WELFARE',
    'INFRASTRUCTURE',
    'CITIZEN_DIVIDEND',
    'CURRENCY_STABILIZATION'
  ) THEN
    RAISE EXCEPTION 'invalid treasury budget priority';
  END IF;

  INSERT INTO public.treasury_citizen_budget_votes (
    user_id,
    quarter,
    priority_choice,
    updated_at
  ) VALUES (
    p_user_id,
    p_quarter,
    p_priority_choice,
    pg_catalog.clock_timestamp()
  )
  ON CONFLICT (user_id, quarter)
  DO UPDATE
    SET priority_choice = EXCLUDED.priority_choice,
        updated_at = pg_catalog.clock_timestamp();

  RETURN true;
END;
$$;

ALTER FUNCTION public.treasury_cast_citizen_budget_vote(uuid, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_cast_citizen_budget_vote(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_cast_citizen_budget_vote(uuid, text, text) TO moneyverse_app;

COMMIT;
