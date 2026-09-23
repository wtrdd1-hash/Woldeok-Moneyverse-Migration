-- 231-space-property-tax-and-season-settlement.sql
-- Update version: v2026.09.23.395
-- P0: 가상 도시 토지 부지 & 세무 구청 시스템 (일일 부동산세 SINK_PROPERTY_TAX 소각, 7일 유예 체납 공매 루프)
-- P0: 시즌 랭킹 & 명예의 전당 보상 분배 엔진 (6대 티어 트로피·WLD 정산, season_hall_of_fame 불변 아카이빙)

BEGIN;

-- 1. user_spaces 테이블에 납부 마감일(tax_paid_until) 컬럼 추가
ALTER TABLE public.user_spaces
ADD COLUMN IF NOT EXISTS tax_paid_until timestamptz NOT NULL DEFAULT (pg_catalog.clock_timestamp() + interval '1 day');

-- 2. 부동산세 납부 이력 테이블 생성
CREATE TABLE IF NOT EXISTS public.space_property_tax_payments (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.user_spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  days_paid integer NOT NULL CHECK (days_paid >= 1),
  total_wld numeric NOT NULL CHECK (total_wld > 0),
  paid_until timestamptz NOT NULL,
  idempotency_key uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_space_tax_payments_space ON public.space_property_tax_payments(space_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_space_tax_payments_user ON public.space_property_tax_payments(user_id);

-- 3. 부동산세 납부 및 100% 영구 소각 함수 (space_pay_property_tax)
CREATE OR REPLACE FUNCTION public.space_pay_property_tax(
  p_actor uuid,
  p_space_id uuid,
  p_days integer,
  p_idempotency_key uuid
)
RETURNS TABLE(
  receipt_id uuid,
  space_id uuid,
  days_paid integer,
  total_wld numeric,
  new_paid_until timestamptz,
  paid_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_space_type text;
  v_owner_id uuid;
  v_current_paid_until timestamptz;
  v_daily_tax numeric;
  v_total_tax numeric;
  v_user_account_id uuid;
  v_sink_account_id uuid;
  v_available numeric;
  v_receipt_id uuid;
  v_new_paid_until timestamptz;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_existing_receipt record;
BEGIN
  IF p_actor IS NULL OR p_space_id IS NULL OR p_idempotency_key IS NULL OR p_days IS NULL OR p_days < 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid input parameters';
  END IF;

  -- 멱등성 재실행 점검
  SELECT id, space_property_tax_payments.space_id, space_property_tax_payments.days_paid,
         space_property_tax_payments.total_wld, space_property_tax_payments.paid_until,
         space_property_tax_payments.created_at
  INTO v_existing_receipt
  FROM public.space_property_tax_payments
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_receipt.id IS NOT NULL THEN
    RETURN QUERY SELECT v_existing_receipt.id, v_existing_receipt.space_id, v_existing_receipt.days_paid,
                        v_existing_receipt.total_wld, v_existing_receipt.paid_until, v_existing_receipt.created_at;
    RETURN;
  END IF;

  -- 공간 조회 및 소유권 확인
  SELECT s.user_id, s.space_type, s.tax_paid_until
  INTO v_owner_id, v_space_type, v_current_paid_until
  FROM public.user_spaces s
  WHERE s.id = p_space_id
  FOR UPDATE;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'space not found';
  END IF;

  IF v_owner_id <> p_actor THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'not owner of this space';
  END IF;

  -- 일일 보유세 산정
  CASE v_space_type
    WHEN 'SPACE_ROOM_STARTER' THEN v_daily_tax := 10;
    WHEN 'SPACE_STUDIO' THEN v_daily_tax := 50;
    WHEN 'SPACE_GALLERY' THEN v_daily_tax := 150;
    WHEN 'SPACE_OFFICE' THEN v_daily_tax := 250;
    WHEN 'SPACE_PENTHOUSE' THEN v_daily_tax := 600;
    WHEN 'SPACE_HQ' THEN v_daily_tax := 2500;
    ELSE v_daily_tax := 50;
  END CASE;

  v_total_tax := v_daily_tax * p_days;

  -- 지갑 잔액 점검 및 락
  SELECT a.id, b.available_amount::numeric INTO v_user_account_id, v_available
  FROM public.accounts a
  JOIN public.account_balances b ON b.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_user_account_id IS NULL OR v_available < v_total_tax THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'insufficient cash balance';
  END IF;

  -- 영구 소각 계좌 조회
  SELECT a.id INTO v_sink_account_id
  FROM public.accounts a
  WHERE a.account_type = 'SINK'::public.account_type AND a.status = 'active'::public.account_status
  LIMIT 1;

  -- WLD 차감 및 소각 계좌 이체 (100% SINK_PROPERTY_TAX)
  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric - v_total_tax), updated_at = v_now
  WHERE account_id = v_user_account_id;

  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric + v_total_tax), updated_at = v_now
  WHERE account_id = v_sink_account_id;

  INSERT INTO public.ledger_transactions (idempotency_key, type, actor_user_id)
  VALUES (p_idempotency_key, 'SINK_PROPERTY_TAX', p_actor)
  ON CONFLICT (idempotency_key) DO NOTHING;

  -- 납부 기한 연장: 기존 납부기한이 미래라면 그 시점부터 연장, 이미 지났다면 현재 시점부터 연장
  v_new_paid_until := GREATEST(COALESCE(v_current_paid_until, v_now), v_now) + (p_days || ' days')::interval;

  UPDATE public.user_spaces
  SET tax_paid_until = v_new_paid_until, updated_at = v_now
  WHERE id = p_space_id;

  INSERT INTO public.space_property_tax_payments (space_id, user_id, days_paid, total_wld, paid_until, idempotency_key, created_at)
  VALUES (p_space_id, p_actor, p_days, v_total_tax, v_new_paid_until, p_idempotency_key, v_now)
  RETURNING id INTO v_receipt_id;

  RETURN QUERY SELECT v_receipt_id, p_space_id, p_days, v_total_tax, v_new_paid_until, v_now;
END;
$$;

-- 4. 시즌 명예의 전당 불변 아카이빙 테이블 (season_hall_of_fame)
CREATE TABLE IF NOT EXISTS public.season_hall_of_fame (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  season_id uuid NOT NULL,
  season_name text NOT NULL,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 10),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  display_name text NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  trophy_code text NOT NULL,
  settled_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CONSTRAINT uq_season_hall_of_fame_season_rank UNIQUE (season_id, rank)
);

