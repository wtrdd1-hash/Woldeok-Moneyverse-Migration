-- v2026.11.02.1626: owner-approved reset of unproven legacy FINANCE VIEW data.
-- No canonical journal, member cash, accounts, balances, MINT or funded receipts changed.
-- Always use an independently verified full Production pg_dump BEFORE applying.
BEGIN;

CREATE TABLE IF NOT EXISTS public.finance_reset_archive_entries (
 reset_id text NOT NULL,
 source_table text NOT NULL,
 source_key text NOT NULL,
 payload jsonb NOT NULL,
 sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
 archived_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(reset_id,source_table,source_key)
);
CREATE TABLE IF NOT EXISTS public.finance_reset_runs (
 reset_id text PRIMARY KEY,
 authorized_reason text NOT NULL,
 pre_reset_backup_sha256 text NOT NULL CHECK(pre_reset_backup_sha256 ~ '^[a-f0-9]{64}$'),
 original_row_counts jsonb NOT NULL,
 verified_archive_rows bigint NOT NULL,
 executed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
REVOKE ALL ON public.finance_reset_archive_entries, public.finance_reset_runs FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.finance_legacy_reset_v1626(p_backup_sha text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,pg_temp AS $reset$
DECLARE
  preserved_money numeric;
  after_money numeric;
  preserved_journal_transactions bigint;
  preserved_journal_postings bigint;
  preserved_member_cash bigint;
  source_count bigint;
  archived_count bigint;
  original_counts jsonb;
  v_reset_key constant text := 'v2026.11.02.1626';
  source_epoch timestamptz;
  verified_backup_sha text := p_backup_sha;
BEGIN
LOCK TABLE public.system_treasury_ledger, public.state_enterprise_dividend_logs,
 public.national_pension_payout_logs, public.national_pension_contributions,
 public.national_pension_accounts, public.treasury_disbursements,
 public.deposit_insurance_premiums, public.deposit_insurance_funds
 IN ACCESS EXCLUSIVE MODE;
 IF EXISTS(SELECT 1 FROM public.finance_reset_runs WHERE reset_id='v2026.11.02.1626') THEN
    RAISE EXCEPTION 'FINANCE_RESET_ALREADY_EXECUTED' USING ERRCODE='23514';
 END IF;

 SELECT opened_at INTO source_epoch FROM public.treasury_fiscal_epochs WHERE id=1;
 IF source_epoch IS NULL THEN RAISE EXCEPTION 'FINANCE_RESET_FISCAL_EPOCH_REQUIRED' USING ERRCODE='23514'; END IF;
 IF EXISTS (
    SELECT 1 FROM public.system_treasury_ledger WHERE ledger_transaction_id IS NOT NULL
 ) OR EXISTS (
    SELECT 1 FROM public.state_enterprise_dividend_logs d
     JOIN public.ledger_transactions t ON t.id=d.ledger_tx_id
 ) OR EXISTS (
    SELECT 1 FROM public.treasury_disbursements WHERE ledger_transaction_id IS NOT NULL
 ) OR EXISTS (
    SELECT 1 FROM public.system_treasury_ledger WHERE created_at >= source_epoch
 ) OR EXISTS (
    SELECT 1 FROM public.state_enterprise_dividend_logs WHERE created_at >= source_epoch
 ) THEN
   RAISE EXCEPTION 'FINANCE_RESET_CERTIFIED_OR_CURRENT_ROWS_PRESENT' USING ERRCODE='23514';
 END IF;
 IF EXISTS(SELECT 1 FROM public.treasury_core_receipts) OR
    EXISTS(SELECT 1 FROM public.pension_funded_receipts) OR
    EXISTS(SELECT 1 FROM public.deposit_insurance_payouts) THEN
   RAISE EXCEPTION 'FINANCE_RESET_NEW_FUNDED_ACTIVITY_PRESENT' USING ERRCODE='23514';
 END IF;
 IF EXISTS(
    SELECT 1 FROM public.account_balances b
    JOIN public.accounts a ON a.id=b.account_id
    WHERE a.account_type='TREASURY' AND a.system_key='treasury' AND b.available_amount<>0
 ) OR EXISTS(
    SELECT 1 FROM public.system_treasury_vaults WHERE balance_wld<>'0'
 ) THEN
   RAISE EXCEPTION 'FINANCE_RESET_TREASURY_MUST_BE_ZERO' USING ERRCODE='23514';
 END IF;
 SELECT COALESCE(sum(available_amount),0) INTO preserved_money FROM public.account_balances;
 SELECT count(*) INTO preserved_member_cash FROM public.accounts a JOIN public.account_balances b
   ON b.account_id=a.id WHERE a.account_type='USER_CASH';
 SELECT count(*) INTO preserved_journal_transactions FROM public.ledger_transactions;
 SELECT count(*) INTO preserved_journal_postings FROM public.ledger_postings;

 WITH entries AS (
   SELECT 'system_treasury_ledger'::text AS tbl, id::text AS pk, to_jsonb(t) AS payload FROM public.system_treasury_ledger t
   UNION ALL SELECT 'state_enterprise_dividend_logs',id::text,to_jsonb(t) FROM public.state_enterprise_dividend_logs t
   UNION ALL SELECT 'national_pension_payout_logs',id::text,to_jsonb(t) FROM public.national_pension_payout_logs t
   UNION ALL SELECT 'national_pension_contributions',id::text,to_jsonb(t) FROM public.national_pension_contributions t
   UNION ALL SELECT 'national_pension_accounts',id::text,to_jsonb(t) FROM public.national_pension_accounts t
   UNION ALL SELECT 'treasury_disbursements',id::text,to_jsonb(t) FROM public.treasury_disbursements t
   UNION ALL SELECT 'deposit_insurance_premiums',id::text,to_jsonb(t) FROM public.deposit_insurance_premiums t
   UNION ALL SELECT 'deposit_insurance_funds',id::text,to_jsonb(t) FROM public.deposit_insurance_funds t
 )
 INSERT INTO public.finance_reset_archive_entries(reset_id,source_table,source_key,payload,sha256)
 SELECT v_reset_key,e.tbl,e.pk,e.payload,
    pg_catalog.encode(public.digest(pg_catalog.convert_to(e.payload::text,'UTF8'),'sha256'),'hex')
 FROM entries e;

 SELECT COALESCE(sum(n),0), COALESCE(jsonb_object_agg(source_table,n),'{}'::jsonb)
 INTO archived_count,original_counts
 FROM (SELECT source_table,count(*) AS n FROM public.finance_reset_archive_entries
       WHERE reset_id='v2026.11.02.1626' GROUP BY source_table) a;

 SELECT
    (SELECT count(*) FROM public.system_treasury_ledger)
   +(SELECT count(*) FROM public.state_enterprise_dividend_logs)
   +(SELECT count(*) FROM public.national_pension_payout_logs)
   +(SELECT count(*) FROM public.national_pension_contributions)
   +(SELECT count(*) FROM public.national_pension_accounts)
   +(SELECT count(*) FROM public.treasury_disbursements)
   +(SELECT count(*) FROM public.deposit_insurance_premiums)
   +(SELECT count(*) FROM public.deposit_insurance_funds)
 INTO source_count;
 IF archived_count<>source_count THEN
   RAISE EXCEPTION 'FINANCE_RESET_ARCHIVE_COUNT_MISMATCH % vs %', archived_count,source_count USING ERRCODE='23514';
 END IF;

 DELETE FROM public.system_treasury_ledger;
 DELETE FROM public.state_enterprise_dividend_logs;
 DELETE FROM public.treasury_disbursements;
 DELETE FROM public.national_pension_payout_logs;
 DELETE FROM public.national_pension_contributions;
 DELETE FROM public.national_pension_accounts;
 DELETE FROM public.deposit_insurance_premiums;
 UPDATE public.deposit_insurance_funds
    SET total_fund_wld=0, total_insured_deposits_wld=0,
        cumulative_premiums_collected_wld=0, cumulative_payouts_wld=0,
        is_emergency_mode=false,updated_at=clock_timestamp()
    WHERE total_fund_wld<>0 OR total_insured_deposits_wld<>0 OR
          cumulative_premiums_collected_wld<>0 OR cumulative_payouts_wld<>0 OR is_emergency_mode;

 SELECT COALESCE(sum(available_amount),0) INTO after_money FROM public.account_balances;
 IF after_money<>preserved_money OR
    (SELECT count(*) FROM public.ledger_transactions)<>preserved_journal_transactions OR
    (SELECT count(*) FROM public.ledger_postings)<>preserved_journal_postings OR
    (SELECT count(*) FROM public.accounts a JOIN public.account_balances b
     ON b.account_id=a.id WHERE a.account_type='USER_CASH')<>preserved_member_cash THEN
    RAISE EXCEPTION 'FINANCE_RESET_CANONICAL_MEMBER_OR_JOURNAL_DRIFT' USING ERRCODE='23514';
 END IF;

 IF source_count>0 THEN
    IF verified_backup_sha IS NULL OR verified_backup_sha !~ '^[a-f0-9]{64}$' THEN
      RAISE EXCEPTION 'FINANCE_RESET_VERIFIED_BACKUP_REQUIRED' USING ERRCODE='23514';
    END IF;
    INSERT INTO public.finance_reset_runs
    (reset_id,authorized_reason,pre_reset_backup_sha256,original_row_counts,verified_archive_rows)
    VALUES (v_reset_key,
     'Explicit owner-approved cleanup of uncertified financial projections; original records preserved in read-only archive. No member wallet or canonical postings reset.',
     verified_backup_sha,
     original_counts,archived_count);
 END IF;
 RETURN archived_count;
END;
$reset$;
ALTER FUNCTION public.finance_legacy_reset_v1626(text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.finance_legacy_reset_v1626(text) FROM PUBLIC,moneyverse_app;
REVOKE ALL ON public.finance_reset_archive_entries, public.finance_reset_runs FROM PUBLIC,moneyverse_app;
COMMIT;
