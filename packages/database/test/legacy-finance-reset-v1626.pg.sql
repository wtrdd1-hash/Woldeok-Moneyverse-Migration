\set ON_ERROR_STOP on
DO $verify$
DECLARE n bigint; archive_n bigint; currency_before numeric;
BEGIN
 IF to_regclass('public.finance_reset_archive_entries') IS NULL THEN
   RAISE EXCEPTION 'RED: finance reset archive missing';
 END IF;
 SELECT count(*) INTO archive_n FROM public.finance_reset_archive_entries WHERE reset_id='v2026.11.02.1626';
 IF archive_n<>1546 THEN RAISE EXCEPTION 'archive expected 1546, got %',archive_n; END IF;
 SELECT count(*) INTO n FROM public.system_treasury_ledger;
 IF n<>0 THEN RAISE EXCEPTION 'Treasury legacy source still active: %',n; END IF;
 SELECT count(*) INTO n FROM public.state_enterprise_dividend_logs;
 IF n<>0 THEN RAISE EXCEPTION 'SOE dividend legacy source still active: %',n; END IF;
 SELECT count(*) INTO n FROM public.national_pension_payout_logs;
 IF n<>0 THEN RAISE EXCEPTION 'NPS payout history still active'; END IF;
 SELECT count(*) INTO n FROM public.national_pension_contributions;
 IF n<>0 THEN RAISE EXCEPTION 'NPS contribution history still active'; END IF;
 SELECT count(*) INTO n FROM public.national_pension_accounts;
 IF n<>0 THEN RAISE EXCEPTION 'NPS model balances not reset'; END IF;
 SELECT count(*) INTO n FROM public.treasury_disbursements;
 IF n<>0 THEN RAISE EXCEPTION 'Legacy Treasury disbursement remains'; END IF;
 SELECT count(*) INTO n FROM public.deposit_insurance_premiums;
 IF n<>0 THEN RAISE EXCEPTION 'Legacy KDIC premium remains'; END IF;
 IF EXISTS (SELECT 1 FROM public.deposit_insurance_funds WHERE total_fund_wld<>0 OR
    cumulative_premiums_collected_wld<>0 OR cumulative_payouts_wld<>0 OR total_insured_deposits_wld<>0)
 THEN RAISE EXCEPTION 'unbacked KDIC model amounts not reset'; END IF;
 IF (SELECT count(*) FROM public.ledger_transactions) < 890 OR
    (SELECT count(*) FROM public.ledger_postings) < 1829 THEN
    RAISE EXCEPTION 'canonical journal changed';
 END IF;
 IF (SELECT count(*) FROM public.treasury_core_receipts)<>0 THEN
    RAISE EXCEPTION 'new funded canonical receipts changed';
 END IF;
 IF EXISTS (SELECT 1 FROM public.account_balances b
    JOIN public.accounts a ON a.id=b.account_id WHERE a.account_type='TREASURY' AND b.available_amount<>0) THEN
    RAISE EXCEPTION 'Treasury projection reset not consistent with actual balance';
 END IF;
 RAISE NOTICE 'PASS protected legacy reset 1546 archived, source views empty, model fund zero and canonical journal retained';
END;
$verify$;
SELECT * FROM public.pension_public_overview();
