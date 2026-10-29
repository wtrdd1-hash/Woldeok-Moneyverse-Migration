-- Additive, backward-compatible read contract for independently approved help editions.
-- Never rewrite applied migration 282 or grant application table access.
BEGIN;
CREATE FUNCTION public.help_public_article_revision(p_locale text, p_slug text)
RETURNS TABLE(
  article_id uuid, locale text, slug text, category text, title text,
  summary text, body_plain text, source_url text, published_at timestamptz,
  published_revision_id uuid, article_version bigint, content_digest text
)
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT a.id, a.locale, a.slug, a.category, r.title, r.summary,
    r.body_plain, r.source_url, r.published_at, r.id, a.version,
    encode(sha256(convert_to(jsonb_build_array(r.title, r.summary, r.body_plain)::text, 'UTF8')), 'hex')
  FROM public.help_articles a
  JOIN public.help_article_revisions r
    ON r.id = a.published_revision_id AND r.article_id = a.id
  WHERE p_locale IN ('ko','en') AND a.locale = p_locale AND a.slug = p_slug
    AND a.state = 'published' AND r.published_at IS NOT NULL
    AND r.approved_by IS NOT NULL AND r.approved_by <> r.author_id
    AND r.reviewed_until > clock_timestamp()
$$;
REVOKE ALL ON FUNCTION public.help_public_article_revision(text,text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.help_public_article_revision(text,text) TO moneyverse_app;
COMMIT;
