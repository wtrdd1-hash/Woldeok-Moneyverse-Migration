BEGIN;

-- 139 consumed DTOs as snake_case even though the validated API contract is
-- camelCase. Every client event consequently fell through to the generic
-- `event` label. Read the contract's real keys explicitly.
CREATE OR REPLACE FUNCTION public.activity_log_events(
  p_events jsonb,
  p_actor uuid,
  p_ip inet,
  p_user_agent text
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_inserted integer;
BEGIN
  IF pg_catalog.jsonb_typeof(p_events) <> 'array' THEN
    RETURN 0;
  END IF;

  INSERT INTO public.user_activity_logs (
    user_id, session_id, event_type, path, target_label, dwell_time_ms,
    ip, user_agent, metadata, created_at
  )
  SELECT
    p_actor,
    pg_catalog.left(COALESCE(event->>'sessionId', ''), 128),
    pg_catalog.left(COALESCE(event->>'eventType', 'event'), 40),
    pg_catalog.left(COALESCE(event->>'path', '/'), 500),
    NULLIF(pg_catalog.left(COALESCE(event->>'targetLabel', ''), 200), ''),
    CASE WHEN event->>'dwellTimeMs' ~ '^[0-9]+$'
      THEN pg_catalog.least((event->>'dwellTimeMs')::integer, 86400000)
      ELSE NULL END,
    p_ip,
    pg_catalog.left(p_user_agent, 500),
    CASE WHEN pg_catalog.jsonb_typeof(event->'metadata') = 'object'
      THEN event->'metadata' ELSE '{}'::jsonb END,
    pg_catalog.now()
  FROM pg_catalog.jsonb_array_elements(p_events) AS item(event);

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted;
END;
$$;

ALTER FUNCTION public.activity_log_events(jsonb, uuid, inet, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_log_events(jsonb, uuid, inet, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_log_events(jsonb, uuid, inet, text)
  TO moneyverse_app;

-- Server-side coverage for every API request. No query values, cookies,
-- authorization headers or request bodies enter this function.
CREATE OR REPLACE FUNCTION public.activity_log_request(
  p_actor uuid,
  p_path text,
  p_method text,
  p_status integer,
  p_duration_ms integer,
  p_request_id uuid,
  p_ip inet,
  p_user_agent text
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  INSERT INTO public.user_activity_logs (
    user_id, session_id, event_type, path, ip, user_agent, metadata
  ) VALUES (
    p_actor,
    '',
    CASE WHEN p_path LIKE '/api/v%/admin/%' THEN 'admin_request' ELSE 'api_request' END,
    pg_catalog.left(COALESCE(p_path, '/'), 500),
    p_ip,
    pg_catalog.left(p_user_agent, 500),
    pg_catalog.jsonb_build_object(
      'method', pg_catalog.left(COALESCE(p_method, ''), 12),
      'status', p_status,
      'durationMs', pg_catalog.greatest(COALESCE(p_duration_ms, 0), 0),
      'requestId', p_request_id
    )
  );
$$;

ALTER FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text)
  TO moneyverse_app;

-- 139 referenced users.name, a column that never existed. Use the same chosen
-- profile-name/fallback identity rule as the member and administrator views.
CREATE OR REPLACE FUNCTION public.activity_list_logs(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_event_type text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
) RETURNS TABLE (
  id bigint, user_id uuid, username text, session_id text, event_type text,
  path text, target_label text, dwell_time_ms integer, ip inet,
  user_agent text, metadata jsonb, created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    log.id,
    log.user_id,
    COALESCE(NULLIF(profile.display_name, ''), identity.display_name, '비로그인'),
    log.session_id,
    log.event_type,
    log.path,
    log.target_label,
    log.dwell_time_ms,
    log.ip,
    log.user_agent,
    log.metadata,
    log.created_at
  FROM public.user_activity_logs AS log
  LEFT JOIN public.member_profiles AS profile ON profile.user_id = log.user_id
  LEFT JOIN LATERAL (
    SELECT candidate.display_name
    FROM public.identities AS candidate
    WHERE candidate.user_id = log.user_id
    ORDER BY candidate.linked_at, candidate.id
    LIMIT 1
  ) AS identity ON true
  WHERE (p_event_type IS NULL OR log.event_type = p_event_type)
    AND (p_user_id IS NULL OR log.user_id = p_user_id)
  ORDER BY log.created_at DESC, log.id DESC
  LIMIT pg_catalog.greatest(1, pg_catalog.least(p_limit, 200))
  OFFSET pg_catalog.greatest(p_offset, 0);
$$;

ALTER FUNCTION public.activity_list_logs(integer, integer, text, uuid)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_list_logs(integer, integer, text, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_list_logs(integer, integer, text, uuid)
  TO moneyverse_app;

-- Summary used by the user directory: when the account last authenticated,
-- made any recorded request, and entered the administrator surface.
CREATE OR REPLACE FUNCTION public.activity_user_access_summaries(p_actor uuid)
RETURNS TABLE (
  user_id uuid,
  last_login_at timestamptz,
  last_seen_at timestamptz,
  last_admin_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles AS role
    WHERE role.user_id = p_actor
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'admin authority required';
  END IF;

  RETURN QUERY
  SELECT
    account.id,
    (SELECT pg_catalog.max(session.created_at)
       FROM public.auth_sessions AS session
      WHERE session.user_id = account.id),
    (SELECT pg_catalog.max(activity.created_at)
       FROM public.user_activity_logs AS activity
      WHERE activity.user_id = account.id),
    (SELECT pg_catalog.max(activity.created_at)
       FROM public.user_activity_logs AS activity
      WHERE activity.user_id = account.id
        AND (activity.event_type = 'admin_request' OR activity.path LIKE '/admin/%'))
  FROM public.users AS account;
END;
$$;

ALTER FUNCTION public.activity_user_access_summaries(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_user_access_summaries(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_user_access_summaries(uuid) TO moneyverse_app;

COMMIT;
