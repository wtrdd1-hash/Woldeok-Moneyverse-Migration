BEGIN;
CREATE OR REPLACE FUNCTION public.account_recent_security_events(p_user_id uuid, p_limit integer DEFAULT 20)
RETURNS TABLE(event_type text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT e.event_type, e.created_at
  FROM public.auth_security_events e
  WHERE e.user_id = p_user_id
  ORDER BY e.created_at DESC, e.id DESC
  LIMIT least(greatest(coalesce(p_limit, 20), 1), 50)
$$;
ALTER FUNCTION public.account_recent_security_events(uuid,integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.account_recent_security_events(uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_recent_security_events(uuid,integer) TO moneyverse_app;
COMMIT;
