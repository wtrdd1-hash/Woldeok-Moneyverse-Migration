-- Game-only stock splits and reverse splits.  Quantities remain integral: a
-- reverse split is rejected when any position would create a fractional unit.
CREATE TABLE IF NOT EXISTS public.virtual_stock_corporate_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  actor_user_id uuid NOT NULL REFERENCES public.users(id),
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id),
  action text NOT NULL CHECK (action IN ('split', 'reverse_split')),
  factor integer NOT NULL CHECK (factor BETWEEN 2 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.virtual_stock_corporate_actions FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.stock_admin_corporate_action(
  p_key uuid,
  p_actor uuid,
  p_stock uuid,
  p_action text,
  p_factor integer
)
RETURNS TABLE(corporate_action_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.virtual_stock_corporate_actions%ROWTYPE;
  v_stock public.virtual_stocks%ROWTYPE;
  v_action_id uuid;
  v_max bigint := 9223372036854775807;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_stock IS NULL
     OR p_action NOT IN ('split', 'reverse_split')
     OR p_factor NOT BETWEEN 2 AND 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock corporate action';
  END IF;

  SELECT * INTO v_existing
  FROM public.virtual_stock_corporate_actions
  WHERE idempotency_key = p_key;
  IF FOUND THEN
    IF v_existing.actor_user_id = p_actor
       AND v_existing.stock_id = p_stock
       AND v_existing.action = p_action
       AND v_existing.factor = p_factor THEN
      RETURN QUERY SELECT v_existing.id, true;
      RETURN;
    END IF;
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'idempotency key conflicts with a different corporate action';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles AS role_row
    JOIN public.users AS user_row ON user_row.id = role_row.user_id
    WHERE role_row.user_id = p_actor
      AND role_row.role = 'operator'::public.admin_role
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active operator role required';
  END IF;

  SELECT * INTO v_stock FROM public.virtual_stocks WHERE id = p_stock FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stock not found';
  END IF;

  IF p_action = 'split' THEN
    IF v_stock.initial_price < p_factor * 10
       OR v_stock.current_price < p_factor * 10
       OR v_stock.day_open_price < p_factor * 10
       OR EXISTS (SELECT 1 FROM public.virtual_stock_positions WHERE stock_id = p_stock AND quantity > v_max / p_factor) THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stock cannot be split by this factor';
    END IF;
    UPDATE public.virtual_stock_positions
    SET quantity = quantity * p_factor,
        average_cost = pg_catalog.greatest(1, (average_cost + p_factor - 1) / p_factor),
        updated_at = pg_catalog.clock_timestamp()
    WHERE stock_id = p_stock;
    UPDATE public.virtual_stocks
    SET initial_price = (initial_price + p_factor - 1) / p_factor,
        current_price = (current_price + p_factor - 1) / p_factor,
        day_open_price = (day_open_price + p_factor - 1) / p_factor,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_stock;
  ELSE
    IF v_stock.initial_price > v_max / p_factor
       OR v_stock.current_price > v_max / p_factor
       OR v_stock.day_open_price > v_max / p_factor
       OR EXISTS (SELECT 1 FROM public.virtual_stock_positions WHERE stock_id = p_stock AND quantity % p_factor <> 0)
       OR EXISTS (SELECT 1 FROM public.virtual_stock_positions WHERE stock_id = p_stock AND average_cost > v_max / p_factor) THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'stock cannot be reverse split by this factor';
    END IF;
    UPDATE public.virtual_stock_positions
    SET quantity = quantity / p_factor,
        average_cost = average_cost * p_factor,
        updated_at = pg_catalog.clock_timestamp()
    WHERE stock_id = p_stock;
    UPDATE public.virtual_stocks
    SET initial_price = initial_price * p_factor,
        current_price = current_price * p_factor,
        day_open_price = day_open_price * p_factor,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_stock;
  END IF;

  INSERT INTO public.virtual_stock_corporate_actions(idempotency_key, actor_user_id, stock_id, action, factor)
  VALUES (p_key, p_actor, p_stock, p_action, p_factor)
  RETURNING id INTO v_action_id;

  PERFORM public.admin_record_audit_event(
    p_actor,
    'stock.corporate_action',
    p_stock,
    p_key,
    pg_catalog.jsonb_build_object('action', p_action, 'factor', p_factor)
  );
  RETURN QUERY SELECT v_action_id, false;
END;
$$;

REVOKE ALL ON FUNCTION public.stock_admin_corporate_action(uuid, uuid, uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stock_admin_corporate_action(uuid, uuid, uuid, text, integer) TO moneyverse_app;
