-- Merge an OAuth-created account fork without rewriting history.
--
-- A rotated data-encryption key used to make a returning identity unfindable.
-- Migration 162 prevents the next fork; this operation repairs an existing
-- one. Historical audit and ledger actor ids deliberately keep naming the
-- account that performed the action. Spendable balances move through the
-- double-entry ledger, while current member-owned records move to the account
-- that will remain usable.

BEGIN;

CREATE TABLE public.admin_account_merge_events (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  actor_user_id uuid NOT NULL REFERENCES public.users(id),
  kept_user_id uuid NOT NULL REFERENCES public.users(id),
  merged_user_id uuid NOT NULL UNIQUE REFERENCES public.users(id),
  transferred_amount bigint NOT NULL CHECK (transferred_amount >= 0),
  transfer_transaction_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CHECK (kept_user_id <> merged_user_id)
);

REVOKE ALL PRIVILEGES ON TABLE public.admin_account_merge_events FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.admin_account_merge_events_immutable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'account merge history is append-only';
END;
$$;

CREATE TRIGGER admin_account_merge_events_immutable
BEFORE UPDATE OR DELETE ON public.admin_account_merge_events
FOR EACH ROW EXECUTE FUNCTION public.admin_account_merge_events_immutable();

CREATE FUNCTION public.admin_merge_forked_member_account(
  p_key uuid,
  p_actor uuid,
  p_keep uuid,
  p_merge uuid
)
RETURNS TABLE(
  kept_user_id uuid,
  merged_user_id uuid,
  transferred_amount bigint,
  transfer_transaction_ids uuid[],
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_source record;
  v_target_account uuid;
  v_transaction uuid;
  v_transactions uuid[] := '{}'::uuid[];
  v_total bigint := 0;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_keep IS NULL OR p_merge IS NULL OR p_keep = p_merge THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'valid distinct account merge ids are required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:account-merge:' || p_key::text, 0)
  );

  SELECT event_row.kept_user_id, event_row.merged_user_id,
         event_row.transferred_amount, event_row.transfer_transaction_ids
  INTO kept_user_id, merged_user_id, transferred_amount, transfer_transaction_ids
  FROM public.admin_account_merge_events AS event_row
  WHERE event_row.idempotency_key = p_key;
  IF FOUND THEN
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS actor_row
    JOIN public.user_roles AS role_row ON role_row.user_id = actor_row.id
    WHERE actor_row.id = p_actor
      AND actor_row.status = 'active'::public.user_status
      AND role_row.role = 'superadmin'::public.admin_role
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'superadmin role required';
  END IF;

  PERFORM 1 FROM public.users AS user_row
  WHERE user_row.id IN (p_keep, p_merge)
  ORDER BY user_row.id
  FOR UPDATE;
  IF (SELECT count(*) FROM public.users AS user_row
      WHERE user_row.id IN (p_keep, p_merge)
        AND user_row.status = 'active'::public.user_status) <> 2 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'two active member accounts are required';
  END IF;

  -- These carry ownership or unsettled state that cannot be combined by a
  -- generic account repair. Refuse loudly instead of guessing.
  IF EXISTS (SELECT 1 FROM public.user_items WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.virtual_stock_positions WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.virtual_bank_loans WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.virtual_bank_bonds WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.virtual_business_ownerships WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.npc_relationships WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.collection_entries WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.user_titles WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.member_board_posts WHERE author_user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.member_board_comments WHERE author_user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.virtual_bank_loans WHERE user_id = p_merge)
    OR EXISTS (SELECT 1 FROM public.shop_upkeep_arrears WHERE user_id = p_merge) THEN
    RAISE EXCEPTION USING ERRCODE = '55000',
      MESSAGE = 'the account has ownership or unsettled records that require a specific merge policy';
  END IF;

  -- A balance never changes owner by UPDATE. The old account remains beside
  -- its historical postings at zero; the surviving account receives a new,
  -- balanced transfer transaction.
  FOR v_source IN
    SELECT account_row.id, account_row.account_type, balance_row.available_amount
    FROM public.accounts AS account_row
    JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    WHERE account_row.owner_user_id = p_merge
      AND account_row.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
      AND account_row.status = 'active'::public.account_status
      AND balance_row.available_amount > 0
    ORDER BY account_row.id
    FOR UPDATE OF account_row, balance_row
  LOOP
    SELECT target_row.id INTO v_target_account
    FROM public.accounts AS target_row
    WHERE target_row.owner_user_id = p_keep
      AND target_row.account_type = v_source.account_type
      AND target_row.status = 'active'::public.account_status
    FOR UPDATE;
    IF v_target_account IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'surviving account wallet is incomplete';
    END IF;

    SELECT public.economy_post_transaction(
      pg_catalog.gen_random_uuid(),
      'ACCOUNT_MERGE_TRANSFER',
      p_actor,
      NULL,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('accountId', v_source.id, 'amount', v_source.available_amount, 'direction', 'credit'),
        pg_catalog.jsonb_build_object('accountId', v_target_account, 'amount', v_source.available_amount, 'direction', 'debit')
      ),
      'economy.account.merge_transfer',
      pg_catalog.jsonb_build_object('keptUserId', p_keep, 'mergedUserId', p_merge)
    ) INTO v_transaction;
    v_transactions := pg_catalog.array_append(v_transactions, v_transaction);
    v_total := v_total + v_source.available_amount;
  END LOOP;

  -- Keep the member's chosen profile name on p_keep. OAuth display names are
  -- moved unchanged and are never allowed to overwrite that chosen name.
  UPDATE public.identities SET user_id = p_keep WHERE user_id = p_merge;
  UPDATE public.auth_sessions SET user_id = p_keep WHERE user_id = p_merge;

  INSERT INTO public.user_roles(user_id, role)
  SELECT p_keep, role_row.role FROM public.user_roles AS role_row WHERE role_row.user_id = p_merge
  ON CONFLICT DO NOTHING;
  DELETE FROM public.user_roles WHERE user_id = p_merge;

  INSERT INTO public.user_consents(user_id, consent_version_id, agreed_at, age_confirmed)
  SELECT p_keep, consent_row.consent_version_id, consent_row.agreed_at, consent_row.age_confirmed
  FROM public.user_consents AS consent_row WHERE consent_row.user_id = p_merge
  ON CONFLICT (user_id, consent_version_id) DO UPDATE
    SET agreed_at = greatest(public.user_consents.agreed_at, EXCLUDED.agreed_at),
        age_confirmed = public.user_consents.age_confirmed OR EXCLUDED.age_confirmed;
  DELETE FROM public.user_consents WHERE user_id = p_merge;

  INSERT INTO public.user_progression(user_id, stage_code, reached_at, updated_at)
  SELECT p_keep, progression_row.stage_code, progression_row.reached_at, progression_row.updated_at
  FROM public.user_progression AS progression_row WHERE progression_row.user_id = p_merge
  ON CONFLICT (user_id) DO NOTHING;
  DELETE FROM public.user_progression WHERE user_id = p_merge;

  INSERT INTO public.user_job_progress(user_id, job_type, experience, level, selected_at, changed_at, is_active)
  SELECT p_keep, progress_row.job_type, progress_row.experience, progress_row.level,
         progress_row.selected_at, progress_row.changed_at, progress_row.is_active
  FROM public.user_job_progress AS progress_row WHERE progress_row.user_id = p_merge
  ON CONFLICT (user_id, job_type) DO UPDATE
    SET experience = public.user_job_progress.experience + EXCLUDED.experience,
        level = greatest(public.user_job_progress.level, EXCLUDED.level),
        selected_at = least(public.user_job_progress.selected_at, EXCLUDED.selected_at),
        changed_at = greatest(public.user_job_progress.changed_at, EXCLUDED.changed_at),
        is_active = public.user_job_progress.is_active OR EXCLUDED.is_active;
  DELETE FROM public.user_job_progress WHERE user_id = p_merge;

  INSERT INTO public.work_reward_windows(user_id, window_start, window_kind, paid_amount)
  SELECT p_keep, window_row.window_start, window_row.window_kind, window_row.paid_amount
  FROM public.work_reward_windows AS window_row WHERE window_row.user_id = p_merge
  ON CONFLICT (user_id, window_start, window_kind) DO UPDATE
    SET paid_amount = public.work_reward_windows.paid_amount + EXCLUDED.paid_amount;
  DELETE FROM public.work_reward_windows WHERE user_id = p_merge;

  INSERT INTO public.member_activity_signals(
    user_id, last_work_at, repeated_task_count, last_shop_purchase_at,
    last_business_management_at, updated_at
  )
  SELECT p_keep, signal_row.last_work_at, signal_row.repeated_task_count,
         signal_row.last_shop_purchase_at, signal_row.last_business_management_at, signal_row.updated_at
  FROM public.member_activity_signals AS signal_row WHERE signal_row.user_id = p_merge
  ON CONFLICT (user_id) DO UPDATE SET
    last_work_at = greatest(public.member_activity_signals.last_work_at, EXCLUDED.last_work_at),
    repeated_task_count = public.member_activity_signals.repeated_task_count + EXCLUDED.repeated_task_count,
    last_shop_purchase_at = greatest(public.member_activity_signals.last_shop_purchase_at, EXCLUDED.last_shop_purchase_at),
    last_business_management_at = greatest(public.member_activity_signals.last_business_management_at, EXCLUDED.last_business_management_at),
    updated_at = greatest(public.member_activity_signals.updated_at, EXCLUDED.updated_at);
  DELETE FROM public.member_activity_signals WHERE user_id = p_merge;

  UPDATE public.photos SET uploaded_by = p_keep WHERE uploaded_by = p_merge;
  UPDATE public.content_command_receipts SET actor_user_id = p_keep WHERE actor_user_id = p_merge;
  UPDATE public.user_activity_logs SET user_id = p_keep WHERE user_id = p_merge;
  UPDATE public.work_assignments SET user_id = p_keep WHERE user_id = p_merge;
  UPDATE public.work_assignments SET verified_by = p_keep WHERE verified_by = p_merge;
  UPDATE public.work_reward_receipts SET user_id = p_keep WHERE user_id = p_merge;

  UPDATE public.users
  SET status = 'deleted'::public.user_status,
      deleted_at = pg_catalog.clock_timestamp()
  WHERE id = p_merge;

  INSERT INTO public.admin_account_merge_events(
    idempotency_key, actor_user_id, kept_user_id, merged_user_id,
    transferred_amount, transfer_transaction_ids
  ) VALUES (p_key, p_actor, p_keep, p_merge, v_total, v_transactions);

  PERFORM public.admin_append_audit_event(
    p_actor,
    'account.fork.merged',
    p_merge,
    p_key,
    pg_catalog.jsonb_build_object(
      'keptUserId', p_keep,
      'transferredAmount', v_total,
      'transferTransactionIds', v_transactions
    )
  );

  INSERT INTO public.discord_outbox_routes(event_type, channel_key, enabled, note)
  VALUES ('economy.account.merge_transfer', 'default', false, 'one-time repair; audit log is authoritative')
  ON CONFLICT (event_type) DO NOTHING;

  kept_user_id := p_keep;
  merged_user_id := p_merge;
  transferred_amount := v_total;
  transfer_transaction_ids := v_transactions;
  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.admin_account_merge_events_immutable() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_merge_forked_member_account(uuid, uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_account_merge_events_immutable() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_merge_forked_member_account(uuid, uuid, uuid, uuid) FROM PUBLIC, moneyverse_app;

COMMIT;
