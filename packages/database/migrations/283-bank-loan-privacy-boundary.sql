-- P0: restore the member loan table boundary after historical grant drift.
-- This migration is forward-only; previously applied SQL and checksums are immutable.
-- Credit evidence previously queried base tables with moneyverse_app. Preserve
-- that user feature via an actor-scoped SECURITY DEFINER read before revoking.
BEGIN;

CREATE OR REPLACE FUNCTION public.bank_my_credit_facts(p_actor uuid)
RETURNS TABLE (
  account_age_days integer,
  job_level integer,
  repayment_count integer,
  overdue_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT
    GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - u.created_at)) / 86400))::integer,
    COALESCE((SELECT MAX(j.level) FROM public.user_job_progress j
              WHERE j.user_id = u.id AND j.is_active), 0)::integer,
    (SELECT COUNT(*)::integer FROM public.virtual_bank_loan_repayments r
     JOIN public.virtual_bank_loans l ON l.id = r.loan_id
     WHERE l.user_id = u.id),
    (SELECT COUNT(*)::integer FROM public.virtual_bank_loans l
     WHERE l.user_id = u.id AND (l.overdue_at IS NOT NULL OR l.status = 'overdue'))
  FROM public.users u
  WHERE u.id = p_actor AND u.status = 'active'::public.user_status
$function$;

ALTER FUNCTION public.bank_my_credit_facts(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_my_credit_facts(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_my_credit_facts(uuid) TO moneyverse_app;

-- Only the migrator-owned scoped functions may access loan rows. In particular,
-- no application-side SELECT, INSERT, UPDATE, DELETE or TRUNCATE on these tables.
REVOKE ALL PRIVILEGES ON TABLE public.virtual_bank_loans, public.virtual_bank_loan_repayments FROM PUBLIC, moneyverse_app;

COMMIT;
