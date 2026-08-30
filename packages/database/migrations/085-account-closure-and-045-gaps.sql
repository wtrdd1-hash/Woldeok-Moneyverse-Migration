-- Closing an account from the console, blocking an address, and the three
-- holes migration 045 left open.
--
-- 045 tightened idempotency across the schema and a review of it named four
-- remaining gaps. Three are real and are closed here. The fourth was not:
-- `business_settle_daily` does check `ownership.user_id = p_actor` (036, in
-- the SELECT that reads the revenue), so nobody can settle somebody else's
-- business. What it does not check is the OWNER OF A REPLAY, which is a
-- different and much smaller thing -- a caller who guesses a receipt key
-- reads back a settlement that is not theirs -- and that is fixed below.
--
-- `economy_claim_work` locked on the actor rather than on the key, which
-- serialises a member against themselves instead of serialising a retry
-- against its original, and answered 23505 where every other command in this
-- schema answers 28000 for "this receipt is not yours".
--
-- `work_rewards` and `daily_rewards` have carried SELECT, INSERT and UPDATE
-- for `moneyverse_app` since 003 and nothing has ever used them: both tables
-- are only ever touched by SECURITY DEFINER functions, and the backend does
-- not name them. A grant nobody uses is a grant nobody notices.

BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.work_rewards, public.daily_rewards
  FROM PUBLIC, moneyverse_app;

CREATE TABLE IF NOT EXISTS public.admin_ip_blocks (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  network inet NOT NULL,
  reason text NOT NULL,
  blocked_by uuid NOT NULL REFERENCES public.users(id),
  blocked_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  expires_at timestamptz,
  lifted_by uuid REFERENCES public.users(id),
  lifted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_ip_blocks_one_live_per_network
  ON public.admin_ip_blocks (network) WHERE lifted_at IS NULL;

REVOKE ALL PRIVILEGES ON TABLE public.admin_ip_blocks FROM PUBLIC, moneyverse_app;

-- A block list, and separate from 058's `admin_ip_allowlist`, which decides
-- where the console may be reached FROM. This one decides who may reach the
-- service at all, and the two answer different questions on purpose.
CREATE OR REPLACE FUNCTION public.security_address_blocked(p_address inet)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_ip_blocks AS block_row
    WHERE block_row.lifted_at IS NULL
      AND (block_row.expires_at IS NULL OR block_row.expires_at > pg_catalog.clock_timestamp())
      AND p_address <<= block_row.network
  )
$$;

