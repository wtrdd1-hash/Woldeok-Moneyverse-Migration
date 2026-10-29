-- v292: remove the application role's unrestricted access to withdrawn article bodies.
-- Forward-only: v288 may already be applied and must remain byte-identical.
BEGIN;

REVOKE ALL ON public.blog_verified_articles FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.blog_verified_public_list()
RETURNS TABLE(
  slug text, country text, locale text, topic text, title text, excerpt text,
  content text, primary_source_url text, receipt uuid, status text,
  published_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT a.slug, a.country, a.locale, a.topic, a.title, a.excerpt,
         a.content, a.primary_source_url, a.receipt, a.status,
         a.published_at, a.updated_at
  FROM public.blog_verified_articles a
  WHERE a.status = 'PUBLISHED'
  ORDER BY a.published_at DESC, a.slug ASC
  LIMIT 150;
$$;

CREATE FUNCTION public.blog_verified_public_by_slug(p_slug text)
RETURNS TABLE(
  slug text, country text, locale text, topic text, title text, excerpt text,
  content text, primary_source_url text, receipt uuid, status text,
  published_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT a.slug, a.country, a.locale, a.topic, a.title, a.excerpt,
         a.content, a.primary_source_url, a.receipt, a.status,
         a.published_at, a.updated_at
  FROM public.blog_verified_articles a
  WHERE a.slug = p_slug AND a.status = 'PUBLISHED';
$$;

-- Scheduler-only metadata is not the article body; its period and duplicate
-- detection semantics must survive withdrawal without granting table SELECT.
CREATE FUNCTION public.blog_verified_period_receipt(p_period text)
RETURNS TABLE(receipt uuid, content_digest text, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT a.receipt, a.content_digest, a.status
  FROM public.blog_verified_articles a
  WHERE a.period_key = p_period;
$$;

CREATE FUNCTION public.blog_verified_recent_digests()
RETURNS TABLE(content_digest text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT a.content_digest FROM public.blog_verified_articles a
  ORDER BY a.published_at DESC, a.period_key ASC
  LIMIT 1000;
$$;

REVOKE ALL ON FUNCTION public.blog_verified_public_list() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_verified_public_by_slug(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_verified_period_receipt(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_verified_recent_digests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_verified_public_list() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.blog_verified_public_by_slug(text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.blog_verified_period_receipt(text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.blog_verified_recent_digests() TO moneyverse_app;

COMMIT;
