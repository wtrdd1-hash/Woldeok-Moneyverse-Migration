-- P0 #1179: votes are private member data, not a general application read model.
-- Forward-only; migrations 241 and 243 are already immutable.
-- Integration HOLD: other open PRs also claim number 280; renumber/revalidate
-- against the next authoritative main before any merge or application.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.treasury_citizen_budget_votes
  FROM moneyverse_app, PUBLIC;

-- Preserve the admin aggregate without granting raw vote choices to the app.
-- Actor authorization matches the existing AdminGuard's active-role contract.
CREATE OR REPLACE FUNCTION public.treasury_budget_vote_totals(
  p_actor uuid,
  p_quarter text
)
RETURNS TABLE(priority_choice text, vote_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admin_current_roles(p_actor)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  IF p_quarter IS NULL OR p_quarter !~ '^[0-9]{4}-Q[1-4]$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid budget vote quarter';
  END IF;

  RETURN QUERY
    SELECT vote.priority_choice, count(*)::bigint
    FROM public.treasury_citizen_budget_votes AS vote
    WHERE vote.quarter = p_quarter
    GROUP BY vote.priority_choice;
END;
$function$;

ALTER FUNCTION public.treasury_budget_vote_totals(uuid, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_budget_vote_totals(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_budget_vote_totals(uuid, text) TO moneyverse_app;

COMMIT;
