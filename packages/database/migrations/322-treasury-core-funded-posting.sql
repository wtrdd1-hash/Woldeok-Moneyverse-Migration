-- v2026.11.01.1618.2: one canonical Treasury Core for funded transfers.
-- Restricted initial commands: NPS_FUND and NPS_WITHDRAW (NEW funded positions only).
-- Minting, historic pension replay, other treasury disbursements deliberately excluded.
BEGIN;
-- Welfare fee stays as a backed, nonnegative earmarked ESCROW asset,
-- not a sink/burn or a fictional VAULT_WELFARE balance.
INSERT INTO public.accounts(account_type,system_key,currency,status,allow_negative)
SELECT 'ESCROW'::public.account_type,'national_pension_welfare','WLD',
       'active'::public.account_status,false
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE system_key='national_pension_welfare');
DO $welfare$
BEGIN
 IF (SELECT count(*) FROM public.accounts WHERE system_key='national_pension_welfare'
       AND account_type='ESCROW' AND status='active' AND NOT allow_negative) <> 1
 THEN RAISE EXCEPTION 'NPS welfare escrow identity invalid'; END IF;
END;$welfare$;
INSERT INTO public.account_balances(account_id,available_amount)
SELECT id,0 FROM public.accounts WHERE system_key='national_pension_welfare'
ON CONFLICT(account_id) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.treasury_core_receipts (
  idempotency_key uuid PRIMARY KEY,
  actor_user_id uuid NOT NULL,
  command text NOT NULL CHECK (command IN ('NPS_FUND','NPS_WITHDRAW')),
  principal_wld numeric NOT NULL CHECK(principal_wld>0 AND principal_wld=trunc(principal_wld)),
  user_disbursement_wld numeric NOT NULL CHECK(user_disbursement_wld>=0 AND user_disbursement_wld=trunc(user_disbursement_wld)),
  welfare_fee_wld numeric NOT NULL CHECK(welfare_fee_wld>=0 AND welfare_fee_wld=trunc(welfare_fee_wld)),
  ledger_transaction_id uuid NOT NULL UNIQUE REFERENCES public.ledger_transactions(id),
  evidence_digest text NOT NULL CHECK(evidence_digest ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.treasury_core_receipts OWNER TO moneyverse_migrator;
REVOKE ALL ON public.treasury_core_receipts FROM PUBLIC,moneyverse_app;
CREATE OR REPLACE FUNCTION public.treasury_core_receipt_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path TO pg_catalog,pg_temp AS $immutable$
BEGIN
 RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='Treasury Core receipts are immutable';
END;$immutable$;
ALTER FUNCTION public.treasury_core_receipt_immutable() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_core_receipt_immutable() FROM PUBLIC;
CREATE TRIGGER treasury_core_receipts_immutable BEFORE UPDATE OR DELETE OR TRUNCATE
 ON public.treasury_core_receipts FOR EACH STATEMENT
 EXECUTE FUNCTION public.treasury_core_receipt_immutable();

-- Extend only the NEW funded receipt, never rewrite historic NPS payout records.
ALTER TABLE public.pension_funded_receipts
 DROP CONSTRAINT IF EXISTS pension_funded_receipts_operation_check;
ALTER TABLE public.pension_funded_receipts
 ADD CONSTRAINT pension_funded_receipts_operation_check
 CHECK(operation IN ('CONTRIBUTION','WITHDRAWAL'));
ALTER TABLE public.pension_funded_receipts
 ADD COLUMN IF NOT EXISTS refund_wld numeric NOT NULL DEFAULT 0
    CHECK(refund_wld>=0 AND refund_wld=trunc(refund_wld)),
 ADD COLUMN IF NOT EXISTS welfare_fee_wld numeric NOT NULL DEFAULT 0
    CHECK(welfare_fee_wld>=0 AND welfare_fee_wld=trunc(welfare_fee_wld));

CREATE OR REPLACE FUNCTION public.treasury_core_post(
 p_actor uuid,p_idempotency_key uuid,p_command text,p_principal_wld text
)
RETURNS TABLE(ledger_transaction_id uuid,principal_wld text,user_disbursement_wld text,
  welfare_fee_wld text,fund_balance_wld text,replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $core$
DECLARE
 v_amount numeric;
 v_paid numeric;
 v_fee numeric;
 v_user_cash uuid;
 v_fund uuid;
 v_sink uuid;
 v_tx uuid;
 v_policy text;
 v_old public.treasury_core_receipts%ROWTYPE;
 v_balance numeric;
 v_n integer;
 v_position numeric;
 v_postings jsonb;
 v_user_status text;
BEGIN
 IF p_actor IS NULL OR p_idempotency_key IS NULL
  OR p_command IS NULL OR p_command NOT IN ('NPS_FUND','NPS_WITHDRAW')
  OR p_principal_wld IS NULL OR length(p_principal_wld)>80
  OR p_principal_wld !~ '^[1-9][0-9]*$'
 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid Treasury Core command'; END IF;
 v_amount:=p_principal_wld::numeric;
 IF p_command='NPS_FUND' AND v_amount<1000 THEN
   RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='new funded pension minimum contribution is 1000 WLD';
 END IF;
 IF v_amount<=0 OR v_amount<>trunc(v_amount) THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid principal';END IF;
 -- Account ownership is checked; the Nest session guard MUST supply p_actor.
 SELECT status::text INTO v_user_status FROM public.users WHERE id=p_actor;
 IF v_user_status IS DISTINCT FROM 'active' THEN
  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='inactive Treasury Core actor'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('TREASURY_CORE_NPS_'||p_actor::text,0));
 SELECT * INTO v_old FROM public.treasury_core_receipts
 WHERE idempotency_key=p_idempotency_key;
 IF FOUND THEN
  IF v_old.actor_user_id<>p_actor OR v_old.command<>p_command
     OR v_old.principal_wld<>v_amount THEN
   RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Treasury Core idempotency conflict';
  END IF;
  SELECT available_amount INTO STRICT v_balance FROM public.account_balances
   WHERE account_id=(SELECT id FROM public.accounts WHERE system_key='national_pension_fund');
  RETURN QUERY SELECT v_old.ledger_transaction_id,v_amount::text,
     v_old.user_disbursement_wld::text,v_old.welfare_fee_wld::text,v_balance::text,true;
  RETURN;
 END IF;
 SELECT count(*),(array_agg(id))[1] INTO v_n,v_user_cash FROM public.accounts
 WHERE owner_user_id=p_actor AND account_type='USER_CASH' AND status='active'
   AND currency='WLD';
 IF v_n<>1 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='unique active user cash account required';END IF;
 SELECT id INTO STRICT v_fund FROM public.accounts
 WHERE system_key='national_pension_fund' AND account_type='ESCROW'
 AND status='active' AND NOT allow_negative;
 SELECT id INTO STRICT v_sink FROM public.accounts
 WHERE system_key='national_pension_welfare' AND account_type='ESCROW'
 AND status='active' AND NOT allow_negative;
 SELECT count(*),(array_agg(version))[1] INTO v_n,v_policy FROM public.economy_policies
 WHERE status='active';
 IF v_n<>1 THEN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='unique active monetary policy required';END IF;
 IF p_command='NPS_FUND' THEN
   v_paid:=0;v_fee:=0;
   v_postings:=jsonb_build_array(
     jsonb_build_object('accountId',v_fund::text,'direction','debit','amount',p_principal_wld),
     jsonb_build_object('accountId',v_user_cash::text,'direction','credit','amount',p_principal_wld));
 ELSE
   SELECT available_principal_wld INTO v_position
   FROM public.pension_funded_positions WHERE user_id=p_actor FOR UPDATE;
   IF v_position IS NULL OR v_position<>v_amount THEN
     RAISE EXCEPTION USING ERRCODE='22023',
       MESSAGE='withdrawal must match exclusively newly funded principal';
   END IF;
   v_paid:=trunc(v_amount*95/100);v_fee:=v_amount-v_paid;
   v_postings:=jsonb_build_array(
     jsonb_build_object('accountId',v_fund::text,'direction','credit','amount',p_principal_wld),
     jsonb_build_object('accountId',v_user_cash::text,'direction','debit','amount',v_paid::text),
     jsonb_build_object('accountId',v_sink::text,'direction','debit','amount',v_fee::text));
   IF v_fee=0 THEN
     v_postings:=jsonb_build_array(
       jsonb_build_object('accountId',v_fund::text,'direction','credit','amount',p_principal_wld),
       jsonb_build_object('accountId',v_user_cash::text,'direction','debit','amount',v_paid::text));
   END IF;
 END IF;
 -- Unique existing money only, never creates WLD: debit/credit sums exactly match.
 v_tx:=public.economy_post_transaction(
   p_idempotency_key,CASE WHEN p_command='NPS_FUND'
     THEN 'NPS_FUNDED_CONTRIBUTION' ELSE 'NPS_FUNDED_WITHDRAWAL' END,
   p_actor,v_policy,v_postings,'treasury.core.nps',
   jsonb_build_object('command',p_command,'principalWld',p_principal_wld,
       'userDisbursementWld',v_paid::text,'welfareFeeWld',v_fee::text));
 IF p_command='NPS_FUND' THEN
  INSERT INTO public.pension_funded_positions(user_id,available_principal_wld,
    cumulative_funded_contribution_wld)
  VALUES (p_actor,v_amount,v_amount)
  ON CONFLICT(user_id) DO UPDATE SET
    available_principal_wld=public.pension_funded_positions.available_principal_wld+
      excluded.available_principal_wld,
    cumulative_funded_contribution_wld=
      public.pension_funded_positions.cumulative_funded_contribution_wld+
      excluded.cumulative_funded_contribution_wld,updated_at=now();
 ELSE
  UPDATE public.pension_funded_positions
  SET available_principal_wld=0,updated_at=now()
  WHERE user_id=p_actor AND available_principal_wld=v_amount;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='pension funded withdrawal race';END IF;
 END IF;
 INSERT INTO public.pension_funded_receipts(idempotency_key,user_id,amount_wld,
  operation,ledger_transaction_id,refund_wld,welfare_fee_wld)
 VALUES(p_idempotency_key,p_actor,v_amount,
    CASE WHEN p_command='NPS_FUND' THEN 'CONTRIBUTION' ELSE 'WITHDRAWAL' END,
    v_tx,v_paid,v_fee);
 INSERT INTO public.treasury_core_receipts(idempotency_key,actor_user_id,command,
  principal_wld,user_disbursement_wld,welfare_fee_wld,ledger_transaction_id,evidence_digest)
 VALUES(p_idempotency_key,p_actor,p_command,v_amount,v_paid,v_fee,v_tx,
  encode(public.digest(jsonb_build_object('key',p_idempotency_key,'actor',p_actor,
    'command',p_command,'principal',v_amount::text,'paid',v_paid::text,'fee',v_fee::text,
    'ledger',v_tx)::text,'sha256'),'hex'));
 SELECT available_amount INTO STRICT v_balance FROM public.account_balances
 WHERE account_id=v_fund;
 RETURN QUERY SELECT v_tx,v_amount::text,v_paid::text,v_fee::text,v_balance::text,false;
END;
$core$;
ALTER FUNCTION public.treasury_core_post(uuid,uuid,text,text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_core_post(uuid,uuid,text,text) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_core_post(uuid,uuid,text,text) TO moneyverse_app;

-- Old dedicated command delegates to exactly the same Treasury Core.
CREATE OR REPLACE FUNCTION public.pension_funded_contribute(
  p_actor uuid,p_key uuid,p_amount text)
RETURNS TABLE(ledger_transaction_id uuid,contributed_wld text,fund_balance_wld text,replayed boolean)
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $wrapper$
 SELECT core.ledger_transaction_id,core.principal_wld,core.fund_balance_wld,core.replayed
 FROM public.treasury_core_post(p_actor,p_key,'NPS_FUND',p_amount) core;
$wrapper$;
ALTER FUNCTION public.pension_funded_contribute(uuid,uuid,text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.pension_funded_contribute(uuid,uuid,text) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_funded_contribute(uuid,uuid,text) TO moneyverse_app;
-- Scoped per-member view: legacy NPS history is deliberately excluded.
CREATE OR REPLACE FUNCTION public.treasury_core_pension_position(p_actor uuid)
RETURNS TABLE(funded_principal_wld text,cumulative_funded_contribution_wld text,
  escrow_balance_wld text,certified_receipt_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $read$
DECLARE v_status text;
BEGIN
 SELECT status::text INTO v_status FROM public.users WHERE id=p_actor;
 IF p_actor IS NULL OR v_status IS DISTINCT FROM 'active' THEN
  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='inactive Treasury Core actor';
 END IF;
 RETURN QUERY SELECT
  coalesce(pos.available_principal_wld,0)::text,
  coalesce(pos.cumulative_funded_contribution_wld,0)::text,
  (SELECT b.available_amount::text FROM public.accounts a
   JOIN public.account_balances b ON b.account_id=a.id
   WHERE a.system_key='national_pension_fund' AND a.account_type='ESCROW'),
  (SELECT count(*) FROM public.treasury_core_receipts r WHERE r.actor_user_id=p_actor)
 FROM (SELECT 1) anchor
 LEFT JOIN public.pension_funded_positions pos ON pos.user_id=p_actor;
END;
$read$;
ALTER FUNCTION public.treasury_core_pension_position(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_core_pension_position(uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_core_pension_position(uuid) TO moneyverse_app;
COMMIT;
