-- WLD-only coin game. No cash-out, payment, or real-world prize exists.
CREATE TABLE IF NOT EXISTS public.virtual_casino_coin_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  play_date date NOT NULL,
  choice text NOT NULL CHECK (choice IN ('heads', 'tails')),
  outcome text NOT NULL CHECK (outcome IN ('heads', 'tails')),
  stake_amount bigint NOT NULL CHECK (stake_amount BETWEEN 10 AND 10000),
  net_amount bigint NOT NULL,
  transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.virtual_casino_coin_plays FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.casino_play_coin(p_key uuid, p_actor uuid, p_choice text, p_stake bigint)
RETURNS TABLE(play_id uuid, outcome text, net_amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_date date := (pg_catalog.now() AT TIME ZONE 'Asia/Seoul')::date; v_existing public.virtual_casino_coin_plays%ROWTYPE; v_cash uuid; v_counterparty uuid; v_outcome text; v_net bigint; v_tx uuid; v_play uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_choice NOT IN ('heads','tails') OR p_stake NOT BETWEEN 10 AND 10000 THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid coin game request'; END IF;
  SELECT * INTO v_existing FROM public.virtual_casino_coin_plays WHERE idempotency_key=p_key;
  IF FOUND THEN
    IF v_existing.user_id=p_actor AND v_existing.choice=p_choice AND v_existing.stake_amount=p_stake THEN RETURN QUERY SELECT v_existing.id,v_existing.outcome,v_existing.net_amount,v_existing.transaction_id,true; RETURN; END IF;
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='idempotency key conflicts with another game';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active user required'; END IF;
  IF COALESCE((SELECT sum(stake_amount) FROM public.virtual_casino_coin_plays WHERE user_id=p_actor AND play_date=v_date),0)+p_stake > 50000 THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='daily game limit reached'; END IF;
  SELECT id INTO v_cash FROM public.accounts WHERE owner_user_id=p_actor AND account_type='USER_CASH'::public.account_type AND status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active cash wallet required'; END IF;
  v_outcome := CASE WHEN get_byte(public.gen_random_bytes(1),0) < 48 THEN 'heads' ELSE 'tails' END;
  v_net := CASE WHEN v_outcome=p_choice THEN p_stake ELSE -p_stake END;
  SELECT id INTO v_counterparty FROM public.accounts WHERE system_key=CASE WHEN v_net>0 THEN 'mint' ELSE 'sink' END AND status='active'::public.account_status FOR UPDATE;
  IF v_counterparty IS NULL THEN RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='game counterparty required'; END IF;
  SELECT public.economy_post_transaction(p_key, 'VIRTUAL_COIN_GAME', p_actor, NULL,
    jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',p_stake,'direction',CASE WHEN v_net>0 THEN 'debit' ELSE 'credit' END),jsonb_build_object('accountId',v_counterparty,'amount',p_stake,'direction',CASE WHEN v_net>0 THEN 'credit' ELSE 'debit' END)),
    'casino.coin.played', jsonb_build_object('choice',p_choice,'outcome',v_outcome,'stake',p_stake,'net',v_net)) INTO v_tx;
  INSERT INTO public.virtual_casino_coin_plays(idempotency_key,user_id,play_date,choice,outcome,stake_amount,net_amount,transaction_id) VALUES(p_key,p_actor,v_date,p_choice,v_outcome,p_stake,v_net,v_tx) RETURNING id INTO v_play;
  RETURN QUERY SELECT v_play,v_outcome,v_net,v_tx,false;
END $$;
ALTER FUNCTION public.casino_play_coin(uuid,uuid,text,bigint) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.casino_play_coin(uuid,uuid,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.casino_play_coin(uuid,uuid,text,bigint) TO moneyverse_app;
