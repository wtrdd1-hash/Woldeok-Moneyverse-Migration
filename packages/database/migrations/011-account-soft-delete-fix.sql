-- 010 introduced the account lifecycle command. This follow-up preserves the
-- immutable migration history while qualifying the RETURNING column in the
-- PL/pgSQL function, whose output field is also named deleted_at.
BEGIN;

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

  UPDATE public.users AS actor_row
  SET status = 'deleted'::public.user_status,
      deleted_at = pg_catalog.clock_timestamp()
  WHERE actor_row.id = p_actor_user_id
  RETURNING actor_row.deleted_at INTO v_deleted_at;

  UPDATE public.auth_sessions
  SET revoked_at = coalesce(revoked_at, v_deleted_at)
  WHERE user_id = p_actor_user_id
    AND revoked_at IS NULL;
  GET DIAGNOSTICS v_revoked_session_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_at, v_revoked_session_count, false;
END;
$$;

ALTER FUNCTION public.account_soft_delete(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.account_soft_delete(uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.account_soft_delete(uuid) TO moneyverse_app;

COMMIT;