CREATE OR REPLACE FUNCTION public.admin_block_address(
  p_key uuid,
  p_actor uuid,
  p_network inet,
  p_expires_at timestamptz,
  p_reason text
)
RETURNS TABLE(block_id uuid, network inet, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.admin_command_receipts%ROWTYPE;
  v_reason text;
  v_block uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_network IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key, actor and network are required';
  END IF;

  IF p_expires_at IS NOT NULL AND p_expires_at <= pg_catalog.clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'an expiry in the past blocks nothing';
  END IF;

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_block_address:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT
      (v_existing.result ->> 'blockId')::uuid,
      (v_existing.result ->> 'network')::inet,
      (v_existing.result ->> 'expiresAt')::timestamptz;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  INSERT INTO public.admin_ip_blocks AS block_row (network, reason, blocked_by, expires_at)
  VALUES (p_network, v_reason, p_actor, p_expires_at)
  RETURNING block_row.id INTO v_block;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'security.address.blocked', v_block, v_reason,
    pg_catalog.jsonb_build_object(
      'blockId', v_block, 'network', pg_catalog.host(p_network), 'expiresAt', p_expires_at
    )
  );

  PERFORM public.admin_append_audit_event(
    p_actor,
    'security.address.blocked',
    v_block,
    p_key,
    pg_catalog.jsonb_build_object('network', pg_catalog.host(p_network), 'expiresAt', p_expires_at),
    pg_catalog.jsonb_build_object(
      'feature', 'security',
      'targetKind', 'ip_block',
      'reason', v_reason,
      'clientIp', pg_catalog.host(p_network),
      'outcome', 'success'
    )
  );

  RETURN QUERY SELECT v_block, p_network, p_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_lift_address_block(
  p_key uuid,
  p_actor uuid,
  p_block uuid,
  p_reason text
)
RETURNS TABLE(block_id uuid, lifted boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.admin_command_receipts%ROWTYPE;
  v_reason text;
  v_changed integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_block IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key, actor and block are required';
  END IF;

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_lift_address_block:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT p_block, true;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  UPDATE public.admin_ip_blocks AS block_row
  SET lifted_by = p_actor, lifted_at = pg_catalog.clock_timestamp()
  WHERE block_row.id = p_block AND block_row.lifted_at IS NULL;

  GET DIAGNOSTICS v_changed = ROW_COUNT;
  IF v_changed = 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'no live block with that id';
  END IF;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (p_key, p_actor, 'security.address.unblocked', p_block, v_reason, '{}'::jsonb);

  PERFORM public.admin_append_audit_event(
    p_actor, 'security.address.unblocked', p_block, p_key, '{}'::jsonb,
    pg_catalog.jsonb_build_object(
      'feature', 'security', 'targetKind', 'ip_block', 'reason', v_reason, 'outcome', 'success'
    )
  );

  RETURN QUERY SELECT p_block, true;
END;
$$;

-- Closing an account the member did not ask to close. Spec section 4 requires
-- this for an under-14 account and does not require notice, which is exactly
-- why it requires a reason, a second factor at the route, and an audit row.
--
-- It does everything a closure means in one transaction: the account is
-- marked deleted, its sessions are gone, and its ledger accounts are frozen
-- so nothing can be posted to them afterwards. Doing two of the three leaves
-- a closed member who is still spending.
CREATE OR REPLACE FUNCTION public.admin_close_account(
  p_key uuid,
  p_actor uuid,
  p_user uuid,
  p_reason text
)
RETURNS TABLE(user_id uuid, revoked_sessions integer, frozen_accounts integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.admin_command_receipts%ROWTYPE;
  v_reason text;
  v_status public.user_status;
  v_sessions integer;
  v_accounts integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_user IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key, actor and member are required';
  END IF;

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_close_account:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT
      (v_existing.result ->> 'userId')::uuid,
      (v_existing.result ->> 'revokedSessions')::integer,
      (v_existing.result ->> 'frozenAccounts')::integer;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  IF p_user = p_actor THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'the superadmin cannot close their own account here';
  END IF;

  SELECT member_row.status INTO v_status
  FROM public.users AS member_row
  WHERE member_row.id = p_user
  FOR UPDATE;

  IF v_status IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown member';
  END IF;

  IF v_status = 'deleted'::public.user_status THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'that account is already closed';
  END IF;

  UPDATE public.users AS member_row
  SET status = 'deleted'::public.user_status, deleted_at = pg_catalog.clock_timestamp()
  WHERE member_row.id = p_user;

  UPDATE public.auth_sessions AS session_row
  SET revoked_at = pg_catalog.clock_timestamp()
  WHERE session_row.user_id = p_user AND session_row.revoked_at IS NULL;
  GET DIAGNOSTICS v_sessions = ROW_COUNT;

  UPDATE public.accounts AS account_row
  SET status = 'frozen'::public.account_status
  WHERE account_row.owner_user_id = p_user
    AND account_row.status = 'active'::public.account_status;
  GET DIAGNOSTICS v_accounts = ROW_COUNT;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'account.closed', p_user, v_reason,
    pg_catalog.jsonb_build_object(
      'userId', p_user, 'revokedSessions', v_sessions, 'frozenAccounts', v_accounts
    )
  );

  PERFORM public.admin_append_audit_event(
    p_actor,
    'account.closed',
    p_user,
    p_key,
    pg_catalog.jsonb_build_object(
      'previousStatus', v_status::text, 'revokedSessions', v_sessions, 'frozenAccounts', v_accounts
    ),
    pg_catalog.jsonb_build_object(
      'feature', 'users',
      'targetKind', 'member',
      'subjectUserId', p_user,
      'reason', v_reason,
      'before', pg_catalog.jsonb_build_object('status', v_status::text),
      'after', pg_catalog.jsonb_build_object('status', 'deleted'),
      'outcome', 'success'
    )
  );

  RETURN QUERY SELECT p_user, v_sessions, v_accounts;
END;
$$;

-- 021's body, with exactly two changes: the advisory lock is taken on the
-- key and before the replay lookup (045's order, so two identical retries
-- cannot both find nothing), and the refusal uses the code the rest of the
-- schema uses for it. Everything else -- the amount from
-- `work_reward_policy`, the cooldown, the event name, the payload -- is
-- unchanged, because none of it was the defect.
CREATE OR REPLACE FUNCTION public.economy_claim_work(
  p_key uuid,
  p_actor uuid
)
RETURNS TABLE(transaction_id uuid, amount bigint, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing_owner uuid;
  v_existing_transaction uuid;
  v_existing_amount bigint;
  v_last_claim timestamptz;
  v_amount bigint;
  v_cash_account uuid;
  v_mint_account uuid;
  v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid work reward';
  END IF;

  -- The key, and before the lookup. Locking the actor serialised a member
  -- against their own unrelated requests and did nothing to serialise a retry
  -- against the request it retries, which is the only race here.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:economy_claim_work:' || p_key::text, 0)
  );

  SELECT reward_row.user_id, reward_row.transaction_id, reward_row.amount
  INTO v_existing_owner, v_existing_transaction, v_existing_amount
  FROM public.work_rewards AS reward_row
  WHERE reward_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_owner IS DISTINCT FROM p_actor THEN
      -- 28000, as everywhere else. 23505 says "you already did this"; this
      -- says "this is not yours", and a reader cannot tell the two apart
      -- when they share a code.
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'work receipt belongs to another user';
    END IF;
    RETURN QUERY SELECT v_existing_transaction, v_existing_amount, true;
    RETURN;
  END IF;

  SELECT policy_row.amount INTO v_amount
  FROM public.work_reward_policy AS policy_row
  WHERE policy_row.singleton AND policy_row.enabled
  FOR SHARE;
  IF v_amount IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'work reward is disabled';
  END IF;

  SELECT reward_row.created_at INTO v_last_claim
  FROM public.work_rewards AS reward_row
  WHERE reward_row.user_id = p_actor
  ORDER BY reward_row.created_at DESC
  LIMIT 1;

  IF v_last_claim IS NOT NULL
    AND v_last_claim + (SELECT policy_row.cooldown FROM public.work_reward_policy AS policy_row
                        WHERE policy_row.singleton) > now() THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'work reward cooldown active';
  END IF;

  SELECT account_row.id INTO v_cash_account
  FROM public.accounts AS account_row
  JOIN public.users AS member_row ON member_row.id = account_row.owner_user_id
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
    AND member_row.status = 'active'::public.user_status;

  SELECT account_row.id INTO v_mint_account
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'mint'
    AND account_row.account_type = 'MINT'::public.account_type
    AND account_row.status = 'active'::public.account_status;

  IF v_cash_account IS NULL OR v_mint_account IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash wallet required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key, 'WORK_REWARD', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_mint_account, 'amount', v_amount, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_cash_account, 'amount', v_amount, 'direction', 'debit')
    ),
    'game.work_reward.claimed',
    pg_catalog.jsonb_build_object('userId', p_actor, 'amount', v_amount)
  ) INTO v_transaction;

  INSERT INTO public.work_rewards (user_id, idempotency_key, transaction_id, amount)
  VALUES (p_actor, p_key, v_transaction, v_amount);

  RETURN QUERY SELECT v_transaction, v_amount, false;
