-- Public category availability is derived only from approved, current publications.
-- Do not expose draft, retracted or expired help via category metadata.
CREATE FUNCTION public.help_public_category_counts(p_locale text)
RETURNS TABLE(category text, article_count bigint)
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT c.category, count(r.id)::bigint AS article_count
  FROM (VALUES ('account'::text), ('wallet'::text), ('shop'::text),
               ('community'::text), ('support'::text)) AS c(category)
  LEFT JOIN public.help_articles a
    ON a.category = c.category AND a.locale = p_locale AND a.state = 'published'
  LEFT JOIN public.help_article_revisions r
    ON r.id = a.published_revision_id AND r.article_id = a.id
    AND r.published_at IS NOT NULL AND r.approved_by IS NOT NULL
    AND r.approved_by <> r.author_id AND r.reviewed_until > clock_timestamp()
  WHERE p_locale IN ('ko', 'en')
  GROUP BY c.category
  ORDER BY c.category
$$;
ALTER FUNCTION public.help_public_category_counts(text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.help_public_category_counts(text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.help_public_category_counts(text) TO moneyverse_app;
