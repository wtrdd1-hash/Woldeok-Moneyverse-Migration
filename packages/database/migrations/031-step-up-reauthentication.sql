-- Recent reauthentication is recorded only after a fresh OAuth code flow has
-- proved an already-linked identity belongs to the active session's user.
ALTER TABLE public.auth_sessions
  ADD COLUMN IF NOT EXISTS reauthenticated_at timestamptz;

ALTER TABLE public.oauth_challenges
  ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'login';

ALTER TABLE public.oauth_challenges
  DROP CONSTRAINT IF EXISTS oauth_challenges_purpose_check;
ALTER TABLE public.oauth_challenges
  ADD CONSTRAINT oauth_challenges_purpose_check
  CHECK (purpose IN ('login', 'link', 'reauth'));

UPDATE public.auth_sessions
SET reauthenticated_at = created_at
WHERE user_id IS NOT NULL AND reauthenticated_at IS NULL;

CREATE OR REPLACE FUNCTION public.auth_mark_session_reauthenticated(
  p_session_id uuid,
  p_provider public.identity_provider,
  p_provider_subject text
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  UPDATE public.auth_sessions AS session_row
  SET reauthenticated_at = pg_catalog.clock_timestamp()
  WHERE session_row.id = p_session_id
    AND session_row.user_id IS NOT NULL
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > pg_catalog.clock_timestamp()
    AND EXISTS (
      SELECT 1
      FROM public.identities AS identity_row
      WHERE identity_row.user_id = session_row.user_id
        AND identity_row.provider = p_provider
        AND identity_row.provider_subject = p_provider_subject
    );
  RETURN FOUND;
END $$;

CREATE OR REPLACE FUNCTION public.auth_session_has_recent_reauthentication(
  p_session_id uuid,
  p_max_age_seconds integer DEFAULT 900
)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.auth_sessions
    WHERE id = p_session_id
      AND user_id IS NOT NULL
      AND revoked_at IS NULL
      AND expires_at > pg_catalog.clock_timestamp()
      AND reauthenticated_at >= pg_catalog.clock_timestamp() - pg_catalog.make_interval(secs => greatest(60, least(p_max_age_seconds, 3600)))
  )
$$;

REVOKE ALL ON FUNCTION public.auth_mark_session_reauthenticated(uuid, public.identity_provider, text), public.auth_session_has_recent_reauthentication(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_mark_session_reauthenticated(uuid, public.identity_provider, text), public.auth_session_has_recent_reauthentication(uuid, integer) TO moneyverse_app;
