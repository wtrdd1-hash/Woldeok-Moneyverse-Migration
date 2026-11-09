-- v2026.11.09.1944 ONE-TIME OPERATOR ACTION — NEVER RUN WITHOUT INDEPENDENT
-- HASHED FULL PG17 BACKUP AND RESTORED CLONE RECEIPT.
-- Explicit owner authorization allows resetting spendable Treasury to zero,
-- not deleting history or adjusting member wallets. All monetary effects are
-- compensating MINT debits / TREASURY credits through economy_post_transaction.
-- The public fiscal-epoch archive, original SWF receipts and pension/dividend
-- records remain intact. Fail if any source/balance has changed since review.
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SET LOCAL lock_timeout = '8s';
SET LOCAL statement_timeout = '60000ms';
DO $correct$
DECLARE
  v_expected_total CONSTANT numeric := 191055911;
  v_expected_swf CONSTANT numeric := 181056161;
  v_expected_archive CONSTANT text := 'e62cc6528e22c3bf60362c4e584d09b01cecef3d9112eb5a0f9e5bcde9e32bc7';
  v_expected_backup CONSTANT text := '12407e12fb00dd7a8eebb6ed2f27812a40695f98a3308e45d74471299eb4ac84';
  v_treasury_id uuid;
  v_mint_id uuid;
  v_actor uuid;
  v_source_id uuid;
  v_vault record;
  v_tx uuid;
  v_pre_treasury numeric;
  v_post_treasury numeric;
  v_pre_money numeric;
  v_post_money numeric;
  v_total_vault numeric;
  v_total_journal numeric;
  v_source_count integer;
  v_receipt_count integer;
  v_total_reset numeric := 0;
  v_fiscal record;
