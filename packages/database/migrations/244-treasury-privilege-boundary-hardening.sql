-- 244-treasury-privilege-boundary-hardening.sql
-- Update version: v2026.10.02.506
-- P0: close PUBLIC SECURITY DEFINER execution and direct treasury write grants.

BEGIN;

CREATE OR REPLACE FUNCTION public.treasury_cast_citizen_budget_vote(
  p_actor uuid,
  p_quarter text,
  p_priority_choice text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.users AS actor
    WHERE actor.id = p_actor
      AND actor.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  IF p_quarter IS NULL OR p_quarter !~ '^[0-9]{4}-Q[1-4]$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'quarter must be YYYY-Q1..Q4';
  END IF;

  IF p_priority_choice IS NULL OR p_priority_choice NOT IN (
    'WELFARE',
    'INFRASTRUCTURE',
    'CITIZEN_DIVIDEND',
    'CURRENCY_STABILIZATION'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid budget priority';
  END IF;

  INSERT INTO public.treasury_citizen_budget_votes AS vote (
    user_id,
    quarter,
    priority_choice,
    updated_at
  )
  VALUES (
    p_actor,
    p_quarter,
    p_priority_choice,
    pg_catalog.clock_timestamp()
  )
  ON CONFLICT (user_id, quarter)
  DO UPDATE
  SET priority_choice = excluded.priority_choice,
      updated_at = pg_catalog.clock_timestamp();

  RETURN true;
END;
$$;

ALTER FUNCTION public.treasury_cast_citizen_budget_vote(uuid, text, text)
  OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.treasury_cast_citizen_budget_vote(uuid, text, text)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_cast_citizen_budget_vote(uuid, text, text)
TO moneyverse_app;

-- Writes belong behind SECURITY DEFINER contracts. Keep read privileges intact.
REVOKE INSERT ON public.treasury_disbursements FROM moneyverse_app;
REVOKE INSERT, UPDATE ON public.treasury_citizen_budget_votes FROM moneyverse_app;
REVOKE INSERT ON public.treasury_wealth_tax_assessments FROM moneyverse_app;

-- Migrations 240-242 created these after the global hardening migration and
-- did not revoke PostgreSQL's default PUBLIC EXECUTE privilege.
REVOKE ALL ON FUNCTION public.treasury_disburse_citizen_dividend(uuid, text, text),
                       public.treasury_disburse_grant(uuid, uuid, text, text, text),
                       public.treasury_distribute_budget_rule(uuid, text, text),
                       public.treasury_execute_market_buyback_burn(uuid, uuid, text),
                       public.get_citizen_tax_transparency_receipt(uuid),
                       public.treasury_execute_progressive_wealth_tax(uuid, text)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.treasury_disburse_citizen_dividend(uuid, text, text),
                          public.treasury_disburse_grant(uuid, uuid, text, text, text),
                          public.treasury_distribute_budget_rule(uuid, text, text),
                          public.treasury_execute_market_buyback_burn(uuid, uuid, text),
                          public.get_citizen_tax_transparency_receipt(uuid),
                          public.treasury_execute_progressive_wealth_tax(uuid, text)
TO moneyverse_app;

COMMIT;
