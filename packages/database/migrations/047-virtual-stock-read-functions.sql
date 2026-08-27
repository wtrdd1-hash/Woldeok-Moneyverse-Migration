-- Read functions for the virtual stock game.
--
-- 023-virtual-stock-game.sql deliberately ends with
--
--   REVOKE ALL ON public.virtual_stocks, public.virtual_stock_positions,
--                 public.virtual_stock_trades FROM PUBLIC, moneyverse_app;
--
-- so these tables were always meant to be reachable only through SECURITY
-- DEFINER functions. The write path got them (stock_trade, stock_admin_*),
-- the read path never did: the application queried the tables directly and
-- was refused with 42501 in production. See
-- docs/findings/stock-reads-lack-grants.md.
--
-- This adds the four missing read functions rather than granting the role
-- SELECT on the tables. Granting would let any SQL injection in the
-- application read every member's positions and trade history; a function
-- that takes p_actor can restrict the rows itself, which is strictly
-- stronger than trusting the caller to append WHERE user_id = $1.

BEGIN;

-- Active stocks, for the public listing. No actor: which stocks exist is not
-- per-member information, and the caller is already authenticated by the
-- application before this is reached.
CREATE OR REPLACE FUNCTION public.stock_list_active()
RETURNS TABLE(
  id uuid,
  symbol text,
  name text,
  description text,
  current_price bigint,
  day_open_price bigint,
  active boolean,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT stock.id, stock.symbol, stock.name, stock.description,
         stock.current_price, stock.day_open_price, stock.active, stock.updated_at
  FROM public.virtual_stocks AS stock
  WHERE stock.active
  ORDER BY stock.symbol;
END $$;

-- Every stock including inactive ones, for the operator console. Guarded by
-- the same operator check the other admin catalogue functions use.
CREATE OR REPLACE FUNCTION public.stock_admin_list(p_actor uuid)
RETURNS TABLE(
  id uuid,
  symbol text,
  name text,
  description text,
  current_price bigint,
  day_open_price bigint,
  active boolean,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  RETURN QUERY
  SELECT stock.id, stock.symbol, stock.name, stock.description,
         stock.current_price, stock.day_open_price, stock.active, stock.updated_at
  FROM public.virtual_stocks AS stock
  ORDER BY stock.active DESC, stock.symbol;
END $$;

-- The caller's own holdings. p_actor is what the WHERE clause uses, so the
-- function cannot be asked for somebody else's positions.
CREATE OR REPLACE FUNCTION public.stock_my_positions(p_actor uuid)
RETURNS TABLE(
  stock_id uuid,
  symbol text,
  name text,
  quantity bigint,
  average_cost bigint,
  market_value bigint,
  current_price bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  RETURN QUERY
  SELECT position.stock_id, stock.symbol, stock.name,
         position.quantity, position.average_cost,
         position.quantity * stock.current_price AS market_value,
         stock.current_price
  FROM public.virtual_stock_positions AS position
  JOIN public.virtual_stocks AS stock ON stock.id = position.stock_id
  WHERE position.user_id = p_actor AND position.quantity > 0
  ORDER BY stock.symbol;
END $$;

-- The caller's own trades, newest first. The limit is bounded here rather
-- than trusted from the application.
CREATE OR REPLACE FUNCTION public.stock_my_trades(p_actor uuid, p_limit integer)
RETURNS TABLE(
  trade_id uuid,
  symbol text,
  side text,
  quantity bigint,
  unit_price bigint,
  gross_amount bigint,
  tax_amount bigint,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer;
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'limit must be between 1 and 200';
  END IF;
  v_limit := p_limit;

  RETURN QUERY
  SELECT trade.id, stock.symbol, trade.side, trade.quantity, trade.unit_price,
         trade.gross_amount, trade.tax_amount, trade.created_at
  FROM public.virtual_stock_trades AS trade
  JOIN public.virtual_stocks AS stock ON stock.id = trade.stock_id
  WHERE trade.user_id = p_actor
  ORDER BY trade.created_at DESC, trade.id DESC
  LIMIT v_limit;
END $$;

ALTER FUNCTION public.stock_list_active() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_admin_list(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_my_positions(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_my_trades(uuid, integer) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION
  public.stock_list_active(),
  public.stock_admin_list(uuid),
  public.stock_my_positions(uuid),
  public.stock_my_trades(uuid, integer)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION
  public.stock_list_active(),
  public.stock_admin_list(uuid),
  public.stock_my_positions(uuid),
  public.stock_my_trades(uuid, integer)
TO moneyverse_app;

-- Restated, not newly imposed: 023 already revoked these and this migration
-- must not be read as loosening them.
REVOKE ALL ON public.virtual_stocks, public.virtual_stock_positions,
              public.virtual_stock_trades FROM PUBLIC, moneyverse_app;

COMMIT;
