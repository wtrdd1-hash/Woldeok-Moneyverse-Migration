CREATE TABLE IF NOT EXISTS public.virtual_stock_price_ticks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  price bigint NOT NULL CHECK (price >= 10),
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS virtual_stock_price_ticks_stock_recorded_idx
  ON public.virtual_stock_price_ticks (stock_id, recorded_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.stock_record_price_tick()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.virtual_stock_price_ticks(stock_id, price, recorded_at)
    VALUES(NEW.id, NEW.current_price, clock_timestamp());
  ELSIF NEW.current_price IS DISTINCT FROM OLD.current_price THEN
    INSERT INTO public.virtual_stock_price_ticks(stock_id, price, recorded_at)
    VALUES(NEW.id, NEW.current_price, clock_timestamp());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS virtual_stock_price_tick_trigger ON public.virtual_stocks;
CREATE TRIGGER virtual_stock_price_tick_trigger
AFTER INSERT OR UPDATE OF current_price ON public.virtual_stocks
FOR EACH ROW EXECUTE FUNCTION public.stock_record_price_tick();

INSERT INTO public.virtual_stock_price_ticks(stock_id, price, recorded_at)
SELECT stock.id, stock.current_price, stock.created_at
FROM public.virtual_stocks AS stock
WHERE NOT EXISTS (
  SELECT 1 FROM public.virtual_stock_price_ticks AS tick WHERE tick.stock_id = stock.id
);

CREATE OR REPLACE FUNCTION public.stock_price_history(p_stock uuid, p_limit integer DEFAULT 80)
RETURNS TABLE(recorded_at timestamptz, price bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT tick.recorded_at, tick.price
  FROM public.virtual_stock_price_ticks AS tick
  JOIN public.virtual_stocks AS stock ON stock.id = tick.stock_id
  WHERE tick.stock_id = p_stock AND stock.active
  ORDER BY tick.recorded_at DESC, tick.id DESC
  LIMIT greatest(1, least(coalesce(p_limit, 80), 240))
$$;

ALTER FUNCTION public.stock_record_price_tick() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_price_history(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_price_history(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stock_price_history(uuid, integer) TO moneyverse_app;
REVOKE ALL ON public.virtual_stock_price_ticks FROM PUBLIC, moneyverse_app;
