-- Migration 355: one-shot claim for "new blog article" notifications.
--
-- 2026-11-26: the post-publish hook has failed on every run since the public notify route was
-- made administrator-only (2026-11-25; anyone could make the bots post arbitrary links). The
-- hook also announced "the latest article" on every 2-hourly run, so a working hook would have
-- repeated the same announcement. This function lets a trusted local caller name a slug and
-- returns the article only the first time and only while it is PUBLISHED; the message is built
-- from these columns, never from caller input. With a NULL slug it claims the newest published
-- article from the last 6 hours that has not been announced, so the hook needs no database
-- access of its own; the window stops it from walking back through the archive one per run.
-- The application role cannot read blog_verified_articles in a clean migration chain, so the
-- read is a function, not a grant (AGENTS.md).

BEGIN;

CREATE TABLE IF NOT EXISTS public.blog_publish_notifications (
  slug text PRIMARY KEY,
  claimed_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);
REVOKE ALL PRIVILEGES ON TABLE public.blog_publish_notifications FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.blog_claim_publish_notification(p_slug text)
RETURNS TABLE(slug text, title text, topic text, excerpt text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_slug text := p_slug;
BEGIN
  IF v_slug IS NOT NULL AND v_slug !~ '^[a-z0-9][a-z0-9-]{0,159}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid slug';
  END IF;
  -- One lock for the "latest" path, one per slug otherwise; the key is locked before the
  -- replay check (045 template).
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:blog_claim_publish_notification:' || coalesce(v_slug, '*latest*'), 0));
  IF v_slug IS NULL THEN
    SELECT a.slug INTO v_slug
    FROM public.blog_verified_articles AS a
    WHERE a.status = 'PUBLISHED'
      AND a.published_at >= pg_catalog.now() - interval '6 hours'
      AND NOT EXISTS (SELECT 1 FROM public.blog_publish_notifications AS n WHERE n.slug = a.slug)
    ORDER BY a.published_at DESC
    LIMIT 1;
    IF v_slug IS NULL THEN RETURN; END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM public.blog_publish_notifications AS n WHERE n.slug = v_slug) THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.blog_verified_articles AS a
                 WHERE a.slug = v_slug AND a.status = 'PUBLISHED') THEN
    RETURN;
  END IF;
  INSERT INTO public.blog_publish_notifications(slug) VALUES (v_slug);
  RETURN QUERY
    SELECT a.slug, a.title, a.topic, a.excerpt
    FROM public.blog_verified_articles AS a
    WHERE a.slug = v_slug;
END;
$$;

ALTER FUNCTION public.blog_claim_publish_notification(text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.blog_claim_publish_notification(text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.blog_claim_publish_notification(text) TO moneyverse_app;

COMMIT;
