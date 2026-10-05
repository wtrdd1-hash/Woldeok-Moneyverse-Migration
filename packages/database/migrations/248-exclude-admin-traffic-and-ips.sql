-- Exclude administrator accounts and administrator client IPs from traffic analytics.
BEGIN;

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

  WITH admin_users AS (
    SELECT DISTINCT user_id FROM public.user_roles
  ), admin_ips AS (
    SELECT DISTINCT client_ip FROM public.audit_logs WHERE client_ip IS NOT NULL
  ), page_views AS (
    SELECT l.*, NULLIF(l.metadata->>'referrer', '') AS referrer,
           NULLIF(upper(l.metadata->>'country'), '') AS country
    FROM public.user_activity_logs AS l
    WHERE l.event_type = 'page_view'
      AND l.created_at >= v_start
      -- 관리자 계정 ID 트래픽 전면 제외
      AND (l.user_id IS NULL OR l.user_id NOT IN (SELECT user_id FROM admin_users))
      -- 관리자 접속 IP 트래픽 전면 제외
      AND (l.ip IS NULL OR l.ip NOT IN (SELECT client_ip FROM admin_ips))
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
    'countries', coalesce((SELECT jsonb_agg(jsonb_build_object('country', country, 'entries', entries)) FROM countries), '[]'::jsonb),
    'excludedAdminStats', pg_catalog.jsonb_build_object(
      'adminUsersCount', (SELECT count(*) FROM admin_users),
      'adminIpsCount', (SELECT count(*) FROM admin_ips)
    )
  ) INTO v_result;
  RETURN v_result;
END;
$$;

ALTER FUNCTION public.admin_activity_traffic_dashboard(uuid, text, integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_activity_traffic_dashboard(uuid, text, integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_activity_traffic_dashboard(uuid, text, integer) TO moneyverse_app;

COMMIT;