END;
$$;

-- 036's replay branch returned another member's settlement to whoever named
-- its key. The settlement itself was never at risk -- the read that produces
-- the revenue has always carried `ownership.user_id = p_actor` -- so this is
-- the receipt check every other command has, and nothing more.
CREATE OR REPLACE FUNCTION public.business_settle_daily(
  p_key uuid,
  p_actor uuid,
  p_ownership uuid
)
RETURNS TABLE(
  ownership_id uuid,
  settlement_date date,
  gross_revenue bigint,
  operating_cost bigint,
  net_amount bigint,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_date date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_owner uuid;
  v_gross bigint;
  v_cost bigint;
  v_cash uuid;
  v_mint uuid;
  v_sink uuid;
  v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_ownership IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business settlement identity is required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:business_settle_daily:' || p_key::text, 0)
  );

  SELECT settlement_row.ownership_id, settlement_row.settlement_date,
         settlement_row.gross_revenue, settlement_row.operating_cost,
         settlement_row.net_amount, settlement_row.transaction_id,
         owner_row.user_id
  INTO ownership_id, settlement_date, gross_revenue, operating_cost,
       net_amount, transaction_id, v_owner
  FROM public.virtual_business_settlements AS settlement_row
  JOIN public.virtual_business_ownerships AS owner_row
    ON owner_row.id = settlement_row.ownership_id
  WHERE settlement_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'settlement receipt belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT business_row.daily_revenue, business_row.daily_operating_cost
  INTO v_gross, v_cost
  FROM public.virtual_business_ownerships AS owner_row
  JOIN public.virtual_business_types AS business_row ON business_row.id = owner_row.business_type_id
  WHERE owner_row.id = p_ownership AND owner_row.user_id = p_actor
  FOR UPDATE OF owner_row, business_row;

  IF v_gross IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business ownership is unavailable';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.virtual_business_settlements AS settlement_row
    WHERE settlement_row.ownership_id = p_ownership AND settlement_row.settlement_date = v_date
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'daily settlement already claimed';
  END IF;

  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;
  SELECT account_row.id INTO v_mint FROM public.accounts AS account_row
  WHERE account_row.system_key = 'mint'
    AND account_row.account_type = 'MINT'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;
  SELECT account_row.id INTO v_sink FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink'
    AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL OR v_sink IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active business accounts required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key, 'BUSINESS_SETTLEMENT', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'debit'),
      pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', v_gross, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_cost, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_sink, 'amount', v_cost, 'direction', 'debit')
    ),
    'business.daily_settled',
    pg_catalog.jsonb_build_object('ownershipId', p_ownership, 'grossRevenue', v_gross, 'operatingCost', v_cost)
  ) INTO v_transaction;

  INSERT INTO public.virtual_business_settlements (
    ownership_id, settlement_date, idempotency_key, gross_revenue, operating_cost,
    net_amount, transaction_id
  ) VALUES (p_ownership, v_date, p_key, v_gross, v_cost, v_gross - v_cost, v_transaction);

  ownership_id := p_ownership;
  settlement_date := v_date;
  gross_revenue := v_gross;
  operating_cost := v_cost;
  net_amount := v_gross - v_cost;
  transaction_id := v_transaction;
  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.security_address_blocked(inet) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_block_address(uuid, uuid, inet, timestamptz, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_lift_address_block(uuid, uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_close_account(uuid, uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_claim_work(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.business_settle_daily(uuid, uuid, uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.security_address_blocked(inet) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_block_address(uuid, uuid, inet, timestamptz, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_lift_address_block(uuid, uuid, uuid, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_close_account(uuid, uuid, uuid, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_claim_work(uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.business_settle_daily(uuid, uuid, uuid) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.security_address_blocked(inet) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_block_address(uuid, uuid, inet, timestamptz, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_lift_address_block(uuid, uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_close_account(uuid, uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_claim_work(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.business_settle_daily(uuid, uuid, uuid) TO moneyverse_app;

COMMIT;
