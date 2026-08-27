-- Game-only virtual stock market. No real-world security, payment, or cash
-- conversion is represented by these tables.
CREATE TABLE IF NOT EXISTS public.virtual_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL UNIQUE CHECK (symbol ~ '^[A-Z][A-Z0-9]{1,7}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  initial_price bigint NOT NULL CHECK (initial_price >= 10),
  current_price bigint NOT NULL CHECK (current_price >= 10),
  day_open_price bigint NOT NULL CHECK (day_open_price >= 10),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.virtual_stock_positions (
  user_id uuid NOT NULL REFERENCES public.users(id),
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id),
  quantity bigint NOT NULL CHECK (quantity >= 0),
  average_cost bigint NOT NULL CHECK (average_cost >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, stock_id)
);

CREATE TABLE IF NOT EXISTS public.virtual_stock_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id),
  side text NOT NULL CHECK (side IN ('buy','sell')),
  quantity bigint NOT NULL CHECK (quantity > 0),
  unit_price bigint NOT NULL CHECK (unit_price >= 10),
  gross_amount bigint NOT NULL CHECK (gross_amount > 0),
  fee_amount bigint NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
  tax_amount bigint NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS virtual_stock_trades_user_created_idx
  ON public.virtual_stock_trades(user_id, created_at DESC, id DESC);

REVOKE ALL ON public.virtual_stocks, public.virtual_stock_positions, public.virtual_stock_trades FROM PUBLIC, moneyverse_app;
