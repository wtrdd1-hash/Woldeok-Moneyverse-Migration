-- Migration 280: fix a real clean-PostgreSQL failure in privacy request intake.
-- Migration 015 is immutable; its RETURNS TABLE(created_at) output variable
-- made INSERT ... RETURNING id, created_at ambiguous (SQLSTATE 42702).
-- Only the INSERT target/RETURNING aliases change. Preserve owner-scoped
-- idempotency, SECURITY DEFINER, audit and least-privilege boundaries.
CREATE OR REPLACE FUNCTION public.privacy_create_my_request(
  p_actor_user_id uuid,
  p_request_type text,
  p_detail text,
  p_idempotency_key uuid
)
RETURNS TABLE(
  request_id uuid,
  request_type text,
  status text,
  created_at timestamptz,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_request_type text;
  v_detail text;
  v_request_hash bytea;
  v_request_id uuid;
  v_existing_type text;
  v_existing_hash bytea;
  v_created_at timestamptz;
BEGIN
  IF p_actor_user_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'authenticated user id and idempotency key are required';
  END IF;

  v_request_type := pg_catalog.lower(pg_catalog.btrim(coalesce(p_request_type, '')));
  IF v_request_type NOT IN ('access', 'correction', 'restriction', 'withdrawal', 'deletion') THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'unsupported privacy request type';
  END IF;

  v_detail := public.privacy_normalize_request_detail(p_detail);
  IF v_request_type = 'correction' AND v_detail IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'correction requests require a detail';
  END IF;

  -- This lock serializes a request with account soft-deletion. A record is
  -- never created after the account has become inactive.
  PERFORM 1
  FROM public.users AS user_row
  WHERE user_row.id = p_actor_user_id
    AND user_row.status = 'active'::public.user_status
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active account required';
  END IF;

  v_request_hash := public.digest(
    pg_catalog.jsonb_build_object(
      'requesterUserId', p_actor_user_id::text,
      'requestType', v_request_type,
      'detail', v_detail
    )::text,
    'sha256'
  );

  SELECT request_row.id, request_row.request_type, request_row.request_hash, request_row.created_at
  INTO v_request_id, v_existing_type, v_existing_hash, v_created_at
  FROM public.privacy_data_subject_requests AS request_row
  WHERE request_row.requester_user_id = p_actor_user_id
    AND request_row.idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing_type IS DISTINCT FROM v_request_type
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different privacy request';
    END IF;
    RETURN QUERY SELECT v_request_id, v_existing_type, 'received'::text, v_created_at, true;
    RETURN;
  END IF;

  INSERT INTO public.privacy_data_subject_requests AS request_row (
    requester_user_id,
    request_type,
    detail,
    idempotency_key,
    request_hash
  ) VALUES (
    p_actor_user_id,
    v_request_type,
    v_detail,
    p_idempotency_key,
    v_request_hash
  )
  ON CONFLICT (requester_user_id, idempotency_key) DO NOTHING
  RETURNING request_row.id, request_row.created_at INTO v_request_id, v_created_at;

  -- A simultaneous retry can win between the read and insert. Re-read under
  -- the same owner/key scope and return its exact receipt rather than leaking
  -- a unique-key exception or accepting a different payload.
  IF v_request_id IS NULL THEN
    SELECT request_row.id, request_row.request_type, request_row.request_hash, request_row.created_at
    INTO v_request_id, v_existing_type, v_existing_hash, v_created_at
    FROM public.privacy_data_subject_requests AS request_row
    WHERE request_row.requester_user_id = p_actor_user_id
      AND request_row.idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF NOT FOUND
      OR v_existing_type IS DISTINCT FROM v_request_type
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different privacy request';
    END IF;

    RETURN QUERY SELECT v_request_id, v_existing_type, 'received'::text, v_created_at, true;
    RETURN;
  END IF;

  -- The immutable audit chain stores only a request type and opaque request
  -- ID. It deliberately omits the user's free-text detail.
  PERFORM public.admin_append_audit_event(
    p_actor_user_id,
    'privacy.request.created',
    v_request_id,
    NULL,
    pg_catalog.jsonb_build_object('requestType', v_request_type)
  );

  RETURN QUERY SELECT v_request_id, v_request_type, 'received'::text, v_created_at, false;
END;
$$;

ALTER FUNCTION public.privacy_create_my_request(uuid, text, text, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.privacy_create_my_request(uuid, text, text, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.privacy_create_my_request(uuid, text, text, uuid)
  TO moneyverse_app;
