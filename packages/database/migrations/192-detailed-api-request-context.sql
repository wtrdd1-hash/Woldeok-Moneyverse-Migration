BEGIN;

CREATE OR REPLACE FUNCTION public.activity_log_request_v2(
  p_actor uuid,
  p_path text,
  p_method text,
  p_status integer,
  p_duration_ms integer,
  p_request_id uuid,
  p_ip inet,
  p_user_agent text,
  p_country text,
  p_context jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_type text := CASE WHEN p_path LIKE '/api/v%/admin/%' THEN 'admin_request' ELSE 'api_request' END;
  v_created_at timestamptz := pg_catalog.clock_timestamp();
  v_safe_context jsonb := CASE WHEN pg_catalog.jsonb_typeof(p_context) = 'object' THEN p_context ELSE '{}'::jsonb END;
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id, session_id, event_type, path, ip, user_agent, metadata, created_at
  ) VALUES (
    p_actor,
    '',
    v_type,
    pg_catalog.left(COALESCE(p_path, '/'), 500),
    p_ip,
    pg_catalog.left(p_user_agent, 500),
    pg_catalog.jsonb_strip_nulls(
      pg_catalog.jsonb_build_object(
        'method', pg_catalog.left(COALESCE(p_method, ''), 12),
        'status', p_status,
        'durationMs', greatest(COALESCE(p_duration_ms, 0), 0),
        'requestId', p_request_id,
        'country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END
      ) || v_safe_context
    ),
    v_created_at
  );

  INSERT INTO public.outbox_events (aggregate_id, type, payload)
  VALUES (
    COALESCE(p_request_id, pg_catalog.gen_random_uuid()),
    CASE WHEN v_type = 'admin_request' THEN 'activity.admin_request' ELSE 'activity.api_request' END,
    pg_catalog.jsonb_strip_nulls(
      pg_catalog.jsonb_build_object(
        'userId', p_actor,
        'method', pg_catalog.left(COALESCE(p_method, ''), 12),
        'path', pg_catalog.left(COALESCE(p_path, '/'), 500),
        'status', p_status,
        'durationMs', greatest(COALESCE(p_duration_ms, 0), 0),
        'requestId', p_request_id,
        'country', CASE WHEN upper(p_country) ~ '^[A-Z]{2}$' THEN upper(p_country) END,
        'userAgent', pg_catalog.left(p_user_agent, 500),
        'occurredAt', v_created_at
      ) || v_safe_context
    )
  );
END;
$$;

ALTER FUNCTION public.activity_log_request_v2(uuid,text,text,integer,integer,uuid,inet,text,text,jsonb)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.activity_log_request_v2(uuid,text,text,integer,integer,uuid,inet,text,text,jsonb)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_log_request_v2(uuid,text,text,integer,integer,uuid,inet,text,text,jsonb)
  TO moneyverse_app;

COMMIT;
