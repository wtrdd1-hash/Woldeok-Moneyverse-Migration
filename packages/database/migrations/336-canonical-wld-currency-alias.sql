-- v2026.11.04.1761: legacy currency 'W' is an old WLD alias, not new supply.
-- Preserve owner, account ID, balances, all ledger postings and receipts.
-- A migration runs as the schema owner, NEVER as the untrusted application role.
BEGIN;

CREATE TABLE IF NOT EXISTS public.finance_currency_alias_receipts (
  account_id uuid PRIMARY KEY REFERENCES public.accounts(id) ON DELETE RESTRICT,
  owner_user_id uuid NOT NULL REFERENCES public.users(id),
  legacy_currency char(3) NOT NULL CHECK (legacy_currency = 'W'),
  canonical_currency char(3) NOT NULL CHECK (canonical_currency = 'WLD'),
  balance_at_normalization_wld numeric NOT NULL,
  journal_at_normalization_wld numeric NOT NULL,
  evidence_hash text NOT NULL CHECK (length(evidence_hash) = 64),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CONSTRAINT finance_alias_must_conserve CHECK (
    balance_at_normalization_wld = journal_at_normalization_wld
  )
);
ALTER TABLE public.finance_currency_alias_receipts OWNER TO moneyverse_migrator;
REVOKE ALL ON TABLE public.finance_currency_alias_receipts FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.finance_currency_alias_receipt_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $immutable$
BEGIN
  RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='immutable currency alias evidence';
END
$immutable$;
ALTER FUNCTION public.finance_currency_alias_receipt_immutable() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.finance_currency_alias_receipt_immutable() FROM PUBLIC, moneyverse_app;
DROP TRIGGER IF EXISTS finance_currency_alias_receipts_immutable ON public.finance_currency_alias_receipts;
CREATE TRIGGER finance_currency_alias_receipts_immutable
BEFORE UPDATE OR DELETE ON public.finance_currency_alias_receipts
FOR EACH ROW EXECUTE FUNCTION public.finance_currency_alias_receipt_immutable();

-- Serialize this small metadata-only alias transition against new account writes.
LOCK TABLE public.accounts IN SHARE ROW EXCLUSIVE MODE;

DO $normalize$
DECLARE
  v_accounts_before bigint;
  v_postings_before bigint;
  v_tx_before bigint;
  v_legacy_count bigint;
  v_moved_count bigint;
  v_updated_count bigint;
  v_money_before numeric;
  v_money_after numeric;
  v_member_wld_before numeric;
  v_member_wld_after numeric;
  v_legacy_wld numeric;
