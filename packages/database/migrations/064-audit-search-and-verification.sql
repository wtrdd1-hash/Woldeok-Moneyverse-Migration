-- Searching the trail, and proving it has not been rewritten (spec 14.9).
--
-- 008 gave the console one read path: the most recent N rows, unfiltered,
-- capped at 100. That answers "what happened lately" and nothing else. An
-- incident starts from a transaction id, an address, a request id or a day,
-- and 14.9 names those as required search axes.
--
-- MASKED BY DEFAULT. 14.9 requires the log screen to mask sensitive values
-- and to record the act of unmasking as its own audit event. So the search
-- function returns an address narrowed to its network and a session hash cut
-- to a prefix, and `admin_reveal_audit_event` -- the only way to the full row
-- -- appends `admin.audit.unmasked` in the same transaction that returns it.
-- The reveal cannot succeed without the audit row: one transaction, both or
-- neither.
--
-- VERIFICATION IS EVIDENCE, NOT A BOOLEAN. `admin_verify_audit_chain` writes
-- what it found into `audit_chain_verifications` -- itself append-only --
-- because 14.9 asks for the daily result to be kept in a separate log, and a
-- verification that leaves no record cannot be produced later.
--
-- THREE FAILURE MODES, NOT ONE. A row can be unlinked (its recorded
-- predecessor hash is not its predecessor's hash), mismatched (its content no
-- longer hashes to its recorded hash) or drifted (a typed column no longer
-- agrees with the context envelope that was signed). They are counted apart
-- because they mean different things: the first says a row was removed or
-- inserted, the second that a row's body was edited, the third that someone
-- edited a column while leaving the hashed envelope alone.
--
-- VERSION 1 ROWS ARE NOT FAILURES. Rows written before 062 are reproduced
-- with the legacy formula pinned to UTC. If that reproduces, the row counts
-- as verified. If it does not, it counts as `legacy` -- the writer's session
-- timezone is not recoverable from the row, so a mismatch there is not
-- evidence of tampering and must not raise the same alarm.
--
-- INDEX COST. Nine indexes is a lot for one table. Audit volume is
-- administrator-scale -- one row per admin request, not per visitor -- so
-- the write amplification is paid by a path that already does more work
-- than an index insert. If read auditing ever moves to member routes this
-- decision has to be revisited.

