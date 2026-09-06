-- Add useful connection context to the private Discord operations feed.
-- Exact IP addresses and raw user agents remain in the database audit log;
-- Discord receives only a masked network and enough UA to derive a device label.
BEGIN;

CREATE OR REPLACE FUNCTION public.activity_log_request(
  p_actor uuid, p_path text, p_method text, p_status integer,
  p_duration_ms integer, p_request_id uuid, p_ip inet, p_user_agent text, p_country text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_type text := CASE WHEN p_path LIKE '/api/v%/admin/%' THEN 'admin_request' ELSE 'api_request' END;
  v_created_at timestamptz := pg_catalog.clock_timestamp();
  v_nickname text;
  v_network text := CASE
    WHEN p_ip IS NULL THEN NULL
    WHEN pg_catalog.family(p_ip) = 4 THEN pg_catalog.set_masklen(p_ip, 24)::text
    ELSE pg_catalog.set_masklen(p_ip, 48)::text
  END;
BEGIN
  SELECT COALESCE(NULLIF(profile.display_name, ''), identity.display_name, '회원')
  INTO v_nickname
  FROM public.users AS account
  LEFT JOIN public.member_profiles AS profile ON profile.user_id = account.id
  LEFT JOIN LATERAL (
    SELECT candidate.display_name FROM public.identities AS candidate
    WHERE candidate.user_id = account.id
    ORDER BY candidate.linked_at, candidate.id LIMIT 1
  ) AS identity ON true
  WHERE account.id = p_actor;

  INSERT INTO public.user_activity_logs (
    user_id, session_id, event_type, path, ip, user_agent, metadata, created_at
  ) VALUES (
    p_actor, '', v_type, pg_catalog.left(COALESCE(p_path, '/'), 500), p_ip,
    pg_catalog.left(p_user_agent, 500),
    pg_catalog.jsonb_build_object(
      'method', pg_catalog.left(COALESCE(p_method, ''), 12), 'status', p_status,
      'durationMs', greatest(COALESCE(p_duration_ms, 0), 0), 'requestId', p_request_id,
      'country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END
    ), v_created_at
  );

  INSERT INTO public.outbox_events (aggregate_id, type, payload)
  VALUES (
    COALESCE(p_request_id, pg_catalog.gen_random_uuid()),
    CASE WHEN v_type = 'admin_request' THEN 'activity.admin_request' ELSE 'activity.api_request' END,
    pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
      'nickname', pg_catalog.left(COALESCE(v_nickname, '비로그인'), 80),
      'userId', p_actor, 'method', pg_catalog.left(COALESCE(p_method, ''), 12),
      'path', pg_catalog.left(COALESCE(p_path, '/'), 500), 'status', p_status,
      'durationMs', greatest(COALESCE(p_duration_ms, 0), 0), 'requestId', p_request_id,
      'country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END,
      'network', v_network, 'userAgent', pg_catalog.left(p_user_agent, 500),
      'occurredAt', v_created_at
    ))
  );
END;
$$;

ALTER FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text, text)
  TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.activity_log_events(
  p_events jsonb, p_actor uuid, p_ip inet, p_user_agent text, p_country text
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_inserted integer;
  v_network text := CASE
    WHEN p_ip IS NULL THEN NULL
    WHEN pg_catalog.family(p_ip) = 4 THEN pg_catalog.set_masklen(p_ip, 24)::text
    ELSE pg_catalog.set_masklen(p_ip, 48)::text
  END;
BEGIN
  IF pg_catalog.jsonb_typeof(p_events) <> 'array' THEN RETURN 0; END IF;
  WITH recorded AS (
    INSERT INTO public.user_activity_logs (
      user_id, session_id, event_type, path, target_label, dwell_time_ms,
      ip, user_agent, metadata, created_at
    )
    SELECT p_actor, pg_catalog.left(COALESCE(event->>'sessionId', ''), 128),
      pg_catalog.left(COALESCE(event->>'eventType', 'event'), 40),
      pg_catalog.left(COALESCE(event->>'path', '/'), 500),
      NULLIF(pg_catalog.left(COALESCE(event->>'targetLabel', ''), 200), ''),
      CASE WHEN event->>'dwellTimeMs' ~ '^[0-9]+$' THEN least((event->>'dwellTimeMs')::integer, 86400000) END,
      p_ip, pg_catalog.left(p_user_agent, 500),
      (CASE WHEN pg_catalog.jsonb_typeof(event->'metadata') = 'object' THEN event->'metadata' ELSE '{}'::jsonb END)
        || pg_catalog.jsonb_build_object('country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END),
      pg_catalog.clock_timestamp()
    FROM pg_catalog.jsonb_array_elements(p_events) AS item(event)
    RETURNING id, user_id, event_type, path, target_label, dwell_time_ms, created_at
  ), queued AS (
    INSERT INTO public.outbox_events (aggregate_id, type, payload)
    SELECT pg_catalog.gen_random_uuid(), 'activity.client_event',
      pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
        'nickname', COALESCE(NULLIF(profile.display_name, ''), identity.display_name,
          CASE WHEN recorded.user_id IS NULL THEN '비로그인' ELSE '회원' END),
        'userId', recorded.user_id, 'activity', recorded.event_type, 'path', recorded.path,
        'targetLabel', recorded.target_label, 'durationMs', recorded.dwell_time_ms,
        'country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END,
        'network', v_network, 'userAgent', pg_catalog.left(p_user_agent, 500),
        'occurredAt', recorded.created_at
      ))
    FROM recorded
    LEFT JOIN public.member_profiles AS profile ON profile.user_id = recorded.user_id
    LEFT JOIN LATERAL (
      SELECT candidate.display_name FROM public.identities AS candidate
      WHERE candidate.user_id = recorded.user_id ORDER BY candidate.linked_at, candidate.id LIMIT 1
    ) AS identity ON true RETURNING id
  ) SELECT pg_catalog.count(*)::integer INTO v_inserted FROM queued;
  RETURN v_inserted;
END;
$$;

ALTER FUNCTION public.activity_log_events(jsonb, uuid, inet, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_log_events(jsonb, uuid, inet, text, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_log_events(jsonb, uuid, inet, text, text) TO moneyverse_app;

COMMIT;
