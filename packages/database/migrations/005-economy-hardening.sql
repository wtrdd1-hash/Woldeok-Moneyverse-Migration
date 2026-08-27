-- Economy write access is deliberately restricted to SECURITY DEFINER commands
-- below. The application role may read receipts, but it cannot manufacture a
-- ledger entry, balance change, outbox event, or daily-reward receipt directly.
BEGIN;

REVOKE CREATE ON SCHEMA public FROM PUBLIC, moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.ledger_transactions,
  public.ledger_postings,
  public.accounts,
  public.account_balances,
  public.outbox_events,
  public.daily_rewards
  FROM PUBLIC, moneyverse_app;

GRANT SELECT ON TABLE public.ledger_transactions,
  public.ledger_postings,
  public.accounts,
  public.account_balances,
  public.outbox_events,
  public.daily_rewards
  TO moneyverse_app;

-- Version 0 fingerprints mark receipts created before this migration. They
-- intentionally cannot be replayed because the original request cannot be
-- reconstructed without ambiguity from historical postings.
ALTER TABLE public.ledger_transactions
  ADD COLUMN IF NOT EXISTS request_hash bytea,
  ADD COLUMN IF NOT EXISTS request_hash_version smallint NOT NULL DEFAULT 0;

UPDATE public.ledger_transactions
SET request_hash = public.digest('legacy:' || id::text, 'sha256')
WHERE request_hash IS NULL;

ALTER TABLE public.ledger_transactions
  ALTER COLUMN request_hash SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.ledger_transactions'::regclass
      AND conname = 'ledger_transactions_request_hash_length'
  ) THEN
    ALTER TABLE public.ledger_transactions
      ADD CONSTRAINT ledger_transactions_request_hash_length
      CHECK (octet_length(request_hash) = 32);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.ledger_transactions'::regclass
      AND conname = 'ledger_transactions_request_hash_version'
  ) THEN
    ALTER TABLE public.ledger_transactions
      ADD CONSTRAINT ledger_transactions_request_hash_version
      CHECK (request_hash_version IN (0, 1));
  END IF;
END;
$$;

-- A single, DB-owned policy controls the reward amount. It is intentionally
-- not writable by the application role.
CREATE TABLE IF NOT EXISTS public.daily_reward_policy (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  amount bigint NOT NULL CHECK (amount > 0),
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.daily_reward_policy (singleton, amount, enabled)
VALUES (true, 100, true)
ON CONFLICT (singleton) DO NOTHING;

REVOKE ALL PRIVILEGES ON TABLE public.daily_reward_policy FROM PUBLIC, moneyverse_app;

-- Store the original request key and granted amount so a lost response can be
-- replayed safely while a genuinely second claim is rejected.
ALTER TABLE public.daily_rewards
  ADD COLUMN IF NOT EXISTS idempotency_key uuid,
  ADD COLUMN IF NOT EXISTS amount bigint;

UPDATE public.daily_rewards AS reward
SET idempotency_key = transaction_row.idempotency_key
FROM public.ledger_transactions AS transaction_row
WHERE transaction_row.id = reward.transaction_id
  AND reward.idempotency_key IS NULL;

UPDATE public.daily_rewards AS reward
SET amount = (
  SELECT posting.amount
  FROM public.ledger_postings AS posting
  JOIN public.accounts AS account ON account.id = posting.account_id
  WHERE posting.transaction_id = reward.transaction_id
    AND posting.direction = 'debit'::public.posting_direction
    AND account.owner_user_id = reward.user_id
    AND account.account_type = 'USER_CASH'::public.account_type
  ORDER BY posting.created_at, posting.id
  LIMIT 1
)
WHERE reward.amount IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.daily_rewards
    WHERE transaction_id IS NULL
      OR idempotency_key IS NULL
      OR amount IS NULL
      OR amount <= 0
  ) THEN
    RAISE EXCEPTION
      'cannot harden daily_rewards: historical rows lack a valid ledger receipt';
  END IF;
END;
$$;

