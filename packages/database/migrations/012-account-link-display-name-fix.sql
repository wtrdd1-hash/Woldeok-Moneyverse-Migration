-- Keep the checked-in 010 migration immutable. Recreate the link function
-- with a POSIX whitespace character class so provider display names are
-- normalized correctly under PostgreSQL's standard-conforming strings.
BEGIN;

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
    pg_catalog.regexp_replace(pg_catalog.btrim(coalesce(p_display_name, '')), '[[:space:]]+', ' ', 'g'),
    120
  );
  IF v_display_name = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'verified OAuth display name is required';
  END IF;

  PERFORM 1
  FROM public.users AS actor_row
  WHERE actor_row.id = p_actor_user_id
    AND actor_row.status = 'active'::public.user_status
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active account required';
  END IF;

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

ALTER FUNCTION public.account_link_oauth_identity(uuid, public.identity_provider, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.account_link_oauth_identity(uuid, public.identity_provider, text, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.account_link_oauth_identity(uuid, public.identity_provider, text, text)
  TO moneyverse_app;

COMMIT;
