-- v1553 post-migration synthetic public PostgreSQL assertions.
DO $check$
DECLARE s jsonb; total numeric; treasury numeric; member numeric;
BEGIN
 SELECT archived_vaults INTO s FROM public.treasury_fiscal_epochs WHERE id=1;
 IF s IS NULL OR jsonb_array_length(s)<>5 THEN
  RAISE EXCEPTION 'ARCHIVE_SNAPSHOT_MISSING';
 END IF;
 IF (SELECT archived_vault_total_wld FROM public.treasury_fiscal_epochs WHERE id=1)<>'220923528'
 OR (SELECT archived_legacy_events FROM public.treasury_fiscal_epochs WHERE id=1)<>552
 OR (SELECT archived_enterprise_dividends FROM public.treasury_fiscal_epochs WHERE id=1)<>744 THEN
  RAISE EXCEPTION 'WRONG_FISCAL_ARCHIVE_COUNTS';
 END IF;
 SELECT sum(balance_wld::numeric) INTO total FROM public.system_treasury_vaults;
 SELECT available_amount INTO treasury FROM public.account_balances
 WHERE account_id='00000000-0000-4000-8000-000000000001';
 SELECT available_amount INTO member FROM public.account_balances
 WHERE account_id='00000000-0000-4000-8000-000000000002';
 IF total<>0 OR treasury<>0 OR member<>100 THEN
  RAISE EXCEPTION 'CANONICAL_OR_MEMBER_BALANCE_CHANGED';
 END IF;
 IF (SELECT count(*) FROM public.system_treasury_ledger)<>552 OR
    (SELECT count(*) FROM public.state_enterprise_dividend_logs)<>744 THEN
  RAISE EXCEPTION 'HISTORIC_FINANCIAL_RECORDS_LOST';
 END IF;
END;
$check$;