BEGIN;

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
  ON public.audit_logs (created_at DESC, sequence DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_sequence_idx
  ON public.audit_logs (actor_user_id, sequence DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_sequence_idx
  ON public.audit_logs (action, sequence DESC);
CREATE INDEX IF NOT EXISTS audit_logs_feature_sequence_idx
  ON public.audit_logs (feature, sequence DESC) WHERE feature IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_target_sequence_idx
  ON public.audit_logs (target_id, sequence DESC) WHERE target_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_subject_sequence_idx
  ON public.audit_logs (subject_user_id, sequence DESC) WHERE subject_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_transaction_idx
  ON public.audit_logs (transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_request_idx
  ON public.audit_logs (request_id) WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_trace_idx
  ON public.audit_logs (trace_id) WHERE trace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_client_ip_idx
  ON public.audit_logs (client_ip, sequence DESC) WHERE client_ip IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.audit_chain_verifications (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  requested_by uuid REFERENCES public.users(id),
  from_sequence bigint NOT NULL,
  to_sequence bigint NOT NULL,
  checked_count bigint NOT NULL,
  verified_count bigint NOT NULL,
  legacy_count bigint NOT NULL,
  mismatch_count bigint NOT NULL,
  link_break_count bigint NOT NULL,
  column_drift_count bigint NOT NULL,
  first_bad_sequence bigint,
  status text NOT NULL CHECK (status IN ('passed', 'failed', 'empty')),
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

REVOKE ALL PRIVILEGES ON TABLE public.audit_chain_verifications
  FROM PUBLIC, moneyverse_app;

CREATE INDEX IF NOT EXISTS audit_chain_verifications_recent
  ON public.audit_chain_verifications (completed_at DESC);

CREATE OR REPLACE FUNCTION public.audit_reject_verification_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'audit chain verifications are append-only';
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.audit_chain_verifications'::pg_catalog.regclass
      AND trigger_row.tgname = 'audit_chain_verifications_immutable'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER audit_chain_verifications_immutable
      BEFORE UPDATE OR DELETE ON public.audit_chain_verifications
      FOR EACH ROW
      EXECUTE FUNCTION public.audit_reject_verification_mutation();
  END IF;
END;
$do$;

-- An address is narrowed rather than dropped: /24 and /48 still answer "was
-- this the same network" without handing a reader the household.
CREATE OR REPLACE FUNCTION public.audit_masked_ip(p_value inet)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT CASE
    WHEN p_value IS NULL THEN NULL
    WHEN pg_catalog.family(p_value) = 4
      THEN pg_catalog.network(pg_catalog.set_masklen(p_value, 24))::text
    ELSE pg_catalog.network(pg_catalog.set_masklen(p_value, 48))::text
  END
$$;

CREATE OR REPLACE FUNCTION public.audit_masked_context(p_context jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT CASE
    WHEN p_context IS NULL THEN '{}'::jsonb
    ELSE p_context
      || (CASE
            WHEN p_context ? 'clientIp'
              THEN pg_catalog.jsonb_build_object(
                'clientIp',
                public.audit_masked_ip(nullif(p_context ->> 'clientIp', '')::inet)
              )
            ELSE '{}'::jsonb
          END)
      || (CASE
            WHEN p_context ? 'userAgentHash'
              THEN pg_catalog.jsonb_build_object(
                'userAgentHash', pg_catalog.left(p_context ->> 'userAgentHash', 12)
              )
            ELSE '{}'::jsonb
          END)
  END
$$;

-- Do the typed columns still say what the signed envelope says? The digest
-- covers `context`, so a column edited on its own would otherwise pass a
-- hash check while changing what a search returns.
CREATE OR REPLACE FUNCTION public.audit_columns_match_context(p_row public.audit_logs)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    (p_row.trace_id::text IS NOT DISTINCT FROM nullif(p_row.context ->> 'traceId', ''))
    AND (p_row.session_hash IS NOT DISTINCT FROM nullif(p_row.context ->> 'sessionHash', ''))
    AND (p_row.feature IS NOT DISTINCT FROM nullif(p_row.context ->> 'feature', ''))
    AND (p_row.target_kind IS NOT DISTINCT FROM nullif(p_row.context ->> 'targetKind', ''))
    AND (p_row.subject_user_id::text IS NOT DISTINCT FROM nullif(p_row.context ->> 'subjectUserId', ''))
    AND (p_row.transaction_id::text IS NOT DISTINCT FROM nullif(p_row.context ->> 'transactionId', ''))
    AND (p_row.outcome IS NOT DISTINCT FROM nullif(p_row.context ->> 'outcome', ''))
    AND (p_row.response_status::text IS NOT DISTINCT FROM nullif(p_row.context ->> 'responseStatus', ''))
    AND (
      CASE
        WHEN p_row.client_ip IS NULL
          THEN nullif(p_row.context ->> 'clientIp', '') IS NULL
        ELSE nullif(p_row.context ->> 'clientIp', '')
          IN (p_row.client_ip::text, pg_catalog.host(p_row.client_ip))
      END
    )
$$;

-- Cursor pagination on `sequence`, which is the only total order the table
-- has. Offsets would skip or repeat rows as the chain grows underneath a
-- reader, and the reader here is looking for a specific row.
CREATE OR REPLACE FUNCTION public.admin_search_audit_events(
  p_actor uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_actor_filter uuid,
  p_subject_user_id uuid,
  p_feature text,
  p_action text,
  p_target_id uuid,
  p_transaction_id uuid,
  p_request_id uuid,
  p_trace_id uuid,
  p_client_ip inet,
  p_outcome text,
  p_cursor bigint,
  p_limit integer
)
RETURNS TABLE(
  sequence bigint,
  audit_id uuid,
  created_at timestamptz,
  hash_version smallint,
  actor_user_id uuid,
  action text,
  feature text,
  target_kind text,
  target_id uuid,
  subject_user_id uuid,
  transaction_id uuid,
  request_id uuid,
  trace_id uuid,
  session_hash text,
  client_ip text,
  outcome text,
  response_status integer,
  metadata jsonb,
  context jsonb,
  previous_integrity_hash text,
  integrity_hash text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 200);
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'audit visibility requires an administrator';
  END IF;

  IF p_action IS NOT NULL AND p_action !~ '^[a-z][a-z0-9_.:-]{0,119}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'action filter is malformed';
  END IF;

  IF p_feature IS NOT NULL AND p_feature !~ '^[a-z][a-z0-9_.:-]{0,63}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'feature filter is malformed';
  END IF;

  IF p_outcome IS NOT NULL AND p_outcome NOT IN ('success', 'failure', 'partial') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'outcome filter is malformed';
  END IF;

  RETURN QUERY
  SELECT
    audit_row.sequence,
    audit_row.id,
    audit_row.created_at,
    audit_row.hash_version,
    audit_row.actor_user_id,
    audit_row.action,
    audit_row.feature,
    audit_row.target_kind,
    audit_row.target_id,
    audit_row.subject_user_id,
    audit_row.transaction_id,
    audit_row.request_id,
    audit_row.trace_id,
    pg_catalog.left(audit_row.session_hash, 12),
    public.audit_masked_ip(audit_row.client_ip),
    audit_row.outcome,
    audit_row.response_status,
    audit_row.metadata,
    public.audit_masked_context(audit_row.context),
    audit_row.previous_integrity_hash,
    audit_row.integrity_hash
  FROM public.audit_logs AS audit_row
  WHERE (p_from IS NULL OR audit_row.created_at >= p_from)
    AND (p_to IS NULL OR audit_row.created_at < p_to)
    AND (p_actor_filter IS NULL OR audit_row.actor_user_id = p_actor_filter)
    AND (p_subject_user_id IS NULL OR audit_row.subject_user_id = p_subject_user_id)
    AND (p_feature IS NULL OR audit_row.feature = p_feature)
    AND (
      p_action IS NULL
      OR audit_row.action = p_action
      OR pg_catalog.starts_with(audit_row.action, p_action || '.')
    )
    AND (p_target_id IS NULL OR audit_row.target_id = p_target_id)
    AND (p_transaction_id IS NULL OR audit_row.transaction_id = p_transaction_id)
    AND (p_request_id IS NULL OR audit_row.request_id = p_request_id)
    AND (p_trace_id IS NULL OR audit_row.trace_id = p_trace_id)
    AND (p_client_ip IS NULL OR audit_row.client_ip = p_client_ip)
    AND (p_outcome IS NULL OR audit_row.outcome = p_outcome)
    AND (p_cursor IS NULL OR audit_row.sequence < p_cursor)
  ORDER BY audit_row.sequence DESC
  LIMIT v_limit;
END;
$$;

-- The only path to an unmasked row, and it pays for itself with an audit
-- entry before it returns one.
CREATE OR REPLACE FUNCTION public.admin_reveal_audit_event(
  p_actor uuid,
  p_audit_id uuid,
  p_reason text
)
RETURNS TABLE(
  sequence bigint,
  audit_id uuid,
  created_at timestamptz,
  actor_user_id uuid,
  action text,
  session_hash text,
  client_ip text,
  context jsonb,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_found boolean;
BEGIN
  IF p_actor IS NULL OR p_audit_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and audit id are required';
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  SELECT true INTO v_found
  FROM public.audit_logs AS audit_row
  WHERE audit_row.id = p_audit_id;

  IF NOT coalesce(v_found, false) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'audit event not found';
  END IF;

  PERFORM public.admin_append_audit_event(
    p_actor,
    'admin.audit.unmasked',
    p_audit_id,
    NULL,
    '{}'::jsonb,
    pg_catalog.jsonb_build_object(
      'feature', 'audit',
      'targetKind', 'audit_event',
      'reason', v_reason,
      'outcome', 'success'
    )
  );

  RETURN QUERY
  SELECT
    audit_row.sequence,
    audit_row.id,
    audit_row.created_at,
    audit_row.actor_user_id,
    audit_row.action,
    audit_row.session_hash,
    -- `host()`, not `::text`. The explicit cast runs `text(inet)`, which
    -- always prints the netmask, so a single address comes back as
    -- `203.0.113.7/32` -- a suffix an operator has to learn to ignore.
    -- Audit rows only ever hold a host address; `audit_masked_ip` keeps the
    -- cast because there the /24 is the whole point.
    pg_catalog.host(audit_row.client_ip),
    audit_row.context,
    audit_row.metadata
  FROM public.audit_logs AS audit_row
  WHERE audit_row.id = p_audit_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_verify_audit_chain(
  p_actor uuid,
  p_from_sequence bigint,
  p_to_sequence bigint
)
RETURNS TABLE(
  verification_id uuid,
  from_sequence bigint,
  to_sequence bigint,
  checked_count bigint,
  verified_count bigint,
  legacy_count bigint,
  mismatch_count bigint,
  link_break_count bigint,
  column_drift_count bigint,
  first_bad_sequence bigint,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_max_span constant bigint := 100000;
  v_started_at timestamptz := pg_catalog.clock_timestamp();
  v_from bigint;
  v_to bigint;
  v_row public.audit_logs%ROWTYPE;
  v_expected_previous text;
  v_expected_sequence bigint;
  v_recomputed text;
  v_checked bigint := 0;
  v_verified bigint := 0;
  v_legacy bigint := 0;
  v_mismatch bigint := 0;
  v_link_break bigint := 0;
  v_column_drift bigint := 0;
  v_first_bad bigint;
  v_status text;
  v_verification_id uuid;
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'chain verification requires an administrator';
  END IF;

  SELECT coalesce(p_from_sequence, min(audit_row.sequence)),
         coalesce(p_to_sequence, max(audit_row.sequence))
  INTO v_from, v_to
  FROM public.audit_logs AS audit_row;

  IF v_from IS NULL OR v_to IS NULL OR v_to < v_from THEN
    v_from := coalesce(v_from, 0);
    v_to := coalesce(v_to, 0);
    v_status := 'empty';
  ELSIF v_to - v_from >= v_max_span THEN
    RAISE EXCEPTION USING
      ERRCODE = '22023',
      MESSAGE = 'verify at most 100000 rows per call; narrow the sequence window';
  END IF;

  IF v_status IS DISTINCT FROM 'empty' THEN
    SELECT audit_row.integrity_hash
    INTO v_expected_previous
    FROM public.audit_logs AS audit_row
    WHERE audit_row.sequence < v_from
    ORDER BY audit_row.sequence DESC
    LIMIT 1;

    v_expected_sequence := v_from;

    FOR v_row IN
      SELECT audit_row.*
      FROM public.audit_logs AS audit_row
      WHERE audit_row.sequence BETWEEN v_from AND v_to
      ORDER BY audit_row.sequence
    LOOP
      v_checked := v_checked + 1;

      IF v_row.sequence <> v_expected_sequence
        OR v_row.previous_integrity_hash IS DISTINCT FROM v_expected_previous THEN
        v_link_break := v_link_break + 1;
        v_first_bad := coalesce(v_first_bad, v_row.sequence);
      END IF;

      IF v_row.hash_version >= 2 THEN
        v_recomputed := public.audit_event_digest(
          v_row.sequence,
          v_row.previous_integrity_hash,
          v_row.actor_user_id,
          v_row.action,
          v_row.target_id,
          v_row.request_id,
          v_row.metadata,
          v_row.created_at,
          v_row.context
        );

        IF v_recomputed = v_row.integrity_hash THEN
          v_verified := v_verified + 1;
        ELSE
          v_mismatch := v_mismatch + 1;
          v_first_bad := coalesce(v_first_bad, v_row.sequence);
        END IF;

        IF NOT public.audit_columns_match_context(v_row) THEN
          v_column_drift := v_column_drift + 1;
          v_first_bad := coalesce(v_first_bad, v_row.sequence);
        END IF;
      ELSE
        v_recomputed := public.audit_event_digest_v1(
          v_row.previous_integrity_hash,
          v_row.actor_user_id,
          v_row.action,
          v_row.target_id,
          v_row.request_id,
          v_row.metadata,
          v_row.created_at
        );

        IF v_recomputed = v_row.integrity_hash THEN
          v_verified := v_verified + 1;
        ELSE
          v_legacy := v_legacy + 1;
        END IF;
      END IF;

      v_expected_previous := v_row.integrity_hash;
      v_expected_sequence := v_row.sequence + 1;
    END LOOP;

    IF v_checked = 0 THEN
      v_status := 'empty';
    ELSIF v_mismatch > 0 OR v_link_break > 0 OR v_column_drift > 0 THEN
      v_status := 'failed';
    ELSE
      v_status := 'passed';
    END IF;
  END IF;

  INSERT INTO public.audit_chain_verifications (
    requested_by,
    from_sequence,
    to_sequence,
    checked_count,
    verified_count,
    legacy_count,
    mismatch_count,
    link_break_count,
    column_drift_count,
    first_bad_sequence,
    status,
    started_at,
    detail
  ) VALUES (
    p_actor,
    v_from,
    v_to,
    v_checked,
    v_verified,
    v_legacy,
    v_mismatch,
    v_link_break,
    v_column_drift,
    v_first_bad,
    v_status,
    v_started_at,
    pg_catalog.jsonb_build_object('requestedFrom', p_from_sequence, 'requestedTo', p_to_sequence)
  )
  RETURNING id INTO v_verification_id;

  verification_id := v_verification_id;
  from_sequence := v_from;
  to_sequence := v_to;
  checked_count := v_checked;
  verified_count := v_verified;
  legacy_count := v_legacy;
  mismatch_count := v_mismatch;
  link_break_count := v_link_break;
  column_drift_count := v_column_drift;
  first_bad_sequence := v_first_bad;
  status := v_status;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_audit_chain_verifications(
  p_actor uuid,
  p_limit integer
)
RETURNS TABLE(
  verification_id uuid,
  requested_by uuid,
  from_sequence bigint,
  to_sequence bigint,
  checked_count bigint,
  verified_count bigint,
  legacy_count bigint,
  mismatch_count bigint,
  link_break_count bigint,
  column_drift_count bigint,
  first_bad_sequence bigint,
  status text,
  started_at timestamptz,
  completed_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'audit visibility requires an administrator';
  END IF;

  RETURN QUERY
  SELECT
    verification_row.id,
    verification_row.requested_by,
    verification_row.from_sequence,
    verification_row.to_sequence,
    verification_row.checked_count,
    verification_row.verified_count,
    verification_row.legacy_count,
    verification_row.mismatch_count,
    verification_row.link_break_count,
    verification_row.column_drift_count,
    verification_row.first_bad_sequence,
    verification_row.status,
    verification_row.started_at,
    verification_row.completed_at
  FROM public.audit_chain_verifications AS verification_row
  ORDER BY verification_row.completed_at DESC
  LIMIT v_limit;
END;
$$;

ALTER TABLE public.audit_chain_verifications OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_reject_verification_mutation() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_masked_ip(inet) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_masked_context(jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_columns_match_context(public.audit_logs) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_search_audit_events(uuid, timestamptz, timestamptz, uuid, uuid, text, text, uuid, uuid, uuid, uuid, inet, text, bigint, integer)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_reveal_audit_event(uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_verify_audit_chain(uuid, bigint, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_list_audit_chain_verifications(uuid, integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.audit_reject_verification_mutation()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_masked_ip(inet) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_masked_context(jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_columns_match_context(public.audit_logs)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_search_audit_events(uuid, timestamptz, timestamptz, uuid, uuid, text, text, uuid, uuid, uuid, uuid, inet, text, bigint, integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_reveal_audit_event(uuid, uuid, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_verify_audit_chain(uuid, bigint, bigint)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_audit_chain_verifications(uuid, integer)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_search_audit_events(uuid, timestamptz, timestamptz, uuid, uuid, text, text, uuid, uuid, uuid, uuid, inet, text, bigint, integer)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_reveal_audit_event(uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_verify_audit_chain(uuid, bigint, bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_audit_chain_verifications(uuid, integer) TO moneyverse_app;

COMMIT;
