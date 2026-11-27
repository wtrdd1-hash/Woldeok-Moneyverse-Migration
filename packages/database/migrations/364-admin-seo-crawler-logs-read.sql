-- 364: the SEO observation console read seo_crawler_logs directly; the table is not granted to the
-- application role, so the console always answered 503. The rows carry crawler IP addresses and
-- user agents, so the read is administrator-only and checked inside the function (template: 324).

CREATE OR REPLACE FUNCTION public.admin_seo_crawler_logs_read(p_actor uuid, p_limit integer)
RETURNS TABLE (
  id text, bot_name text, path text, status_code integer, duration_ms integer,
  ip_address text, user_agent text, created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 300 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid crawler log limit';
  END IF;
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u JOIN public.user_roles AS r ON r.user_id = u.id
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active administrator role required';
  END IF;
  RETURN QUERY
    SELECT l.id::text, l.bot_name::text, l.path::text, l.status_code, l.duration_ms,
      l.ip_address::text, l.user_agent, l.created_at
    FROM public.seo_crawler_logs AS l
    ORDER BY l.created_at DESC, l.id DESC
    LIMIT p_limit;
END;
$function$;

ALTER FUNCTION public.admin_seo_crawler_logs_read(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_seo_crawler_logs_read(uuid, integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_seo_crawler_logs_read(uuid, integer) TO moneyverse_app;
