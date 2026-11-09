-- v2026.11.10.1949: Explicit, bounded, ledger-funded Treasury mint.
-- No current/historic SWF valuation, dividend or synthetic profit is funding.
-- Migration does NOT unfreeze issuance, change balances, execute or approve an order.
BEGIN;

ALTER TABLE public.monetary_policy_orders
  DROP CONSTRAINT monetary_policy_orders_target_envelope_check;
ALTER TABLE public.monetary_policy_orders
  ADD CONSTRAINT monetary_policy_orders_target_envelope_check
  CHECK (target_envelope IN (
    'WORK_REWARD','QUEST_REWARD','EVENT_REWARD','INCIDENT_COMPENSATION',
    'STABILIZATION_POOL','HARD_SINK_PURGE','GENERAL_CIRCULATION',
    'TREASURY_ISSUANCE'
  ));

-- Do not rewrite 344. This only adds one explicit target to its proposal domain.
CREATE OR REPLACE FUNCTION public.admin_monetary_policy_propose(
  p_actor uuid, p_type text, p_envelope text, p_max_amount text,
  p_reason text, p_valid_hours integer DEFAULT 72
)
RETURNS SETOF public.monetary_policy_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $propose$
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor,'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor,'approver'::public.admin_role)
    OR public.admin_role_holder(p_actor,'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='monetary policy proposal requires an active administrator';
  END IF;
  IF NOT ((p_type='MINT' AND p_envelope IN (
      'WORK_REWARD','QUEST_REWARD','EVENT_REWARD','INCIDENT_COMPENSATION',
      'STABILIZATION_POOL','GENERAL_CIRCULATION','TREASURY_ISSUANCE'))
    OR (p_type='RETIRE' AND p_envelope='HARD_SINK_PURGE'))
    OR p_max_amount IS NULL OR p_max_amount !~ '^[1-9][0-9]{0,15}$'
    OR p_max_amount::numeric > 1000000000000000
    OR p_reason IS NULL OR length(btrim(p_reason)) < 10
    OR p_valid_hours IS NULL OR p_valid_hours NOT BETWEEN 1 AND 720 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid policy type, envelope, amount or duration';
  END IF;
  RETURN QUERY INSERT INTO public.monetary_policy_orders
    (order_type,target_envelope,max_amount_wld,status,proposed_by,reason,expires_at)
    VALUES(p_type,p_envelope,p_max_amount,'PROPOSED',p_actor,btrim(p_reason),
      clock_timestamp()+make_interval(hours=>p_valid_hours))
    RETURNING *;
END;
$propose$;
ALTER FUNCTION public.admin_monetary_policy_propose(uuid,text,text,text,text,integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_monetary_policy_propose(uuid,text,text,text,text,integer) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_monetary_policy_propose(uuid,text,text,text,text,integer) TO moneyverse_app;

CREATE TABLE public.treasury_mint_settlements (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  request_key uuid NOT NULL UNIQUE,
  policy_order_id uuid NOT NULL REFERENCES public.monetary_policy_orders(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  amount_wld numeric(20,0) NOT NULL CHECK (amount_wld BETWEEN 1 AND 10000000),
  ledger_transaction_id uuid NOT NULL UNIQUE REFERENCES public.ledger_transactions(id) ON DELETE RESTRICT,
  mint_certificate_id uuid NOT NULL UNIQUE REFERENCES public.mint_certificates(id) ON DELETE RESTRICT,
  vault_before_wld text NOT NULL CHECK (vault_before_wld ~ '^(0|[1-9][0-9]*)$'),
  vault_after_wld text NOT NULL CHECK (vault_after_wld ~ '^(0|[1-9][0-9]*)$'),
  receipt jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
REVOKE ALL ON TABLE public.treasury_mint_settlements FROM PUBLIC,moneyverse_app;
GRANT SELECT,INSERT ON public.treasury_mint_settlements TO moneyverse_migrator;
GRANT SELECT,UPDATE ON public.system_treasury_vaults TO moneyverse_migrator;
GRANT SELECT,INSERT ON public.system_treasury_ledger TO moneyverse_migrator;
GRANT SELECT ON public.treasury_fiscal_epochs,public.accounts,public.account_balances,public.ledger_transactions,public.ledger_postings TO moneyverse_migrator;
GRANT SELECT,INSERT ON public.mint_certificates TO moneyverse_migrator;
GRANT SELECT,UPDATE ON public.monetary_policy_orders TO moneyverse_migrator;

CREATE OR REPLACE FUNCTION public.admin_monetary_mint_to_treasury(
  p_actor uuid,p_order_id uuid,p_amount text,p_request_key uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $mint$
DECLARE
  v_existing public.treasury_mint_settlements%ROWTYPE;
  v_order public.monetary_policy_orders%ROWTYPE;
  v_proof record;
  v_after_proof record;
  v_mint_id uuid;
  v_treasury_id uuid;
  v_vault_id uuid;
  v_before numeric;
  v_amount numeric;
  v_after numeric;
  v_tx uuid;
  v_cert uuid;
  v_receipt jsonb;
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor,'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor,'approver'::public.admin_role)
    OR public.admin_role_holder(p_actor,'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active administrator required for Treasury issuance';
  END IF;
  IF p_order_id IS NULL OR p_request_key IS NULL
    OR p_amount IS NULL OR p_amount !~ '^[1-9][0-9]{0,7}$'
    OR p_amount::numeric NOT BETWEEN 1 AND 10000000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Treasury issuance amount must be 1..10,000,000 WLD';
  END IF;
  v_amount:=p_amount::numeric;
  PERFORM pg_catalog.pg_advisory_xact_lock(1949,pg_catalog.hashtext(p_request_key::text));
  SELECT * INTO v_existing FROM public.treasury_mint_settlements WHERE request_key=p_request_key;
  IF FOUND THEN
    IF v_existing.actor_id<>p_actor OR v_existing.policy_order_id<>p_order_id
      OR v_existing.amount_wld<>v_amount THEN
      RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='Treasury mint request key already bound to different data';
    END IF;
    RETURN v_existing.receipt;
  END IF;

  SELECT * INTO v_order FROM public.monetary_policy_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.order_type<>'MINT' OR v_order.target_envelope<>'TREASURY_ISSUANCE'
    OR v_order.status<>'APPROVED' OR v_order.expires_at<=pg_catalog.clock_timestamp()
    OR v_order.executed_amount_wld::numeric+v_amount>v_order.max_amount_wld::numeric THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='only active approved Treasury MINT orders with remaining capacity may issue';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.monetary_system_status WHERE id=1 AND is_issuance_frozen=false) THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='monetary issuance is frozen';
  END IF;
  SELECT * INTO v_proof FROM public.treasury_fiscal_proof_read();
  IF NOT FOUND OR v_proof.vault_total IS NULL OR v_proof.vault_total<>v_proof.canonical_total
    OR v_proof.vault_total<>v_proof.journal_total OR v_proof.invalid_new_sources<>'0'
    OR v_proof.epoch_opened_at IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='Treasury fiscal provenance not certified';
  END IF;
  SELECT id INTO v_mint_id FROM public.accounts
    WHERE account_type='MINT' AND system_key='mint' AND status='active';
  SELECT id INTO v_treasury_id FROM public.accounts
    WHERE account_type='TREASURY' AND system_key='treasury' AND status='active';
  IF v_mint_id IS NULL OR v_treasury_id IS NULL OR v_mint_id=v_treasury_id THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='canonical MINT/TREASURY accounts unavailable';
  END IF;

  -- ECONOMY CORE owns the negative MINT issuance and positive Treasury balance.
  -- This is intentional NEW WLD, unlike the funded donation and SWF reallocation.
  SELECT public.economy_post_transaction(
    p_request_key,'TREASURY_AUTHORIZED_MINT',p_actor,NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_mint_id,'amount',v_amount::text,'direction','credit'),
      pg_catalog.jsonb_build_object('accountId',v_treasury_id,'amount',v_amount::text,'direction','debit')
    ),'treasury.authorized_mint.recorded',
    pg_catalog.jsonb_build_object('policyOrderId',p_order_id,'amountWld',v_amount::text)
  ) INTO v_tx;
  IF v_tx IS NULL THEN RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='canonical mint posting missing'; END IF;

  SELECT id,balance_wld::numeric INTO v_vault_id,v_before
    FROM public.system_treasury_vaults WHERE code='VAULT_MAIN' FOR UPDATE;
  IF v_vault_id IS NULL OR v_before IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='VAULT_MAIN missing';
  END IF;
  v_after:=v_before+v_amount;
  UPDATE public.system_treasury_vaults
    SET balance_wld=v_after::text,updated_at=pg_catalog.clock_timestamp() WHERE id=v_vault_id;
  INSERT INTO public.system_treasury_ledger
    (vault_id,tx_type,amount_wld,actor_id,reason,balance_before,balance_after,ledger_transaction_id)
  VALUES(v_vault_id,'INJECTION',v_amount::text,p_actor,
    'Authorized explicit MINT to Treasury; order '||p_order_id::text||' tx '||v_tx::text,
    v_before::text,v_after::text,v_tx);
  INSERT INTO public.mint_certificates
    (policy_order_id,amount_wld,source_envelope,recipient_user_id,idempotency_key,actor_id)
  VALUES(p_order_id,v_amount::text,'TREASURY_ISSUANCE',NULL,'treasury-'||p_request_key::text,p_actor)
    RETURNING id INTO v_cert;
  UPDATE public.monetary_policy_orders SET
    executed_amount_wld=(executed_amount_wld::numeric+v_amount)::text,
    status=CASE WHEN executed_amount_wld::numeric+v_amount=max_amount_wld::numeric
      THEN 'EXECUTED' ELSE 'APPROVED' END,
    updated_at=pg_catalog.clock_timestamp() WHERE id=p_order_id;
  SELECT * INTO v_after_proof FROM public.treasury_fiscal_proof_read();
  IF v_after_proof.vault_total<>v_after::text
    OR v_after_proof.canonical_total<>v_after::text
    OR v_after_proof.journal_total<>v_after::text
    OR v_after_proof.invalid_new_sources<>'0' THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='new Treasury issuance cannot be reconciled';
  END IF;
  v_receipt:=pg_catalog.jsonb_build_object(
    'success',true,'code','TREASURY_MINT_SETTLED','policy_order_id',p_order_id,
    'amount_wld',v_amount::text,'ledger_transaction_id',v_tx,
    'mint_certificate_id',v_cert,'vault_before_wld',v_before::text,
    'vault_after_wld',v_after::text,'request_key',p_request_key);
  INSERT INTO public.treasury_mint_settlements
    (request_key,policy_order_id,actor_id,amount_wld,ledger_transaction_id,
     mint_certificate_id,vault_before_wld,vault_after_wld,receipt)
    VALUES(p_request_key,p_order_id,p_actor,v_amount,v_tx,v_cert,v_before::text,v_after::text,v_receipt);
  RETURN v_receipt;
END;
$mint$;
ALTER FUNCTION public.admin_monetary_mint_to_treasury(uuid,uuid,text,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_monetary_mint_to_treasury(uuid,uuid,text,uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_monetary_mint_to_treasury(uuid,uuid,text,uuid) TO moneyverse_app;

-- The old freeze/unfreeze API relied on app direct UPDATE, which is denied.
-- Make the explicit operator action usable without silently lifting existing holds.
CREATE OR REPLACE FUNCTION public.admin_monetary_set_issuance_frozen(
  p_actor uuid,p_frozen boolean,p_reason text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $freeze$
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor,'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor,'approver'::public.admin_role)
    OR public.admin_role_holder(p_actor,'superadmin'::public.admin_role)) THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='active administrator required for issuance policy';
  END IF;
  IF p_frozen IS NULL OR p_reason IS NULL OR length(btrim(p_reason))<10 THEN
    RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='explicit freeze/unfreeze reason required';
  END IF;
  UPDATE public.monetary_system_status
    SET is_issuance_frozen=p_frozen,
        freeze_reason=CASE WHEN p_frozen THEN btrim(p_reason) ELSE NULL END,
        frozen_at=CASE WHEN p_frozen THEN pg_catalog.clock_timestamp() ELSE NULL END,
        frozen_by=CASE WHEN p_frozen THEN p_actor ELSE NULL END,
        updated_at=pg_catalog.clock_timestamp()
    WHERE id=1;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='monetary status unavailable'; END IF;
  RETURN p_frozen;
END;
$freeze$;
ALTER FUNCTION public.admin_monetary_set_issuance_frozen(uuid,boolean,text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_monetary_set_issuance_frozen(uuid,boolean,text) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_monetary_set_issuance_frozen(uuid,boolean,text) TO moneyverse_app;
GRANT SELECT,UPDATE ON public.monetary_system_status TO moneyverse_migrator;

COMMIT;
