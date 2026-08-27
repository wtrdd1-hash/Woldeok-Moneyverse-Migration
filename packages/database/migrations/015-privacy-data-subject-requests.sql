-- In-app data-subject requests are records for a later, reviewed process.
-- This migration deliberately has no delivery address, attachment, export,
-- outbound message, or automatic account mutation.  A user's authenticated
-- session supplies the actor; the shared application role cannot query or
-- write this table directly.
BEGIN;

CREATE TABLE IF NOT EXISTS public.privacy_data_subject_requests (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  requester_user_id uuid NOT NULL
    REFERENCES public.users(id) ON DELETE RESTRICT,
  request_type text NOT NULL
    CHECK (request_type IN ('access', 'correction', 'restriction', 'withdrawal', 'deletion')),
  detail text,
  status text NOT NULL DEFAULT 'received'
    CHECK (status = 'received'),
  idempotency_key uuid NOT NULL,
  request_hash bytea NOT NULL
    CHECK (pg_catalog.octet_length(request_hash) = 32),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CHECK (
    detail IS NULL
    OR (
      pg_catalog.char_length(detail) BETWEEN 1 AND 1000
      AND detail = pg_catalog.btrim(detail)
      AND detail !~ '[[:cntrl:]<>]'
      AND detail !~ '[[:space:]]{2,}'
    )
  ),
  CHECK (request_type <> 'correction' OR detail IS NOT NULL),
  UNIQUE (requester_user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS privacy_data_subject_requests_owner_created_idx
  ON public.privacy_data_subject_requests (requester_user_id, created_at DESC, id DESC);

-- An internal canonicalizer keeps the stored detail intentionally small and
-- plain. It accepts no JSON object, file, email field, callback URL, or other
-- delivery/export primitive because the SQL signature is only scalar text.
CREATE OR REPLACE FUNCTION public.privacy_normalize_request_detail(p_detail text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_detail text;
BEGIN
  IF p_detail IS NULL THEN
    RETURN NULL;
  END IF;

  -- Bound work before regular-expression normalization. The final stored
  -- detail is even smaller (at most 1000 characters).
  IF pg_catalog.char_length(p_detail) > 4000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'privacy request detail must be at most 1000 characters';
  END IF;

  v_detail := pg_catalog.regexp_replace(
    pg_catalog.replace(
      pg_catalog.replace(p_detail, E'\r\n', E'\n'),
      E'\r',
      E'\n'
    ),
    '[[:space:]]+',
    ' ',
    'g'
  );
  v_detail := pg_catalog.btrim(v_detail);

  IF v_detail = '' THEN
    RETURN NULL;
  END IF;

  IF pg_catalog.char_length(v_detail) > 1000
    OR v_detail ~ '[[:cntrl:]<>]' THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'privacy request detail must be safe plain text of at most 1000 characters';
  END IF;

  RETURN v_detail;
END;
$$;

-- Creates a request for the exact active account passed by the server-side
-- session boundary. Idempotency is scoped to that account, so no other user
-- can learn whether an opaque UUID key was used elsewhere.
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

  INSERT INTO public.privacy_data_subject_requests (
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
  RETURNING id, created_at INTO v_request_id, v_created_at;

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

-- The application can list exactly the active authenticated account's own
-- submissions. There is intentionally no staff queue, cross-user lookup, or
-- export/readout command in this domain migration.
CREATE OR REPLACE FUNCTION public.privacy_list_my_requests(
  p_actor_user_id uuid,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  request_id uuid,
  request_type text,
  detail text,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor_user_id IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'active user id and a limit between 1 and 100 are required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    WHERE user_row.id = p_actor_user_id
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active account required';
  END IF;

  RETURN QUERY
  SELECT
    request_row.id,
    request_row.request_type,
    request_row.detail,
    request_row.status,
    request_row.created_at
  FROM public.privacy_data_subject_requests AS request_row
  WHERE request_row.requester_user_id = p_actor_user_id
  ORDER BY request_row.created_at DESC, request_row.id DESC
  LIMIT p_limit;
END;
$$;

ALTER TABLE public.privacy_data_subject_requests OWNER TO moneyverse_migrator;
ALTER FUNCTION public.privacy_normalize_request_detail(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.privacy_create_my_request(uuid, text, text, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.privacy_list_my_requests(uuid, integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON TABLE public.privacy_data_subject_requests
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.privacy_normalize_request_detail(text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.privacy_create_my_request(uuid, text, text, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.privacy_list_my_requests(uuid, integer)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.privacy_create_my_request(uuid, text, text, uuid)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.privacy_list_my_requests(uuid, integer)
  TO moneyverse_app;

COMMIT;
