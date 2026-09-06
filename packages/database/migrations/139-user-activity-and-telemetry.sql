-- 135-user-activity-and-telemetry.sql
-- All-encompassing user activity telemetry: page views, dwell duration, button clicks, and navigation.

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  session_id text,
  event_type text NOT NULL, -- 'page_view', 'page_dwell', 'button_click'
  path text NOT NULL,
  target_label text,
  dwell_time_ms integer,
  ip inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_event_type ON public.user_activity_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_path ON public.user_activity_logs (path);

REVOKE ALL PRIVILEGES ON TABLE public.user_activity_logs FROM PUBLIC, moneyverse_app;

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
  v_inserted integer := 0;
  v_event record;
BEGIN
  IF jsonb_typeof(p_events) <> 'array' THEN
    RETURN 0;
  END IF;

  FOR v_event IN SELECT * FROM jsonb_to_recordset(p_events) AS x(
    event_type text,
    path text,
    target_label text,
    dwell_time_ms integer,
    session_id text,
    metadata jsonb,
    created_at timestamptz
  )
  LOOP
    INSERT INTO public.user_activity_logs (
      user_id,
      session_id,
      event_type,
      path,
      target_label,
      dwell_time_ms,
      ip,
      user_agent,
      metadata,
      created_at
    ) VALUES (
      p_actor,
      COALESCE(v_event.session_id, ''),
      COALESCE(v_event.event_type, 'event'),
      COALESCE(v_event.path, '/'),
      v_event.target_label,
      v_event.dwell_time_ms,
      p_ip,
      p_user_agent,
      COALESCE(v_event.metadata, '{}'::jsonb),
      COALESCE(v_event.created_at, CURRENT_TIMESTAMP)
    );
    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN v_inserted;
END;
$$;

ALTER FUNCTION public.activity_log_events(jsonb, uuid, inet, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.activity_log_events(jsonb, uuid, inet, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_log_events(jsonb, uuid, inet, text) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.activity_list_logs(
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
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.user_id,
    COALESCE(u.name, '비로그인') AS username,
    l.session_id,
    l.event_type,
    l.path,
    l.target_label,
    l.dwell_time_ms,
    l.ip,
    l.user_agent,
    l.metadata,
    l.created_at
  FROM public.user_activity_logs l
  LEFT JOIN public.users u ON u.id = l.user_id
  WHERE (p_event_type IS NULL OR l.event_type = p_event_type)
    AND (p_user_id IS NULL OR l.user_id = p_user_id)
  ORDER BY l.created_at DESC
  LIMIT LEAST(p_limit, 200)
  OFFSET GREATEST(p_offset, 0);
END;
$$;

ALTER FUNCTION public.activity_list_logs(integer, integer, text, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.activity_list_logs(integer, integer, text, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.activity_list_logs(integer, integer, text, uuid) TO moneyverse_app;