BEGIN
  -- Application writes must not race the one-time rebaseline.
  PERFORM pg_catalog.pg_advisory_xact_lock(1944, 1);
  LOCK TABLE public.system_treasury_vaults, public.system_treasury_ledger,
    public.ledger_transactions, public.ledger_postings, public.accounts,
    public.account_balances IN SHARE ROW EXCLUSIVE MODE;
  IF pg_catalog.current_database() <> 'woldeok_moneyverse_dev' THEN
    RAISE EXCEPTION 'TREASURY_V1944_UNKNOWN_DATABASE' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.schema_migrations
    WHERE filename = '343-block-unfunded-swf-liquidation.sql') THEN
    RAISE EXCEPTION 'TREASURY_V1944_LIQUIDATION_HOLD_REQUIRED' USING ERRCODE = '23514';
  END IF;
  SELECT * INTO v_fiscal FROM public.treasury_fiscal_proof_read();
  IF v_fiscal.database_name <> current_database()
    OR v_fiscal.backup_sha256 <> v_expected_archive
    OR v_fiscal.invalid_new_sources <> '0'
    OR v_fiscal.vault_total <> v_expected_total::text
    OR v_fiscal.journal_total <> v_expected_total::text
    OR v_fiscal.canonical_total <> v_expected_total::text
    OR v_fiscal.canonical_count <> '1'
    OR v_fiscal.vault_count <> '5' THEN
    RAISE EXCEPTION 'TREASURY_V1944_PRE_RESET_PROOF_MISMATCH' USING ERRCODE = '23514';
  END IF;
  SELECT count(*)::int INTO v_source_count
  FROM public.ledger_transactions t WHERE t.type = 'SWF_PORTFOLIO_LIQUIDATION';
  SELECT t.id, t.actor_user_id INTO v_source_id, v_actor
  FROM public.ledger_transactions t
  WHERE t.type = 'SWF_PORTFOLIO_LIQUIDATION' LIMIT 1;
  IF v_source_count <> 1 OR v_source_id IS NULL OR v_actor IS NULL THEN
    RAISE EXCEPTION 'TREASURY_V1944_SWF_SOURCE_AMBIGUOUS' USING ERRCODE = '23514';
  END IF;
  SELECT count(*)::int INTO v_receipt_count
  FROM public.system_treasury_ledger l
  JOIN public.system_treasury_vaults v ON v.id=l.vault_id
  WHERE l.ledger_transaction_id=v_source_id AND l.tx_type='INJECTION'
    AND l.amount_wld::numeric=v_expected_swf AND v.code='VAULT_MAIN';
  IF v_receipt_count <> 1 THEN
    RAISE EXCEPTION 'TREASURY_V1944_SOURCE_RECEIPT_MISMATCH' USING ERRCODE='23514';
  END IF;
  SELECT id INTO STRICT v_mint_id FROM public.accounts
  WHERE account_type='MINT'::public.account_type AND system_key='mint';
  SELECT id INTO STRICT v_treasury_id FROM public.accounts
  WHERE account_type='TREASURY'::public.account_type AND system_key='treasury';
  SELECT available_amount INTO v_pre_treasury FROM public.account_balances
  WHERE account_id=v_treasury_id;
  SELECT coalesce(sum(b.available_amount),0) INTO v_pre_money
  FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id
  WHERE a.account_type IN ('USER_CASH'::public.account_type,'USER_BANK'::public.account_type);
  IF v_pre_treasury IS DISTINCT FROM v_expected_total THEN
    RAISE EXCEPTION 'TREASURY_V1944_CURRENT_BALANCE_CHANGED' USING ERRCODE='23514';
  END IF;
  -- Each vault gets a separate idempotent and source-linked canonical receipt.
  -- A single journal transaction cannot link five separate audit rows because
  -- system_treasury_ledger.ledger_transaction_id is UNIQUE by design.
  FOR v_vault IN
    SELECT id, code, balance_wld FROM public.system_treasury_vaults ORDER BY code FOR UPDATE
  LOOP
    IF v_vault.balance_wld::numeric <= 0 THEN
      RAISE EXCEPTION 'TREASURY_V1944_VAULT_NOT_POSITIVE: %', v_vault.code USING ERRCODE='23514';
    END IF;
    IF (v_vault.code='VAULT_MAIN' AND v_vault.balance_wld::numeric<>185055981)
      OR (v_vault.code='VAULT_WELFARE' AND v_vault.balance_wld::numeric<>2999930)
      OR (v_vault.code IN ('VAULT_EMERGENCY','VAULT_INFRA','VAULT_RESERVE')
            AND v_vault.balance_wld::numeric<>1000000)
      OR v_vault.code NOT IN ('VAULT_MAIN','VAULT_WELFARE','VAULT_EMERGENCY','VAULT_INFRA','VAULT_RESERVE') THEN
      RAISE EXCEPTION 'TREASURY_V1944_VAULT_SNAPSHOT_DRIFT: %', v_vault.code USING ERRCODE='23514';
    END IF;
    v_tx := public.economy_post_transaction(
      md5('owner-approved-treasury-fiscal-zero-v1944:' || v_vault.code)::uuid,
      'TREASURY_OWNER_APPROVED_FISCAL_ZERO_V1944', v_actor, NULL,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('accountId',v_mint_id,'amount',v_vault.balance_wld,'direction','debit'),
        pg_catalog.jsonb_build_object('accountId',v_treasury_id,'amount',v_vault.balance_wld,'direction','credit')
      ), 'treasury.owner_approved_fiscal_reset_v1944',
      pg_catalog.jsonb_build_object('sourceSwfTransaction',v_source_id,'vaultCode',v_vault.code,
        'backingRule','reverse unverified modeled-AUM and remaining initial treasury WLD',
        'resetBackupSha256',v_expected_backup,'ownerApproved',true)
    );
    UPDATE public.system_treasury_vaults
    SET balance_wld='0', updated_at=pg_catalog.clock_timestamp()
    WHERE id=v_vault.id AND balance_wld=v_vault.balance_wld;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'TREASURY_V1944_VAULT_CHANGED' USING ERRCODE='23514';
    END IF;
    INSERT INTO public.system_treasury_ledger
      (vault_id,tx_type,amount_wld,actor_id,reason,balance_before,balance_after,ledger_transaction_id)
    VALUES (v_vault.id,'ABSORPTION_SINK',v_vault.balance_wld,NULL,
      'Owner-approved v1944 fiscal correction; canonical WLD returned to MINT; original ledger and member payments retained',
      v_vault.balance_wld,'0',v_tx);
    v_total_reset:=v_total_reset+v_vault.balance_wld::numeric;
  END LOOP;
  SELECT available_amount INTO v_post_treasury FROM public.account_balances
  WHERE account_id=v_treasury_id;
  SELECT coalesce(sum(b.available_amount),0) INTO v_post_money
  FROM public.account_balances b JOIN public.accounts a ON a.id=b.account_id
  WHERE a.account_type IN ('USER_CASH'::public.account_type,'USER_BANK'::public.account_type);
  SELECT coalesce(sum(balance_wld::numeric),0) INTO v_total_vault FROM public.system_treasury_vaults;
  SELECT coalesce(sum(CASE WHEN p.direction='debit'::public.posting_direction THEN p.amount ELSE -p.amount END),0)
    INTO v_total_journal FROM public.ledger_postings p JOIN public.accounts a ON a.id=p.account_id
  WHERE a.id=v_treasury_id;
  IF v_total_reset<>v_expected_total OR v_post_treasury<>0 OR v_total_vault<>0
    OR v_total_journal<>0 OR v_pre_money<>v_post_money THEN
    RAISE EXCEPTION 'TREASURY_V1944_POST_RESET_INVARIANT_FAILED' USING ERRCODE='23514';
  END IF;
  SELECT * INTO v_fiscal FROM public.treasury_fiscal_proof_read();
  IF v_fiscal.vault_total<>'0' OR v_fiscal.canonical_total<>'0'
    OR v_fiscal.journal_total<>'0' OR v_fiscal.invalid_new_sources<>'0' THEN
    RAISE EXCEPTION 'TREASURY_V1944_FINAL_SOURCE_PROOF_FAILED' USING ERRCODE='23514';
  END IF;
  INSERT INTO public.treasury_swf_events(event_type,amount_wld,summary,metadata)
  VALUES ('FISCAL_CORRECTION_V1944',v_total_reset,
    'Owner-approved fiscal balance reset via canonical MINT counterpostings; original SWF liquidity claim and all member transactions preserved',
    pg_catalog.jsonb_build_object('sourceSwfTransaction',v_source_id,
      'preResetTreasury',v_expected_total::text,'postResetTreasury','0',
      'sourceBackedSwfAmount',v_expected_swf::text,'backupSha256',v_expected_backup));
  RAISE NOTICE 'TREASURY_V1944_CLONE_OR_PROD_RESULT: canonical WLD correction verified; original user balances and ledger preserved';
END;
$correct$;
COMMIT;
