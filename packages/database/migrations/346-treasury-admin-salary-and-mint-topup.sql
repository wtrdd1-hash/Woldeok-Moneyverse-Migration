-- v2026.11.10.1950: Treasury Admin Salary, Mint Direct Top-up, and Pigouvian Welfare Tax
BEGIN;

-- 1. 관리자 임금 지급 감사 테이블
CREATE TABLE IF NOT EXISTS public.treasury_admin_salaries (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  amount_wld numeric(20,0) NOT NULL CHECK (amount_wld > 0),
  disbursed_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  source_vault text NOT NULL DEFAULT 'VAULT_MAIN',
  reason text NOT NULL,
  ledger_transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

REVOKE ALL ON TABLE public.treasury_admin_salaries FROM PUBLIC, moneyverse_app;
GRANT SELECT ON TABLE public.treasury_admin_salaries TO moneyverse_app;
GRANT SELECT, INSERT ON TABLE public.treasury_admin_salaries TO moneyverse_migrator;

-- 2. 국고 관리자 임금 지급 함수
CREATE OR REPLACE FUNCTION public.treasury_disburse_admin_salary(
  p_actor uuid,
  p_target_admin uuid,
  p_amount text,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $salary$
DECLARE
  v_vault_id uuid;
  v_vault_before numeric;
  v_vault_after numeric;
  v_amount numeric;
  v_treasury_acc_id uuid;
  v_user_acc_id uuid;
  v_tx_id uuid;
  v_key uuid;
  v_postings jsonb;
BEGIN
  -- 관리자 권한 확인
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'approver'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator privilege required for salary disbursement';
  END IF;

  -- 대상자가 관리자 역할인지 확인
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_target_admin
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'target user is not an authorized administrator';
  END IF;

  -- 금액 검증 (1 ~ 5,000,000 WLD)
  IF p_amount IS NULL OR p_amount !~ '^[1-9][0-9]{0,7}$' OR p_amount::numeric NOT BETWEEN 1 AND 5000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'admin salary amount must be between 1 and 5,000,000 WLD';
  END IF;
  v_amount := p_amount::numeric;

  -- 사유 검증
  IF p_reason IS NULL OR length(btrim(p_reason)) < 5 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'salary disbursement reason must be at least 5 characters';
  END IF;

  -- 국고 중앙 금고(VAULT_MAIN) 잠금 및 비축금 검증
  SELECT id, balance_wld::numeric INTO v_vault_id, v_vault_before
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF v_vault_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'VAULT_MAIN not found';
  END IF;

  -- 30% 안전 비축금 원칙 강제 (불가침 하한선)
  IF (v_vault_before - v_amount) < floor(v_vault_before * 0.30) THEN
    RAISE EXCEPTION USING ERRCODE = '22003', MESSAGE = 'EX_INSUFFICIENT_SAFE_RESERVE: cannot disburse salary violating 30% safe reserve';
  END IF;

  -- 국고 계좌 식별
  SELECT id INTO v_treasury_acc_id
  FROM public.accounts
  WHERE account_type = 'TREASURY'::public.account_type
  LIMIT 1;

  IF v_treasury_acc_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'TREASURY account not found';
  END IF;

  -- 수령 관리자의 USER_CASH 계좌 조회/생성
  SELECT id INTO v_user_acc_id
  FROM public.accounts
  WHERE owner_user_id = p_target_admin AND account_type = 'USER_CASH'::public.account_type
  LIMIT 1;

  IF v_user_acc_id IS NULL THEN
    INSERT INTO public.accounts (owner_user_id, account_type, currency, status, allow_negative)
    VALUES (p_target_admin, 'USER_CASH'::public.account_type, 'WLD', 'active'::public.account_status, false)
    RETURNING id INTO v_user_acc_id;

    INSERT INTO public.account_balances (account_id, available_amount)
    VALUES (v_user_acc_id, 0)
    ON CONFLICT (account_id) DO NOTHING;
  END IF;

  -- 국고 잔고 차감
  v_vault_after := v_vault_before - v_amount;
  UPDATE public.system_treasury_vaults
  SET balance_wld = v_vault_after::text, updated_at = clock_timestamp()
  WHERE id = v_vault_id;

  -- 회계 감사 원장 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after, created_at
  ) VALUES (
    v_vault_id, 'OUTFLOW', v_amount::text, p_actor,
    '[국고 관리자 임금 지급] ' || btrim(p_reason),
    v_vault_before::text, v_vault_after::text, clock_timestamp()
  );

  -- 복식부기 전표 발행 (credit TREASURY, debit USER_CASH)
  v_key := md5('admin-salary-' || p_target_admin::text || '-' || clock_timestamp()::text)::uuid;
  v_postings := jsonb_build_array(
    jsonb_build_object('accountId', v_treasury_acc_id, 'amount', v_amount::text, 'direction', 'credit'),
    jsonb_build_object('accountId', v_user_acc_id, 'amount', v_amount::text, 'direction', 'debit')
  );

  v_tx_id := public.economy_post_transaction(
    v_key,
    'TREASURY_ADMIN_SALARY',
    p_actor,
    'v1950',
    v_postings,
    'treasury.admin_salary_disbursed',
    jsonb_build_object('targetAdminId', p_target_admin, 'amountWld', v_amount::text, 'reason', p_reason)
  );

  -- 감사 테이블 기록
  INSERT INTO public.treasury_admin_salaries (
    admin_id, amount_wld, disbursed_by, source_vault, reason, ledger_transaction_id
  ) VALUES (
    p_target_admin, v_amount, p_actor, 'VAULT_MAIN', btrim(p_reason), v_tx_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'code', 'ADMIN_SALARY_DISBURSED',
    'amount_wld', v_amount::text,
    'target_admin_id', p_target_admin,
    'ledger_transaction_id', v_tx_id,
    'vault_balance_after_wld', v_vault_after::text
  );
END;
$salary$;

ALTER FUNCTION public.treasury_disburse_admin_salary(uuid, uuid, text, text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_disburse_admin_salary(uuid, uuid, text, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_admin_salary(uuid, uuid, text, text) TO moneyverse_app;

-- 3. 조폐국 화폐발행으로 국고 즉시 채우기 (Top-up from Mint) 통합 함수
CREATE OR REPLACE FUNCTION public.admin_treasury_topup_from_mint_direct(
  p_actor uuid,
  p_amount text,
  p_reason text,
  p_request_key uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $topup$
DECLARE
  v_order_id uuid;
  v_receipt jsonb;
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'approver'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'superadmin or approver required for direct mint top-up';
  END IF;

  IF p_amount IS NULL OR p_amount !~ '^[1-9][0-9]{0,7}$' OR p_amount::numeric NOT BETWEEN 1 AND 10000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'mint topup amount must be 1..10,000,000 WLD';
  END IF;

  -- 1. 승인된 통화정책 발령 주문 즉시 생성
  INSERT INTO public.monetary_policy_orders (
    order_type, target_envelope, max_amount_wld, status, proposed_by, approved_by, reason, expires_at
  ) VALUES (
    'MINT', 'TREASURY_ISSUANCE', p_amount, 'APPROVED', p_actor, p_actor, btrim(p_reason),
    clock_timestamp() + interval '24 hours'
  ) RETURNING id INTO v_order_id;

  -- 2. 조폐국 발행 정본 실행
  v_receipt := public.admin_monetary_mint_to_treasury(p_actor, v_order_id, p_amount, p_request_key);

  RETURN v_receipt;
END;
$topup$;

ALTER FUNCTION public.admin_treasury_topup_from_mint_direct(uuid, text, text, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_treasury_topup_from_mint_direct(uuid, text, text, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_treasury_topup_from_mint_direct(uuid, text, text, uuid) TO moneyverse_app;

-- 4. 카지노 고액 베팅 도박 중독 방지 피구세(1%) 복지 금고 실시간 격리 트리거 함수
CREATE OR REPLACE FUNCTION public.trigger_casino_pigouvian_welfare_tax()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $pigou$
DECLARE
  v_tax numeric;
  v_welfare_id uuid;
  v_welfare_before numeric;
  v_welfare_after numeric;
BEGIN
  -- 10만 WLD 이상 고액 베팅 시 1% 피구세 직행 격리
  IF NEW.stake_amount >= 100000 THEN
    v_tax := floor(NEW.stake_amount * 0.01);
    IF v_tax >= 1 THEN
      SELECT id, balance_wld::numeric INTO v_welfare_id, v_welfare_before
      FROM public.system_treasury_vaults
      WHERE code = 'VAULT_WELFARE'
      FOR UPDATE;

      IF v_welfare_id IS NOT NULL THEN
        v_welfare_after := v_welfare_before + v_tax;
        UPDATE public.system_treasury_vaults
        SET balance_wld = v_welfare_after::text, updated_at = clock_timestamp()
        WHERE id = v_welfare_id;

        INSERT INTO public.system_treasury_ledger (
          vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after, created_at
        ) VALUES (
          v_welfare_id, 'INFLOW', v_tax::text, NEW.user_id,
          '[도박 중독 방지 교정세 1%] 카지노 고액 베팅 100% 복지 금고 직행 귀속',
          v_welfare_before::text, v_welfare_after::text, clock_timestamp()
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$pigou$;

ALTER FUNCTION public.trigger_casino_pigouvian_welfare_tax() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.trigger_casino_pigouvian_welfare_tax() FROM PUBLIC;

-- 카지노 주사위 테이블 트리거 연결
DROP TRIGGER IF EXISTS trg_casino_dice_pigouvian_tax ON public.virtual_casino_dice_plays;
CREATE TRIGGER trg_casino_dice_pigouvian_tax
AFTER INSERT ON public.virtual_casino_dice_plays
FOR EACH ROW EXECUTE FUNCTION public.trigger_casino_pigouvian_welfare_tax();

COMMIT;
