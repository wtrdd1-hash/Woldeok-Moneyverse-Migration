-- Make browser activity delivery retry-safe. Raw client IP remains in user_activity_logs;
-- Discord delivery continues to receive only the masked network generated below.
BEGIN;

ALTER TABLE public.user_activity_logs
  ADD COLUMN IF NOT EXISTS client_event_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS user_activity_logs_client_event_id_uq
  ON public.user_activity_logs (client_event_id)
  WHERE client_event_id IS NOT NULL;

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
  WITH parsed AS (
    SELECT event,
      CASE WHEN event->>'eventId' ~ '^[0-9a-fA-F-]{36}$' THEN (event->>'eventId')::uuid END AS event_id
    FROM pg_catalog.jsonb_array_elements(p_events) AS item(event)
  ), recorded AS (
    INSERT INTO public.user_activity_logs (
      client_event_id, user_id, session_id, event_type, path, target_label, dwell_time_ms,
      ip, user_agent, metadata, created_at
    )
    SELECT parsed.event_id, p_actor, pg_catalog.left(COALESCE(event->>'sessionId', ''), 128),
      pg_catalog.left(COALESCE(event->>'eventType', 'event'), 40),
      pg_catalog.left(COALESCE(event->>'path', '/'), 500),
      NULLIF(pg_catalog.left(COALESCE(event->>'targetLabel', ''), 200), ''),
      CASE WHEN event->>'dwellTimeMs' ~ '^[0-9]+$' THEN least((event->>'dwellTimeMs')::integer, 86400000) END,
      p_ip, pg_catalog.left(p_user_agent, 500),
      (CASE WHEN pg_catalog.jsonb_typeof(event->'metadata') = 'object' THEN event->'metadata' ELSE '{}'::jsonb END)
        || pg_catalog.jsonb_build_object('country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END),
      pg_catalog.clock_timestamp()
    FROM parsed
    WHERE parsed.event_id IS NOT NULL
    ON CONFLICT (client_event_id) WHERE client_event_id IS NOT NULL DO NOTHING
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
