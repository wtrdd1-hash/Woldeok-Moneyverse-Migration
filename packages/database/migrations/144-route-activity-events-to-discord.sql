-- Detailed activity stays in PostgreSQL. Discord receives only a typed
-- notification and an opaque receipt through the existing outbox, so no IP,
-- user agent, path, nickname, cookie, token, body or query value crosses that
-- boundary. The worker already supplies leasing, retries, dead letters and
-- Discord rate-limit backoff.
BEGIN;

INSERT INTO public.discord_outbox_routes (event_type, channel_key, enabled, note) VALUES
  ('activity.api_request',   'logs', true, 'sanitised API request notification'),
  ('activity.admin_request', 'logs', true, 'sanitised administrator request notification'),
  ('activity.client_event',  'logs', true, 'sanitised page and click notification')
ON CONFLICT (event_type) DO UPDATE
SET channel_key = EXCLUDED.channel_key,
    enabled = EXCLUDED.enabled,
    note = EXCLUDED.note;

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

  WITH recorded AS (
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
        THEN least((event->>'dwellTimeMs')::integer, 86400000)
        ELSE NULL END,
      p_ip,
      pg_catalog.left(p_user_agent, 500),
      CASE WHEN pg_catalog.jsonb_typeof(event->'metadata') = 'object'
        THEN event->'metadata' ELSE '{}'::jsonb END,
      pg_catalog.now()
    FROM pg_catalog.jsonb_array_elements(p_events) AS item(event)
    RETURNING id
  ), queued AS (
    INSERT INTO public.outbox_events (aggregate_id, type, payload)
    SELECT pg_catalog.gen_random_uuid(), 'activity.client_event', '{}'::jsonb
    FROM recorded
    RETURNING id
  )
  SELECT pg_catalog.count(*)::integer INTO v_inserted FROM queued;

  RETURN v_inserted;
END;
$$;

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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_type text := CASE
    WHEN p_path LIKE '/api/v%/admin/%' THEN 'admin_request'
    ELSE 'api_request'
  END;
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id, session_id, event_type, path, ip, user_agent, metadata
  ) VALUES (
    p_actor,
    '',
    v_type,
    pg_catalog.left(COALESCE(p_path, '/'), 500),
    p_ip,
    pg_catalog.left(p_user_agent, 500),
    pg_catalog.jsonb_build_object(
      'method', pg_catalog.left(COALESCE(p_method, ''), 12),
      'status', p_status,
      'durationMs', greatest(COALESCE(p_duration_ms, 0), 0),
      'requestId', p_request_id
    )
  );

  INSERT INTO public.outbox_events (aggregate_id, type, payload)
  VALUES (
    COALESCE(p_request_id, pg_catalog.gen_random_uuid()),
    CASE WHEN v_type = 'admin_request'
      THEN 'activity.admin_request'
      ELSE 'activity.api_request' END,
    '{}'::jsonb
  );
END;
$$;

ALTER FUNCTION public.activity_log_events(jsonb, uuid, inet, text)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_log_events(jsonb, uuid, inet, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_log_events(jsonb, uuid, inet, text)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_log_request(uuid, text, text, integer, integer, uuid, inet, text)
  TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.user_activity_logs, public.discord_outbox_routes
  FROM PUBLIC, moneyverse_app;

COMMIT;
