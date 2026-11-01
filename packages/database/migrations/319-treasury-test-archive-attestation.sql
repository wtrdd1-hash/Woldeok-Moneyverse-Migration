-- v1614: independently attest the existing official Test Treasury backup.
-- The already-applied Production migration 314 is immutable and must not be edited.
-- Production epoch amounts and SHA are NEVER changed by this migration.
BEGIN;
CREATE TABLE IF NOT EXISTS public.treasury_epoch_attestation_corrections (
  id integer PRIMARY KEY CHECK (id = 1),
  database_name text NOT NULL,
  previous_backup_sha256 text NOT NULL,
  verified_backup_sha256 text NOT NULL,
  source_dump_name text NOT NULL,
  previous_reset_reason text NOT NULL,
  archived_vault_total_wld text NOT NULL,
  archived_legacy_events integer NOT NULL,
  archived_enterprise_dividends integer NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.treasury_epoch_attestation_corrections OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON TABLE public.treasury_epoch_attestation_corrections
  FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.treasury_epoch_attestation_correction_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,pg_temp
AS $function$
BEGIN
  RAISE EXCEPTION USING ERRCODE='55000',
    MESSAGE='Treasury epoch attestation correction is append-only';
END;
$function$;
ALTER FUNCTION public.treasury_epoch_attestation_correction_immutable()
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_epoch_attestation_correction_immutable() FROM PUBLIC;
CREATE TRIGGER treasury_epoch_attestation_correction_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON public.treasury_epoch_attestation_corrections
  FOR EACH STATEMENT EXECUTE FUNCTION public.treasury_epoch_attestation_correction_immutable();

DO $test_attestation$
DECLARE
  e public.treasury_fiscal_epochs%ROWTYPE;
  n integer;
  v numeric;
  c numeric;
  posts numeric;
  archive_sum numeric;
  historic_treasury integer;
  historic_dividends integer;
  target_sha CONSTANT text := '2149b77487f83f4e871ff44aa0e1f471b8ada6db9d9e622ce66e6e19ead420d6';
  original_sha CONSTANT text := 'e62cc6528e22c3bf60362c4e584d09b01cecef3d9112eb5a0f9e5bcde9e32bc7';
BEGIN
  -- Only two exact, independently secured and restored DB identities may correct
  -- the mismatched Test metadata. All other DBs (including Production and CI)
  -- are deliberately untouched.
  IF current_database() NOT IN (
    'wdmv_v761_test_acl_v1544_restore',
    'wdmv_v1614_fiscal_rehearsal'
  ) THEN
    RETURN;
  END IF;
  SELECT * INTO e FROM public.treasury_fiscal_epochs WHERE id = 1 FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'TEST_EPOCH_NOT_INITIALIZED' USING ERRCODE='23514';
  END IF;
  IF e.full_backup_sha256 = target_sha
     AND EXISTS (SELECT 1 FROM public.treasury_epoch_attestation_corrections WHERE id=1) THEN
    RETURN;
  END IF;
  IF e.full_backup_sha256 <> original_sha
     OR e.archived_vault_total_wld <> '60000000'
     OR e.archived_legacy_events <> 3
     OR e.archived_enterprise_dividends <> 0
     OR coalesce(jsonb_array_length(e.archived_vaults),0) <> 5 THEN
    RAISE EXCEPTION 'TEST_EPOCH_ARCHIVE_MISMATCH' USING ERRCODE='23514';
  END IF;
  SELECT coalesce(sum((item->>'balance_wld')::numeric),0) INTO archive_sum
    FROM jsonb_array_elements(e.archived_vaults) item;
  SELECT count(*), coalesce(sum(balance_wld::numeric),0)
    INTO n,v FROM public.system_treasury_vaults;
  SELECT count(*), max(ab.available_amount)
    INTO n,c FROM public.accounts a JOIN public.account_balances ab ON a.id=ab.account_id
    WHERE a.account_type='TREASURY' AND a.system_key='treasury';
  SELECT coalesce(sum(CASE WHEN p.direction::text='debit' THEN p.amount ELSE -p.amount END),0)
    INTO posts FROM public.ledger_postings p JOIN public.accounts a ON a.id=p.account_id
    WHERE a.account_type='TREASURY' AND a.system_key='treasury';
  SELECT count(*) INTO historic_treasury
    FROM public.system_treasury_ledger WHERE created_at<e.opened_at;
  SELECT count(*) INTO historic_dividends
    FROM public.state_enterprise_dividend_logs WHERE created_at<e.opened_at;
  IF archive_sum <> 60000000 OR (SELECT count(*) FROM public.system_treasury_vaults) <> 5
     OR v <> 0 OR n <> 1 OR c IS DISTINCT FROM 0 OR posts <> 0
     OR historic_treasury <> 3 OR historic_dividends <> 0
     OR EXISTS (SELECT 1 FROM public.system_treasury_ledger WHERE created_at >= e.opened_at)
     OR EXISTS (SELECT 1 FROM public.state_enterprise_dividend_logs WHERE created_at >= e.opened_at) THEN
    RAISE EXCEPTION 'TEST_EPOCH_CURRENT_LEDGER_NOT_ZERO' USING ERRCODE='23514';
  END IF;
  INSERT INTO public.treasury_epoch_attestation_corrections (
    id,database_name,previous_backup_sha256,verified_backup_sha256,
    source_dump_name,previous_reset_reason,archived_vault_total_wld,
    archived_legacy_events,archived_enterprise_dividends
  ) VALUES (
    1,current_database(),original_sha,target_sha,
    'before-318-test.pgdump',e.reset_reason,e.archived_vault_total_wld,
    e.archived_legacy_events,e.archived_enterprise_dividends
  );
  UPDATE public.treasury_fiscal_epochs SET
    full_backup_sha256 = target_sha,
    reset_reason = 'Test-only independently backed fiscal epoch: backup SHA verified; ' ||
      'source migration 314 unchanged; correction permanently audited in migration 319'
    WHERE id = 1;
END;
$test_attestation$;
COMMIT;
