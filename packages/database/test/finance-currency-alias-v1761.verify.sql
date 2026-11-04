-- v1761 strict READ-ONLY post-migration proof: may run on any authorized
-- isolated PostgreSQL restore. No member money, IDs, account metadata or
-- ledger records are changed by this verifier.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;

DO $verify$
DECLARE
  v_aliases bigint;
  v_balance_sum numeric;
  v_wrong_accounts bigint;
  v_bad_receipts bigint;
  v_drift bigint;
BEGIN
  SELECT count(*) INTO v_aliases FROM public.finance_currency_alias_receipts;
  SELECT coalesce(sum(b.available_amount),0)::numeric INTO v_balance_sum
  FROM public.account_balances b;
  SELECT count(*) INTO v_wrong_accounts
  FROM public.accounts a WHERE a.currency <> 'WLD';

  SELECT count(*) INTO v_bad_receipts FROM public.finance_currency_alias_receipts r
  JOIN public.accounts a ON a.id=r.account_id
  WHERE a.currency<>'WLD' OR a.owner_user_id IS DISTINCT FROM r.owner_user_id
    OR r.balance_at_normalization_wld<>r.journal_at_normalization_wld
    OR r.evidence_hash IS DISTINCT FROM pg_catalog.encode(public.digest(
      pg_catalog.jsonb_build_object(
        'migration','v2026.11.04.1761',
        'accountId',r.account_id,'owner',r.owner_user_id,
        'legacyCode','W','canonicalCode','WLD',
        'availableWld',r.balance_at_normalization_wld::text,
        'journalWld',r.journal_at_normalization_wld::text
      )::text,'sha256'),'hex');

  SELECT count(*) INTO v_drift
  FROM public.account_balances b
  LEFT JOIN (
    SELECT p.account_id,
      sum(CASE WHEN p.direction='debit'::public.posting_direction
               THEN p.amount ELSE -p.amount END)::numeric AS journal
    FROM public.ledger_postings p GROUP BY p.account_id
  ) j ON j.account_id=b.account_id
  WHERE b.available_amount IS DISTINCT FROM coalesce(j.journal,0);

  IF v_wrong_accounts<>0 OR v_bad_receipts<>0 OR v_drift<>0 OR v_balance_sum<>0
     OR has_table_privilege('moneyverse_app','public.finance_currency_alias_receipts','INSERT')
     OR has_table_privilege('moneyverse_app','public.finance_currency_alias_receipts','UPDATE')
     OR has_table_privilege('moneyverse_app','public.finance_currency_alias_receipts','DELETE')
  THEN
    RAISE EXCEPTION 'CURRENCY_ALIAS_UNCERTIFIED: after-migration evidence or canonical balance failure';
  END IF;
  RAISE NOTICE 'CANONICAL_WLD_ALIAS_v1761_OK receipts=% total_money_delta=0 account_balance_drift=0 app_receipts_DML=false',v_aliases;
END
$verify$;

ROLLBACK;
