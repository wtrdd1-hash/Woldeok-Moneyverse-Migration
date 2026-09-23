BEGIN;

-- v2026.09.23.406 security-boundary reconciliation.
-- The application role mutates durable state through vetted SECURITY DEFINER
-- commands. Direct table DML is reserved for the session bootstrap layer.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM moneyverse_app;
GRANT INSERT, UPDATE ON TABLE public.auth_sessions, public.oauth_challenges TO moneyverse_app;

-- Existing SECURITY DEFINER functions created by later migrations inherited
-- PUBLIC EXECUTE in several cases. Remove that implicit entry point without
-- disturbing explicit application/operator grants.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT procedure_row.oid::regprocedure::text AS identity
    FROM pg_catalog.pg_proc AS procedure_row
    JOIN pg_catalog.pg_namespace AS namespace_row
      ON namespace_row.oid = procedure_row.pronamespace
    WHERE namespace_row.nspname = 'public'
      AND procedure_row.prosecdef
  LOOP
    EXECUTE pg_catalog.format(
      'REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC',
      fn.identity
    );
  END LOOP;
END;
$$;

-- Portfolio read with halt state encapsulated behind the database privilege
-- boundary. The app must never join virtual_stocks directly.
CREATE OR REPLACE FUNCTION public.stock_my_positions_v2(p_actor uuid)
RETURNS TABLE(
  stock_id uuid,
  symbol text,
  name text,
  quantity bigint,
  average_cost bigint,
  market_value bigint,
  current_price bigint,
  halt_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    position_row.stock_id,
    stock_row.symbol,
    stock_row.name,
    position_row.quantity,
    position_row.average_cost,
    position_row.quantity * stock_row.current_price,
    stock_row.current_price,
    coalesce(stock_row.halt_status, 'ACTIVE')::text
  FROM public.virtual_stock_positions AS position_row
  JOIN public.virtual_stocks AS stock_row
    ON stock_row.id = position_row.stock_id
  WHERE position_row.user_id = p_actor
    AND position_row.quantity > 0
  ORDER BY stock_row.symbol;
$$;

-- Minimal authoritative state lookup used before a trade. The actual trade
-- function remains the sole writer and performs its own transaction locking.
CREATE OR REPLACE FUNCTION public.stock_trade_state(p_stock uuid)
RETURNS TABLE(active boolean, halt_status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    stock_row.active,
    coalesce(stock_row.halt_status, 'ACTIVE')::text
  FROM public.virtual_stocks AS stock_row
  WHERE stock_row.id = p_stock;
$$;

ALTER FUNCTION public.stock_my_positions_v2(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_trade_state(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.stock_my_positions_v2(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.stock_trade_state(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.stock_my_positions_v2(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.stock_trade_state(uuid) TO moneyverse_app;

COMMIT;
