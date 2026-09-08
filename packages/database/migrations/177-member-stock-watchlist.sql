BEGIN;

CREATE TABLE public.member_stock_watchlist (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (user_id, stock_id)
);

CREATE INDEX member_stock_watchlist_user_created_idx
  ON public.member_stock_watchlist(user_id, created_at DESC, stock_id);

CREATE FUNCTION public.stock_my_watchlist(p_actor uuid)
RETURNS TABLE(
  stock_id uuid,
  symbol text,
  name text,
  current_price bigint,
  day_open_price bigint,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  RETURN QUERY
  SELECT w.stock_id, s.symbol, s.name, s.current_price, s.day_open_price, w.created_at
  FROM public.member_stock_watchlist AS w
  JOIN public.virtual_stocks AS s ON s.id = w.stock_id
  WHERE w.user_id = p_actor AND s.active
  ORDER BY w.created_at DESC, s.symbol;
END;
$$;

CREATE FUNCTION public.stock_watchlist_set(p_actor uuid, p_stock uuid, p_watching boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_stock IS NULL OR p_watching IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor, stock and state are required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.virtual_stocks AS s WHERE s.id = p_stock AND s.active
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'active stock not found';
  END IF;

  IF p_watching THEN
    INSERT INTO public.member_stock_watchlist(user_id, stock_id)
    VALUES (p_actor, p_stock)
    ON CONFLICT (user_id, stock_id) DO NOTHING;
  ELSE
    DELETE FROM public.member_stock_watchlist
    WHERE user_id = p_actor AND stock_id = p_stock;
  END IF;

  RETURN p_watching;
END;
$$;

ALTER FUNCTION public.stock_my_watchlist(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_watchlist_set(uuid, uuid, boolean) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON TABLE public.member_stock_watchlist FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.stock_my_watchlist(uuid), public.stock_watchlist_set(uuid, uuid, boolean) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.stock_my_watchlist(uuid), public.stock_watchlist_set(uuid, uuid, boolean) TO moneyverse_app;

COMMIT;
