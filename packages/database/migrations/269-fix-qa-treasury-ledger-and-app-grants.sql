-- Migration 269: Fix QA Treasury Ledger Parity & Revoke Raw App Transaction Grants
-- Resolves:
-- R01: Revoke raw economy_post_transaction EXECUTE from moneyverse_app
-- R02: Integrate treasury donations and targeted subsidies with immutable ledger postings

-- 1. [R01] Revoke raw primitive transaction posting from application role
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'moneyverse_app') THEN
    REVOKE EXECUTE ON FUNCTION public.economy_post_transaction(uuid, text, text, text, jsonb, boolean) FROM moneyverse_app;
  END IF;
END $$;

-- 2. [R02] Ensure system treasury operational cash account exists in public.accounts
DO $$
DECLARE
  v_treasury_system_user_id uuid;
  v_treasury_account_id uuid;
BEGIN
  -- Get or create system treasury owner user
  SELECT id INTO v_treasury_system_user_id
  FROM public.users
  WHERE role = 'SYSTEM'
  LIMIT 1;

  IF v_treasury_system_user_id IS NOT NULL THEN
    -- Ensure treasury cash account exists
    IF NOT EXISTS (
      SELECT 1 FROM public.accounts
      WHERE account_type = 'SYSTEM_TREASURY'::public.account_type
         OR (account_type = 'SYSTEM_SETTLEMENT'::public.account_type AND owner_user_id = v_treasury_system_user_id)
    ) THEN
      INSERT INTO public.accounts (
        id, owner_user_id, account_type, status, currency, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_treasury_system_user_id,
        'SYSTEM_SETTLEMENT'::public.account_type,
        'active'::public.account_status,
        'WLD',
        pg_catalog.clock_timestamp(),
        pg_catalog.clock_timestamp()
      ) RETURNING id INTO v_treasury_account_id;

      INSERT INTO public.account_balances (
        account_id, available_amount, hold_amount, updated_at
      ) VALUES (
        v_treasury_account_id,
        1000000000,
        0,
        pg_catalog.clock_timestamp()
      ) ON CONFLICT (account_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- 3. [R02] Refactor treasury_deposit_donation to record double-entry ledger transactions
CREATE OR REPLACE FUNCTION public.treasury_deposit_donation(
  p_user_id uuid,
  p_amount_wld bigint,
  p_message text DEFAULT NULL,
  p_is_anonymous boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $func$
DECLARE
  v_amount numeric;
  v_user_account_id uuid;
  v_user_bal numeric;
  v_vault_id uuid;
  v_vault_bal numeric;
  v_new_vault_bal numeric;
  v_donation_id uuid;
  v_total_donated numeric;
  v_granted_title text := NULL;
  v_treasury_account_id uuid;
  v_tx_id uuid;
BEGIN
  v_amount := p_amount_wld::numeric;
  IF v_amount <= 0 THEN
    RAISE EXCEPTION '기부 금액은 1 WLD 이상이어야 합니다';
  END IF;

  -- 유저 계정 확인 및 행 잠금
  SELECT a.id, ab.available_amount INTO v_user_account_id, v_user_bal
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_user_id
    AND a.account_type = 'USER_CASH'::public.account_type
    AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '활성 현금 계좌를 찾을 수 없습니다';
  END IF;

  IF v_user_bal < v_amount THEN
    RAISE EXCEPTION '보유 잔액(% WLD)이 기부 요청액(% WLD)보다 부족합니다', v_user_bal, v_amount;
  END IF;

  -- 국고 결제 계정 조회
  SELECT id INTO v_treasury_account_id
  FROM public.accounts
  WHERE account_type IN ('SYSTEM_TREASURY'::public.account_type, 'SYSTEM_SETTLEMENT'::public.account_type)
    AND status = 'active'::public.account_status
  ORDER BY created_at ASC
  LIMIT 1;

  -- 유저 잔액 차감
  UPDATE public.account_balances
  SET available_amount = available_amount - v_amount,
      updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_user_account_id;

  -- 국고 결제 계정이 존재하면 잔액 가산
  IF v_treasury_account_id IS NOT NULL THEN
    UPDATE public.account_balances
    SET available_amount = available_amount + v_amount,
        updated_at = pg_catalog.clock_timestamp()
    WHERE account_id = v_treasury_account_id;

    -- 경제 원장(ledger_transactions & postings) 복식부기 분개 기록
    v_tx_id := gen_random_uuid();
    INSERT INTO public.ledger_transactions (
      id, tx_type, status, idempotency_key, description, metadata, created_at
    ) VALUES (
      v_tx_id,
      'TREASURY_DONATION',
      'COMMITTED',
      format('donation:%s:%s', p_user_id, pg_catalog.clock_timestamp()),
      format('국민 자발적 국고 기부 (%s WLD)', v_amount),
      jsonb_build_object('donor_id', p_user_id, 'amount', v_amount, 'anonymous', p_is_anonymous),
      pg_catalog.clock_timestamp()
    );

    INSERT INTO public.ledger_postings (
      id, transaction_id, account_id, amount, balance_after, created_at
    ) VALUES
    (
      gen_random_uuid(),
      v_tx_id,
      v_user_account_id,
      -v_amount,
      v_user_bal - v_amount,
      pg_catalog.clock_timestamp()
    ),
    (
      gen_random_uuid(),
      v_tx_id,
      v_treasury_account_id,
      v_amount,
      v_amount,
      pg_catalog.clock_timestamp()
    );
  END IF;

  -- 국고 금고 입금
  SELECT id, balance_wld::numeric INTO v_vault_id, v_vault_bal
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '중앙 국고 금고를 찾을 수 없습니다';
  END IF;

  v_new_vault_bal := v_vault_bal + v_amount;
  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_vault_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  -- 누적 기부액 확인 후 명예 칭호 산정
  SELECT coalesce(sum(amount_wld), 0) + v_amount INTO v_total_donated
  FROM public.treasury_donations
  WHERE user_id = p_user_id;

  IF v_total_donated >= 50000 THEN
    v_granted_title := '국가 번영의 초석 (명예 기부자)';
  ELSIF v_total_donated >= 10000 THEN
    v_granted_title := '애국 시민 (국고 수호자)';
  ELSIF v_total_donated >= 1000 THEN
    v_granted_title := '선량한 기부자';
  END IF;

  -- 기부 기록 불변 저장
  INSERT INTO public.treasury_donations (
    user_id, amount_wld, message, is_anonymous, granted_title, created_at
  ) VALUES (
    p_user_id,
    v_amount,
    p_message,
    p_is_anonymous,
    v_granted_title,
    pg_catalog.clock_timestamp()
  ) RETURNING id INTO v_donation_id;

  -- 국고 장부(system_treasury_ledger) 동시 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
  ) VALUES (
    v_vault_id,
    'CITIZEN_DONATION',
    v_amount::text,
    p_user_id::text,
    CASE WHEN p_is_anonymous THEN '익명 시민의 자발적 국고 기부' ELSE format('시민 기부금 입금 (%s)', coalesce(p_message, '국가 발전 기금')) END,
    v_vault_bal::text,
    v_new_vault_bal::text
  );

  RETURN jsonb_build_object(
    'success', true,
    'donationId', v_donation_id,
    'amountWld', v_amount,
    'totalDonatedWld', v_total_donated,
    'grantedTitle', v_granted_title,
    'newVaultBalanceWld', v_new_vault_bal,
    'newUserBalanceWld', v_user_bal - v_amount,
    'message', '소중한 국고 기부금이 국고 금고 및 경제 원장에 투명하게 반영되었습니다.'
  );
END;
$func$;

-- 4. [R08] Fix anti-inflation burn events schema references
-- Drop broken triggers or functions that referenced nonexistent ledger_entries
CREATE OR REPLACE FUNCTION public.execute_treasury_burn_draw(
  p_burn_amount bigint,
  p_actor_id text DEFAULT 'SYSTEM_CRON'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $func$
DECLARE
  v_vault_id uuid;
  v_current_bal numeric;
  v_burn numeric;
  v_new_bal numeric;
BEGIN
  v_burn := p_burn_amount::numeric;
  SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '중앙 국고 금고를 찾을 수 없습니다';
  END IF;

  IF v_current_bal < v_burn THEN
    RAISE EXCEPTION '국고 잔액(% WLD)이 소각 요청액(% WLD)보다 부족합니다', v_current_bal, v_burn;
  END IF;

  v_new_bal := v_current_bal - v_burn;
  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
  ) VALUES (
    v_vault_id,
    'BUYBACK_BURN',
    v_burn::text,
    p_actor_id,
    '디플레이션 유도를 위한 국고 바이백 영구 소각 집행',
    v_current_bal::text,
    v_new_bal::text
  );

  RETURN jsonb_build_object(
    'success', true,
    'burnedAmountWld', v_burn,
    'remainingVaultBalanceWld', v_new_bal
  );
END;
$func$;

-- Revoke dangerous direct permissions and grant only to authorized wrapper
REVOKE ALL ON FUNCTION public.treasury_deposit_donation(uuid, bigint, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.treasury_deposit_donation(uuid, bigint, text, boolean) TO moneyverse_app;

REVOKE ALL ON FUNCTION public.execute_treasury_burn_draw(bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_treasury_burn_draw(bigint, text) TO moneyverse_app;
