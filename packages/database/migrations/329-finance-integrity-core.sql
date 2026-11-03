-- v2026.11.03.1701: Internal-only, atomic financial transition proof.
-- Canonical WLD remains in ledger_transactions/postings and account_balances.
-- This layer stores JSON evidence; it never creates an independent money balance.
BEGIN;

CREATE TABLE public.finance_integrity_receipts (
  transaction_id uuid PRIMARY KEY REFERENCES public.ledger_transactions(id) ON DELETE RESTRICT,
  recorded_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  domain text NOT NULL CHECK (domain IN ('TREASURY','BANK','MARKET','MEMBER_ECONOMY')),
  evidence jsonb NOT NULL CHECK (
    pg_catalog.jsonb_typeof(evidence) = 'object'
    AND evidence->>'schemaVersion' = '1'
  ),
  evidence_sha256 text NOT NULL CHECK (evidence_sha256 ~ '^[0-9a-f]{64}$')
);
ALTER TABLE public.finance_integrity_receipts OWNER TO moneyverse_migrator;
REVOKE ALL ON TABLE public.finance_integrity_receipts FROM PUBLIC, moneyverse_app;

-- Immutable records are protected against edits, deletion and TRUNCATE,
-- including table-owner mistakes. A schema migration can deliberately disable
-- triggers only through a separately audited, privileged change.
CREATE FUNCTION public.finance_integrity_immutable()
RETURNS trigger LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp AS $immutable$
BEGIN
  RAISE EXCEPTION USING ERRCODE='55000',
    MESSAGE='canonical journal and integrity receipts are append-only';
END
$immutable$;
ALTER FUNCTION public.finance_integrity_immutable() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.finance_integrity_immutable() FROM PUBLIC, moneyverse_app;
CREATE TRIGGER finance_integrity_receipts_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON public.finance_integrity_receipts
  FOR EACH STATEMENT EXECUTE FUNCTION public.finance_integrity_immutable();
CREATE TRIGGER finance_integrity_ledger_transactions_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON public.ledger_transactions
  FOR EACH STATEMENT EXECUTE FUNCTION public.finance_integrity_immutable();
CREATE TRIGGER finance_integrity_ledger_postings_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON public.ledger_postings
  FOR EACH STATEMENT EXECUTE FUNCTION public.finance_integrity_immutable();

CREATE TABLE public.finance_integrity_policy (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  enforcement_started_at timestamptz NOT NULL
);
INSERT INTO public.finance_integrity_policy(singleton,enforcement_started_at)
VALUES (true,pg_catalog.clock_timestamp());
ALTER TABLE public.finance_integrity_policy OWNER TO moneyverse_migrator;
REVOKE ALL ON public.finance_integrity_policy FROM PUBLIC, moneyverse_app;

