-- v2026.09.23.391
-- Expand virtual stocks to 10 diverse market symbols across prices from 10 KRW to 10,000,000 KRW.
-- Seed randomized initial price bands for penny stocks, mid-caps, and mega-cap conglomerates.

BEGIN;

WITH stock_catalog(symbol, name, description, min_price, max_price, shares_outstanding) AS (
  VALUES
    ('CHIPS', '치무 초전도', '초전도체 및 양자 컴퓨팅 연구소 — 초저가 고변동성 동전주', 10::bigint, 80::bigint, 50000000::bigint),
    ('WDG', '월덱 게임즈', '메타버스 및 가상 경제 게임 개발사 — 저가 성장주', 150::bigint, 950::bigint, 20000000::bigint),
    ('WDT', 'Woldeok Tech', '월덱테크 — 가상 기술/플랫폼 IT 기업', 1200::bigint, 4800::bigint, 10000000::bigint),
    ('WDM', 'Woldeok Mobility', '월덱모빌리티 — 가상 이동/전기차 모빌리티 기업', 8500::bigint, 25000::bigint, 5000000::bigint),
    ('WDB', 'Woldeok Bio', '월덱바이오 — 신약 개발 및 첨단 바이오 헬스케어', 45000::bigint, 95000::bigint, 2000000::bigint),
    ('MYUY', '뮤야 엔터테인먼트', '가상 크리에이터 및 K-콘텐츠 미디어 엔터테인먼트', 120000::bigint, 350000::bigint, 1500000::bigint),
    ('WFIN', '월덱 파이낸셜', '가상 자산 은행 및 중앙 금융 지주회사', 400000::bigint, 850000::bigint, 1000000::bigint),
    ('DUCK', '덕덕 물산', '가상 세계 글로벌 종합 무역/유통/상사', 1200000::bigint, 2800000::bigint, 800000::bigint),
    ('CHIMU314', '치무전자', '초대형 반도체·가전 글로벌 대장주', 3500000::bigint, 6500000::bigint, 500000::bigint),
    ('SPACE', '월덱 우주항공', '심우주 탐사 및 미래 우주 인프라 최고가 황제주', 7500000::bigint, 10000000::bigint, 200000::bigint)
),
priced AS (
  SELECT
    symbol,
    name,
    description,
    (min_price + pg_catalog.floor(pg_catalog.random() * (max_price - min_price + 1))::bigint) AS price,
    shares_outstanding
  FROM stock_catalog
),
upserted AS (
  INSERT INTO public.virtual_stocks (
    symbol,
    name,
    description,
    initial_price,
    current_price,
    day_open_price,
    shares_outstanding,
    active,
    halt_status
  )
  SELECT
    symbol,
    name,
    description,
    price,
    price,
    price,
    shares_outstanding,
    true,
    'ACTIVE'
  FROM priced
  ON CONFLICT (symbol) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    initial_price = EXCLUDED.initial_price,
    current_price = EXCLUDED.current_price,
    day_open_price = EXCLUDED.day_open_price,
    shares_outstanding = EXCLUDED.shares_outstanding,
    active = true,
    halt_status = 'ACTIVE',
    updated_at = now()
  RETURNING id, current_price
)
INSERT INTO public.virtual_stock_dynamics (
  stock_id,
  price_exact,
  fair_value,
  trend_bps,
  vol_bps
)
SELECT
  upserted.id,
  upserted.current_price,
  upserted.current_price,
  0,
  params.base_vol_bps
FROM upserted
CROSS JOIN public.virtual_stock_market_params AS params
WHERE params.id = 1
ON CONFLICT (stock_id) DO UPDATE SET
  price_exact = EXCLUDED.price_exact,
  fair_value = EXCLUDED.fair_value,
  trend_bps = 0,
  updated_at = now();

COMMIT;
