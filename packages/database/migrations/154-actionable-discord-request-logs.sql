-- Give Discord operators the useful, already-sanitised shape of web activity.
-- Deliberately excluded: query strings, request bodies, cookies, authorization
-- headers, raw IP addresses and user agents.
BEGIN;

DROP FUNCTION public.activity_log_events(jsonb, uuid, inet, text);
CREATE FUNCTION public.activity_log_events(
  p_events jsonb, p_actor uuid, p_ip inet, p_user_agent text, p_country text
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $$
DECLARE v_inserted integer;
BEGIN
  IF pg_catalog.jsonb_typeof(p_events) <> 'array' THEN RETURN 0; END IF;
  WITH recorded AS (
    INSERT INTO public.user_activity_logs (
      user_id, session_id, event_type, path, target_label, dwell_time_ms,
      ip, user_agent, metadata, created_at
    )
    SELECT p_actor,
      pg_catalog.left(COALESCE(event->>'sessionId', ''), 128),
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
        'nickname', COALESCE(NULLIF(profile.display_name, ''), identity.display_name, CASE WHEN recorded.user_id IS NULL THEN '비로그인' ELSE '회원' END),
        'userId', recorded.user_id, 'activity', recorded.event_type, 'path', recorded.path,
        'targetLabel', recorded.target_label, 'durationMs', recorded.dwell_time_ms,
        'country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END,
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

DROP FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text);
CREATE FUNCTION public.activity_log_request(
  p_actor uuid, p_path text, p_method text, p_status integer,
  p_duration_ms integer, p_request_id uuid, p_ip inet, p_user_agent text, p_country text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_type text := CASE WHEN p_path LIKE '/api/v%/admin/%' THEN 'admin_request' ELSE 'api_request' END;
  v_created_at timestamptz := pg_catalog.clock_timestamp();
  v_nickname text;
BEGIN
  SELECT COALESCE(NULLIF(profile.display_name, ''), identity.display_name, '회원')
  INTO v_nickname
  FROM public.users AS account
  LEFT JOIN public.member_profiles AS profile ON profile.user_id = account.id
  LEFT JOIN LATERAL (
    SELECT candidate.display_name
    FROM public.identities AS candidate
    WHERE candidate.user_id = account.id
    ORDER BY candidate.linked_at, candidate.id
    LIMIT 1
  ) AS identity ON true
  WHERE account.id = p_actor;

  INSERT INTO public.user_activity_logs (
    user_id, session_id, event_type, path, ip, user_agent, metadata, created_at
  ) VALUES (
    p_actor, '', v_type, pg_catalog.left(COALESCE(p_path, '/'), 500), p_ip,
    pg_catalog.left(p_user_agent, 500),
    pg_catalog.jsonb_build_object(
      'method', pg_catalog.left(COALESCE(p_method, ''), 12),
      'status', p_status,
      'durationMs', greatest(COALESCE(p_duration_ms, 0), 0),
      'requestId', p_request_id,
      'country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END
    ),
    v_created_at
  );

  INSERT INTO public.outbox_events (aggregate_id, type, payload)
  VALUES (
    COALESCE(p_request_id, pg_catalog.gen_random_uuid()),
    CASE WHEN v_type = 'admin_request' THEN 'activity.admin_request' ELSE 'activity.api_request' END,
    pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
      'nickname', pg_catalog.left(COALESCE(v_nickname, '비로그인'), 80),
      'userId', p_actor,
      'method', pg_catalog.left(COALESCE(p_method, ''), 12),
      'path', pg_catalog.left(COALESCE(p_path, '/'), 500),
      'status', p_status,
      'durationMs', greatest(COALESCE(p_duration_ms, 0), 0),
      'requestId', p_request_id,
      'country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END,
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

DROP FUNCTION public.outbox_claim_pending(integer);
CREATE FUNCTION public.outbox_claim_pending(p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, event_type text, channel_key text, safe_context jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS MATERIALIZED (
    SELECT event.id
    FROM public.outbox_events AS event
    WHERE event.delivered_at IS NULL
      AND event.delivery_failed_at IS NULL
      AND (event.delivery_locked_until IS NULL OR event.delivery_locked_until < pg_catalog.clock_timestamp())
    ORDER BY event.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT greatest(1, least(p_limit, 100))
  ), resolved AS (
    SELECT event.id, event.type, event.payload,
           coalesce((SELECT route.channel_key FROM public.discord_outbox_routes AS route
                     WHERE route.event_type = event.type AND route.enabled), 'logs') AS channel_key
    FROM public.outbox_events AS event JOIN candidates ON candidates.id = event.id
  ), claimed AS (
    UPDATE public.outbox_events AS event
    SET delivery_attempts = event.delivery_attempts + 1,
        delivery_locked_until = pg_catalog.clock_timestamp() + interval '2 minutes'
    FROM resolved WHERE event.id = resolved.id
    RETURNING event.id, event.type
  )
  SELECT claimed.id, claimed.type, resolved.channel_key,
         CASE WHEN claimed.type LIKE 'activity.%' THEN resolved.payload ELSE '{}'::jsonb END
  FROM claimed JOIN resolved ON resolved.id = claimed.id;
END;
$$;

ALTER FUNCTION public.outbox_claim_pending(integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.outbox_claim_pending(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.outbox_claim_pending(integer) TO moneyverse_app;

COMMIT;
