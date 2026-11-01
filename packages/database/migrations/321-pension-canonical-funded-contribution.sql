-- v2026.11.01.1618: new funded NPS contributions ONLY.
-- Historic NPS payment records remain immutable and UNVERIFIED.
-- This introduces no issuance, no backfill, and no deficit financing.
BEGIN;

INSERT INTO public.accounts (account_type,system_key,currency,status,allow_negative)
SELECT 'ESCROW'::public.account_type,'national_pension_fund','WLD','active'::public.account_status,false
WHERE NOT EXISTS (SELECT 1 FROM public.accounts WHERE system_key='national_pension_fund');

DO $audit$
BEGIN
  IF (SELECT count(*) FROM public.accounts
      WHERE account_type='ESCROW' AND system_key='national_pension_fund'
        AND status='active' AND NOT allow_negative) <> 1
    OR (SELECT count(*) FROM public.accounts WHERE system_key='national_pension_fund') <> 1
  THEN RAISE EXCEPTION 'NPS canonical escrow identity is not unique';
  END IF;
END;
$audit$;
INSERT INTO public.account_balances(account_id,available_amount)
SELECT id,0 FROM public.accounts WHERE system_key='national_pension_fund'
ON CONFLICT (account_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.pension_funded_positions (
 user_id uuid PRIMARY KEY,
 available_principal_wld numeric NOT NULL DEFAULT 0
    CHECK (available_principal_wld >= 0 AND available_principal_wld = trunc(available_principal_wld)),
 cumulative_funded_contribution_wld numeric NOT NULL DEFAULT 0
    CHECK (cumulative_funded_contribution_wld >= 0 AND cumulative_funded_contribution_wld = trunc(cumulative_funded_contribution_wld)),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.pension_funded_receipts (
 idempotency_key uuid PRIMARY KEY,
 user_id uuid NOT NULL,
 amount_wld numeric NOT NULL CHECK (amount_wld > 0 AND amount_wld=trunc(amount_wld)),
 operation text NOT NULL CHECK (operation IN ('CONTRIBUTION')),
 ledger_transaction_id uuid NOT NULL UNIQUE REFERENCES public.ledger_transactions(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pension_funded_receipts_user_created
ON public.pension_funded_receipts(user_id,created_at DESC);
REVOKE ALL ON public.pension_funded_positions, public.pension_funded_receipts FROM PUBLIC,moneyverse_app;

CREATE OR REPLACE FUNCTION public.pension_funded_contribute(
 p_actor uuid,p_key uuid,p_amount text
)
RETURNS TABLE(ledger_transaction_id uuid,contributed_wld text,fund_balance_wld text,replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO pg_catalog,pg_temp
AS $settle$
DECLARE
 v_amount numeric;
 v_user_cash uuid;
 v_fund uuid;
 v_tx uuid;
 v_previous public.pension_funded_receipts%ROWTYPE;
 v_count integer;
 v_balance numeric;
BEGIN
 IF p_actor IS NULL OR p_key IS NULL OR p_amount IS NULL
   OR length(p_amount)>80 OR p_amount !~ '^[1-9][0-9]*$'
 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid pension funding request'; END IF;
 v_amount:=p_amount::numeric;
 -- Serialize a member's fiscal position and a repeated idempotency key.
 PERFORM pg_advisory_xact_lock(hashtextextended('NPS_USER_'||p_actor::text,0));
 SELECT * INTO v_previous FROM public.pension_funded_receipts WHERE idempotency_key=p_key;
 IF FOUND THEN
   IF v_previous.user_id<>p_actor OR v_previous.amount_wld<>v_amount
      OR v_previous.operation<>'CONTRIBUTION'
   THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='pension idempotency conflict'; END IF;
   SELECT available_amount INTO v_balance FROM public.account_balances
   WHERE account_id=(SELECT id FROM public.accounts WHERE system_key='national_pension_fund');
   RETURN QUERY SELECT v_previous.ledger_transaction_id,v_amount::text,v_balance::text,true;
   RETURN;
 END IF;
 SELECT count(*),(array_agg(a.id))[1] INTO v_count,v_user_cash FROM public.accounts a
 WHERE a.owner_user_id=p_actor AND a.account_type='USER_CASH' AND a.status='active'
   AND a.currency='WLD';
 IF v_count<>1 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='unique active user cash account required'; END IF;
 SELECT id INTO STRICT v_fund FROM public.accounts
 WHERE system_key='national_pension_fund' AND account_type='ESCROW'
   AND status='active' AND NOT allow_negative;
 -- Canonical account-level posting increases dedicated escrow and debits user.
 -- The core primitive atomically rejects overdrafts and writes two-sided ledger.
 v_tx := public.economy_post_transaction(
    p_key,'NPS_FUNDED_CONTRIBUTION',p_actor,'NPS_FUNDED_V1',
    jsonb_build_array(
      jsonb_build_object('accountId',v_fund::text,'direction','debit','amount',p_amount),
      jsonb_build_object('accountId',v_user_cash::text,'direction','credit','amount',p_amount)
    ),'pension.funded.contribution',
    jsonb_build_object('userId',p_actor,'amountWld',p_amount,'fundAccountId',v_fund)
 );
 INSERT INTO public.pension_funded_receipts(idempotency_key,user_id,amount_wld,operation,ledger_transaction_id)
 VALUES (p_key,p_actor,v_amount,'CONTRIBUTION',v_tx);
 INSERT INTO public.pension_funded_positions(
    user_id,available_principal_wld,cumulative_funded_contribution_wld
 ) VALUES (p_actor,v_amount,v_amount)
 ON CONFLICT (user_id) DO UPDATE SET
    available_principal_wld=public.pension_funded_positions.available_principal_wld+excluded.available_principal_wld,
    cumulative_funded_contribution_wld=public.pension_funded_positions.cumulative_funded_contribution_wld+excluded.cumulative_funded_contribution_wld,
    updated_at=now();
 SELECT available_amount INTO STRICT v_balance FROM public.account_balances WHERE account_id=v_fund;
 RETURN QUERY SELECT v_tx,v_amount::text,v_balance::text,false;
END;
$settle$;
ALTER FUNCTION public.pension_funded_contribute(uuid,uuid,text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.pension_funded_contribute(uuid,uuid,text) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_funded_contribute(uuid,uuid,text) TO moneyverse_app;
COMMIT;
