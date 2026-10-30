-- P1: Restore the verified blog admin list after migration 298 revoked direct
-- app-role reads. Keep withdrawn article bodies unavailable to public callers.
-- This forward-only migration depends on the unmerged 307..310 stack.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.blog_verified_articles FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.blog_verified_admin_list(p_actor uuid)
RETURNS TABLE (
  slug text, country text, locale text, topic text, title text, excerpt text,
  content text, primary_source_url text, receipt uuid, status text,
  published_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION 'administrator required' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION 'administrator required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT a.slug, a.country, a.locale, a.topic, a.title, a.excerpt,
           a.content, a.primary_source_url, a.receipt, a.status,
           a.published_at, a.updated_at
    FROM public.blog_verified_articles AS a
    WHERE a.status IN ('PUBLISHED', 'WITHDRAWN')
    ORDER BY a.published_at DESC, a.slug ASC
    LIMIT 200;
END;
$function$;

ALTER FUNCTION public.blog_verified_admin_list(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.blog_verified_admin_list(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.blog_verified_admin_list(uuid) TO moneyverse_app;
COMMIT;
