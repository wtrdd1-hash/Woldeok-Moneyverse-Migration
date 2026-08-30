-- The detail a superadmin's audit trail is supposed to carry (spec 14.9),
-- and the guard that keeps secrets out of it (spec 14.9, 17.10).
--
-- Until now an audit row recorded five things: who, what action, which
-- target, an optional request id and a free-form metadata object. Every
-- question an incident actually starts with -- which request, from which
-- address, through which screen, did it succeed, what did the value look
-- like before -- had no place to live, and `request_id` was NULL on every
-- backend-written row because nothing generated one.
--
-- SHAPE. The columns below are exactly the axes 14.9 says the log must be
-- searchable by; everything else in 14.9's list goes into `context`, a jsonb
-- envelope with a closed key set. The alternative -- forty columns -- makes
-- every future field a migration and leaves thirty-eight of them NULL on
-- every row. The typed columns are derived from `context` and the whole
-- envelope is hashed, so 064's verifier can confirm the columns still agree
-- with the bytes that were signed.
--
-- CLOSED, NOT OPEN. An unrecognised context key is rejected (22023) rather
-- than dropped. A typo in an interceptor is then a loud failure at the call
-- site instead of a field that silently never gets recorded -- and a field
-- that silently never gets recorded is discovered during an incident.
--
-- SECRETS. 17.10 forbids passwords, session ids, access and refresh tokens,
-- DB URLs, client secrets and bot tokens in any log. `audit_first_sensitive
-- _key` walks metadata and context to any depth and refuses the write. It
-- matches on key names, so it is a coarse net: it will also refuse a
-- harmless `tokenCount`. That is the intended direction of error -- a
-- rejected audit write is a bug report, a recorded bot token is an incident.
-- Every metadata key the existing fifteen writers use was checked against
-- the pattern before this landed.
--
-- SESSIONS. 17.10 lists the session id itself as forbidden, but 14.9 wants
-- to correlate a session's actions. `session_hash` is a one-way hash the
-- application computes; `auth_sessions.id` is a v4 uuid, so the hash is not
-- reversible by enumeration and it still groups a session's rows together.