ALTER TABLE public.daily_rewards
  ALTER COLUMN transaction_id SET NOT NULL,
  ALTER COLUMN idempotency_key SET NOT NULL,
  ALTER COLUMN amount SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.daily_rewards'::regclass
      AND conname = 'daily_rewards_amount_positive'
  ) THEN
    ALTER TABLE public.daily_rewards
      ADD CONSTRAINT daily_rewards_amount_positive CHECK (amount > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.daily_rewards'::regclass
      AND conname = 'daily_rewards_idempotency_key_key'
  ) THEN
    ALTER TABLE public.daily_rewards
      ADD CONSTRAINT daily_rewards_idempotency_key_key UNIQUE (idempotency_key);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_post_transaction(
  p_key uuid,
  p_type text,
  p_actor uuid,
  p_policy text,
  p_postings jsonb,
  p_event text,
  p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_transaction_id uuid;
  v_existing_hash bytea;
  v_existing_hash_version smallint;
  v_request_hash bytea;
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_debit_total bigint;
  v_credit_total bigint;
  v_expected_account_count integer;
  v_locked_account_count integer;
  v_updated_balance_count integer;
  v_invalid_balance boolean;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_type IS NULL OR btrim(p_type) = ''
    OR p_event IS NULL OR btrim(p_event) = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'transaction identity is required';
  END IF;

  IF jsonb_typeof(p_postings) IS DISTINCT FROM 'array'
    OR jsonb_array_length(p_postings) < 2 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'at least two postings required';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_postings) AS posting
    WHERE jsonb_typeof(posting) <> 'object'
      OR nullif(posting ->> 'accountId', '') IS NULL
      OR coalesce(posting ->> 'direction', '') NOT IN ('debit', 'credit')
      OR coalesce(posting ->> 'amount', '') !~ '^[1-9][0-9]*$'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid ledger posting';
  END IF;

  SELECT
    coalesce(sum((posting ->> 'amount')::bigint)
      FILTER (WHERE posting ->> 'direction' = 'debit'), 0),
    coalesce(sum((posting ->> 'amount')::bigint)
      FILTER (WHERE posting ->> 'direction' = 'credit'), 0)
  INTO v_debit_total, v_credit_total
  FROM jsonb_array_elements(p_postings) AS posting;

  IF v_debit_total <> v_credit_total OR v_debit_total <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unbalanced ledger transaction';
  END IF;

  v_request_hash := public.digest(
    jsonb_build_object(
      'type', p_type,
      'actorUserId', p_actor,
      'policyVersion', p_policy,
      'postings', p_postings,
      'eventType', p_event,
      'eventPayload', v_payload
    )::text,
    'sha256'
  );

  SELECT id, request_hash, request_hash_version
  INTO v_transaction_id, v_existing_hash, v_existing_hash_version
  FROM public.ledger_transactions
  WHERE idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_hash_version <> 1
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different request';
    END IF;
    RETURN v_transaction_id;
  END IF;

  -- PostgreSQL waits for an in-flight conflicting insert before DO NOTHING.
  -- A second read therefore returns the first committed receipt rather than a
  -- unique-key error when identical requests arrive concurrently.
  INSERT INTO public.ledger_transactions (
    idempotency_key,
    request_hash,
    request_hash_version,
    type,
    actor_user_id,
    policy_version
  ) VALUES (
    p_key,
    v_request_hash,
    1,
    p_type,
    p_actor,
    p_policy
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_transaction_id;

  IF v_transaction_id IS NULL THEN
    SELECT id, request_hash, request_hash_version
    INTO v_transaction_id, v_existing_hash, v_existing_hash_version
    FROM public.ledger_transactions
    WHERE idempotency_key = p_key;

    IF NOT FOUND
      OR v_existing_hash_version <> 1
      OR v_existing_hash IS DISTINCT FROM v_request_hash THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'idempotency key was reused with a different request';
    END IF;
    RETURN v_transaction_id;
  END IF;

  SELECT count(*)
  INTO v_expected_account_count
  FROM (
    SELECT DISTINCT (posting ->> 'accountId')::uuid AS account_id
    FROM jsonb_array_elements(p_postings) AS posting
  ) AS posting_accounts;

  PERFORM account.id
  FROM public.accounts AS account
  JOIN (
    SELECT DISTINCT (posting ->> 'accountId')::uuid AS account_id
    FROM jsonb_array_elements(p_postings) AS posting
  ) AS posting_accounts ON posting_accounts.account_id = account.id
  WHERE account.status = 'active'::public.account_status
  ORDER BY account.id
  FOR UPDATE OF account;
  GET DIAGNOSTICS v_locked_account_count = ROW_COUNT;

  IF v_locked_account_count <> v_expected_account_count THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown or inactive account';
  END IF;

  INSERT INTO public.ledger_postings (
    transaction_id,
    account_id,
    amount,
    direction
  )
  SELECT
    v_transaction_id,
    (posting ->> 'accountId')::uuid,
    (posting ->> 'amount')::bigint,
    (posting ->> 'direction')::public.posting_direction
  FROM jsonb_array_elements(p_postings) AS posting;

  UPDATE public.account_balances AS balance
  SET available_amount = balance.available_amount + delta.delta,
      updated_at = now()
  FROM (
    SELECT
      (posting ->> 'accountId')::uuid AS account_id,
      sum(
        CASE posting ->> 'direction'
          WHEN 'debit' THEN (posting ->> 'amount')::bigint
          ELSE -(posting ->> 'amount')::bigint
        END
      ) AS delta
    FROM jsonb_array_elements(p_postings) AS posting
    GROUP BY 1
  ) AS delta
  WHERE balance.account_id = delta.account_id;
  GET DIAGNOSTICS v_updated_balance_count = ROW_COUNT;

  IF v_updated_balance_count <> v_expected_account_count THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'account balance row is missing';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.account_balances AS balance
    JOIN public.accounts AS account ON account.id = balance.account_id
    JOIN (
      SELECT DISTINCT (posting ->> 'accountId')::uuid AS account_id
      FROM jsonb_array_elements(p_postings) AS posting
    ) AS posting_accounts ON posting_accounts.account_id = account.id
    WHERE balance.available_amount < 0
      AND NOT account.allow_negative
  ) INTO v_invalid_balance;

  IF v_invalid_balance THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'insufficient balance';
  END IF;

  INSERT INTO public.outbox_events (aggregate_id, type, payload)
  VALUES (v_transaction_id, p_event, v_payload);

  RETURN v_transaction_id;
