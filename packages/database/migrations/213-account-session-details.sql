-- User-facing active-session details without exposing raw request metadata.
CREATE OR REPLACE FUNCTION public.account_active_sessions(p_user uuid, p_current_session uuid)
RETURNS TABLE (
  session_id uuid,
  created_at timestamptz,
  expires_at timestamptz,
  reauthenticated_at timestamptz,
  admin_opened_at timestamptz,
  last_seen_at timestamptz,
  device_label text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    session.id,
    session.created_at,
    session.expires_at,
    session.reauthenticated_at,
    session.admin_opened_at,
    COALESCE(activity.last_seen_at, session.created_at),
    CASE
      WHEN activity.user_agent ILIKE '%Android%' THEN 'Android device'
      WHEN activity.user_agent ILIKE '%iPhone%' OR activity.user_agent ILIKE '%iPad%' THEN 'Apple mobile device'
      WHEN activity.user_agent ILIKE '%Windows%' THEN 'Windows device'
      WHEN activity.user_agent ILIKE '%Macintosh%' OR activity.user_agent ILIKE '%Mac OS%' THEN 'Mac device'
      WHEN activity.user_agent ILIKE '%Linux%' THEN 'Linux device'
      WHEN activity.user_agent IS NULL OR activity.user_agent = '' THEN 'Unknown device'
      ELSE 'Web browser'
    END
  FROM public.auth_sessions AS session
  LEFT JOIN LATERAL (
    SELECT log.created_at AS last_seen_at, log.user_agent
    FROM public.user_activity_logs AS log
    WHERE log.user_id = p_user AND log.session_id = session.id::text
    ORDER BY log.created_at DESC, log.id DESC
    LIMIT 1
  ) AS activity ON true
  WHERE session.user_id = p_user
    AND session.revoked_at IS NULL
    AND session.expires_at > pg_catalog.now()
  ORDER BY (session.id = p_current_session) DESC, COALESCE(activity.last_seen_at, session.created_at) DESC, session.id DESC;
$$;

ALTER FUNCTION public.account_active_sessions(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.account_active_sessions(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_active_sessions(uuid, uuid) TO moneyverse_app;
