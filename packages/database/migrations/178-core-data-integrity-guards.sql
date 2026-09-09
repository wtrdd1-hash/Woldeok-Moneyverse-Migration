-- Defense-in-depth invariants for the two pieces of state that define the
-- Moneyverse economy: account balances and the double-entry ledger.
--
-- Application write functions already create balances and balanced postings.
-- These deferred constraint triggers protect the same invariants even when a
-- future migration or privileged maintenance command bypasses those functions.
-- They are deferred so legitimate multi-statement transactions may create the
-- parent row first and finish the dependent state before COMMIT.
BEGIN;

CREATE OR REPLACE FUNCTION public.assert_account_has_balance()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.account_balances AS balance_row
    WHERE balance_row.account_id = NEW.id
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'every account must have exactly one account_balances row',
      DETAIL = pg_catalog.format('account_id=%s', NEW.id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS accounts_require_balance ON public.accounts;
CREATE CONSTRAINT TRIGGER accounts_require_balance
AFTER INSERT ON public.accounts
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.assert_account_has_balance();

CREATE OR REPLACE FUNCTION public.assert_ledger_transaction_balanced()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_posting_count bigint;
  v_debit_total numeric;
  v_credit_total numeric;
BEGIN
  SELECT
    pg_catalog.count(*)::bigint,
    pg_catalog.coalesce(
      pg_catalog.sum(posting_row.amount::numeric)
        FILTER (WHERE posting_row.direction = 'debit'::public.posting_direction),
      0::numeric
    ),
    pg_catalog.coalesce(
      pg_catalog.sum(posting_row.amount::numeric)
        FILTER (WHERE posting_row.direction = 'credit'::public.posting_direction),
      0::numeric
    )
  INTO v_posting_count, v_debit_total, v_credit_total
  FROM public.ledger_postings AS posting_row
  WHERE posting_row.transaction_id = NEW.id;

  IF v_posting_count < 2 OR v_debit_total <= 0 OR v_debit_total <> v_credit_total THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'ledger transaction must contain balanced debit and credit postings',
      DETAIL = pg_catalog.format(
        'transaction_id=%s posting_count=%s debit_total=%s credit_total=%s',
        NEW.id, v_posting_count, v_debit_total, v_credit_total
      );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS ledger_transactions_require_balanced_postings ON public.ledger_transactions;
CREATE CONSTRAINT TRIGGER ledger_transactions_require_balanced_postings
AFTER INSERT ON public.ledger_transactions
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.assert_ledger_transaction_balanced();

-- Trigger functions are internal integrity machinery, not application APIs.
REVOKE ALL PRIVILEGES ON FUNCTION public.assert_account_has_balance() FROM PUBLIC;
REVOKE ALL PRIVILEGES ON FUNCTION public.assert_ledger_transaction_balanced() FROM PUBLIC;
ALTER FUNCTION public.assert_account_has_balance() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.assert_ledger_transaction_balanced() OWNER TO moneyverse_migrator;

COMMIT;