END;
$$;

ALTER FUNCTION public.economy_post_transaction(uuid, text, uuid, text, jsonb, text, jsonb)
  OWNER TO moneyverse_migrator;

CREATE OR REPLACE FUNCTION public.economy_transfer(
  p_key uuid,
  p_actor uuid,
  p_recipient uuid,
  p_amount bigint
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_from_account_id uuid;
  v_to_account_id uuid;
  v_transaction_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_recipient IS NULL
    OR p_actor = p_recipient OR p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid transfer';
  END IF;

  SELECT account.id
  INTO v_from_account_id
  FROM public.accounts AS account
  JOIN public.users AS user_row ON user_row.id = account.owner_user_id
  WHERE account.owner_user_id = p_actor
    AND account.account_type = 'USER_CASH'::public.account_type
    AND account.status = 'active'::public.account_status
    AND user_row.status = 'active'::public.user_status;

  SELECT account.id
  INTO v_to_account_id
  FROM public.accounts AS account
  JOIN public.users AS user_row ON user_row.id = account.owner_user_id
  WHERE account.owner_user_id = p_recipient
    AND account.account_type = 'USER_CASH'::public.account_type
    AND account.status = 'active'::public.account_status
    AND user_row.status = 'active'::public.user_status;

  IF v_from_account_id IS NULL OR v_to_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash wallet required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key,
    'USER_TO_USER',
    p_actor,
    NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_from_account_id, 'amount', p_amount, 'direction', 'credit'),
      jsonb_build_object('accountId', v_to_account_id, 'amount', p_amount, 'direction', 'debit')
    ),
    'wallet.transfer.completed',
    jsonb_build_object('fromUserId', p_actor, 'toUserId', p_recipient, 'amount', p_amount)
  ) INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

