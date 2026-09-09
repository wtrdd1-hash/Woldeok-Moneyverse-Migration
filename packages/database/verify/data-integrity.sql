-- Read-only production/CI integrity gate. Any violation aborts psql when run
-- with ON_ERROR_STOP=1. Keep this query independent from application code so
-- it can also diagnose a partially deployed service.
DO $integrity$
DECLARE
  v_count bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_count
  FROM public.accounts AS account_row
  LEFT JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
  WHERE balance_row.account_id IS NULL;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'DATA_INTEGRITY missing account balance rows: %', v_count;
  END IF;

  WITH transaction_totals AS (
    SELECT
      transaction_row.id,
      pg_catalog.count(posting_row.id)::bigint AS posting_count,
      COALESCE(pg_catalog.sum(posting_row.amount::numeric)
        FILTER (WHERE posting_row.direction = 'debit'::public.posting_direction), 0::numeric) AS debit_total,
      COALESCE(pg_catalog.sum(posting_row.amount::numeric)
        FILTER (WHERE posting_row.direction = 'credit'::public.posting_direction), 0::numeric) AS credit_total
    FROM public.ledger_transactions AS transaction_row
    LEFT JOIN public.ledger_postings AS posting_row ON posting_row.transaction_id = transaction_row.id
    GROUP BY transaction_row.id
  )
  SELECT pg_catalog.count(*) INTO v_count
  FROM transaction_totals
  WHERE posting_count < 2 OR debit_total <= 0 OR debit_total <> credit_total;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'DATA_INTEGRITY malformed ledger transactions: %', v_count;
  END IF;

  WITH expected AS (
    SELECT
      account_row.id,
      account_row.allow_negative,
      balance_row.available_amount::numeric AS stored_amount,
      COALESCE(pg_catalog.sum(
        CASE posting_row.direction
          WHEN 'debit'::public.posting_direction THEN posting_row.amount::numeric
          WHEN 'credit'::public.posting_direction THEN -posting_row.amount::numeric
          ELSE 0::numeric
        END
      ), 0::numeric) AS ledger_amount
    FROM public.accounts AS account_row
    JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    LEFT JOIN public.ledger_postings AS posting_row ON posting_row.account_id = account_row.id
    GROUP BY account_row.id, account_row.allow_negative, balance_row.available_amount
  )
  SELECT pg_catalog.count(*) INTO v_count
  FROM expected
  WHERE stored_amount <> ledger_amount;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'DATA_INTEGRITY account balance / ledger mismatches: %', v_count;
  END IF;

  SELECT pg_catalog.count(*) INTO v_count
  FROM public.account_balances AS balance_row
  JOIN public.accounts AS account_row ON account_row.id = balance_row.account_id
  WHERE balance_row.available_amount < 0 AND NOT account_row.allow_negative;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'DATA_INTEGRITY disallowed negative balances: %', v_count;
  END IF;

  SELECT pg_catalog.count(*) INTO v_count
  FROM pg_catalog.pg_constraint AS constraint_row
  JOIN pg_catalog.pg_namespace AS namespace_row ON namespace_row.oid = constraint_row.connamespace
  WHERE namespace_row.nspname = 'public' AND NOT constraint_row.convalidated;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'DATA_INTEGRITY unvalidated public constraints: %', v_count;
  END IF;

  SELECT pg_catalog.count(*) INTO v_count
  FROM pg_catalog.pg_index AS index_row
  JOIN pg_catalog.pg_class AS table_row ON table_row.oid = index_row.indrelid
  JOIN pg_catalog.pg_namespace AS namespace_row ON namespace_row.oid = table_row.relnamespace
  WHERE namespace_row.nspname = 'public' AND NOT index_row.indisvalid;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'DATA_INTEGRITY invalid public indexes: %', v_count;
  END IF;

  -- The web role may read these relations but value-bearing writes must stay
  -- behind SECURITY DEFINER functions.
  SELECT pg_catalog.count(*) INTO v_count
  FROM (VALUES
    ('accounts'), ('account_balances'), ('ledger_transactions'),
    ('ledger_postings'), ('outbox_events')
  ) AS protected(table_name)
  WHERE pg_catalog.has_table_privilege('moneyverse_app', pg_catalog.format('public.%I', protected.table_name), 'INSERT')
     OR pg_catalog.has_table_privilege('moneyverse_app', pg_catalog.format('public.%I', protected.table_name), 'UPDATE')
     OR pg_catalog.has_table_privilege('moneyverse_app', pg_catalog.format('public.%I', protected.table_name), 'DELETE')
     OR pg_catalog.has_table_privilege('moneyverse_app', pg_catalog.format('public.%I', protected.table_name), 'TRUNCATE');
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'DATA_INTEGRITY moneyverse_app write privilege regression on protected tables: %', v_count;
  END IF;
END;
$integrity$;

SELECT 'DATA_INTEGRITY_OK' AS result;
