-- v2026.11.10.2032: Repair salary disbursement to use a linked, funded Treasury
-- ledger entry; bind one immutable request UUID to the recipient, actor, amount
-- and reason. Migration 346 has been applied to Test: never rewrite it.
BEGIN;

-- Preserve all existing Treasury journal categories. Only add a specific,
-- auditable category whose source is a current-epoch double-entry posting.
ALTER TABLE public.system_treasury_ledger
  DROP CONSTRAINT system_treasury_ledger_tx_type_check;
ALTER TABLE public.system_treasury_ledger
  ADD CONSTRAINT system_treasury_ledger_tx_type_check CHECK (tx_type IN (
    'INJECTION','ABSORPTION_SINK','STOCK_HALT_SETTLEMENT','FEE_RECIRCULATION',
    'CITIZEN_DIVIDEND','COMMUNITY_FUNDING','WELFARE_SUBSIDY','MARKET_STIMULUS',
    'PUBLIC_GRANT','BUDGET_DISTRIBUTION','MARKET_BUYBACK_BURN',
    'CASINO_PIGOVIAN_TAX','STOCK_SPECULATION_TAX','WEALTH_TAX_COLLECTION',
    'USER_DONATION','TARGETED_SUBSIDY','ADMIN_SALARY'
  ));

-- A nullable column preserves any pre-existing historical receipt exactly as
-- written; only the new five-argument endpoint can create fresh receipts.
ALTER TABLE public.treasury_admin_salaries
  ADD COLUMN IF NOT EXISTS request_key uuid;
