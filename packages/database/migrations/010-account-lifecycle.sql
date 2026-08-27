-- Account lifecycle commands are deliberately database-owned.  The web
-- process shares one database role, so it must not be able to read arbitrary
-- identities, attach an OAuth subject to a chosen user, remove a final login
-- method, or mark an account deleted without revoking every session.
BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- There were no account-lifecycle commands before this migration.  Preserve
-- any historical soft-deleted rows rather than rejecting the migration, while
-- making a deleted timestamp mandatory going forward.
UPDATE public.users
SET deleted_at = created_at
WHERE status = 'deleted'::public.user_status
  AND deleted_at IS NULL;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND conname = 'users_deleted_at_matches_status'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_deleted_at_matches_status
      CHECK (
        (status = 'deleted'::public.user_status AND deleted_at IS NOT NULL)
        OR (status <> 'deleted'::public.user_status AND deleted_at IS NULL)
      );
  END IF;
END;
$do$;

CREATE INDEX IF NOT EXISTS identities_user_id_idx ON public.identities (user_id, linked_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS auth_sessions_active_user_idx
  ON public.auth_sessions (user_id)
  WHERE revoked_at IS NULL;

-- These broad prototype grants would allow a compromised application path to
-- enumerate OAuth identities or consent data.  Every necessary read below is
-- exposed as a purpose-built SECURITY DEFINER function instead.
REVOKE ALL PRIVILEGES ON TABLE public.users, public.identities, public.user_consents
  FROM PUBLIC, moneyverse_app;

-- The session layer receives only a yes/no answer.  It rechecks that the
-- session, account, and current consent are all active, so a soft-deleted
-- account is denied even before a stale session-row cleanup is observed.
CREATE OR REPLACE FUNCTION public.auth_session_has_current_consent(
  p_session_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_has_consent boolean;
BEGIN
  IF p_session_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.auth_sessions AS session_row
    JOIN public.users AS user_row ON user_row.id = session_row.user_id
    JOIN public.user_consents AS consent_row ON consent_row.user_id = user_row.id
    WHERE session_row.id = p_session_id
      AND session_row.user_id IS NOT NULL
      AND session_row.revoked_at IS NULL
      AND session_row.expires_at > pg_catalog.now()
      AND user_row.status = 'active'::public.user_status
      AND consent_row.age_confirmed IS TRUE
      AND consent_row.consent_version_id = (
        SELECT consent_version.id
        FROM public.consent_versions AS consent_version
        WHERE consent_version.published_at <= pg_catalog.now()
        ORDER BY consent_version.published_at DESC, consent_version.id DESC
        LIMIT 1
      )
  ) INTO v_has_consent;

  RETURN v_has_consent;
END;
$$;

-- Signed Discord interactions receive only an exact internal UUID for an
-- exact Discord OAuth subject; no profile, email, broad identity search, or
-- inactive/non-consented account is exposed to the shared app role.
CREATE OR REPLACE FUNCTION public.discord_user_for_subject(
  p_discord_subject text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF p_discord_subject IS NULL
    OR p_discord_subject !~ '^[0-9]{16,22}$' THEN
    RETURN NULL;
  END IF;

  SELECT identity_row.user_id
  INTO v_user_id
  FROM public.identities AS identity_row
  JOIN public.users AS user_row ON user_row.id = identity_row.user_id
  JOIN public.user_consents AS consent_row ON consent_row.user_id = user_row.id
  WHERE identity_row.provider = 'discord'::public.identity_provider
    AND identity_row.provider_subject = p_discord_subject
    AND user_row.status = 'active'::public.user_status
    AND consent_row.age_confirmed IS TRUE
    AND consent_row.consent_version_id = (
      SELECT consent_version.id
      FROM public.consent_versions AS consent_version
      WHERE consent_version.published_at <= pg_catalog.now()
      ORDER BY consent_version.published_at DESC, consent_version.id DESC
      LIMIT 1
    )
  LIMIT 1;

  RETURN v_user_id;
END;
$$;

-- Wallet transfer input may carry only an internal UUID.  Returning that same
-- UUID (or NULL) provides no profile data; the HTTP layer maps either an
-- unknown or inactive recipient to one generic response.
CREATE OR REPLACE FUNCTION public.wallet_active_recipient_by_id(
  p_recipient_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF p_recipient_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT user_row.id
  INTO v_user_id
  FROM public.users AS user_row
  WHERE user_row.id = p_recipient_user_id
    AND user_row.status = 'active'::public.user_status;

  RETURN v_user_id;
END;
$$;

-- This read model is intentionally scoped to the supplied authenticated
-- account.  It provides just enough information for an account settings UI,
-- without restoring table-level identity visibility.
CREATE OR REPLACE FUNCTION public.account_list_my_identities(
  p_actor_user_id uuid
)
RETURNS TABLE(
  identity_id uuid,
  provider public.identity_provider,
  display_name text,
  linked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'account identity is required';
  END IF;

  RETURN QUERY
  SELECT
    identity_row.id,
    identity_row.provider,
    identity_row.display_name,
    identity_row.linked_at
  FROM public.identities AS identity_row
  JOIN public.users AS user_row ON user_row.id = identity_row.user_id
  WHERE identity_row.user_id = p_actor_user_id
    AND user_row.status = 'active'::public.user_status
  ORDER BY identity_row.linked_at ASC, identity_row.id ASC;
END;
$$;

-- A caller must pass an identity produced by a completed provider-token
-- verification flow, never values submitted by the browser.  This function
-- cannot verify an OAuth token itself, but it atomically enforces ownership of
-- the verified provider subject and refuses to move it between accounts.
CREATE OR REPLACE FUNCTION public.account_link_oauth_identity(
  p_actor_user_id uuid,
  p_provider public.identity_provider,
  p_provider_subject text,
  p_display_name text
)
RETURNS TABLE(
  identity_id uuid,
  provider public.identity_provider,
  display_name text,
  linked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_display_name text;
  v_identity_id uuid;
  v_identity_user_id uuid;
BEGIN
  IF p_actor_user_id IS NULL OR p_provider IS NULL
    OR p_provider_subject IS NULL
    OR pg_catalog.char_length(p_provider_subject) = 0
    OR pg_catalog.char_length(p_provider_subject) > 255
    OR p_provider_subject <> pg_catalog.btrim(p_provider_subject)
    OR (p_provider = 'discord'::public.identity_provider
      AND p_provider_subject !~ '^[0-9]{16,22}$') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid verified OAuth identity';
  END IF;

  v_display_name := pg_catalog.left(
    pg_catalog.regexp_replace(pg_catalog.btrim(coalesce(p_display_name, '')), '\\s+', ' ', 'g'),
    120
  );
  IF v_display_name = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'verified OAuth display name is required';
  END IF;

  -- Every account lifecycle mutation first locks the actor. This serializes
  -- linking, unlinking, and deletion for one account.
  PERFORM 1
  FROM public.users AS actor_row
  WHERE actor_row.id = p_actor_user_id
    AND actor_row.status = 'active'::public.user_status
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active account required';
  END IF;

  -- The subject-level lock turns two simultaneous links of the same external
  -- identity into a deterministic winner/validated result rather than an
  -- insert race or an ownership transfer.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'moneyverse:oauth-identity:' || p_provider::text || ':' || p_provider_subject,
      0
    )
  );

  SELECT identity_row.id, identity_row.user_id
  INTO v_identity_id, v_identity_user_id
  FROM public.identities AS identity_row
  WHERE identity_row.provider = p_provider
    AND identity_row.provider_subject = p_provider_subject
  FOR UPDATE;

  IF FOUND THEN
    IF v_identity_user_id IS DISTINCT FROM p_actor_user_id THEN
      -- Do not reveal whether the provider subject is attached to an active,
      -- restricted, or deleted account, and never migrate it automatically.
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'OAuth identity is unavailable';
    END IF;

    UPDATE public.identities
    SET display_name = v_display_name
    WHERE id = v_identity_id;

    RETURN QUERY SELECT v_identity_id, p_provider, v_display_name, false;
    RETURN;
  END IF;

  INSERT INTO public.identities (user_id, provider, provider_subject, display_name)
  VALUES (p_actor_user_id, p_provider, p_provider_subject, v_display_name)
  RETURNING id INTO v_identity_id;

  RETURN QUERY SELECT v_identity_id, p_provider, v_display_name, true;
END;
$$;

-- A user may remove a linked login method only while at least one remains.
-- The actor-row lock above prevents two concurrent unlink requests from both
-- observing two identities and deleting the last pair.
CREATE OR REPLACE FUNCTION public.account_unlink_identity(
  p_actor_user_id uuid,
  p_identity_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_identity_id uuid;
  v_identity_count integer;
BEGIN
  IF p_actor_user_id IS NULL OR p_identity_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'account and identity are required';
  END IF;

  PERFORM 1
  FROM public.users AS actor_row
  WHERE actor_row.id = p_actor_user_id
    AND actor_row.status = 'active'::public.user_status
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active account required';
  END IF;

  SELECT identity_row.id
  INTO v_identity_id
  FROM public.identities AS identity_row
  WHERE identity_row.id = p_identity_id
    AND identity_row.user_id = p_actor_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    -- Do not distinguish another account's identity from an unknown UUID.
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'OAuth identity is unavailable';
  END IF;

  SELECT pg_catalog.count(*)::integer
  INTO v_identity_count
  FROM public.identities AS identity_row
  WHERE identity_row.user_id = p_actor_user_id;
  IF v_identity_count <= 1 THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'the last OAuth identity cannot be removed';
  END IF;

  DELETE FROM public.identities WHERE id = v_identity_id;
  RETURN v_identity_id;
END;
$$;

-- Deletion is soft: ledger and audit references stay intact, OAuth subjects
-- remain reserved against silent account takeover, and every authenticated
-- session for the account is revoked atomically. Repeating the command is
-- safe and reports the original deletion timestamp.
CREATE OR REPLACE FUNCTION public.account_soft_delete(
  p_actor_user_id uuid
)
RETURNS TABLE(
  deleted_at timestamptz,
  revoked_session_count integer,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_status public.user_status;
  v_deleted_at timestamptz;
  v_revoked_session_count integer := 0;
BEGIN
  IF p_actor_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'account is required';
  END IF;

  SELECT actor_row.status, actor_row.deleted_at
  INTO v_status, v_deleted_at
  FROM public.users AS actor_row
  WHERE actor_row.id = p_actor_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'account is unavailable';
  END IF;

  IF v_status = 'deleted'::public.user_status THEN
    RETURN QUERY SELECT v_deleted_at, 0, true;
    RETURN;
  END IF;

  -- A restricted account is still allowed to exercise its deletion right.
  UPDATE public.users
  SET status = 'deleted'::public.user_status,
      deleted_at = pg_catalog.clock_timestamp()
  WHERE id = p_actor_user_id
  RETURNING deleted_at INTO v_deleted_at;

  UPDATE public.auth_sessions
  SET revoked_at = coalesce(revoked_at, v_deleted_at)
  WHERE user_id = p_actor_user_id
    AND revoked_at IS NULL;
  GET DIAGNOSTICS v_revoked_session_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_at, v_revoked_session_count, false;
END;
$$;

ALTER FUNCTION public.auth_session_has_current_consent(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.discord_user_for_subject(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.wallet_active_recipient_by_id(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.account_list_my_identities(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.account_link_oauth_identity(uuid, public.identity_provider, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.account_unlink_identity(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.account_soft_delete(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.auth_session_has_current_consent(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.discord_user_for_subject(text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.wallet_active_recipient_by_id(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.account_list_my_identities(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.account_link_oauth_identity(uuid, public.identity_provider, text, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.account_unlink_identity(uuid, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.account_soft_delete(uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.auth_session_has_current_consent(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.discord_user_for_subject(text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.wallet_active_recipient_by_id(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.account_list_my_identities(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.account_link_oauth_identity(uuid, public.identity_provider, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.account_unlink_identity(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.account_soft_delete(uuid) TO moneyverse_app;

COMMIT;