-- Internal database boundary. Business wrappers call the canonical posting
-- primitive; no HTTP route or moneyverse_app EXECUTE is created for this helper.
CREATE FUNCTION public.finance_integrity_assert_and_record(
  p_transaction_id uuid, p_before jsonb, p_submitted_postings jsonb,
  p_type text, p_event text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $proof$
DECLARE
  v_posting_count bigint;
  v_account_count bigint;
  v_net numeric;
  v_domain text;
  v_evidence jsonb;
  v_tx public.ledger_transactions%ROWTYPE;
BEGIN
  IF p_transaction_id IS NULL OR pg_catalog.jsonb_typeof(p_before) IS DISTINCT FROM 'array'
     OR pg_catalog.jsonb_typeof(p_submitted_postings) IS DISTINCT FROM 'array'
  THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='financial proof input is incomplete';
  END IF;

  SELECT * INTO STRICT v_tx FROM public.ledger_transactions WHERE id=p_transaction_id;
  SELECT count(*), count(DISTINCT account_id),
     coalesce(sum(CASE WHEN direction='debit'::public.posting_direction
       THEN amount ELSE -amount END),0)
    INTO v_posting_count,v_account_count,v_net
  FROM public.ledger_postings WHERE transaction_id=p_transaction_id;
  IF v_posting_count<2 OR v_posting_count<>pg_catalog.jsonb_array_length(p_submitted_postings)
     OR v_net<>0 OR v_account_count<>pg_catalog.jsonb_array_length(p_before)
     OR v_account_count<>(SELECT count(DISTINCT before_item->>'accountId')
                          FROM pg_catalog.jsonb_array_elements(p_before) AS before_item)
  THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='financial proof journal or account count mismatch';
  END IF;

  -- The independent persisted journal must contain exactly the requested
  -- postings, including duplicate counts, not only equal aggregate totals.
  IF EXISTS (
    WITH expected AS (
      SELECT (item->>'accountId')::uuid AS account_id,
             (item->>'direction')::public.posting_direction AS direction,
             (item->>'amount')::numeric AS amount,count(*) AS n
      FROM pg_catalog.jsonb_array_elements(p_submitted_postings) item
      GROUP BY 1,2,3
    ), actual AS (
      SELECT account_id,direction,amount,count(*) AS n
      FROM public.ledger_postings WHERE transaction_id=p_transaction_id
      GROUP BY 1,2,3
    )
    SELECT 1 FROM expected e FULL JOIN actual a
      ON a.account_id=e.account_id AND a.direction=e.direction
      AND a.amount=e.amount
    WHERE e.n IS DISTINCT FROM a.n
  ) THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='financial proof postings differ from persisted journal';
  END IF;

  -- Every touched account's post-balance must equal the locked pre-balance
  -- plus THIS transaction's journal delta. Historic opening discrepancies are
  -- reported separately, never silently rebaselined or overwritten here.
  IF EXISTS (
    WITH opening AS (
      SELECT (item->>'accountId')::uuid AS account_id,
             (item->>'beforeAmount')::numeric AS before_amount
      FROM pg_catalog.jsonb_array_elements(p_before) item
    ), delta AS (
      SELECT account_id,
        sum(CASE WHEN direction='debit'::public.posting_direction
          THEN amount ELSE -amount END) AS amount
      FROM public.ledger_postings WHERE transaction_id=p_transaction_id
      GROUP BY account_id
    )
    SELECT 1 FROM delta d FULL JOIN opening o ON o.account_id=d.account_id
      LEFT JOIN public.account_balances b ON b.account_id=d.account_id
    WHERE o.account_id IS NULL OR d.account_id IS NULL
       OR o.before_amount IS NULL OR b.available_amount IS NULL
       OR b.available_amount IS DISTINCT FROM (o.before_amount + d.amount)
  ) THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='financial proof balance transition mismatch';
  END IF;

  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.ledger_postings p
       JOIN public.accounts a ON a.id=p.account_id
       WHERE p.transaction_id=p_transaction_id AND a.account_type='TREASURY'::public.account_type)
    THEN 'TREASURY'
    WHEN p_type ~* '(STOCK|BOND|MARKET)' THEN 'MARKET'
    WHEN EXISTS (SELECT 1 FROM public.ledger_postings p
       JOIN public.accounts a ON a.id=p.account_id
       WHERE p.transaction_id=p_transaction_id AND a.account_type='USER_BANK'::public.account_type)
    THEN 'BANK'
    ELSE 'MEMBER_ECONOMY'
    END INTO v_domain;

  SELECT pg_catalog.jsonb_build_object(
    'schemaVersion',1,
    'transactionId',v_tx.id::text,
    'idempotencyKey',v_tx.idempotency_key::text,
    'requestHash',pg_catalog.encode(v_tx.request_hash,'hex'),
    'type',v_tx.type,
    'domain',v_domain,
    'eventType',p_event,
    'postingNetWld',v_net::text,
    'postings',(
      SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'accountId',p.account_id::text,'direction',p.direction::text,
        'amountWld',p.amount::text
      ) ORDER BY p.account_id,p.direction::text,p.amount)
      FROM public.ledger_postings p WHERE p.transaction_id=p_transaction_id
    ),
    'accounts',(
      SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'accountId',d.account_id::text,
        'beforeWld',o.before_amount::text,
        'deltaWld',d.amount::text,'afterWld',b.available_amount::text
      ) ORDER BY d.account_id)
      FROM (
        SELECT account_id,sum(CASE WHEN direction='debit'::public.posting_direction
          THEN amount ELSE -amount END) AS amount
        FROM public.ledger_postings WHERE transaction_id=p_transaction_id
        GROUP BY account_id
      ) d
      JOIN (SELECT (item->>'accountId')::uuid account_id,
                   (item->>'beforeAmount')::numeric before_amount
            FROM pg_catalog.jsonb_array_elements(p_before) item) o USING(account_id)
      JOIN public.account_balances b ON b.account_id=d.account_id
    )
  ) INTO v_evidence;

  INSERT INTO public.finance_integrity_receipts
    (transaction_id,domain,evidence,evidence_sha256)
  VALUES(p_transaction_id,v_domain,v_evidence,
    pg_catalog.encode(public.digest(v_evidence::text,'sha256'),'hex'));