BEGIN;

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS context jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS trace_id uuid,
  ADD COLUMN IF NOT EXISTS session_hash text,
  ADD COLUMN IF NOT EXISTS feature text,
  ADD COLUMN IF NOT EXISTS target_kind text,
  ADD COLUMN IF NOT EXISTS subject_user_id uuid,
  ADD COLUMN IF NOT EXISTS transaction_id uuid,
  ADD COLUMN IF NOT EXISTS client_ip inet,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS response_status integer;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraint_row
    WHERE constraint_row.conrelid = 'public.audit_logs'::pg_catalog.regclass
      AND constraint_row.conname = 'audit_logs_outcome_check'
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_outcome_check
      CHECK (outcome IS NULL OR outcome IN ('success', 'failure', 'partial'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraint_row
    WHERE constraint_row.conrelid = 'public.audit_logs'::pg_catalog.regclass
      AND constraint_row.conname = 'audit_logs_response_status_check'
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_response_status_check
      CHECK (response_status IS NULL OR (response_status BETWEEN 100 AND 599));
  END IF;
END;
$do$;

-- 17.10: "normalise newlines and control characters so a log entry cannot be
-- forged by its own content". Everything that reaches a text column or an
-- error message from outside passes through here first.
CREATE OR REPLACE FUNCTION public.audit_normalize_text(
  p_value text,
  p_max_length integer
)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT nullif(
    pg_catalog.left(
      pg_catalog.btrim(pg_catalog.regexp_replace(p_value, '[[:cntrl:]]+', ' ', 'g')),
      greatest(1, least(coalesce(p_max_length, 256), 4096))
    ),
    ''
  )
$$;

-- Returns the first key at any depth whose name says the value must not be
-- here, or NULL when the payload is clean.
CREATE OR REPLACE FUNCTION public.audit_first_sensitive_key(p_payload jsonb)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_forbidden constant text :=
    '(password|passphrase|secret|token|cookie|authorization|credential|'
    || 'session_?id|private_?key|api_?key|access_?key|bearer|totp|'
    || 'recovery_?code|db_?url|database_?url|connection_?string)';
  v_key text;
  v_found text;
BEGIN
  IF p_payload IS NULL THEN
    RETURN NULL;
  END IF;

  IF pg_catalog.jsonb_typeof(p_payload) = 'object' THEN
    FOR v_key IN
      SELECT keys.object_key
      FROM pg_catalog.jsonb_object_keys(p_payload) AS keys(object_key)
    LOOP
      IF v_key ~* v_forbidden THEN
        RETURN v_key;
      END IF;

      v_found := public.audit_first_sensitive_key(p_payload -> v_key);
      IF v_found IS NOT NULL THEN
        RETURN v_found;
      END IF;
    END LOOP;
  ELSIF pg_catalog.jsonb_typeof(p_payload) = 'array' THEN
    FOR v_found IN
      SELECT public.audit_first_sensitive_key(element.value)
      FROM pg_catalog.jsonb_array_elements(p_payload) AS element(value)
    LOOP
      IF v_found IS NOT NULL THEN
        RETURN v_found;
      END IF;
    END LOOP;
  END IF;

  RETURN NULL;
END;
$$;

-- The closed key set. Adding a field to 14.9's list means adding it here in
-- a migration, which is the point: the shape of the evidence is versioned.
CREATE OR REPLACE FUNCTION public.audit_assert_context(p_context jsonb)
RETURNS void
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_allowed constant text[] := ARRAY[
    -- correlation and identity
    'traceId', 'sessionHash', 'authMethod', 'reauthenticatedAt', 'actorRoles',
    -- origin
    'clientIp', 'userAgentHash', 'userAgentFamily', 'httpMethod', 'httpPath',
    -- what was touched
    'feature', 'targetKind', 'targetLabel', 'targetCount', 'subjectUserId',
    -- why
    'reason', 'ticket', 'memo',
    -- the change itself
    'before', 'requested', 'verified', 'after',
    'policyVersionBefore', 'policyVersionAfter', 'effectiveAt',
    'featureStateBefore', 'featureStateAfter',
    -- ledger linkage
    'transactionId', 'originTransactionId', 'correctionTransactionId',
    'accountId', 'amount', 'currency', 'debitSummary', 'creditSummary',
    -- bulk work
    'bulkTotal', 'bulkSucceeded', 'bulkFailed', 'bulkSkipped', 'bulkOutcomes',
    -- result
    'outcome', 'responseStatus', 'errorCode', 'errorClass',
    'idempotencyKey', 'appliedFunction', 'policyCode',
    -- timing
    'receivedAt', 'completedAt', 'durationMs', 'occurredAtSeoul'
  ];
  v_offender text;
BEGIN
  IF p_context IS NULL OR pg_catalog.jsonb_typeof(p_context) <> 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context must be an object';
  END IF;

  IF pg_catalog.octet_length(p_context::text) > 16384 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context is too large';
  END IF;

  SELECT keys.context_key INTO v_offender
  FROM pg_catalog.jsonb_object_keys(p_context) AS keys(context_key)
  WHERE keys.context_key <> ALL (v_allowed)
  LIMIT 1;

  IF v_offender IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'unknown audit context field: '
        || coalesce(public.audit_normalize_text(v_offender, 64), '?');
  END IF;

  v_offender := public.audit_first_sensitive_key(p_context);
  IF v_offender IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'audit context carries a forbidden field: '
        || coalesce(public.audit_normalize_text(v_offender, 64), '?');
  END IF;
END;
$$;

-- Same shape as 062 with the context envelope threaded through. The typed
-- columns are read back out of the validated envelope rather than taken as
-- separate parameters, so a caller cannot record a `clientIp` column that
-- disagrees with the `clientIp` inside the bytes being hashed.
CREATE OR REPLACE FUNCTION public.admin_append_audit_event(
  p_actor_user_id uuid,
  p_action text,
  p_target_id uuid,
  p_request_id uuid,
  p_metadata jsonb,
  p_context jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_audit_id uuid;
  v_previous_hash text;
  v_previous_sequence bigint;
  v_sequence bigint;
  v_integrity_hash text;
  v_created_at timestamptz := pg_catalog.clock_timestamp();
  v_offender text;
  v_uuid_pattern constant text :=
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
  v_trace_id uuid;
  v_subject_user_id uuid;
  v_transaction_id uuid;
  v_client_ip inet;
  v_session_hash text;
  v_feature text;
  v_target_kind text;
  v_outcome text;
  v_response_status integer;
BEGIN
  IF p_actor_user_id IS NULL
    OR p_action IS NULL
    OR p_action !~ '^[a-z][a-z0-9_.:-]{2,119}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid audit event identity';
  END IF;

  IF p_metadata IS NULL
    OR pg_catalog.jsonb_typeof(p_metadata) <> 'object'
    OR pg_catalog.octet_length(p_metadata::text) > 16384 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid audit metadata';
  END IF;

  v_offender := public.audit_first_sensitive_key(p_metadata);
  IF v_offender IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'audit metadata carries a forbidden field: '
        || coalesce(public.audit_normalize_text(v_offender, 64), '?');
  END IF;

  PERFORM public.audit_assert_context(p_context);

  IF (p_context ? 'traceId') AND (p_context ->> 'traceId') IS NOT NULL THEN
    IF (p_context ->> 'traceId') !~ v_uuid_pattern THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context traceId must be a uuid';
    END IF;
    v_trace_id := (p_context ->> 'traceId')::uuid;
  END IF;

  IF (p_context ? 'subjectUserId') AND (p_context ->> 'subjectUserId') IS NOT NULL THEN
    IF (p_context ->> 'subjectUserId') !~ v_uuid_pattern THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context subjectUserId must be a uuid';
    END IF;
    v_subject_user_id := (p_context ->> 'subjectUserId')::uuid;
  END IF;

  IF (p_context ? 'transactionId') AND (p_context ->> 'transactionId') IS NOT NULL THEN
    IF (p_context ->> 'transactionId') !~ v_uuid_pattern THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context transactionId must be a uuid';
    END IF;
    v_transaction_id := (p_context ->> 'transactionId')::uuid;
  END IF;

  IF (p_context ? 'clientIp') AND (p_context ->> 'clientIp') IS NOT NULL THEN
    BEGIN
      v_client_ip := (p_context ->> 'clientIp')::inet;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context clientIp must be an address';
    END;
  END IF;

  v_session_hash := p_context ->> 'sessionHash';
  IF v_session_hash IS NOT NULL AND v_session_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context sessionHash must be a sha-256 digest';
  END IF;

  v_feature := p_context ->> 'feature';
  IF v_feature IS NOT NULL AND v_feature !~ '^[a-z][a-z0-9_.:-]{2,63}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context feature is malformed';
  END IF;

  v_target_kind := p_context ->> 'targetKind';
  IF v_target_kind IS NOT NULL AND v_target_kind !~ '^[a-z][a-z0-9_.:-]{2,63}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context targetKind is malformed';
  END IF;

  v_outcome := p_context ->> 'outcome';
  IF v_outcome IS NOT NULL AND v_outcome NOT IN ('success', 'failure', 'partial') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context outcome is malformed';
  END IF;

  IF (p_context ? 'responseStatus') AND (p_context ->> 'responseStatus') IS NOT NULL THEN
    IF (p_context ->> 'responseStatus') !~ '^[1-5][0-9]{2}$' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit context responseStatus is malformed';
    END IF;
    v_response_status := (p_context ->> 'responseStatus')::integer;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin-audit-chain', 0)
  );

  SELECT audit_row.integrity_hash, audit_row.sequence
  INTO v_previous_hash, v_previous_sequence
  FROM public.audit_logs AS audit_row
  ORDER BY audit_row.sequence DESC
  LIMIT 1;

  v_sequence := coalesce(v_previous_sequence, 0) + 1;

  v_integrity_hash := public.audit_event_digest(
    v_sequence,
    v_previous_hash,
    p_actor_user_id,
    p_action,
    p_target_id,
    p_request_id,
    p_metadata,
    v_created_at,
    p_context
  );

  INSERT INTO public.audit_logs (
    id,
    sequence,
    hash_version,
    actor_user_id,
    action,
    target_id,
    request_id,
    metadata,
    context,
    trace_id,
    session_hash,
    feature,
    target_kind,
    subject_user_id,
    transaction_id,
    client_ip,
    outcome,
    response_status,
    created_at,
    previous_integrity_hash,
    integrity_hash
  ) VALUES (
    pg_catalog.gen_random_uuid(),
    v_sequence,
    2,
    p_actor_user_id,
    p_action,
    p_target_id,
    p_request_id,
    p_metadata,
    p_context,
    v_trace_id,
    v_session_hash,
    v_feature,
    v_target_kind,
    v_subject_user_id,
    v_transaction_id,
    v_client_ip,
    v_outcome,
    v_response_status,
    v_created_at,
    v_previous_hash,
    v_integrity_hash
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- The fifteen writers already in the schema keep their five-argument call.
CREATE OR REPLACE FUNCTION public.admin_append_audit_event(
  p_actor_user_id uuid,
  p_action text,
  p_target_id uuid,
  p_request_id uuid,
  p_metadata jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN public.admin_append_audit_event(
    p_actor_user_id,
    p_action,
    p_target_id,
    p_request_id,
    p_metadata,
    '{}'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_record_audit_event(
  p_actor_user_id uuid,
  p_action text,
  p_target_id uuid,
  p_request_id uuid,
  p_metadata jsonb,
  p_context jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor_user_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor user id is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    JOIN public.user_roles AS role_row ON role_row.user_id = user_row.id
    WHERE user_row.id = p_actor_user_id
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active administrator role required';
  END IF;

  RETURN public.admin_append_audit_event(
    p_actor_user_id,
    p_action,
    p_target_id,
    p_request_id,
    p_metadata,
    p_context
  );
END;
$$;

ALTER FUNCTION public.audit_normalize_text(text, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_first_sensitive_key(jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_assert_context(jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_append_audit_event(uuid, text, uuid, uuid, jsonb, jsonb)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_record_audit_event(uuid, text, uuid, uuid, jsonb, jsonb)
  OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.audit_normalize_text(text, integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_first_sensitive_key(jsonb)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_assert_context(jsonb)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_append_audit_event(uuid, text, uuid, uuid, jsonb, jsonb)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_record_audit_event(uuid, text, uuid, uuid, jsonb, jsonb)
  FROM PUBLIC, moneyverse_app;

-- `admin_record_audit_event` is the application's one door into the chain,
-- and 007 already grants the five-argument form.
GRANT EXECUTE ON FUNCTION public.admin_record_audit_event(uuid, text, uuid, uuid, jsonb, jsonb)
  TO moneyverse_app;

COMMIT;
