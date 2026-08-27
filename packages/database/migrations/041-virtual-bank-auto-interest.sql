-- Game-only deposit interest. The rate is calculated from WLD circulation,
-- never from a real-world financial rate or payment product.
CREATE TABLE IF NOT EXISTS public.virtual_bank_interest_accruals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  interest_date date NOT NULL,
  rate_bps integer NOT NULL CHECK (rate_bps BETWEEN 1 AND 10),
  principal_amount bigint NOT NULL CHECK (principal_amount > 0),
  interest_amount bigint NOT NULL CHECK (interest_amount > 0),
  transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, interest_date)
);

REVOKE ALL ON public.virtual_bank_interest_accruals FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.bank_auto_interest_rate_bps()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT CASE
    WHEN COALESCE(sum(balance.available_amount), 0) < 10000000 THEN 4
    WHEN COALESCE(sum(balance.available_amount), 0) < 100000000 THEN 3
    ELSE 2
  END
  FROM public.account_balances AS balance
  JOIN public.accounts AS account ON account.id = balance.account_id
  WHERE account.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
    AND account.status = 'active'::public.account_status
$$;

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
    v_interest := pg_catalog.greatest(1, (bank_row.available_amount * v_rate_bps) / 10000);
    SELECT public.economy_post_transaction(pg_catalog.gen_random_uuid(), 'BANK_DEPOSIT_INTEREST', bank_row.user_id, NULL,
      pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('accountId', bank_row.account_id, 'amount', v_interest, 'direction', 'debit'), pg_catalog.jsonb_build_object('accountId', mint_account_id, 'amount', v_interest, 'direction', 'credit')),
      'bank.interest.accrued', pg_catalog.jsonb_build_object('interestDate', p_interest_date, 'rateBps', v_rate_bps, 'amount', v_interest)) INTO v_transaction_id;
    INSERT INTO public.virtual_bank_interest_accruals(user_id, interest_date, rate_bps, principal_amount, interest_amount, transaction_id) VALUES(bank_row.user_id, p_interest_date, v_rate_bps, bank_row.available_amount, v_interest, v_transaction_id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

ALTER FUNCTION public.bank_auto_interest_rate_bps() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_accrue_daily_interest(date) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.bank_auto_interest_rate_bps(), public.bank_accrue_daily_interest(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bank_auto_interest_rate_bps(), public.bank_accrue_daily_interest(date) TO moneyverse_app;
