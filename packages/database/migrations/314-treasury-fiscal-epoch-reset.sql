-- v2026.10.31.1553: one-shot, owner-authorized Treasury fiscal baseline reset.
-- Requires verified external full pg_dump; preserves every historical financial record.
-- Does not edit canonical journal, members, balances, MINT, pensions or dividends.
BEGIN;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET LOCAL statement_timeout = '20000ms';
LOCK TABLE public.system_treasury_vaults IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.system_treasury_ledger IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.state_enterprise_dividend_logs IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE public.treasury_fiscal_epochs (
  id integer PRIMARY KEY CHECK (id=1),
  opened_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  canonical_opening_wld text NOT NULL CHECK (canonical_opening_wld='0'),
  archived_vault_total_wld text NOT NULL,
  archived_vaults jsonb NOT NULL,
  archived_legacy_events integer NOT NULL,
  archived_enterprise_dividends integer NOT NULL,
  full_backup_sha256 text NOT NULL CHECK (full_backup_sha256 ~ '^[a-f0-9]{64}$'),
  reset_reason text NOT NULL
);
DO $epoch$
DECLARE n integer; c numeric; posted numeric; vault_total numeric; snap jsonb;
 legacy_total integer; missing_links integer; dividends integer;
BEGIN
 SELECT count(*),max(ab.available_amount) INTO n,c
 FROM public.accounts a JOIN public.account_balances ab ON ab.account_id=a.id
 WHERE a.account_type='TREASURY' AND a.system_key='treasury';
 IF n<>1 OR c IS DISTINCT FROM 0 THEN
  RAISE EXCEPTION 'TREASURY_EPOCH_CANONICAL_ZERO_REQUIRED' USING ERRCODE='23514';
 END IF;
 SELECT coalesce(sum(CASE WHEN p.direction::text='debit' THEN p.amount
 WHEN p.direction::text='credit' THEN -p.amount ELSE 0 END),0)
 INTO posted FROM public.ledger_postings p
 JOIN public.accounts a ON a.id=p.account_id
 WHERE a.account_type='TREASURY' AND a.system_key='treasury';
 IF posted<>0 THEN
  RAISE EXCEPTION 'TREASURY_EPOCH_PROJECTION_UNVERIFIED' USING ERRCODE='23514';
 END IF;
 SELECT sum(balance_wld::numeric),jsonb_agg(jsonb_build_object('code',code,'balance_wld',balance_wld) ORDER BY code)
 INTO vault_total,snap FROM public.system_treasury_vaults;
 SELECT count(*),count(*) FILTER (WHERE ledger_transaction_id IS NULL)
 INTO legacy_total,missing_links FROM public.system_treasury_ledger;
 SELECT count(*) INTO dividends FROM public.state_enterprise_dividend_logs;
 IF vault_total IS DISTINCT FROM 220923528 OR jsonb_array_length(snap)<>5
 OR legacy_total<>552 OR missing_links<>552 OR dividends<>744 THEN
  RAISE EXCEPTION 'TREASURY_EPOCH_BASELINE_CHANGED' USING ERRCODE='23514';
 END IF;
 INSERT INTO public.treasury_fiscal_epochs
 (id,canonical_opening_wld,archived_vault_total_wld,archived_vaults,
  archived_legacy_events,archived_enterprise_dividends,full_backup_sha256,reset_reason)
 VALUES (1,'0',vault_total::text,snap,legacy_total,dividends,
 'e62cc6528e22c3bf60362c4e584d09b01cecef3d9112eb5a0f9e5bcde9e32bc7',
 'Owner-approved Treasury-only fiscal epoch reset: archive legacy totals; preserve old entries and canonical user ledger; zero new epoch has no available funds');
 UPDATE public.system_treasury_vaults
 SET balance_wld='0',updated_at=clock_timestamp() WHERE balance_wld<>'0';
END;
$epoch$;

CREATE OR REPLACE FUNCTION public.treasury_fiscal_guard_vault()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,pg_temp AS $body$
DECLARE backing numeric; reported numeric; n integer;
BEGIN
 SELECT count(*),max(ab.available_amount) INTO n,backing
 FROM public.accounts a JOIN public.account_balances ab ON a.id=ab.account_id
 WHERE a.account_type='TREASURY' AND a.system_key='treasury';
 SELECT coalesce(sum(balance_wld::numeric),0) INTO reported FROM public.system_treasury_vaults;
 IF n<>1 OR backing IS NULL OR reported>backing THEN
  RAISE EXCEPTION 'TREASURY_EPOCH_UNBACKED' USING ERRCODE='23514';
 END IF;
 RETURN NULL;
END;
$body$;
CREATE CONSTRAINT TRIGGER fiscal_vault_backing_guard
 AFTER INSERT OR UPDATE OR DELETE ON public.system_treasury_vaults
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW
 EXECUTE FUNCTION public.treasury_fiscal_guard_vault();

CREATE OR REPLACE FUNCTION public.treasury_fiscal_guard_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,pg_temp AS $body$
DECLARE began timestamptz; tx uuid; posting_count integer; balance numeric; treasury_count integer;
BEGIN
 SELECT opened_at INTO began FROM public.treasury_fiscal_epochs WHERE id=1;
 IF began IS NULL THEN
  RAISE EXCEPTION 'TREASURY_EPOCH_MISSING_CANONICAL_PROVENANCE' USING ERRCODE='23514';
 END IF;
 IF TG_OP='UPDATE' AND NEW.created_at<began THEN
  RAISE EXCEPTION 'TREASURY_EPOCH_ARCHIVED_SOURCE_IMMUTABLE' USING ERRCODE='23514';
 END IF;
 -- INSERT is always a new event, even when a caller tries to backdate created_at.
 IF TG_TABLE_NAME='system_treasury_ledger' THEN tx:=NEW.ledger_transaction_id;
 ELSE tx:=NEW.ledger_tx_id; END IF;
 IF tx IS NULL THEN
  RAISE EXCEPTION 'TREASURY_EPOCH_MISSING_CANONICAL_PROVENANCE' USING ERRCODE='23514';
 END IF;
 SELECT count(*)::int,
 coalesce(sum(CASE WHEN p.direction::text='debit' THEN p.amount
 WHEN p.direction::text='credit' THEN -p.amount ELSE 0 END),0),
 count(*) FILTER(WHERE a.account_type='TREASURY' AND a.system_key='treasury')::int
 INTO posting_count,balance,treasury_count FROM public.ledger_postings p
 JOIN public.accounts a ON a.id=p.account_id WHERE p.transaction_id=tx;
 IF posting_count<2 OR balance<>0 OR treasury_count<1
 OR NOT EXISTS(SELECT 1 FROM public.ledger_transactions WHERE id=tx) THEN
  RAISE EXCEPTION 'TREASURY_EPOCH_MISSING_CANONICAL_PROVENANCE' USING ERRCODE='23514';
 END IF;
 RETURN NULL;
END;
$body$;
CREATE CONSTRAINT TRIGGER fiscal_treasury_source_guard
 AFTER INSERT OR UPDATE ON public.system_treasury_ledger
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW
 EXECUTE FUNCTION public.treasury_fiscal_guard_event();
CREATE CONSTRAINT TRIGGER fiscal_dividend_source_guard
 AFTER INSERT OR UPDATE ON public.state_enterprise_dividend_logs
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW
 EXECUTE FUNCTION public.treasury_fiscal_guard_event();
COMMIT;
