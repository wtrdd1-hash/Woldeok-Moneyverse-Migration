-- Paying many members at once, with the preview the spec asks for first.
--
-- Spec 14.9: a bulk operation shows its target count, its total and the
-- policy version before it runs, and afterwards records which targets
-- succeeded, which failed and which were excluded, each with a reason. A
-- summary line saying "1,240 paid" is not a record of anything; the rows
-- below are.
--
-- ONE KEY PER TARGET, DERIVED. The batch has an idempotency key and so does
-- every payment inside it, derived from the batch key and the member. A
-- retried batch therefore re-uses each member's key, `economy_post_transaction`
-- recognises it, and nobody is paid twice -- including in the case that
-- matters, where the batch died halfway through.
--
-- A MEMBER WHO CANNOT BE PAID IS NOT A FAILED BATCH. A closed or frozen
-- account, a member restricted this morning: each is recorded as its own
-- outcome and the batch continues. The alternative -- one bad account aborts
-- everything -- means the operator retries and the first nine hundred
-- payments happen again, or would if the keys were not derived.

BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_bulk_payouts (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  actor_user_id uuid NOT NULL REFERENCES public.users(id),
  filter jsonb NOT NULL,
  amount bigint NOT NULL CHECK (amount BETWEEN 1 AND 1000000),
  reason text NOT NULL,
  policy_version text,
  target_count integer NOT NULL CHECK (target_count >= 0),
  paid_count integer NOT NULL CHECK (paid_count >= 0),
  skipped_count integer NOT NULL CHECK (skipped_count >= 0),
  failed_count integer NOT NULL CHECK (failed_count >= 0),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE TABLE IF NOT EXISTS public.admin_bulk_payout_items (
  payout_id uuid NOT NULL REFERENCES public.admin_bulk_payouts(id),
  user_id uuid NOT NULL REFERENCES public.users(id),
  outcome text NOT NULL CHECK (outcome IN ('paid', 'skipped', 'failed')),
  detail text NOT NULL DEFAULT '',
  transaction_id uuid REFERENCES public.ledger_transactions(id),
  PRIMARY KEY (payout_id, user_id)
);

REVOKE ALL PRIVILEGES ON TABLE public.admin_bulk_payouts, public.admin_bulk_payout_items
  FROM PUBLIC, moneyverse_app;

-- A closed filter. An unrecognised key is refused rather than ignored,
-- because a filter that is quietly wider than the operator believes is how a
-- payment reaches everybody.
CREATE OR REPLACE FUNCTION public.admin_bulk_payout_targets(p_filter jsonb)
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_allowed constant text[] := ARRAY['userIds', 'minWorkCompletions', 'stageCode'];
  v_offender text;
  v_ids uuid[];
  v_minimum integer;
  v_stage text;
BEGIN
  IF p_filter IS NULL OR pg_catalog.jsonb_typeof(p_filter) <> 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'the filter must be an object';
  END IF;

  SELECT keys.filter_key INTO v_offender
  FROM pg_catalog.jsonb_object_keys(p_filter) AS keys(filter_key)
  WHERE keys.filter_key <> ALL (v_allowed)
  LIMIT 1;

  IF v_offender IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'unknown filter field: ' || coalesce(public.audit_normalize_text(v_offender, 64), '?');
  END IF;

  IF p_filter ? 'userIds' THEN
    IF pg_catalog.jsonb_typeof(p_filter -> 'userIds') <> 'array' THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'userIds must be an array';
    END IF;
    SELECT pg_catalog.array_agg(entry.value::text::uuid) INTO v_ids
    FROM pg_catalog.jsonb_array_elements_text(p_filter -> 'userIds') AS entry(value);
  END IF;

  v_minimum := nullif(p_filter ->> 'minWorkCompletions', '')::integer;
  v_stage := nullif(p_filter ->> 'stageCode', '');

  RETURN QUERY
  SELECT member_row.id
  FROM public.users AS member_row
  WHERE member_row.status = 'active'::public.user_status
    AND (v_ids IS NULL OR member_row.id = ANY (v_ids))
    AND (
      v_minimum IS NULL
      OR (SELECT count(*) FROM public.work_reward_receipts AS receipt_row
          WHERE receipt_row.user_id = member_row.id) >= v_minimum
    )
    AND (
      v_stage IS NULL
      OR EXISTS (
        SELECT 1 FROM public.user_progression AS progression_row
        WHERE progression_row.user_id = member_row.id
          AND progression_row.stage_code = v_stage
      )
    )
  ORDER BY member_row.id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_preview_bulk_payout(
  p_actor uuid,
  p_filter jsonb,
  p_amount bigint
)
RETURNS TABLE(
  target_count bigint,
  payable_count bigint,
  total_amount bigint,
  policy_version text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_amount IS NULL OR p_amount < 1 OR p_amount > 1000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'an amount between 1 and 1000000 is required';
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  RETURN QUERY
  SELECT
    count(*),
    -- Payable, not merely matched: a member with no active cash account is in
    -- the target set and cannot be paid, and the operator should see that
    -- before they confirm rather than in the outcome table afterwards.
    count(*) FILTER (WHERE account_row.id IS NOT NULL),
    count(*) FILTER (WHERE account_row.id IS NOT NULL) * p_amount,
    (SELECT active.version FROM public.economy_active_policy() AS active)
  FROM public.admin_bulk_payout_targets(p_filter) AS target
  LEFT JOIN public.accounts AS account_row
    ON account_row.owner_user_id = target.user_id
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_execute_bulk_payout(
  p_key uuid,
  p_actor uuid,
  p_filter jsonb,
  p_amount bigint,
  p_reason text
)
RETURNS TABLE(
  payout_id uuid,
  target_count integer,
  paid_count integer,
  skipped_count integer,
  failed_count integer,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  c_maximum_targets constant integer := 5000;
  v_existing public.admin_bulk_payouts%ROWTYPE;
  v_reason text;
  v_policy text;
  v_mint uuid;
  v_payout uuid;
  v_target record;
  v_cash uuid;
  v_transaction uuid;
  v_targets integer := 0;
  v_paid integer := 0;
  v_skipped integer := 0;
  v_failed integer := 0;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_amount IS NULL
    OR p_amount < 1 OR p_amount > 1000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'an amount between 1 and 1000000 is required';
  END IF;

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_execute_bulk_payout:' || p_key::text, 0)
  );

  SELECT payout_row.* INTO v_existing
  FROM public.admin_bulk_payouts AS payout_row
  WHERE payout_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'this payout belongs to another administrator';
    END IF;
    RETURN QUERY SELECT v_existing.id, v_existing.target_count, v_existing.paid_count,
                        v_existing.skipped_count, v_existing.failed_count, true;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  SELECT count(*) INTO v_targets
  FROM public.admin_bulk_payout_targets(p_filter) AS target;

  IF v_targets > c_maximum_targets THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'narrow the filter: at most 5000 members in one payout';
  END IF;

  SELECT account_row.id INTO v_mint
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'mint'
    AND account_row.account_type = 'MINT'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_mint IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'the mint account is unavailable';
  END IF;

  SELECT active.version INTO v_policy FROM public.economy_active_policy() AS active;

  INSERT INTO public.admin_bulk_payouts (
    idempotency_key, actor_user_id, filter, amount, reason, policy_version,
    target_count, paid_count, skipped_count, failed_count
  ) VALUES (p_key, p_actor, p_filter, p_amount, v_reason, v_policy, v_targets, 0, 0, 0)
  RETURNING admin_bulk_payouts.id INTO v_payout;

  FOR v_target IN SELECT target.user_id FROM public.admin_bulk_payout_targets(p_filter) AS target
  LOOP
    SELECT account_row.id INTO v_cash
    FROM public.accounts AS account_row
    WHERE account_row.owner_user_id = v_target.user_id
      AND account_row.account_type = 'USER_CASH'::public.account_type
      AND account_row.status = 'active'::public.account_status;

    IF v_cash IS NULL THEN
      v_skipped := v_skipped + 1;
      INSERT INTO public.admin_bulk_payout_items (payout_id, user_id, outcome, detail)
      VALUES (v_payout, v_target.user_id, 'skipped', 'no active cash account');
      CONTINUE;
    END IF;

    BEGIN
      -- Derived from the batch key and the member, so a retry of the batch
      -- re-uses it and economy_post_transaction returns the same transaction
      -- rather than paying again.
      SELECT public.economy_post_transaction(
        pg_catalog.md5(p_key::text || ':' || v_target.user_id::text)::uuid,
        'ADMIN_ADJUSTMENT',
        p_actor,
        v_policy,
        pg_catalog.jsonb_build_array(
          pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', p_amount, 'direction', 'credit'),
          pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', p_amount, 'direction', 'debit')
        ),
        'economy.bulk_payout.paid',
        pg_catalog.jsonb_build_object('payoutId', v_payout, 'amount', p_amount)
      ) INTO v_transaction;

      v_paid := v_paid + 1;
      INSERT INTO public.admin_bulk_payout_items (payout_id, user_id, outcome, transaction_id)
      VALUES (v_payout, v_target.user_id, 'paid', v_transaction);
    EXCEPTION WHEN others THEN
      -- One member who cannot be paid is not a failed batch, and the reason
      -- belongs on their row rather than in a log nobody reads.
      v_failed := v_failed + 1;
      INSERT INTO public.admin_bulk_payout_items (payout_id, user_id, outcome, detail)
      VALUES (v_payout, v_target.user_id, 'failed',
              coalesce(public.audit_normalize_text(SQLERRM, 200), SQLSTATE));
    END;
  END LOOP;

  UPDATE public.admin_bulk_payouts AS payout_row
  SET paid_count = v_paid, skipped_count = v_skipped, failed_count = v_failed
  WHERE payout_row.id = v_payout;

  PERFORM public.admin_append_audit_event(
    p_actor,
    'economy.bulk_payout.executed',
    v_payout,
    p_key,
    pg_catalog.jsonb_build_object('filter', p_filter, 'amount', p_amount, 'policyVersion', v_policy),
    pg_catalog.jsonb_build_object(
      'feature', 'economy',
      'targetKind', 'bulk_payout',
      'reason', v_reason,
      'targetCount', v_targets,
      'bulkTotal', v_targets,
      'bulkSucceeded', v_paid,
      'bulkSkipped', v_skipped,
      'bulkFailed', v_failed,
      'amount', p_amount * v_paid,
      'outcome', CASE WHEN v_failed > 0 THEN 'partial' ELSE 'success' END
    )
  );

  RETURN QUERY SELECT v_payout, v_targets, v_paid, v_skipped, v_failed, false;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_bulk_payout_report(
  p_actor uuid,
  p_payout uuid
)
RETURNS TABLE(user_id uuid, outcome text, detail text, transaction_id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_payout IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and payout are required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'payout visibility requires an administrator';
  END IF;

  RETURN QUERY
  SELECT item_row.user_id, item_row.outcome, item_row.detail, item_row.transaction_id
  FROM public.admin_bulk_payout_items AS item_row
  WHERE item_row.payout_id = p_payout
  ORDER BY item_row.outcome, item_row.user_id;
END;
$$;

ALTER TABLE public.admin_bulk_payouts OWNER TO moneyverse_migrator;
ALTER TABLE public.admin_bulk_payout_items OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_bulk_payout_targets(jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_preview_bulk_payout(uuid, jsonb, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_execute_bulk_payout(uuid, uuid, jsonb, bigint, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_bulk_payout_report(uuid, uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_bulk_payout_targets(jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_preview_bulk_payout(uuid, jsonb, bigint)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_execute_bulk_payout(uuid, uuid, jsonb, bigint, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_bulk_payout_report(uuid, uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_preview_bulk_payout(uuid, jsonb, bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_execute_bulk_payout(uuid, uuid, jsonb, bigint, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_bulk_payout_report(uuid, uuid) TO moneyverse_app;

COMMIT;
