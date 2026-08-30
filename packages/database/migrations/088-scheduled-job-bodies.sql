-- The jobs themselves: reconciliation, the hourly sweep, and the daily
-- verification of the audit chain.
--
-- Each one is a function the runner calls after `schedule_claim_run` has
-- given it the window, so the runner holds no logic worth testing and the
-- work stays where the data is.
--
-- RECONCILIATION RUNS AS ITS OWN ROLE. 018 checks `session_user` against
-- `moneyverse_reconciler`, deliberately: a SECURITY DEFINER wrapper owned by
-- the migrator does NOT pass that check, so the web role cannot write a
-- snapshot even by accident. The worker therefore needs its own connection,
-- exactly as the status collector has had since 050. What that role could not
-- do until now is react to what it found, and reacting is the point --
-- spec 7 wants a failed reconciliation to put rewards into safe mode.

BEGIN;

-- 064's verification, with the administrator check lifted out of it.
--
-- The daily run has no actor: nobody asked for it, it is the schedule. The
-- body is here once and `admin_verify_audit_chain` is now a role check in
-- front of it, so the two callers cannot drift into verifying different
-- things -- which is the failure that would matter most, because it would be
-- invisible until the day the chain was actually broken.
CREATE OR REPLACE FUNCTION public.audit_verify_chain_window(
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
  -- Clamp to rows that exist, before the span is measured. Asking to verify
  -- from sequence 1 on a chain whose first surviving row is 40 is a reasonable
  -- request; answering it with an invented link break would report a forgery,
  -- and measuring the span against the raw request would refuse a window that
  -- covers ten rows because the caller wrote a large upper bound.
  SELECT greatest(coalesce(p_from_sequence, min(audit_row.sequence)), min(audit_row.sequence)),
         least(coalesce(p_to_sequence, max(audit_row.sequence)), max(audit_row.sequence))
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
          v_row.id,
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
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'chain verification requires an administrator';
  END IF;

  RETURN QUERY
  SELECT * FROM public.audit_verify_chain_window(p_actor, p_from_sequence, p_to_sequence);
END;
$$;

-- Takes the snapshot and acts on it. Runs as the reconciler.
CREATE OR REPLACE FUNCTION public.economy_run_reconciliation_check()
RETURNS TABLE(snapshot_id uuid, integrity_ok boolean, tripped text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_snapshot uuid;
  v_ok boolean;
  v_delta numeric;
  v_feature text;
  v_tripped text[] := ARRAY[]::text[];
BEGIN
  -- Not wrapped: 018 checks the session's login role, and this function being
  -- SECURITY DEFINER does not change it. A caller that is not the reconciler
  -- gets 018's own 42501, which is the answer it should get.
  v_snapshot := public.economy_record_reconciliation_snapshot();

  SELECT snapshot_row.integrity_ok, snapshot_row.balance_total_delta_amount
  INTO v_ok, v_delta
  FROM public.economy_reconciliation_snapshots AS snapshot_row
  WHERE snapshot_row.id = v_snapshot;

  IF v_ok THEN
    snapshot_id := v_snapshot;
    integrity_ok := true;
    tripped := v_tripped;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Spec 7: a ledger that does not reconcile stops paying out before anybody
  -- decides anything. Only features that are on are moved, and only to safe
  -- mode; coming back is a decision with a reason, and that is the superadmin's.
  FOREACH v_feature IN ARRAY ARRAY['casino', 'economy_auto_policy'] LOOP
    IF public.economy_trip_safe_mode(
         v_feature, 'ledger reconciliation failed', v_snapshot) THEN
      v_tripped := v_tripped || v_feature;
    END IF;
  END LOOP;

  PERFORM public.admin_raise_alert(
    'economy.reconciliation.failed',
    'critical',
    'the ledger did not reconcile',
    v_snapshot::text,
    pg_catalog.jsonb_build_object(
      'snapshotId', v_snapshot, 'balanceDelta', v_delta, 'tripped', pg_catalog.to_jsonb(v_tripped)
    )
  );

  snapshot_id := v_snapshot;
  integrity_ok := false;
  tripped := v_tripped;
  RETURN NEXT;
END;
$$;

-- The hourly look for something out of the ordinary. Everything it reads is
-- the ledger; nothing here keeps a counter of its own.
CREATE OR REPLACE FUNCTION public.economy_run_anomaly_sweep()
RETURNS TABLE(raised integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_window text := public.schedule_period_key('hourly', pg_catalog.clock_timestamp());
  v_issued numeric;
  v_typical numeric;
  v_largest numeric;
  v_raised integer := 0;
BEGIN
  SELECT
    coalesce(sum(posting_row.amount::numeric) FILTER (
      WHERE transaction_row.created_at > pg_catalog.clock_timestamp() - interval '1 hour'), 0),
    coalesce(sum(posting_row.amount::numeric) FILTER (
      WHERE transaction_row.created_at > pg_catalog.clock_timestamp() - interval '7 days'), 0) / 168
  INTO v_issued, v_typical
  FROM public.ledger_postings AS posting_row
  JOIN public.ledger_transactions AS transaction_row ON transaction_row.id = posting_row.transaction_id
  JOIN public.accounts AS account_row ON account_row.id = posting_row.account_id
  WHERE account_row.account_type = 'MINT'::public.account_type
    AND posting_row.direction = 'credit'::public.posting_direction;

  -- Four times the trailing hourly mean, and only once there is a mean worth
  -- comparing against. A quiet week would otherwise make every first payout
  -- of the day an anomaly.
  IF v_typical > 100 AND v_issued > v_typical * 4 THEN
    IF public.admin_raise_alert(
         'economy.issuance.spike', 'warning',
         'issuance this hour is well above the weekly average',
         v_window,
         pg_catalog.jsonb_build_object('issued', v_issued, 'typical', v_typical)) THEN
      v_raised := v_raised + 1;
    END IF;
  END IF;

  SELECT coalesce(max(posting_row.amount::numeric), 0) INTO v_largest
  FROM public.ledger_postings AS posting_row
  JOIN public.ledger_transactions AS transaction_row ON transaction_row.id = posting_row.transaction_id
  WHERE transaction_row.type = 'ADMIN_ADJUSTMENT'
    AND transaction_row.created_at > pg_catalog.clock_timestamp() - interval '1 hour';

  IF v_largest >= 100000 THEN
    IF public.admin_raise_alert(
         'economy.correction.large', 'warning',
         'a large administrative correction was posted',
         v_window,
         pg_catalog.jsonb_build_object('amount', v_largest)) THEN
      v_raised := v_raised + 1;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.admin_login_attempts AS attempt_row
    WHERE attempt_row.decision = 'block'
      AND attempt_row.created_at > pg_catalog.clock_timestamp() - interval '1 hour'
    GROUP BY attempt_row.user_id
    HAVING count(*) >= 5
  ) THEN
    IF public.admin_raise_alert(
         'admin.login.failures', 'warning',
         'repeated administrator sign-in failures in the last hour',
         v_window, '{}'::jsonb) THEN
      v_raised := v_raised + 1;
    END IF;
  END IF;

  raised := v_raised;
  RETURN NEXT;
END;
$$;

-- The daily walk of the audit chain. It verifies the window that has been
-- appended since the last verification rather than the whole chain, because
-- the whole chain grows without bound and 064 refuses more than 100000 rows
-- in one call for the same reason.
CREATE OR REPLACE FUNCTION public.audit_run_daily_verification()
RETURNS TABLE(verification_id uuid, status text, checked_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_from bigint;
  v_to bigint;
  v_result record;
BEGIN
  SELECT coalesce(max(previous_row.to_sequence), 0) + 1 INTO v_from
  FROM public.audit_chain_verifications AS previous_row
  WHERE previous_row.status <> 'empty';

  SELECT max(audit_row.sequence) INTO v_to FROM public.audit_logs AS audit_row;

  IF v_to IS NULL OR v_to < v_from THEN
    verification_id := NULL;
    status := 'empty';
    checked_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  v_to := least(v_to, v_from + 99999);

  SELECT * INTO v_result
  FROM public.audit_verify_chain_window(NULL, v_from, v_to);

  IF v_result.status = 'failed' THEN
    PERFORM public.admin_raise_alert(
      'audit.chain.failed', 'critical',
      'the audit chain did not verify',
      v_result.verification_id::text,
      pg_catalog.jsonb_build_object(
        'firstBadSequence', v_result.first_bad_sequence,
        'mismatch', v_result.mismatch_count,
        'linkBreaks', v_result.link_break_count,
        'columnDrift', v_result.column_drift_count
      )
    );
  END IF;

  verification_id := v_result.verification_id;
  status := v_result.status;
  checked_count := v_result.checked_count;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.audit_verify_chain_window(uuid, bigint, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_verify_audit_chain(uuid, bigint, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_run_reconciliation_check() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_run_anomaly_sweep() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_run_daily_verification() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.audit_verify_chain_window(uuid, bigint, bigint)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_run_reconciliation_check()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_run_anomaly_sweep() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_run_daily_verification() FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.economy_run_anomaly_sweep() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.audit_run_daily_verification() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_run_reconciliation_check() TO moneyverse_reconciler;

COMMIT;
