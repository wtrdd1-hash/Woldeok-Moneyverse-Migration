-- v2026.10.15.684: conservation-first Treasury donation. Kept separate from
-- legacy donate routines, which remain explicitly disabled by migration 272.
BEGIN;

ALTER TABLE public.treasury_donations
  ADD COLUMN IF NOT EXISTS idempotency_key uuid,
  ADD COLUMN IF NOT EXISTS core_transaction_id uuid,
  ADD CONSTRAINT treasury_donation_v2_core_transaction_fk
    FOREIGN KEY (core_transaction_id) REFERENCES public.ledger_transactions(id),
  ADD CONSTRAINT treasury_donation_v2_idempotency_unique UNIQUE (idempotency_key),
  ADD CONSTRAINT treasury_donation_v2_core_unique UNIQUE (core_transaction_id);

CREATE OR REPLACE FUNCTION public.treasury_donate_v2(
  p_idempotency_key uuid,
  p_actor uuid,
  p_amount_wld text,
  p_memo text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_amount numeric;
  v_amount_text text;
  v_message text;
  v_user_cash_account_id uuid;
  v_treasury_account_id uuid;
  v_vault_id uuid;
  v_vault_balance numeric;
  v_transaction_id uuid;
  v_donation_id uuid;
  v_prior record;
  v_total_donated numeric;
  v_title text := '';
BEGIN
  IF p_idempotency_key IS NULL OR p_actor IS NULL OR p_amount_wld IS NULL
     OR p_amount_wld !~ '^[1-9][0-9]*$' THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid Treasury donation request';
  END IF;
  v_amount:=p_amount_wld::numeric;
  v_amount_text:=v_amount::text;
  IF v_amount <= 0 OR scale(v_amount) <> 0 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='positive integer WLD amount required';
  END IF;
  v_message:=btrim(coalesce(p_memo,''));
  IF char_length(v_message)>500 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Treasury donation memo too long';
  END IF;

  -- Repeat commands are serialized even before recording the fiscal receipt.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key::text, 684));
  SELECT d.id,d.user_id,d.amount_wld,d.memo,d.core_transaction_id
  INTO v_prior
  FROM public.treasury_donations d
  WHERE d.idempotency_key=p_idempotency_key
  FOR UPDATE;
  IF FOUND THEN
    IF v_prior.user_id IS DISTINCT FROM p_actor
       OR v_prior.amount_wld IS DISTINCT FROM v_amount
       OR coalesce(v_prior.memo,'') IS DISTINCT FROM v_message THEN
      RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='idempotency key reused for different Treasury donation';
    END IF;
    RETURN jsonb_build_object(
      'success',true,
      'donationId',v_prior.id,
      'transactionId',v_prior.core_transaction_id,
      'amountWld',v_amount_text,
      'memo',v_message
    );
  END IF;

  SELECT a.id INTO v_user_cash_account_id
  FROM public.accounts a
  JOIN public.users u ON u.id=a.owner_user_id
  WHERE a.owner_user_id=p_actor
    AND a.account_type='USER_CASH'::public.account_type
    AND a.status='active'::public.account_status
    AND u.status='active'::public.user_status;
  SELECT a.id INTO v_treasury_account_id
  FROM public.accounts a
  WHERE a.account_type='TREASURY'::public.account_type
    AND a.status='active'::public.account_status
  ORDER BY a.id LIMIT 1;
  IF v_user_cash_account_id IS NULL OR v_treasury_account_id IS NULL
     OR v_user_cash_account_id=v_treasury_account_id THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active donor and Treasury settlement accounts required';
  END IF;

  -- The Economy Core is the sole writer of member/treasury account balances.
  -- These balanced postings move existing WLD; they cannot mint supply.
  SELECT public.economy_post_transaction(
    p_idempotency_key,
    'TREASURY_DONATION',
    p_actor,
    NULL, -- economy_policies has no approved live row; never fabricate a policy version
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_user_cash_account_id,'direction','credit','amount',v_amount_text),
      pg_catalog.jsonb_build_object('accountId',v_treasury_account_id,'direction','debit','amount',v_amount_text)
    ),
    'treasury.donation.settled',
    pg_catalog.jsonb_build_object('donorId',p_actor,'amountWld',v_amount_text,'memo',v_message)
  ) INTO v_transaction_id;

  -- Fiscal subledger: mirrors the canonical settlement, but is not minting.
  SELECT v.id,v.balance_wld::numeric INTO v_vault_id,v_vault_balance
  FROM public.system_treasury_vaults v
  WHERE v.code='VAULT_MAIN'
  FOR UPDATE;
  IF v_vault_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='Treasury fiscal vault is unavailable';
  END IF;

  UPDATE public.system_treasury_vaults
  SET balance_wld=(v_vault_balance+v_amount)::text,
      updated_at=pg_catalog.clock_timestamp()
  WHERE id=v_vault_id;

  SELECT coalesce(sum(d.amount_wld),0)+v_amount INTO v_total_donated
  FROM public.treasury_donations d WHERE d.user_id=p_actor;
  IF v_total_donated>=50000 THEN
    v_title:='국가 번영의 초석 (명예 기부자)';
  ELSIF v_total_donated>=10000 THEN
    v_title:='애국 시민 (국고 수호자)';
  ELSIF v_total_donated>=1000 THEN
    v_title:='선량한 기부자';
  END IF;

  INSERT INTO public.treasury_donations(
    user_id,amount_wld,memo,honor_title,idempotency_key,core_transaction_id
  ) VALUES (
    p_actor,v_amount,v_message,v_title,p_idempotency_key,v_transaction_id
  ) RETURNING id INTO v_donation_id;

  INSERT INTO public.system_treasury_ledger(
    vault_id,tx_type,amount_wld,actor_id,reason,balance_before,balance_after
  ) VALUES (
    v_vault_id,'USER_DONATION',v_amount_text,p_actor,
    format('Core transaction %s (Treasury donation)',v_transaction_id),
    v_vault_balance::text,(v_vault_balance+v_amount)::text
  );

  RETURN jsonb_build_object(
    'success',true,'donationId',v_donation_id,
    'transactionId',v_transaction_id,
    'amountWld',v_amount_text,'memo',v_message
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.treasury_donate_v2(uuid,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_donate_v2(uuid,uuid,text,text) TO moneyverse_app;
COMMIT;