END
$proof$;
ALTER FUNCTION public.finance_integrity_assert_and_record(uuid,jsonb,jsonb,text,text)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.finance_integrity_assert_and_record(uuid,jsonb,jsonb,text,text)
  FROM PUBLIC,moneyverse_app;

-- A replay after enforcement MUST have an intact matching receipt. Pre-migration
-- receipts remain LEGACY_UNVERIFIED rather than being fabricated.
CREATE FUNCTION public.finance_integrity_verify_replay(p_transaction_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,pg_temp AS $replay$
DECLARE
  v_since timestamptz;
  v_created timestamptz;
  v_evidence jsonb;
  v_hash text;
  v_journal jsonb;
  v_count bigint;
  v_net numeric;
BEGIN
  SELECT enforcement_started_at INTO STRICT v_since FROM public.finance_integrity_policy
  WHERE singleton=true;
  SELECT created_at INTO STRICT v_created FROM public.ledger_transactions
  WHERE id=p_transaction_id;
  SELECT evidence,evidence_sha256 INTO v_evidence,v_hash
  FROM public.finance_integrity_receipts WHERE transaction_id=p_transaction_id;
  IF NOT FOUND THEN
    IF v_created<v_since THEN RETURN false; END IF;
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='financial replay has no protected receipt';
  END IF;
  IF v_hash IS DISTINCT FROM
     pg_catalog.encode(public.digest(v_evidence::text,'sha256'),'hex')
     OR v_evidence->>'transactionId' IS DISTINCT FROM p_transaction_id::text
  THEN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='financial replay receipt digest mismatch'; END IF;
  SELECT count(*),coalesce(sum(CASE WHEN direction='debit'::public.posting_direction
      THEN amount ELSE -amount END),0),
    pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'accountId',account_id::text,'direction',direction::text,'amountWld',amount::text)
      ORDER BY account_id,direction::text,amount)
  INTO v_count,v_net,v_journal
  FROM public.ledger_postings WHERE transaction_id=p_transaction_id;
  IF v_count<2 OR v_net<>0 OR v_evidence->'postings' IS DISTINCT FROM v_journal THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='financial replay journal has changed';
  END IF;
  RETURN true;
