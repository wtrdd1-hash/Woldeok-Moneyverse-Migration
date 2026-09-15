-- v2026.09.15.122 — casino-scoped negative balance policy
-- Only casino settlement transactions may take the acting user's USER_CASH
-- below zero. Every other ledger transaction retains the insufficient-balance
-- invariant. This keeps debt-like casino loss from becoming a general-purpose
-- overdraft for transfers, shops, banking, work, or admin paths.

CREATE OR REPLACE FUNCTION public.economy_post_transaction(p_key uuid, p_type text, p_actor uuid, p_policy text, p_postings jsonb, p_event text, p_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_transaction_id uuid;
  v_existing_hash bytea;
  v_existing_hash_version smallint;
  v_request_hash bytea;
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_debit_total numeric;
  v_credit_total numeric;
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
    coalesce(sum((posting ->> 'amount')::numeric)
      FILTER (WHERE posting ->> 'direction' = 'debit'), 0),
    coalesce(sum((posting ->> 'amount')::numeric)
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
    (posting ->> 'amount')::numeric,
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
          WHEN 'debit' THEN (posting ->> 'amount')::numeric
          ELSE -(posting ->> 'amount')::numeric
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
      AND NOT (
        p_type IN ('VIRTUAL_COIN_GAME', 'VIRTUAL_DICE_GAME')
        AND account.account_type = 'USER_CASH'::public.account_type
        AND account.owner_user_id = p_actor
      )
  ) INTO v_invalid_balance;

  IF v_invalid_balance THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'insufficient balance';
  END IF;

  INSERT INTO public.outbox_events (aggregate_id, type, payload)
  VALUES (v_transaction_id, p_event, v_payload);

  RETURN v_transaction_id;
END;
$function$;


ALTER FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb) FROM PUBLIC, moneyverse_app;
-- ledger primitive intentionally remains unavailable to moneyverse_app