BEGIN
  SELECT count(*) INTO v_accounts_before FROM public.accounts;
  SELECT count(*) INTO v_tx_before FROM public.ledger_transactions;
  SELECT count(*) INTO v_postings_before FROM public.ledger_postings;
  SELECT coalesce(sum(available_amount), 0)::numeric
    INTO v_money_before FROM public.account_balances;
  SELECT coalesce(sum(b.available_amount),0)::numeric
    INTO v_member_wld_before
  FROM public.accounts a JOIN public.account_balances b ON b.account_id=a.id
  WHERE a.currency='WLD'
    AND a.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type);
  SELECT count(*),coalesce(sum(b.available_amount),0)::numeric
    INTO v_legacy_count,v_legacy_wld
  FROM public.accounts a JOIN public.account_balances b ON b.account_id=a.id
  WHERE a.currency='W';

  -- No unknown virtual currencies are silently re-labelled or minted.
  IF v_money_before <> 0
     OR EXISTS(SELECT 1 FROM public.accounts a WHERE trim(a.currency) NOT IN ('W','WLD'))
     OR EXISTS(SELECT 1 FROM public.accounts a WHERE a.currency='W'
        AND (a.account_type <> 'USER_CASH'::public.account_type
             OR a.owner_user_id IS NULL OR a.status <> 'active'::public.account_status))
     OR EXISTS(
        SELECT 1 FROM public.accounts a
        LEFT JOIN public.account_balances b ON b.account_id=a.id
        LEFT JOIN (
          SELECT p.account_id,
            sum(CASE WHEN p.direction='debit'::public.posting_direction
                     THEN p.amount ELSE -p.amount END)::numeric AS journal
          FROM public.ledger_postings p GROUP BY p.account_id
        ) j ON j.account_id=a.id
        WHERE a.currency='W'
          AND (b.account_id IS NULL OR b.available_amount IS DISTINCT FROM coalesce(j.journal,0))
     )
     OR EXISTS(
        SELECT 1 FROM public.ledger_postings p
        GROUP BY p.transaction_id
        HAVING sum(CASE WHEN p.direction='debit'::public.posting_direction
                        THEN p.amount ELSE -p.amount END)<>0
     )
  THEN
    RAISE EXCEPTION 'CURRENCY_ALIAS_UNCERTIFIED: unbalanced, non-WLD, unsupported legacy account or journal projection';
  END IF;

  -- Currency alias audit receipt is immutable and cannot be forged by the app.
  -- Existing account owner, account ID and available amount are NOT changed.
  INSERT INTO public.finance_currency_alias_receipts (
    account_id,owner_user_id,legacy_currency,canonical_currency,
    balance_at_normalization_wld,journal_at_normalization_wld,evidence_hash
  )
  SELECT a.id,a.owner_user_id,'W','WLD',b.available_amount::numeric,
    coalesce(j.journal,0),
    pg_catalog.encode(public.digest(
      pg_catalog.jsonb_build_object(
        'migration','v2026.11.04.1761',
        'accountId',a.id,'owner',a.owner_user_id,
        'legacyCode','W','canonicalCode','WLD',
        'availableWld',b.available_amount::text,
        'journalWld',coalesce(j.journal,0)::text
      )::text,'sha256'),'hex')
  FROM public.accounts a
  JOIN public.account_balances b ON b.account_id=a.id
  LEFT JOIN (
    SELECT p.account_id,
      sum(CASE WHEN p.direction='debit'::public.posting_direction
               THEN p.amount ELSE -p.amount END)::numeric AS journal
    FROM public.ledger_postings p GROUP BY p.account_id
  ) j ON j.account_id=a.id
  WHERE a.currency='W' AND a.account_type='USER_CASH'::public.account_type
  ON CONFLICT (account_id) DO NOTHING;
  GET DIAGNOSTICS v_moved_count = ROW_COUNT;

  UPDATE public.accounts SET currency='WLD'
  WHERE currency='W' AND account_type='USER_CASH'::public.account_type;
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  SELECT coalesce(sum(available_amount),0)::numeric
    INTO v_money_after FROM public.account_balances;
  SELECT coalesce(sum(b.available_amount),0)::numeric
    INTO v_member_wld_after
  FROM public.accounts a JOIN public.account_balances b ON b.account_id=a.id
  WHERE a.currency='WLD'
    AND a.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type);

  IF v_legacy_count <> v_moved_count OR v_legacy_count <> v_updated_count
     OR v_money_after <> v_money_before
     OR v_member_wld_after <> v_member_wld_before+v_legacy_wld
     OR (SELECT count(*) FROM public.accounts) <> v_accounts_before
     OR (SELECT count(*) FROM public.ledger_transactions) <> v_tx_before
     OR (SELECT count(*) FROM public.ledger_postings) <> v_postings_before
     OR EXISTS (SELECT 1 FROM public.accounts a WHERE a.currency <> 'WLD')
  THEN
    RAISE EXCEPTION 'CURRENCY_ALIAS_UNCERTIFIED: alias metadata transition failed conservation';
  END IF;
  RAISE NOTICE 'WLD_ALIAS_METADATA_ONLY_NORMALIZED accounts=% balance_moved_code_only=% no_new_supply=true',
    v_updated_count,v_legacy_wld;
END
$normalize$;

-- Future money writers must never reintroduce obsolete currency aliases.
ALTER TABLE public.accounts
 ADD CONSTRAINT accounts_canonical_wld_currency CHECK (currency = 'WLD') NOT VALID;
ALTER TABLE public.accounts VALIDATE CONSTRAINT accounts_canonical_wld_currency;

-- Keep the existing least-privilege web role access unchanged.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.accounts FROM PUBLIC, moneyverse_app;

COMMIT;
