-- v2026.09.19.261
-- Seed three additional virtual stocks with randomized initial prices.
-- The random draw is only for listing-time initial price; after insertion the
-- existing deterministic market-dynamics engine owns all subsequent movement.

BEGIN;

WITH seed(symbol, name, description, min_price, max_price, shares_outstanding) AS (
  VALUES
    ('WDT', 'Woldeok Tech', '월덕테크 — 가상 기술/플랫폼 기업', 800::bigint, 2600::bigint, 1000000::bigint),
    ('WDM', 'Woldeok Mobility', '월덕모빌리티 — 가상 이동/물류 기업', 1200::bigint, 4200::bigint, 1000000::bigint),
    ('WDB', 'Woldeok Bio', '월덕바이오 — 가상 바이오/헬스 기업', 600::bigint, 3200::bigint, 1000000::bigint)
),
priced AS (
  SELECT
    symbol,
    name,
    description,
    (min_price + pg_catalog.floor(pg_catalog.random() * (max_price - min_price + 1))::bigint) AS price,
    shares_outstanding
  FROM seed
),
inserted AS (
  INSERT INTO public.virtual_stocks (
    symbol,
    name,
    description,
    initial_price,
    current_price,
    day_open_price,
    shares_outstanding
  )
  SELECT
    symbol,
    name,
    description,
    price,
    price,
    price,
    shares_outstanding
  FROM priced
  ON CONFLICT (symbol) DO NOTHING
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
  inserted.id,
  inserted.current_price,
  inserted.current_price,
  0,
  params.base_vol_bps
FROM inserted
CROSS JOIN public.virtual_stock_market_params AS params
WHERE params.id = 1
ON CONFLICT (stock_id) DO NOTHING;

COMMIT;
