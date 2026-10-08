-- 263-anti-inflation-burn-events.sql
-- Anti-Inflation Golden Burn Draw & Philanthropy Treasury System

CREATE TABLE IF NOT EXISTS public.burn_event_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  burn_amount NUMERIC NOT NULL DEFAULT 10000,
  reward_title VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_burn_event_user ON public.burn_event_participations(user_id, created_at DESC);

-- 원자적 WLD 소각 및 한정판 칭호 수여 함수
CREATE OR REPLACE FUNCTION public.participate_anti_inflation_burn_draw(
  p_user_id UUID,
  p_burn_amount NUMERIC DEFAULT 10000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_account_id UUID;
  v_current_bal NUMERIC;
  v_titles TEXT[] := ARRAY[
    '인플레이션 헌터 (Inflation Hunter)',
    '국고 수호자 (Treasury Guardian)',
    '골든 고래 (Golden Whale)',
    '월덱 박애주의자 (Moneyverse Philanthropist)',
    '통화안정 명예훈장 (Monetary Peacekeeper)'
  ];
  v_chosen_title TEXT;
  v_vault_id UUID;
BEGIN
  -- 1. 유저 현금 계좌 및 잔액 조회
  SELECT a.id, ab.available_amount INTO v_account_id, v_current_bal
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_user_id AND a.account_type = 'USER_CASH'
  FOR UPDATE;

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION '현금 계좌를 찾을 수 없습니다.';
  END IF;

  IF v_current_bal < p_burn_amount THEN
    RAISE EXCEPTION '소각 참여를 위한 WLD 잔액이 부족합니다. (필요: % WLD, 보유: % WLD)', p_burn_amount, v_current_bal;
  END IF;

  -- 2. 유저 잔액 차감 (화폐 소각)
  UPDATE public.account_balances
  SET available_amount = available_amount - p_burn_amount,
      updated_at = clock_timestamp()
  WHERE account_id = v_account_id;

  -- 3. 원장(ledger_entries)에 영구 소각(destination_account_id IS NULL) 기록
  INSERT INTO public.ledger_entries (
    source_account_id, destination_account_id, amount, currency, description, created_at
  ) VALUES (
    v_account_id, NULL, p_burn_amount, 'WLD', '거시경제 인플레이션 타파 럭키 골든 드로우 영구 소각', clock_timestamp()
  );

  -- 4. 무작위 칭호 결정 및 수여
  v_chosen_title := v_titles[floor(random() * array_length(v_titles, 1) + 1)::int];

  -- member_titles 테이블에 삽입 (중복 무시)
  INSERT INTO public.member_titles (user_id, title)
  VALUES (p_user_id, v_chosen_title)
  ON CONFLICT DO NOTHING;

  -- 참여 기록 저장
  INSERT INTO public.burn_event_participations (user_id, burn_amount, reward_title)
  VALUES (p_user_id, p_burn_amount, v_chosen_title);

  -- 5. 국고 비상 준비금(VAULT_EMERGENCY) 장부 기록
  SELECT id INTO v_vault_id FROM public.system_treasury_vaults WHERE code = 'VAULT_EMERGENCY' LIMIT 1;
  IF v_vault_id IS NOT NULL THEN
    INSERT INTO public.system_treasury_ledger (
      vault_id, tx_type, amount_wld, reason, balance_before, balance_after, created_at
    ) VALUES (
      v_vault_id, 'RETIRE_BURN', p_burn_amount::text,
      '시민 자발적 인플레이션 타파 소각 축제: ' || p_burn_amount || ' WLD 영구 소각 달성',
      (SELECT balance_wld FROM public.system_treasury_vaults WHERE id = v_vault_id),
      (SELECT balance_wld FROM public.system_treasury_vaults WHERE id = v_vault_id),
      clock_timestamp()
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'burnAmount', p_burn_amount,
    'remainingBalance', v_current_bal - p_burn_amount,
    'awardedTitle', v_chosen_title,
    'message', '🎉 ' || p_burn_amount || ' WLD가 국고 소각되어 통화 가치를 지켰습니다! [' || v_chosen_title || '] 칭호를 획득하셨습니다.'
  );
END;
$$;

ALTER FUNCTION public.participate_anti_inflation_burn_draw(UUID, NUMERIC) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.participate_anti_inflation_burn_draw(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.participate_anti_inflation_burn_draw(UUID, NUMERIC) TO moneyverse_app;