CREATE UNIQUE INDEX IF NOT EXISTS treasury_admin_salaries_request_key_uq
  ON public.treasury_admin_salaries (request_key) WHERE request_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.treasury_disburse_admin_salary(
  p_actor uuid,
  p_target_admin uuid,
  p_amount text,
  p_reason text,
  p_request_key uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $salary$
DECLARE
  v_amount numeric;
  v_reason text;
  v_existing public.treasury_admin_salaries%ROWTYPE;
  v_vault_id uuid;
  v_vault_before numeric;
  v_vault_after numeric;
  v_treasury_acc_id uuid;
  v_user_acc_id uuid;
  v_tx_id uuid;
  v_postings jsonb;
  v_old_vault_after text;
BEGIN
  -- The OTP endpoint requires superadmin; the DB is an independent boundary.
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'superadmin'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active superadministrator required for salary disbursement';
  END IF;
  IF p_target_admin IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id=p_target_admin
  ) THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='salary recipient must hold an administrator role';
  END IF;
  IF p_amount IS NULL OR p_amount !~ '^[1-9][0-9]{0,7}$'
    OR p_amount::numeric NOT BETWEEN 1 AND 5000000
    OR p_reason IS NULL OR char_length(btrim(p_reason)) < 5
    OR char_length(btrim(p_reason)) > 2000 OR p_request_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid administrator salary amount, reason or request key';
  END IF;
  v_amount:=p_amount::numeric;
  v_reason:=btrim(p_reason);

  -- Lock the request key before reading its receipt, never the actor.
  PERFORM pg_catalog.pg_advisory_xact_lock(348, pg_catalog.hashtext(p_request_key::text));
  SELECT * INTO v_existing FROM public.treasury_admin_salaries WHERE request_key=p_request_key;
  IF FOUND THEN
    IF v_existing.disbursed_by<>p_actor OR v_existing.admin_id<>p_target_admin
      OR v_existing.amount_wld<>v_amount OR v_existing.reason<>v_reason THEN
      RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='administrator salary request key belongs to different parameters';
    END IF;
    SELECT balance_after INTO v_old_vault_after
    FROM public.system_treasury_ledger
    WHERE ledger_transaction_id=v_existing.ledger_transaction_id AND tx_type='ADMIN_SALARY';
    IF v_old_vault_after IS NULL THEN
      RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='salary receipt lacks canonical Treasury journal';
    END IF;
    RETURN pg_catalog.jsonb_build_object(
      'success',true,'code','ADMIN_SALARY_DISBURSED',
      'amount_wld',v_amount::text,'target_admin_id',p_target_admin,
      'ledger_transaction_id',v_existing.ledger_transaction_id,
      'vault_balance_after_wld',v_old_vault_after,'replayed',true
    );
  END IF;

  IF (public.finance_integrity_scan()->>'status') IS DISTINCT FROM 'CLEAN' THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='canonical Treasury funding must reconcile before administrator salary';
  END IF;
  SELECT id,balance_wld::numeric INTO v_vault_id,v_vault_before
  FROM public.system_treasury_vaults WHERE code='VAULT_MAIN' FOR UPDATE;
  IF v_vault_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='canonical Treasury main vault missing';
  END IF;
  IF v_vault_before-v_amount < pg_catalog.floor(v_vault_before*0.30) THEN
    RAISE EXCEPTION USING ERRCODE='22003', MESSAGE='safe Treasury reserve cannot fund administrator salary';
  END IF;

  SELECT id INTO v_treasury_acc_id
  FROM public.accounts WHERE account_type='TREASURY'::public.account_type
    AND system_key='treasury' LIMIT 1;
  IF v_treasury_acc_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='canonical Treasury funding account missing';
  END IF;
  SELECT id INTO v_user_acc_id FROM public.accounts
    WHERE owner_user_id=p_target_admin AND account_type='USER_CASH'::public.account_type
      AND status='active'::public.account_status LIMIT 1;
  IF v_user_acc_id IS NULL THEN
    INSERT INTO public.accounts (owner_user_id,account_type,currency,status,allow_negative)
    VALUES (p_target_admin,'USER_CASH'::public.account_type,'WLD','active'::public.account_status,false)
    RETURNING id INTO v_user_acc_id;
    INSERT INTO public.account_balances(account_id,available_amount)
    VALUES (v_user_acc_id,0) ON CONFLICT(account_id) DO NOTHING;
  END IF;

  -- The canonical balanced posting is the ONLY source of monetary movement.
  -- The fiscal epoch trigger requires this transaction ID on the journal row.
  v_postings:=pg_catalog.jsonb_build_array(
    pg_catalog.jsonb_build_object('accountId',v_treasury_acc_id,'amount',v_amount::text,'direction','credit'),
    pg_catalog.jsonb_build_object('accountId',v_user_acc_id,'amount',v_amount::text,'direction','debit')
  );
  v_tx_id:=public.economy_post_transaction(
    p_request_key,'TREASURY_ADMIN_SALARY',p_actor,NULL,v_postings,
    'treasury.admin_salary_disbursed',
    pg_catalog.jsonb_build_object('targetAdminId',p_target_admin,'amountWld',v_amount::text,'reason',v_reason)
  );
  v_vault_after:=v_vault_before-v_amount;
  UPDATE public.system_treasury_vaults
  SET balance_wld=v_vault_after::text,updated_at=pg_catalog.clock_timestamp()
  WHERE id=v_vault_id;

  INSERT INTO public.system_treasury_ledger(
    vault_id,tx_type,amount_wld,actor_id,reason,balance_before,balance_after,ledger_transaction_id
  ) VALUES (
    v_vault_id,'ADMIN_SALARY',v_amount::text,p_actor,
    '[국고 관리자 임금 지급] '||v_reason,v_vault_before::text,v_vault_after::text,v_tx_id
  );
  INSERT INTO public.treasury_admin_salaries(
    admin_id,amount_wld,disbursed_by,source_vault,reason,ledger_transaction_id,request_key
  ) VALUES (p_target_admin,v_amount,p_actor,'VAULT_MAIN',v_reason,v_tx_id,p_request_key);

  RETURN pg_catalog.jsonb_build_object(
    'success',true,'code','ADMIN_SALARY_DISBURSED',
    'amount_wld',v_amount::text,'target_admin_id',p_target_admin,
    'ledger_transaction_id',v_tx_id,'vault_balance_after_wld',v_vault_after::text,
    'replayed',false
  );
END;
$salary$;

ALTER FUNCTION public.treasury_disburse_admin_salary(uuid,uuid,text,text,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_disburse_admin_salary(uuid,uuid,text,text,uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_admin_salary(uuid,uuid,text,text,uuid) TO moneyverse_app;
-- The legacy four-argument API did not have a durable idempotency key or a
-- canonical journal transaction link: disable direct application access.
REVOKE ALL ON FUNCTION public.treasury_disburse_admin_salary(uuid,uuid,text,text) FROM PUBLIC,moneyverse_app;

COMMIT;
