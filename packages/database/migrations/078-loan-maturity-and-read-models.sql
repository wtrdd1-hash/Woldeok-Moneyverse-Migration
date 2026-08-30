BEGIN;

CREATE OR REPLACE FUNCTION public.bank_mark_overdue_loans()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.virtual_bank_loans SET status = 'overdue', overdue_at = clock_timestamp(),
    status_reason = 'maturity passed without full repayment'
  WHERE status = 'active' AND maturity_at IS NOT NULL AND maturity_at < clock_timestamp()
    AND outstanding_amount > 0;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.progression_my_status(p_actor uuid)
RETURNS TABLE(stage_code text, reached_at timestamptz, next_stage_code text, next_requirements jsonb)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT u.stage_code, u.reached_at, n.code, n.unlock_requirements
  FROM public.user_progression u JOIN public.progression_stages s ON s.code = u.stage_code
  LEFT JOIN public.progression_stages n ON n.ordinal = s.ordinal + 1
  WHERE u.user_id = p_actor
$$;

ALTER FUNCTION public.bank_mark_overdue_loans() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.progression_my_status(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_mark_overdue_loans(), public.progression_my_status(uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_mark_overdue_loans(), public.progression_my_status(uuid)
  TO moneyverse_app;

COMMIT;