END
$replay$;
ALTER FUNCTION public.finance_integrity_verify_replay(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.finance_integrity_verify_replay(uuid) FROM PUBLIC,moneyverse_app;

-- Aggregate-only diagnostic. A reconciler runs it in a READ ONLY REPEATABLE READ
-- transaction and alerts on nonzero values. It neither repairs nor mints money.
CREATE FUNCTION public.finance_integrity_scan()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,pg_temp AS $scan$
DECLARE
  v_discrepancy bigint;
  v_missing_balances bigint;
  v_unbalanced bigint;
  v_bad_digest bigint;
  v_missing_receipt bigint;
  v_since timestamptz;
BEGIN
  SELECT enforcement_started_at INTO STRICT v_since FROM public.finance_integrity_policy
  WHERE singleton=true;
  SELECT count(*) FILTER(WHERE stored IS DISTINCT FROM journal),
         count(*) FILTER(WHERE stored IS NULL)
  INTO v_discrepancy,v_missing_balances
  FROM (
    SELECT a.id,b.available_amount AS stored,
       coalesce(sum(CASE WHEN p.direction='debit'::public.posting_direction
         THEN p.amount ELSE -p.amount END),0) AS journal
    FROM public.accounts a
    LEFT JOIN public.account_balances b ON b.account_id=a.id
    LEFT JOIN public.ledger_postings p ON p.account_id=a.id
    GROUP BY a.id,b.available_amount
  ) s;
  SELECT count(*) INTO v_unbalanced FROM (
    SELECT t.id FROM public.ledger_transactions t
    LEFT JOIN public.ledger_postings p ON p.transaction_id=t.id
    GROUP BY t.id
    HAVING count(p.id)<2 OR coalesce(sum(CASE WHEN
      p.direction='debit'::public.posting_direction THEN p.amount ELSE -p.amount END),0)<>0
  ) bad;
  SELECT count(*) INTO v_bad_digest FROM public.finance_integrity_receipts r
    WHERE r.evidence_sha256 IS DISTINCT FROM
      pg_catalog.encode(public.digest(r.evidence::text,'sha256'),'hex');
  SELECT count(*) INTO v_missing_receipt FROM public.ledger_transactions t
    LEFT JOIN public.finance_integrity_receipts r ON r.transaction_id=t.id
    WHERE t.created_at>=v_since AND r.transaction_id IS NULL;
  RETURN pg_catalog.jsonb_build_object(
    'status',CASE WHEN v_discrepancy=0 AND v_unbalanced=0 AND v_bad_digest=0
                         AND v_missing_receipt=0 THEN 'CLEAN' ELSE 'ALERT' END,
    'balanceDiscrepancies',v_discrepancy,
    'missingBalanceRows',v_missing_balances,
    'unbalancedTransactions',v_unbalanced,
    'corruptEvidenceDigests',v_bad_digest,
    'missingProtectedReceipts',v_missing_receipt,
    'historicalReconciliationRequired',true
  );
END
$scan$;
ALTER FUNCTION public.finance_integrity_scan() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.finance_integrity_scan() FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.finance_integrity_scan() TO moneyverse_reconciler;

-- No direct external/public API and no direct DML for the untrusted web role.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.ledger_transactions,public.ledger_postings,public.account_balances
  FROM PUBLIC,moneyverse_app;
REVOKE EXECUTE ON FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb)
  FROM PUBLIC,moneyverse_app;


-- Replace, never edit, the previously deployed canonical posting routine.
-- Exact base: 195-casino-scoped-negative-balance.sql; retains per-key replay
-- identity, ordered account locking, casino exception and zero-sum rules.
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
  v_integrity_before jsonb;
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
    PERFORM public.finance_integrity_verify_replay(v_transaction_id);
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
    PERFORM public.finance_integrity_verify_replay(v_transaction_id);
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

  -- Snapshot only the locked, touched accounts. Historic opening drift is
  -- not silently repaired; transition proof protects each NEW posting.
  SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'accountId',b.account_id::text,'beforeAmount',b.available_amount::text
  ) ORDER BY b.account_id) INTO v_integrity_before
  FROM public.account_balances b
  JOIN (SELECT DISTINCT (item->>'accountId')::uuid AS account_id
        FROM pg_catalog.jsonb_array_elements(p_postings) item) touched
    ON touched.account_id=b.account_id;
  IF v_integrity_before IS NULL OR
      pg_catalog.jsonb_array_length(v_integrity_before)<>v_expected_account_count THEN
    RAISE EXCEPTION USING ERRCODE='55000',
      MESSAGE='cannot create financial integrity account snapshot';
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

  -- This is the final internal gate of the same PostgreSQL transaction.
  -- Any exception rolls back postings, balances, outbox AND JSON proof.
  PERFORM public.finance_integrity_assert_and_record(
    v_transaction_id,v_integrity_before,p_postings,p_type,p_event
  );
  RETURN v_transaction_id;
END;
$function$;


ALTER FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb) FROM PUBLIC, moneyverse_app;
-- ledger primitive intentionally remains unavailable to moneyverse_app

REVOKE EXECUTE ON FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb)
  FROM PUBLIC,moneyverse_app;
COMMIT;
