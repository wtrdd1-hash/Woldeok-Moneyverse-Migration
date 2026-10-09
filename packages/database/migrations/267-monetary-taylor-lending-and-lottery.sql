-- Migration 267: Central Bank Taylor Rule Lending, Advanced Stock Orders & Treasury Mega Lottery
-- Institutional FinTech Standard & Monetary Stability Engine

BEGIN;

-- 1. 중앙은행 테일러 칙(Taylor Rule) 통화정책 테이블
CREATE TABLE IF NOT EXISTS public.central_bank_monetary_policy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  neutral_rate numeric(6, 4) NOT NULL DEFAULT 0.0350, -- 중립금리 3.50%
  inflation_target numeric(6, 4) NOT NULL DEFAULT 0.0200, -- 목표 인플레이션 2.00%
  current_inflation numeric(6, 4) NOT NULL DEFAULT 0.0220, -- 현 인플레이션 2.20%
  gdp_gap numeric(6, 4) NOT NULL DEFAULT 0.0050, -- GDP 갭 0.50%
  taylor_base_rate numeric(6, 4) NOT NULL DEFAULT 0.0385, -- 테일러 기준금리 3.85%
  adjusted_policy_rate numeric(6, 4) NOT NULL DEFAULT 0.0375, -- 최종 운용 기준금리
  last_decision_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  governor_note text NOT NULL DEFAULT '테일러 준칙 기반 통화안정 기준금리 정상 고시'
);

-- 2. 시민 담보/신용 대출 및 반대매매 청산 관리
CREATE TABLE IF NOT EXISTS public.citizen_lending_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  loan_type text NOT NULL CHECK (loan_type IN ('CREDIT', 'STOCK_COLLATERAL', 'DEPOSIT_COLLATERAL')),
  principal_wld numeric(20, 0) NOT NULL CHECK (principal_wld > 0),
  outstanding_wld numeric(20, 0) NOT NULL CHECK (outstanding_wld >= 0),
  annual_interest_rate numeric(6, 4) NOT NULL, -- 기준금리 + 가산스프레드
  collateral_stock_id uuid REFERENCES public.virtual_stocks(id) ON DELETE SET NULL,
  collateral_shares numeric(20, 0) DEFAULT 0,
  collateral_ratio numeric(6, 4) DEFAULT 1.5000, -- 담보인정비율 (LTV 150%)
  maintenance_margin_ratio numeric(6, 4) DEFAULT 1.2000, -- 유지담보비율 (120% 미달 시 청산)
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REPAID', 'MARGIN_CALLED', 'LIQUIDATED')),
  borrowed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  due_at timestamptz NOT NULL DEFAULT (clock_timestamp() + interval '30 days'),
  liquidated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_citizen_lending_user_status ON public.citizen_lending_contracts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_citizen_lending_collateral ON public.citizen_lending_contracts(collateral_stock_id) WHERE status = 'ACTIVE';

-- 3. 가상 주식 스마트 스탑로스 / 익절 / 지정가 예약 주문 엔진
CREATE TABLE IF NOT EXISTS public.stock_advanced_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  order_type text NOT NULL CHECK (order_type IN ('LIMIT_BUY', 'LIMIT_SELL', 'STOP_LOSS', 'TAKE_PROFIT')),
  trigger_price numeric(20, 0) NOT NULL CHECK (trigger_price > 0),
  target_shares numeric(20, 0) NOT NULL CHECK (target_shares > 0),
  escrow_wld numeric(20, 0) NOT NULL DEFAULT 0, -- 매수 주문 시 에스크로 락
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'TRIGGERED', 'FILLED', 'CANCELLED', 'EXPIRED')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  triggered_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (clock_timestamp() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_stock_advanced_orders_active 
  ON public.stock_advanced_orders(stock_id, status, trigger_price) 
  WHERE status = 'PENDING';

-- 4. 국고 메가 잭팟 복권(National Treasury Mega Jackpot) 50% 영구 소각 시스템
CREATE TABLE IF NOT EXISTS public.national_treasury_lottery_rounds (
  round_number integer PRIMARY KEY,
  ticket_price_wld numeric(20, 0) NOT NULL DEFAULT 1000,
  jackpot_pool_wld numeric(20, 0) NOT NULL DEFAULT 50000000, -- 국고 초기 지원 5천만 WLD
  burn_pool_wld numeric(20, 0) NOT NULL DEFAULT 0, -- 판매금의 50% 누적 소각 풀
  total_tickets_sold integer NOT NULL DEFAULT 0,
  winning_numbers integer[] DEFAULT NULL, -- 6개 번호 (1~45)
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'DRAWING', 'SETTLED')),
  started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  draws_at timestamptz NOT NULL DEFAULT (clock_timestamp() + interval '7 days'),
  settled_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.national_treasury_lottery_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number integer NOT NULL REFERENCES public.national_treasury_lottery_rounds(round_number) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chosen_numbers integer[] NOT NULL, -- 6자리 번호
  matched_count integer DEFAULT 0,
  prize_tier integer DEFAULT 0, -- 1등: 6개일치, 2등: 5개, 3등: 4개
  prize_wld numeric(20, 0) DEFAULT 0,
  is_claimed boolean NOT NULL DEFAULT false,
  purchased_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_lottery_tickets_round_user 
  ON public.national_treasury_lottery_tickets(round_number, user_id);

-- 5. 초기 1회차 복권 라운드 시딩
INSERT INTO public.national_treasury_lottery_rounds (round_number, ticket_price_wld, jackpot_pool_wld, status)
VALUES (1, 1000, 100000000, 'OPEN')
ON CONFLICT (round_number) DO NOTHING;

-- 6. 초기 테일러 칙 통화정책 기본값 시딩
INSERT INTO public.central_bank_monetary_policy (neutral_rate, inflation_target, current_inflation, gdp_gap, taylor_base_rate, adjusted_policy_rate)
SELECT 0.0350, 0.0200, 0.0220, 0.0050, 0.0385, 0.0375
WHERE NOT EXISTS (SELECT 1 FROM public.central_bank_monetary_policy);

-- 7. 테이블 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON public.central_bank_monetary_policy TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.citizen_lending_contracts TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_advanced_orders TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.national_treasury_lottery_rounds TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.national_treasury_lottery_tickets TO app_user;

COMMIT;
