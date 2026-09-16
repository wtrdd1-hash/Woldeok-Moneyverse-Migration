-- Privacy-safe admin traffic analytics and Economy AI operational status.
BEGIN;

CREATE INDEX IF NOT EXISTS idx_user_activity_page_view_created
  ON public.user_activity_logs (created_at DESC, session_id)
  WHERE event_type = 'page_view';



-- Keep the raw telemetry table behind SECURITY DEFINER read models. This is
-- repeated here intentionally: older environments may have accumulated broad
-- table grants even though migration 139 revoked them.
REVOKE ALL PRIVILEGES ON TABLE public.user_activity_logs FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_activity_list_logs(
  p_actor uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_event_type text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
) RETURNS TABLE (
  id bigint,
  user_id uuid,
  username text,
  session_id text,
  event_type text,
  path text,
  target_label text,
  dwell_time_ms integer,
  ip inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'activity logs require an administrator';
  END IF;

  RETURN QUERY
  SELECT * FROM public.activity_list_logs(
    least(greatest(coalesce(p_limit, 50), 1), 200),
    greatest(coalesce(p_offset, 0), 0),
    p_event_type,
    p_user_id
  );
END;
$$;

ALTER FUNCTION public.admin_activity_list_logs(uuid, integer, integer, text, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_list_logs(integer, integer, text, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.admin_activity_list_logs(uuid, integer, integer, text, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_activity_list_logs(uuid, integer, integer, text, uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_activity_traffic_dashboard(
  p_actor uuid,
  p_granularity text DEFAULT 'day',
  p_periods integer DEFAULT 30
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_periods integer;
  v_start timestamptz;
  v_bucket text;
  v_result jsonb;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'traffic analytics requires an administrator';
  END IF;
  IF p_granularity NOT IN ('day', 'month', 'year') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'granularity must be day, month, or year';
  END IF;
  v_periods := least(greatest(coalesce(p_periods, 30), 1), CASE p_granularity WHEN 'day' THEN 366 WHEN 'month' THEN 120 ELSE 20 END);
  v_bucket := p_granularity;
  v_start := CASE p_granularity
    WHEN 'day' THEN date_trunc('day', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul' - pg_catalog.make_interval(days => v_periods - 1)
    WHEN 'month' THEN date_trunc('month', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul' - pg_catalog.make_interval(months => v_periods - 1)
    ELSE date_trunc('year', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul' - pg_catalog.make_interval(years => v_periods - 1)
  END;

  WITH page_views AS (
    SELECT l.*, NULLIF(l.metadata->>'referrer', '') AS referrer,
           NULLIF(upper(l.metadata->>'country'), '') AS country
    FROM public.user_activity_logs AS l
    WHERE l.event_type = 'page_view' AND l.created_at >= v_start
  ), first_views AS (
    SELECT DISTINCT ON (coalesce(NULLIF(session_id, ''), 'event:' || id::text))
      coalesce(NULLIF(session_id, ''), 'event:' || id::text) AS session_key,
      path, referrer, country, user_id, created_at
    FROM page_views
    ORDER BY coalesce(NULLIF(session_id, ''), 'event:' || id::text), created_at, id
  ), series AS (
    SELECT date_trunc(v_bucket, created_at AT TIME ZONE 'Asia/Seoul')::date AS bucket,
           count(*)::bigint AS page_views,
           count(DISTINCT coalesce(NULLIF(session_id, ''), 'event:' || id::text))::bigint AS unique_sessions,
           count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL)::bigint AS authenticated_users
    FROM page_views GROUP BY 1 ORDER BY 1
  ), landing AS (
    SELECT path, count(*)::bigint AS entries,
           count(*) FILTER (WHERE user_id IS NULL)::bigint AS anonymous_entries
    FROM first_views GROUP BY path ORDER BY entries DESC, path LIMIT 20
  ), sources AS (
    SELECT CASE
      WHEN referrer IS NULL THEN '(direct)'
      WHEN lower(referrer) ~ '^https?://([^/?#]+)' THEN
        CASE WHEN lower(substring(referrer FROM '^https?://([^/?#]+)')) ~ '(^|\.)easy-scraping\.com$'
          THEN '(internal)' ELSE lower(substring(referrer FROM '^https?://([^/?#]+)')) END
      ELSE '(other)'
    END AS source, count(*)::bigint AS entries
    FROM first_views GROUP BY 1 ORDER BY entries DESC, source LIMIT 20
  ), countries AS (
    SELECT coalesce(country, 'UNKNOWN') AS country, count(*)::bigint AS entries
    FROM first_views GROUP BY 1 ORDER BY entries DESC, country LIMIT 20
  )
  SELECT pg_catalog.jsonb_build_object(
    'granularity', p_granularity,
    'periods', v_periods,
    'rangeStart', v_start,
    'generatedAt', pg_catalog.clock_timestamp(),
    'summary', pg_catalog.jsonb_build_object(
      'pageViews', (SELECT count(*) FROM page_views),
      'uniqueSessions', (SELECT count(DISTINCT coalesce(NULLIF(session_id, ''), 'event:' || id::text)) FROM page_views),
      'authenticatedUsers', (SELECT count(DISTINCT user_id) FROM page_views WHERE user_id IS NOT NULL),
      'anonymousSessions', (SELECT count(*) FROM first_views WHERE user_id IS NULL)
    ),
    'series', coalesce((SELECT jsonb_agg(jsonb_build_object('bucket', bucket, 'pageViews', page_views, 'uniqueSessions', unique_sessions, 'authenticatedUsers', authenticated_users) ORDER BY bucket) FROM series), '[]'::jsonb),
    'landingPages', coalesce((SELECT jsonb_agg(jsonb_build_object('path', path, 'entries', entries, 'anonymousEntries', anonymous_entries)) FROM landing), '[]'::jsonb),
    'sources', coalesce((SELECT jsonb_agg(jsonb_build_object('source', source, 'entries', entries)) FROM sources), '[]'::jsonb),
    'countries', coalesce((SELECT jsonb_agg(jsonb_build_object('country', country, 'entries', entries)) FROM countries), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_economy_ai_status(p_actor uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $$
DECLARE v_result jsonb;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'AI status requires an administrator';
  END IF;
  SELECT jsonb_build_object(
    'switchState', public.feature_switch_state('economy_ai_policy_review'),
    'reviewCount', (SELECT count(*) FROM public.economy_ai_policy_reviews),
    'latestReview', (SELECT to_jsonb(r) - 'proposal' FROM public.economy_ai_policy_reviews r ORDER BY reviewed_at DESC LIMIT 1),
    'agents', coalesce((SELECT jsonb_agg(to_jsonb(s) ORDER BY domain, seat, model) FROM public.economy_ai_agent_scoreboard s), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

ALTER FUNCTION public.admin_activity_traffic_dashboard(uuid, text, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_economy_ai_status(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_activity_traffic_dashboard(uuid, text, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.admin_economy_ai_status(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_activity_traffic_dashboard(uuid, text, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_economy_ai_status(uuid) TO moneyverse_app;
COMMIT;
