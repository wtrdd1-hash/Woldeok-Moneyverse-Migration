BEGIN;

-- 1. 실시간 1:1 라이브 승부존 (PVP Wager Arena)
CREATE TABLE IF NOT EXISTS public.pvp_wager_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id uuid NOT NULL REFERENCES public.users(id),
  creator_name text NOT NULL DEFAULT '익명',
  opponent_user_id uuid REFERENCES public.users(id),
  opponent_name text,
  game_type text NOT NULL, -- 'dice', 'rps', 'hilo'
  stake_amount numeric(20, 2) NOT NULL CHECK (stake_amount >= 1000 AND stake_amount <= 50000000),
  fee_rate numeric(5, 4) NOT NULL DEFAULT 0.03,
  treasury_fee numeric(20, 2) NOT NULL DEFAULT 0,
  winner_id uuid REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'waiting', -- 'waiting', 'in_progress', 'settled', 'cancelled'
  creator_move text,
  opponent_move text,
  battle_result jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  settled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pvp_wager_rooms_status ON public.pvp_wager_rooms(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pvp_wager_rooms_creator ON public.pvp_wager_rooms(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_pvp_wager_rooms_opponent ON public.pvp_wager_rooms(opponent_user_id);

-- 2. 심야 비밀 암시장 한정 경매 (Midnight Black Market Secret Auction)
CREATE TABLE IF NOT EXISTS public.black_market_auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text NOT NULL,
  item_title text NOT NULL,
  item_description text NOT NULL,
  item_icon text NOT NULL,
  item_buff_type text NOT NULL,
  item_buff_value numeric(10, 2) NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  starting_bid numeric(20, 2) NOT NULL,
  current_bid numeric(20, 2) NOT NULL,
  highest_bidder_id uuid REFERENCES public.users(id),
  highest_bidder_name text,
  bid_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active', -- 'scheduled', 'active', 'ended', 'settled'
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_black_market_auctions_status ON public.black_market_auctions(status, ends_at ASC);

-- 3. 심야 암시장 입찰 로그 (Bid Logs)
CREATE TABLE IF NOT EXISTS public.black_market_bid_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.black_market_auctions(id) ON DELETE CASCADE,
  bidder_user_id uuid NOT NULL REFERENCES public.users(id),
  bidder_name text NOT NULL,
  bid_amount numeric(20, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_black_market_bid_logs_auction ON public.black_market_bid_logs(auction_id, created_at DESC);

-- 4. 초기 비밀 암시장 초희귀 아이템 4종 시드 데이터
INSERT INTO public.black_market_auctions (
  item_code, item_title, item_description, item_icon, item_buff_type, item_buff_value,
  starts_at, ends_at, starting_bid, current_bid, status
)
VALUES
  (
    'item_chronos_watch',
    '크로노스의 황금 회중시계',
    '시간의 신 크로노스의 가호가 깃든 시계. 30일간 전 직업 업무 쿨타임을 50% 단축시킵니다.',
    'Clock',
    'WORK_COOLDOWN_REDUCTION',
    50.00,
    clock_timestamp() - interval '1 hour',
    clock_timestamp() + interval '12 hours',
    500000.00,
    500000.00,
    'active'
  ),
  (
    'item_midas_touch',
    '마이더스의 황금 건틀릿',
    '만지는 모든 것을 황금으로 바꾸는 전설의 건틀릿. 14일간 카지노 게임 배당률 +20% 추가 보정을 부여합니다.',
    'Sparkles',
    'CASINO_PAYOUT_BOOST',
    20.00,
    clock_timestamp() - interval '1 hour',
    clock_timestamp() + interval '16 hours',
    1000000.00,
    1000000.00,
    'active'
  ),
  (
    'item_zero_tax_card',
    '국가지정 영구 거래세 면제 카드',
    '국가 최고 의회의 승인을 받은 영구 면세 카드. 가상 주식 매매 거래세(0.15%)를 영구히 0%로 면제합니다.',
    'ShieldCheck',
    'PERMANENT_TAX_EXEMPTION',
    100.00,
    clock_timestamp() - interval '1 hour',
    clock_timestamp() + interval '20 hours',
    3000000.00,
    3000000.00,
    'active'
  ),
  (
    'item_gold_dragon_aura',
    '불멸의 골드 드래곤 아우라',
    '전 서버 유일의 신화급 치장 아이템. 닉네임 및 채팅창에 휘황찬란한 황금빛 드래곤 애니메이션 효과가 영구 적용됩니다.',
    'Crown',
    'AURA_ANIMATION',
    1.00,
    clock_timestamp() - interval '1 hour',
    clock_timestamp() + interval '24 hours',
    5000000.00,
    5000000.00,
    'active'
  )
ON CONFLICT DO NOTHING;

-- 권한 부여
GRANT ALL PRIVILEGES ON TABLE public.pvp_wager_rooms TO moneyverse_app;
GRANT ALL PRIVILEGES ON TABLE public.black_market_auctions TO moneyverse_app;
GRANT ALL PRIVILEGES ON TABLE public.black_market_bid_logs TO moneyverse_app;

COMMIT;
