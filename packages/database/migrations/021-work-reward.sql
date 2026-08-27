BEGIN;

-- Work rewards are DB-owned: the browser may retry with an idempotency key,
-- but never chooses a reward amount or cooldown.
CREATE TABLE IF NOT EXISTS public.work_reward_policy (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  amount bigint NOT NULL CHECK (amount > 0),
  cooldown interval NOT NULL CHECK (cooldown >= interval '1 minute'),
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.work_reward_policy (singleton, amount, cooldown, enabled)
VALUES (true, 50, interval '1 hour', true)
ON CONFLICT (singleton) DO NOTHING;

ALTER TABLE public.work_rewards
  ADD COLUMN IF NOT EXISTS amount bigint;

REVOKE ALL PRIVILEGES ON TABLE public.work_reward_policy FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.economy_claim_work(
  p_key uuid,
  p_actor uuid
) RETURNS TABLE (transaction_id uuid, amount bigint, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing_key uuid;
  v_existing_transaction uuid;
  v_existing_amount bigint;
  v_last_claim timestamptz;
  v_amount bigint;
  v_cash_account uuid;
  v_mint_account uuid;
  v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid work reward';
  END IF;

  SELECT idempotency_key, transaction_id, amount
  INTO v_existing_key, v_existing_transaction, v_existing_amount
  FROM public.work_rewards WHERE idempotency_key = p_key;
  IF FOUND THEN
    IF (SELECT user_id FROM public.work_rewards WHERE idempotency_key = p_key) = p_actor THEN
      RETURN QUERY SELECT v_existing_transaction, v_existing_amount, true;
      RETURN;
    END IF;
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'work receipt belongs to another user';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:work-reward:' || p_actor::text, 0));
  SELECT amount INTO v_amount FROM public.work_reward_policy
  WHERE singleton AND enabled FOR SHARE;
  IF v_amount IS NULL THEN RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'work reward is disabled'; END IF;

  SELECT created_at INTO v_last_claim FROM public.work_rewards
  WHERE user_id = p_actor ORDER BY created_at DESC LIMIT 1;
  IF v_last_claim IS NOT NULL AND v_last_claim + (SELECT cooldown FROM public.work_reward_policy WHERE singleton) > now() THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'work reward cooldown active';
  END IF;

  SELECT account.id INTO v_cash_account FROM public.accounts AS account
  JOIN public.users AS user_row ON user_row.id = account.owner_user_id
  WHERE account.owner_user_id = p_actor AND account.account_type = 'USER_CASH'::public.account_type
    AND account.status = 'active'::public.account_status AND user_row.status = 'active'::public.user_status;
  SELECT id INTO v_mint_account FROM public.accounts
  WHERE system_key = 'mint' AND account_type = 'MINT'::public.account_type
    AND status = 'active'::public.account_status;
  IF v_cash_account IS NULL OR v_mint_account IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash wallet required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key, 'WORK_REWARD', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_mint_account, 'amount', v_amount, 'direction', 'credit'),
      jsonb_build_object('accountId', v_cash_account, 'amount', v_amount, 'direction', 'debit')
    ), 'game.work_reward.claimed', jsonb_build_object('userId', p_actor, 'amount', v_amount)
  ) INTO v_transaction;

  INSERT INTO public.work_rewards(user_id, idempotency_key, transaction_id, amount)
  VALUES (p_actor, p_key, v_transaction, v_amount);
  RETURN QUERY SELECT v_transaction, v_amount, false;
END;
$$;

ALTER FUNCTION public.economy_claim_work(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_claim_work(uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_claim_work(uuid, uuid) TO moneyverse_app;

COMMIT;
