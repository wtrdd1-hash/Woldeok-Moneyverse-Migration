BEGIN;

-- 1. 가상 주식 실전 챔피언십 리그 시즌 원장 (Stock League Seasons)
CREATE TABLE IF NOT EXISTS public.stock_league_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  entry_fee numeric(20, 2) NOT NULL DEFAULT 10000,
  prize_pool numeric(20, 2) NOT NULL DEFAULT 0,
  treasury_subsidy numeric(20, 2) NOT NULL DEFAULT 1000000,
  status text NOT NULL DEFAULT 'active', -- 'upcoming', 'active', 'settled'
  winner_id uuid REFERENCES public.users(id),
  winner_name text,
  total_participants integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_stock_league_seasons_status ON public.stock_league_seasons(status, starts_at DESC);

-- 2. 리그 참가자 랭킹 및 티어 원장 (Stock League Participants)
CREATE TABLE IF NOT EXISTS public.stock_league_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.stock_league_seasons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  user_name text NOT NULL DEFAULT '익명 트레이더',
  initial_asset numeric(20, 2) NOT NULL,
  current_asset numeric(20, 2) NOT NULL,
  roi_rate numeric(10, 4) NOT NULL DEFAULT 0,
  rank_position integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'Bronze', -- 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Challenger'
  is_whale boolean NOT NULL DEFAULT FALSE,
  follower_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT uq_stock_league_participant UNIQUE (season_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_league_participants_season_rank ON public.stock_league_participants(season_id, roi_rate DESC);
CREATE INDEX IF NOT EXISTS idx_stock_league_participants_user ON public.stock_league_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_league_participants_whale ON public.stock_league_participants(is_whale);

-- 3. 고래 카피 트레이딩 구독 원장 (Copy Trading Subscriptions)
CREATE TABLE IF NOT EXISTS public.copy_trading_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.users(id),
  follower_name text NOT NULL DEFAULT '구독자',
  whale_id uuid NOT NULL REFERENCES public.users(id),
  whale_name text NOT NULL DEFAULT '고래 트레이더',
  allocated_budget numeric(20, 2) NOT NULL,
  used_budget numeric(20, 2) NOT NULL DEFAULT 0,
  copy_ratio numeric(5, 4) NOT NULL DEFAULT 1.0,
  total_profit_shared numeric(20, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT uq_copy_trading_sub UNIQUE (follower_id, whale_id)
);

CREATE INDEX IF NOT EXISTS idx_copy_trading_follower ON public.copy_trading_subscriptions(follower_id);
CREATE INDEX IF NOT EXISTS idx_copy_trading_whale ON public.copy_trading_subscriptions(whale_id, status);

-- 4. AI 전속 금융 비서 덕이 포트폴리오 진단 원장 (AI Financial Diagnoses)
CREATE TABLE IF NOT EXISTS public.ai_financial_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  pr_index integer NOT NULL, -- 0 ~ 100
  risk_level text NOT NULL, -- 'VERY_LOW', 'MODERATE', 'HIGH', 'CRITICAL'
  asset_summary jsonb NOT NULL,
  diagnostic_notes jsonb NOT NULL,
  rebalance_suggestions jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_ai_financial_diagnoses_user ON public.ai_financial_diagnoses(user_id, created_at DESC);

-- 5. 제1회 가상 주식 챔피언십 리그 초기 시즌 시드 생성
INSERT INTO public.stock_league_seasons (
  season_number, title, starts_at, ends_at, entry_fee, prize_pool, treasury_subsidy, status
)
VALUES (
  1,
  '제1회 월덱 가상주식 실전 투자 챔피언십',
  clock_timestamp(),
  clock_timestamp() + interval '14 days',
  10000.00,
  1000000.00,
  1000000.00,
  'active'
)
ON CONFLICT (season_number) DO NOTHING;

-- 권한 부여
GRANT ALL PRIVILEGES ON TABLE public.stock_league_seasons TO moneyverse_app;
GRANT ALL PRIVILEGES ON TABLE public.stock_league_participants TO moneyverse_app;
GRANT ALL PRIVILEGES ON TABLE public.copy_trading_subscriptions TO moneyverse_app;
GRANT ALL PRIVILEGES ON TABLE public.ai_financial_diagnoses TO moneyverse_app;

COMMIT;
