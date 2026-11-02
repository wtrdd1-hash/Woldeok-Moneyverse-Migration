-- v2026.11.02.1621: restore admin SOE dividend-history read without widening app ACL.
-- Migration 320 revoked raw application SELECT on this legacy finance table.
-- Historical rows remain informational only, never certified as settled WLD.
BEGIN;

CREATE OR REPLACE FUNCTION public.admin_soe_dividend_history_read(
  p_actor uuid, p_limit integer
)
RETURNS TABLE (
  id uuid,
  enterprise_id uuid,
  enterprise_code text,
  enterprise_name text,
  dividend_amount_wld text,
  revenue_wld text,
  net_profit_wld text,
  eval_grade text,
  created_at text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid administrator or SOE history limit';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS u
    JOIN public.user_roles AS r ON r.user_id = u.id
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active administrator role required';
  END IF;

  RETURN QUERY
    SELECT l.id, l.enterprise_id, e.code::text, e.name::text,
      l.dividend_amount_wld::text, l.revenue_wld::text, l.net_profit_wld::text,
      l.eval_grade::text, l.created_at::text
    FROM public.state_enterprise_dividend_logs AS l
    JOIN public.state_enterprises AS e ON e.id = l.enterprise_id
    ORDER BY l.created_at DESC, l.id DESC
    LIMIT p_limit;
END;
$function$;

ALTER FUNCTION public.admin_soe_dividend_history_read(uuid, integer)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_soe_dividend_history_read(uuid, integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_soe_dividend_history_read(uuid, integer)
  TO moneyverse_app;
REVOKE ALL ON TABLE public.state_enterprise_dividend_logs FROM moneyverse_app;
COMMIT;
