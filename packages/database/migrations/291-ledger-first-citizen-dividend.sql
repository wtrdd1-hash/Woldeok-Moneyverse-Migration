-- v2026.10.28.1420: atomic canonical citizen dividend, forward-only.
-- NEVER replay historical payout or fabricate opening treasury cash.
BEGIN;
ALTER TABLE public.treasury_disbursements
 ADD COLUMN IF NOT EXISTS request_key uuid UNIQUE,
 ADD COLUMN IF NOT EXISTS ledger_transaction_id uuid UNIQUE REFERENCES public.ledger_transactions(id),
 ADD COLUMN IF NOT EXISTS beneficiary_account_ids uuid[],
 ADD COLUMN IF NOT EXISTS receipt jsonb;
ALTER TABLE public.system_treasury_ledger
 ADD COLUMN IF NOT EXISTS ledger_transaction_id uuid UNIQUE REFERENCES public.ledger_transactions(id);

CREATE OR REPLACE FUNCTION public.treasury_disburse_citizen_dividend(
 p_actor uuid,p_amount_per_user_wld text,p_reason text,p_request_key uuid
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $dividend$
DECLARE
 v_amount numeric; v_total numeric; v_count integer;
 v_treasury_account uuid; v_treasury_balance numeric;
 v_recipients uuid[]; v_postings jsonb; v_tx_id uuid;
 v_vault_id uuid; v_before numeric; v_after numeric; v_floor numeric;
 v_receipt jsonb; v_id uuid; v_ledger_id uuid; v_old record;
BEGIN
 IF p_actor IS NULL OR p_request_key IS NULL OR
    NOT public.admin_role_holder(p_actor,'operator'::public.admin_role) THEN
  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='operator and stable payout key required';
 END IF;
 IF p_amount_per_user_wld IS NULL OR p_amount_per_user_wld !~ '^[1-9][0-9]*$'
     OR length(p_amount_per_user_wld)>7 THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='positive bounded integer dividend required';
 END IF;
 v_amount := p_amount_per_user_wld::numeric;
 IF v_amount>1000000 OR p_reason IS NULL OR length(btrim(p_reason))<10 THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid dividend amount or audited reason';
 END IF;

 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_request_key::text));
 SELECT d.receipt,d.admin_id,d.amount_per_beneficiary_wld,d.reason INTO v_old
 FROM public.treasury_disbursements d WHERE d.request_key=p_request_key;
 IF FOUND THEN
  IF v_old.receipt IS NULL OR v_old.admin_id IS DISTINCT FROM p_actor
      OR v_old.amount_per_beneficiary_wld::numeric<>v_amount
      OR v_old.reason IS DISTINCT FROM p_reason THEN
   RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='dividend replay request differs';
  END IF;
  RETURN v_old.receipt;
 END IF;

 SELECT a.id INTO STRICT v_treasury_account FROM public.accounts a
 WHERE a.account_type='TREASURY'::public.account_type
   AND a.status='active'::public.account_status;
 SELECT pg_catalog.array_agg(a.id ORDER BY a.id),count(*) INTO v_recipients,v_count
 FROM public.accounts a JOIN public.users u ON u.id=a.owner_user_id
 WHERE a.account_type='USER_CASH'::public.account_type
   AND a.status='active'::public.account_status
   AND u.status='active'::public.user_status;
 IF v_count<1 OR v_count>10000 THEN
  RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='beneficiary count outside safe bounds';
 END IF;
 v_total := v_count*v_amount;
 -- Match canonical account locking order before taking the vault lock.
 PERFORM a.id FROM public.accounts a
 WHERE a.id=v_treasury_account OR a.id=ANY(v_recipients)
 ORDER BY a.id FOR UPDATE;
 IF (SELECT count(*) FROM public.accounts a JOIN public.users u ON u.id=a.owner_user_id
      WHERE a.id=ANY(v_recipients) AND a.status='active'::public.account_status
        AND u.status='active'::public.user_status)<>v_count THEN
  RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='beneficiary status changed';
 END IF;
 SELECT b.available_amount INTO v_treasury_balance FROM public.account_balances b
 WHERE b.account_id=v_treasury_account FOR UPDATE;
 IF v_treasury_balance IS NULL OR v_treasury_balance<v_total THEN
  RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='insufficient certified treasury ledger balance';
 END IF;
 SELECT v.id,v.balance_wld::numeric INTO STRICT v_vault_id,v_before
 FROM public.system_treasury_vaults v WHERE v.code='VAULT_MAIN' FOR UPDATE;
 v_floor:=pg_catalog.floor(v_before*0.3); v_after:=v_before-v_total;
 IF v_after<v_floor THEN
  RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='treasury 30 percent reserve protection';
 END IF;

 SELECT pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
  'accountId',v_treasury_account,'amount',v_total::text,'direction','credit'))
  || pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
   'accountId',r.account_id,'amount',v_amount::text,'direction','debit') ORDER BY r.account_id)
 INTO v_postings FROM pg_catalog.unnest(v_recipients) AS r(account_id);

 -- Exactly one canonical balanced posting, cash balance mutation, and outbox.
 -- Remaining audit writes occur in the same PostgreSQL transaction.
 SELECT public.economy_post_transaction(
  p_request_key,'TREASURY_CITIZEN_DIVIDEND',p_actor,NULL,
  v_postings,'treasury.citizen_dividend.settled',
  pg_catalog.jsonb_build_object('citizenCount',v_count,'amountWld',v_total::text,
   'sourceVault','VAULT_MAIN','beneficiaryAccountIds',v_recipients)
 ) INTO v_tx_id;
 UPDATE public.system_treasury_vaults
 SET balance_wld=v_after::text,updated_at=pg_catalog.clock_timestamp()
 WHERE id=v_vault_id;
 INSERT INTO public.system_treasury_ledger
  (vault_id,tx_type,amount_wld,actor_id,reason,balance_before,balance_after,ledger_transaction_id)
 VALUES (v_vault_id,'CITIZEN_DIVIDEND',v_total::text,p_actor,p_reason,
  v_before::text,v_after::text,v_tx_id)
 RETURNING id INTO v_ledger_id;
 v_receipt:=pg_catalog.jsonb_build_object(
  'success',true,'disbursement_id',NULL,'ledger_id',v_ledger_id,
  'ledger_transaction_id',v_tx_id,'beneficiary_count',v_count,
  'amount_per_beneficiary_wld',v_amount::text,'total_amount_wld',v_total::text,
  'balance_before',v_before::text,'balance_after',v_after::text,
  'safe_reserve_wld',v_floor::text,'request_key',p_request_key);
 INSERT INTO public.treasury_disbursements
  (disbursement_type,vault_code,total_amount_wld,beneficiary_count,
   amount_per_beneficiary_wld,admin_id,reason,request_key,ledger_transaction_id,
   beneficiary_account_ids,receipt)
 VALUES ('CITIZEN_DIVIDEND','VAULT_MAIN',v_total::text,v_count,
  v_amount::text,p_actor,p_reason,p_request_key,v_tx_id,v_recipients,v_receipt)
 RETURNING id INTO v_id;
 v_receipt:=pg_catalog.jsonb_set(v_receipt,'{disbursement_id}',pg_catalog.to_jsonb(v_id));
 UPDATE public.treasury_disbursements SET receipt=v_receipt WHERE id=v_id;
 RETURN v_receipt;
END;
$dividend$;

ALTER FUNCTION public.treasury_disburse_citizen_dividend(uuid,text,text,uuid)
 OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_disburse_citizen_dividend(uuid,text,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_citizen_dividend(uuid,text,text,uuid) TO moneyverse_app;

-- Backward-compatibility overload fails closed rather than recrediting wallets.
CREATE OR REPLACE FUNCTION public.treasury_disburse_citizen_dividend(
 p_actor uuid,p_amount_per_user_wld text,p_reason text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $legacy$
BEGIN
 RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='legacy dividend signature requires an idempotency key';
END;
$legacy$;
REVOKE ALL ON FUNCTION public.treasury_disburse_citizen_dividend(uuid,text,text) FROM PUBLIC;
COMMIT;