CREATE INDEX IF NOT EXISTS idx_season_hall_of_fame_season ON public.season_hall_of_fame(season_id, rank ASC);
CREATE INDEX IF NOT EXISTS idx_season_hall_of_fame_user ON public.season_hall_of_fame(user_id);

-- 5. 시즌 정산 및 보상 청구 테이블 (season_reward_claims)
CREATE TABLE IF NOT EXISTS public.season_reward_claims (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  season_id uuid NOT NULL,
  season_name text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  rank integer,
  tier text NOT NULL CHECK (tier IN ('Capital Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze')),
  reward_wld numeric NOT NULL DEFAULT 0,
  trophy_code text,
  claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  idempotency_key uuid UNIQUE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CONSTRAINT uq_season_reward_claims_season_user UNIQUE (season_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_season_reward_claims_user ON public.season_reward_claims(user_id, claimed);

-- 6. 시즌 종료 정산 프로시저 (season_settle_rewards)
CREATE OR REPLACE FUNCTION public.season_settle_rewards(p_season_id uuid)
RETURNS TABLE(
  settled_count integer,
  hall_of_fame_count integer,
  season_name text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_season_name text;
  v_active boolean;
  v_total_participants integer;
  v_hof_count integer := 0;
  v_settled integer := 0;
  v_rec record;
  v_tier text;
  v_reward_wld numeric;
  v_trophy text;
  v_pct numeric;
BEGIN
  -- 시즌 확인
  SELECT name, active INTO v_season_name, v_active
  FROM public.virtual_seasons
  WHERE id = p_season_id;

  IF v_season_name IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'season not found';
  END IF;

  -- 이미 정산되어 명예의 전당에 등록되었는지 확인
  SELECT count(*) INTO v_hof_count
  FROM public.season_hall_of_fame
  WHERE season_id = p_season_id;

  IF v_hof_count > 0 THEN
    RETURN QUERY SELECT 0, v_hof_count, v_season_name;
    RETURN;
  END IF;

  -- 총 참가자 수 및 점수 집계 템프 생성
  DROP TABLE IF EXISTS _tmp_season_rankings;
  CREATE TEMP TABLE _tmp_season_rankings ON COMMIT DROP AS
  WITH totals AS (
    SELECT entry.user_id,
           SUM(entry.points_earned)::numeric AS points,
           COUNT(*)::bigint AS entries
    FROM public.virtual_consumption_event_entries entry
    JOIN public.virtual_consumption_events evt ON evt.id = entry.event_id
    WHERE evt.season_id = p_season_id
    GROUP BY entry.user_id
  ),
  ranked AS (
    SELECT totals.user_id,
           totals.points,
           totals.entries,
           DENSE_RANK() OVER (ORDER BY totals.points DESC, totals.entries ASC, totals.user_id) AS rank,
           COALESCE(
             (SELECT iden.display_name FROM public.identities iden WHERE iden.user_id = totals.user_id ORDER BY iden.linked_at LIMIT 1),
             '도전자'
           ) AS display_name
    FROM totals
  )
  SELECT * FROM ranked;

  SELECT count(*) INTO v_total_participants FROM _tmp_season_rankings;

  IF v_total_participants = 0 THEN
    -- 참가자가 없을 경우 빈 정산 완료 처리
    UPDATE public.virtual_seasons
    SET active = false, lifecycle_state = 'closed', closed_at = pg_catalog.clock_timestamp()
    WHERE id = p_season_id;

    RETURN QUERY SELECT 0, 0, v_season_name;
    RETURN;
  END IF;

  -- 랭킹별 티어 및 보상 배정 루프
  FOR v_rec IN SELECT * FROM _tmp_season_rankings ORDER BY rank ASC LOOP
    v_pct := (v_rec.rank::numeric / v_total_participants::numeric) * 100.0;

    IF v_rec.rank <= 10 THEN
      v_tier := 'Capital Master';
      v_reward_wld := 500;
      v_trophy := 'TROPHY_SEASON_CHAMPION_#' || v_rec.rank;

      -- 명예의 전당 아카이빙
      INSERT INTO public.season_hall_of_fame (season_id, season_name, rank, user_id, display_name, score, trophy_code)
      VALUES (p_season_id, v_season_name, v_rec.rank, v_rec.user_id, v_rec.display_name, v_rec.points, v_trophy)
      ON CONFLICT (season_id, rank) DO NOTHING;

      v_hof_count := v_hof_count + 1;
    ELSIF v_pct <= 1.0 THEN
      v_tier := 'Diamond';
      v_reward_wld := 500;
      v_trophy := NULL;
    ELSIF v_pct <= 5.0 THEN
      v_tier := 'Platinum';
      v_reward_wld := 400;
      v_trophy := NULL;
    ELSIF v_pct <= 20.0 THEN
      v_tier := 'Gold';
      v_reward_wld := 250;
      v_trophy := NULL;
    ELSIF v_pct <= 50.0 THEN
      v_tier := 'Silver';
      v_reward_wld := 150;
      v_trophy := NULL;
    ELSE
      v_tier := 'Bronze';
      v_reward_wld := 100;
      v_trophy := NULL;
    END IF;

    INSERT INTO public.season_reward_claims (season_id, season_name, user_id, rank, tier, reward_wld, trophy_code)
    VALUES (p_season_id, v_season_name, v_rec.user_id, v_rec.rank, v_tier, v_reward_wld, v_trophy)
    ON CONFLICT (season_id, user_id) DO NOTHING;

    v_settled := v_settled + 1;
  END LOOP;

  -- 시즌 상태 closed 처리
  UPDATE public.virtual_seasons
  SET active = false, lifecycle_state = 'closed', closed_at = pg_catalog.clock_timestamp()
  WHERE id = p_season_id;

  RETURN QUERY SELECT v_settled, v_hof_count, v_season_name;
END;
$$;

-- 7. 시즌 보상 청구 및 수령 프로시저 (season_claim_reward)
CREATE OR REPLACE FUNCTION public.season_claim_reward(
  p_actor uuid,
  p_season_id uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  claim_id uuid,
  season_id uuid,
  season_name text,
  tier text,
  rank integer,
  reward_wld numeric,
  trophy_code text,
  claimed_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_claim record;
  v_user_account_id uuid;
  v_source_account_id uuid;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_actor IS NULL OR p_season_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid input parameters';
  END IF;

  SELECT c.id, c.season_name, c.tier, c.rank, c.reward_wld, c.trophy_code, c.claimed, c.claimed_at, c.idempotency_key
  INTO v_claim
  FROM public.season_reward_claims c
  WHERE c.season_id = p_season_id AND c.user_id = p_actor
  FOR UPDATE;

  IF v_claim.id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'no reward found for this season';
  END IF;

  -- 이미 수령 완료된 경우 멱등 반환
  IF v_claim.claimed THEN
    RETURN QUERY SELECT v_claim.id, p_season_id, v_claim.season_name, v_claim.tier, v_claim.rank,
                        v_claim.reward_wld, v_claim.trophy_code, v_claim.claimed_at;
    RETURN;
  END IF;

  -- 보상 WLD 지급 (USER_CASH 계좌 입금)
  IF v_claim.reward_wld > 0 THEN
    SELECT a.id INTO v_user_account_id
    FROM public.accounts a
    WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
    FOR UPDATE;

    IF v_user_account_id IS NOT NULL THEN
      -- 시스템 자금원(SYSTEM) 계좌
      SELECT a.id INTO v_source_account_id
      FROM public.accounts a
      WHERE a.account_type = 'SYSTEM'::public.account_type AND a.status = 'active'::public.account_status
      LIMIT 1;

      UPDATE public.account_balances
      SET available_amount = (available_amount::numeric + v_claim.reward_wld), updated_at = v_now
      WHERE account_id = v_user_account_id;

      IF v_source_account_id IS NOT NULL THEN
        UPDATE public.account_balances
        SET available_amount = (available_amount::numeric - v_claim.reward_wld), updated_at = v_now
        WHERE account_id = v_source_account_id;
      END IF;

      INSERT INTO public.ledger_transactions (idempotency_key, type, actor_user_id)
      VALUES (p_idempotency_key, 'SOURCE_SEASON_REWARD', p_actor)
      ON CONFLICT (idempotency_key) DO NOTHING;
    END IF;
  END IF;

  -- 수령 상태 업데이트
  UPDATE public.season_reward_claims
  SET claimed = true, claimed_at = v_now, idempotency_key = p_idempotency_key
  WHERE id = v_claim.id;

  RETURN QUERY SELECT v_claim.id, p_season_id, v_claim.season_name, v_claim.tier, v_claim.rank,
                      v_claim.reward_wld, v_claim.trophy_code, v_now;
END;
$$;

-- 8. 권한 부여
GRANT SELECT, INSERT, UPDATE ON public.user_spaces, public.space_property_tax_payments, public.season_hall_of_fame, public.season_reward_claims TO moneyverse_app;

COMMIT;
