-- v1626.3: original SQL272 writes the correct canonical donation transaction but
-- omitted its transaction ID from the fiscal Treasury source event. SQL314 guard
-- correctly rejected every new donation at COMMIT; restore the missing exact link.
-- An authorized member supplies existing WLD; this is NOT a new Mint issuance.
BEGIN;
CREATE OR REPLACE FUNCTION public.treasury_user_donate(
  p_user_id uuid,
  p_amount_wld text,
  p_memo text,
  p_request_key uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $donation$
DECLARE
  v_amount numeric;
  v_user_account_id uuid;
  v_treasury_account_id uuid;
  v_vault_id uuid;
  v_old_vault numeric;
  v_new_vault numeric;
  v_tx_id uuid;
  v_receipt jsonb;
  v_donation_id uuid;
  v_total numeric;
  v_title text;
  v_user_balance numeric;
  v_memo text;
BEGIN
  IF p_user_id IS NULL OR p_request_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='actor and idempotency key are required';
  END IF;
  IF p_amount_wld IS NULL OR p_amount_wld !~ '^[1-9][0-9]*$'
    OR length(p_amount_wld) > 16 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='a positive bounded integer donation amount is required';
  END IF;
  v_amount := p_amount_wld::numeric;
  IF v_amount > 1000000000000000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='donation amount exceeds supported range';
  END IF;
  v_memo := left(coalesce(nullif(btrim(p_memo),''),'국고 자발적 공공 기부'), 300);
  SELECT a.id INTO v_user_account_id FROM public.accounts a
  WHERE a.owner_user_id=p_user_id
    AND a.account_type='USER_CASH'::public.account_type
    AND a.currency='WLD'
    AND a.status='active'::public.account_status
  ORDER BY a.id LIMIT 1;
  SELECT a.id INTO v_treasury_account_id FROM public.accounts a
  WHERE a.account_type='TREASURY'::public.account_type
    AND a.status='active'::public.account_status
  ORDER BY a.id LIMIT 1;
  IF v_user_account_id IS NULL OR v_treasury_account_id IS NULL
    OR v_user_account_id = v_treasury_account_id THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='eligible cash or treasury ledger account is unavailable';
  END IF;

  -- The canonical primitive is SECURITY DEFINER, balance-checked, row-locked,
  -- immutable two-sided and idempotent. It owns the only balance mutation.
  SELECT public.economy_post_transaction(
    p_request_key, 'TREASURY_USER_DONATION', p_user_id, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_user_account_id,'amount',v_amount::text,'direction','credit'),
      pg_catalog.jsonb_build_object('accountId',v_treasury_account_id,'amount',v_amount::text,'direction','debit')
    ),
    'treasury.donation.recorded',
    pg_catalog.jsonb_build_object('donorId',p_user_id,'amountWld',v_amount::text)
  ) INTO v_tx_id;

  SELECT d.receipt INTO v_receipt FROM public.treasury_donations d
  WHERE d.ledger_transaction_id=v_tx_id;
  IF FOUND THEN
    IF v_receipt IS NULL THEN
      RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='incomplete donation receipt requires operator reconciliation';
    END IF;
    RETURN v_receipt;
  END IF;

  SELECT id,balance_wld::numeric INTO v_vault_id,v_old_vault
  FROM public.system_treasury_vaults
  WHERE code='VAULT_MAIN' FOR UPDATE;
  IF NOT FOUND OR v_old_vault IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='central treasury vault unavailable';
  END IF;
  v_new_vault := v_old_vault + v_amount;

  SELECT coalesce(sum(amount_wld),0)+v_amount INTO v_total
  FROM public.treasury_donations WHERE user_id=p_user_id;
  v_title := CASE WHEN v_total >= 50000 THEN '골드 필란트로피스트 (Gold Philanthropist)'
    WHEN v_total >= 10000 THEN '실버 가디언 (Silver Guardian)'
    WHEN v_total >= 1000 THEN '브론즈 서포터 (Bronze Supporter)'
    ELSE '시민 기부자 (Citizen Donor)' END;

  UPDATE public.system_treasury_vaults
  SET balance_wld=v_new_vault::text,updated_at=pg_catalog.clock_timestamp()
  WHERE id=v_vault_id;
  INSERT INTO public.system_treasury_ledger
    (vault_id,tx_type,amount_wld,actor_id,reason,balance_before,balance_after,ledger_transaction_id)
  VALUES (v_vault_id,'USER_DONATION',v_amount::text,p_user_id,
    'Verified immutable economic receipt '||v_tx_id::text,v_old_vault::text,v_new_vault::text,v_tx_id);

  SELECT ab.available_amount INTO v_user_balance
  FROM public.account_balances ab WHERE ab.account_id=v_user_account_id;
  v_receipt := pg_catalog.jsonb_build_object(
    'success',true,'donation_id',NULL,'ledger_transaction_id',v_tx_id,
    'donated_amount_wld',v_amount::text,'total_donated_wld',v_total::text,
    'honor_title',v_title,'user_balance_after',v_user_balance::text,
    'vault_balance_after',v_new_vault::text
  );
  INSERT INTO public.treasury_donations
    (user_id,amount_wld,memo,honor_title,ledger_transaction_id,receipt)
  VALUES (p_user_id,v_amount,v_memo,v_title,v_tx_id,v_receipt)
  RETURNING id INTO v_donation_id;
  v_receipt := pg_catalog.jsonb_set(v_receipt,'{donation_id}',pg_catalog.to_jsonb(v_donation_id));
  UPDATE public.treasury_donations SET receipt=v_receipt WHERE id=v_donation_id;
  RETURN v_receipt;
END;
$donation$;
ALTER FUNCTION public.treasury_user_donate(uuid,text,text,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_user_donate(uuid,text,text,uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_user_donate(uuid,text,text,uuid) TO moneyverse_app;
COMMIT;