ALTER FUNCTION public.economy_transfer(uuid, uuid, uuid, bigint)
  OWNER TO moneyverse_migrator;

CREATE OR REPLACE FUNCTION public.economy_claim_daily(
  p_key uuid,
  p_actor uuid,
  p_reward_date date
) RETURNS TABLE (transaction_id uuid, amount bigint, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_today date := (current_timestamp AT TIME ZONE 'Asia/Seoul')::date;
  v_existing_key uuid;
  v_existing_transaction_id uuid;
  v_existing_amount bigint;
  v_cash_account_id uuid;
  v_mint_account_id uuid;
  v_amount bigint;
  v_transaction_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_reward_date IS NULL
    OR p_reward_date <> v_today THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'daily reward is only available for the current Asia/Seoul date';
  END IF;

  -- Locks only this user's KST-day claim. Hash collisions merely serialize
  -- unrelated claims; they cannot merge them.
  PERFORM pg_advisory_xact_lock(
    hashtextextended('moneyverse:daily-reward:' || p_actor::text || ':' || p_reward_date::text, 0)
  );

  SELECT reward.idempotency_key, reward.transaction_id, reward.amount
  INTO v_existing_key, v_existing_transaction_id, v_existing_amount
  FROM public.daily_rewards AS reward
  WHERE reward.user_id = p_actor
    AND reward.reward_date = p_reward_date;

  IF FOUND THEN
    IF v_existing_key = p_key THEN
      RETURN QUERY SELECT v_existing_transaction_id, v_existing_amount, true;
      RETURN;
    END IF;
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'daily reward already claimed';
  END IF;

  SELECT policy.amount
  INTO v_amount
  FROM public.daily_reward_policy AS policy
  WHERE policy.singleton
    AND policy.enabled
  FOR SHARE;

  IF v_amount IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'daily reward is disabled';
  END IF;

  SELECT account.id
  INTO v_cash_account_id
  FROM public.accounts AS account
  JOIN public.users AS user_row ON user_row.id = account.owner_user_id
  WHERE account.owner_user_id = p_actor
    AND account.account_type = 'USER_CASH'::public.account_type
    AND account.status = 'active'::public.account_status
    AND user_row.status = 'active'::public.user_status;

  SELECT account.id
  INTO v_mint_account_id
  FROM public.accounts AS account
  WHERE account.system_key = 'mint'
    AND account.account_type = 'MINT'::public.account_type
    AND account.status = 'active'::public.account_status;

  IF v_cash_account_id IS NULL OR v_mint_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash wallet required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key,
    'MINT_TO_USER',
    p_actor,
    NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_mint_account_id, 'amount', v_amount, 'direction', 'credit'),
      jsonb_build_object('accountId', v_cash_account_id, 'amount', v_amount, 'direction', 'debit')
    ),
    'game.daily_reward.claimed',
    jsonb_build_object('userId', p_actor, 'rewardDate', p_reward_date, 'amount', v_amount)
  ) INTO v_transaction_id;

  INSERT INTO public.daily_rewards (
    user_id,
    reward_date,
    transaction_id,
    idempotency_key,
    amount
  ) VALUES (
    p_actor,
    p_reward_date,
    v_transaction_id,
    p_key,
    v_amount
  );

  RETURN QUERY SELECT v_transaction_id, v_amount, false;
END;
$$;

ALTER FUNCTION public.economy_claim_daily(uuid, uuid, date)
  OWNER TO moneyverse_migrator;

-- Default EXECUTE is granted to PUBLIC for newly created PostgreSQL functions;
-- revoke it explicitly before granting the limited commands to the app role.
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_post_transaction(uuid, text, uuid, text, jsonb, text, jsonb)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_transfer(uuid, uuid, uuid, bigint)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_claim_daily(uuid, uuid, date)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.economy_transfer(uuid, uuid, uuid, bigint) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_claim_daily(uuid, uuid, date) TO moneyverse_app;

COMMIT;
