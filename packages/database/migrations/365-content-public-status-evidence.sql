-- 365: the public status page read content_status_sources and content_status_snapshots directly;
-- neither is granted to the application role, so /status always answered 503. content_public_status()
-- (013) already folds staleness into 'unknown', which loses the stale/unknown distinction the
-- Spring policy reports. This read returns the raw last observation and the source's stale window
-- for public, active sources only, and no detail text. Public data; no actor needed.

CREATE OR REPLACE FUNCTION public.content_public_status_evidence()
RETURNS TABLE (
  source_key text, display_name text, stale_after_seconds integer, state text, observed_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  RETURN QUERY
    SELECT s.source_key, s.display_name, s.stale_after_seconds, last_seen.state, last_seen.observed_at
    FROM public.content_status_sources AS s
    LEFT JOIN LATERAL (
      SELECT snap.state, snap.observed_at
      FROM public.content_status_snapshots AS snap
      WHERE snap.source_key = s.source_key
      ORDER BY snap.observed_at DESC, snap.id DESC
      LIMIT 1
    ) AS last_seen ON true
    WHERE s.public_visible AND s.active
    ORDER BY s.sort_order, s.source_key
    LIMIT 200;
END;
$function$;

ALTER FUNCTION public.content_public_status_evidence() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_public_status_evidence() FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_public_status_evidence() TO moneyverse_app;
