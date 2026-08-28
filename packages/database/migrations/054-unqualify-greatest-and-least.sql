-- GREATEST and LEAST cannot be schema-qualified.
--
-- They look like functions and they are not: the parser expands them inline,
-- and there is no `greatest` in pg_catalog for a qualified name to find. Three
-- migrations wrote them qualified, and every one of those call sites raises
-- undefined_function the moment it is reached:
--
--   030  outbox_claim_pending        — the LIMIT, so every call, always
--   040  stock_admin_corporate_action — inside the split branch
--   041  bank_accrue_daily_interest   — inside the per-deposit loop
--
-- The Discord outbox has therefore never delivered anything, no stock split
-- has ever completed, and bank interest fails as soon as one member holds a
-- deposit. Nothing caught it because the qualified form parses cleanly and
-- only fails at execution, and two of the three are background jobs whose
-- errors nobody was reading.
--
-- 053 carries the corporate-action fix, because it is already rewriting that
-- function. This migration is the other two. The bodies are otherwise
-- untouched: the qualification is the whole bug.
--
-- `search_path` is `pg_catalog, pg_temp` in all three, so the unqualified
-- names still resolve where they always would have.

BEGIN;

CREATE OR REPLACE FUNCTION public.outbox_claim_pending(p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid,event_type text,payload jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT event.id
    FROM public.outbox_events AS event
    WHERE event.delivered_at IS NULL
      AND (event.delivery_locked_until IS NULL OR event.delivery_locked_until < pg_catalog.clock_timestamp())
    ORDER BY event.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT greatest(1, least(p_limit, 100))
  ), claimed AS (
    UPDATE public.outbox_events AS event
    SET delivery_attempts = event.delivery_attempts + 1,
        delivery_locked_until = pg_catalog.clock_timestamp() + interval '2 minutes'
    FROM candidates
    WHERE event.id = candidates.id
    RETURNING event.id, event.type, event.payload
  )
  SELECT claimed.id, claimed.type, claimed.payload FROM claimed;
END $$;

CREATE OR REPLACE FUNCTION public.bank_accrue_daily_interest(
  p_interest_date date DEFAULT (pg_catalog.now() AT TIME ZONE 'Asia/Seoul')::date
)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE bank_row record; mint_account_id uuid; v_rate_bps integer; v_interest bigint; v_transaction_id uuid; v_count integer := 0;
BEGIN
  IF p_interest_date IS NULL OR p_interest_date > (pg_catalog.now() AT TIME ZONE 'Asia/Seoul')::date THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid interest date'; END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('moneyverse:bank-interest:' || p_interest_date::text, 0));
  SELECT account.id INTO mint_account_id FROM public.accounts AS account WHERE account.system_key = 'mint' AND account.account_type = 'MINT'::public.account_type AND account.status = 'active'::public.account_status FOR UPDATE;
  IF mint_account_id IS NULL THEN RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'active mint account required'; END IF;
  v_rate_bps := public.bank_auto_interest_rate_bps();
  FOR bank_row IN
    SELECT account.id AS account_id, account.owner_user_id AS user_id, balance.available_amount
    FROM public.accounts AS account JOIN public.account_balances AS balance ON balance.account_id = account.id JOIN public.users AS user_row ON user_row.id = account.owner_user_id
    WHERE account.account_type = 'USER_BANK'::public.account_type AND account.status = 'active'::public.account_status AND user_row.status = 'active'::public.user_status AND balance.available_amount > 0
      AND NOT EXISTS (SELECT 1 FROM public.virtual_bank_interest_accruals AS prior WHERE prior.user_id = account.owner_user_id AND prior.interest_date = p_interest_date)
    FOR UPDATE OF balance
  LOOP
    v_interest := greatest(1::bigint, (bank_row.available_amount * v_rate_bps) / 10000);
    SELECT public.economy_post_transaction(pg_catalog.gen_random_uuid(), 'BANK_DEPOSIT_INTEREST', bank_row.user_id, NULL,
      pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('accountId', bank_row.account_id, 'amount', v_interest, 'direction', 'debit'), pg_catalog.jsonb_build_object('accountId', mint_account_id, 'amount', v_interest, 'direction', 'credit')),
      'bank.interest.accrued', pg_catalog.jsonb_build_object('interestDate', p_interest_date, 'rateBps', v_rate_bps, 'amount', v_interest)) INTO v_transaction_id;
    INSERT INTO public.virtual_bank_interest_accruals(user_id, interest_date, rate_bps, principal_amount, interest_amount, transaction_id) VALUES(bank_row.user_id, p_interest_date, v_rate_bps, bank_row.available_amount, v_interest, v_transaction_id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

ALTER FUNCTION public.outbox_claim_pending(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_accrue_daily_interest(date) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION
  public.outbox_claim_pending(integer),
  public.bank_accrue_daily_interest(date)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.outbox_claim_pending(integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_accrue_daily_interest(date) TO moneyverse_app;

COMMIT;
