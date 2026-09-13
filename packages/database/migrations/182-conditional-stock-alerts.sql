BEGIN;

CREATE TABLE public.member_stock_alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  condition_kind text NOT NULL CHECK (condition_kind IN (
    'price_at_or_above', 'price_at_or_below',
    'day_change_at_or_above', 'day_change_at_or_below'
  )),
  threshold_amount bigint,
  threshold_bps integer,
  cooldown_seconds integer NOT NULL DEFAULT 3600 CHECK (cooldown_seconds BETWEEN 300 AND 604800),
  active boolean NOT NULL DEFAULT true,
  last_condition_met boolean NOT NULL DEFAULT false,
  last_evaluated_at timestamptz,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (
    (condition_kind IN ('price_at_or_above','price_at_or_below') AND threshold_amount IS NOT NULL AND threshold_amount > 0 AND threshold_bps IS NULL)
    OR
    (condition_kind IN ('day_change_at_or_above','day_change_at_or_below') AND threshold_amount IS NULL AND threshold_bps IS NOT NULL AND threshold_bps BETWEEN -100000 AND 100000)
  )
);

CREATE INDEX member_stock_alert_rules_user_created_idx
  ON public.member_stock_alert_rules(user_id, created_at DESC, id);
CREATE INDEX member_stock_alert_rules_active_stock_idx
  ON public.member_stock_alert_rules(stock_id, active) WHERE active;

CREATE TABLE public.member_stock_alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.member_stock_alert_rules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  condition_kind text NOT NULL,
  threshold_amount bigint,
  threshold_bps integer,
  trigger_price bigint NOT NULL,
  trigger_day_change_bps integer NOT NULL,
  triggered_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX member_stock_alert_events_user_triggered_idx
  ON public.member_stock_alert_events(user_id, triggered_at DESC, id);

CREATE FUNCTION public.stock_alert_rule_create(
  p_actor uuid,
  p_stock uuid,
  p_condition text,
  p_threshold_amount bigint,
  p_threshold_bps integer,
  p_cooldown_seconds integer DEFAULT 3600
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_actor IS NULL OR p_stock IS NULL OR p_condition IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor, stock and condition are required';
  END IF;
  IF p_condition NOT IN ('price_at_or_above','price_at_or_below','day_change_at_or_above','day_change_at_or_below') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unsupported stock alert condition';
  END IF;
  IF p_cooldown_seconds IS NULL OR p_cooldown_seconds < 300 OR p_cooldown_seconds > 604800 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'cooldown must be between 300 and 604800 seconds';
  END IF;
  IF p_condition IN ('price_at_or_above','price_at_or_below') THEN
    IF p_threshold_amount IS NULL OR p_threshold_amount <= 0 OR p_threshold_bps IS NOT NULL THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'price alerts require a positive WLD threshold only';
    END IF;
  ELSE
    IF p_threshold_amount IS NOT NULL OR p_threshold_bps IS NULL OR p_threshold_bps < -100000 OR p_threshold_bps > 100000 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'change alerts require a basis-point threshold between -100000 and 100000';
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.virtual_stocks s WHERE s.id = p_stock AND s.active) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'active stock not found';
  END IF;

  INSERT INTO public.member_stock_alert_rules(
    user_id, stock_id, condition_kind, threshold_amount, threshold_bps, cooldown_seconds
  ) VALUES (
    p_actor, p_stock, p_condition, p_threshold_amount, p_threshold_bps, p_cooldown_seconds
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE FUNCTION public.stock_alert_rule_delete(p_actor uuid, p_rule uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_rule IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor and rule are required';
  END IF;
  DELETE FROM public.member_stock_alert_rules WHERE id = p_rule AND user_id = p_actor;
  RETURN FOUND;
END;
$$;

CREATE FUNCTION public.stock_alert_rules_list(p_actor uuid)
RETURNS TABLE(
  alert_id uuid, stock_id uuid, symbol text, name text,
  condition_kind text, threshold_amount bigint, threshold_bps integer,
  cooldown_seconds integer, current_price bigint, day_open_price bigint,
  current_day_change_bps integer, condition_met boolean,
  last_evaluated_at timestamptz, last_triggered_at timestamptz, created_at timestamptz
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
  SELECT r.id, r.stock_id, s.symbol, s.name,
    r.condition_kind, r.threshold_amount, r.threshold_bps, r.cooldown_seconds,
    s.current_price, s.day_open_price,
    CASE WHEN s.day_open_price <= 0 THEN 0
         ELSE trunc(((s.current_price - s.day_open_price)::numeric * 10000) / s.day_open_price)::integer END AS current_day_change_bps,
    CASE r.condition_kind
      WHEN 'price_at_or_above' THEN s.current_price >= r.threshold_amount
      WHEN 'price_at_or_below' THEN s.current_price <= r.threshold_amount
      WHEN 'day_change_at_or_above' THEN (CASE WHEN s.day_open_price <= 0 THEN 0 ELSE trunc(((s.current_price - s.day_open_price)::numeric * 10000) / s.day_open_price)::integer END) >= r.threshold_bps
      WHEN 'day_change_at_or_below' THEN (CASE WHEN s.day_open_price <= 0 THEN 0 ELSE trunc(((s.current_price - s.day_open_price)::numeric * 10000) / s.day_open_price)::integer END) <= r.threshold_bps
      ELSE false
    END AS condition_met,
    r.last_evaluated_at, r.last_triggered_at, r.created_at
  FROM public.member_stock_alert_rules r
  JOIN public.virtual_stocks s ON s.id = r.stock_id
  WHERE r.user_id = p_actor AND r.active AND s.active
  ORDER BY r.created_at DESC, r.id;
END;
$$;

CREATE FUNCTION public.stock_alert_events_list(p_actor uuid, p_limit integer DEFAULT 20)
RETURNS TABLE(
  event_id uuid, alert_id uuid, stock_id uuid, symbol text, name text,
  condition_kind text, threshold_amount bigint, threshold_bps integer,
  trigger_price bigint, trigger_day_change_bps integer, triggered_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE v_limit integer := LEAST(100, GREATEST(1, COALESCE(p_limit, 20)));
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;
  RETURN QUERY
  SELECT e.id, e.rule_id, e.stock_id, s.symbol, s.name,
    e.condition_kind, e.threshold_amount, e.threshold_bps,
    e.trigger_price, e.trigger_day_change_bps, e.triggered_at
  FROM public.member_stock_alert_events e
  JOIN public.virtual_stocks s ON s.id = e.stock_id
  WHERE e.user_id = p_actor
  ORDER BY e.triggered_at DESC, e.id DESC
  LIMIT v_limit;
END;
$$;

CREATE FUNCTION public.stock_alerts_evaluate_due()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_rule record;
  v_change integer;
  v_met boolean;
  v_ready boolean;
  v_triggered integer := 0;
  v_now timestamptz := clock_timestamp();
  v_next_state boolean;
BEGIN
  FOR v_rule IN
    SELECT r.*, s.current_price, s.day_open_price
    FROM public.member_stock_alert_rules r
    JOIN public.virtual_stocks s ON s.id = r.stock_id
    WHERE r.active AND s.active
    FOR UPDATE OF r SKIP LOCKED
  LOOP
    v_change := CASE WHEN v_rule.day_open_price <= 0 THEN 0
      ELSE trunc(((v_rule.current_price - v_rule.day_open_price)::numeric * 10000) / v_rule.day_open_price)::integer END;
    v_met := CASE v_rule.condition_kind
      WHEN 'price_at_or_above' THEN v_rule.current_price >= v_rule.threshold_amount
      WHEN 'price_at_or_below' THEN v_rule.current_price <= v_rule.threshold_amount
      WHEN 'day_change_at_or_above' THEN v_change >= v_rule.threshold_bps
      WHEN 'day_change_at_or_below' THEN v_change <= v_rule.threshold_bps
      ELSE false END;
    v_ready := v_rule.last_triggered_at IS NULL
      OR v_now >= v_rule.last_triggered_at + make_interval(secs => v_rule.cooldown_seconds);
    v_next_state := v_met;

    IF v_met AND NOT v_rule.last_condition_met AND v_ready THEN
      INSERT INTO public.member_stock_alert_events(
        rule_id, user_id, stock_id, condition_kind, threshold_amount, threshold_bps,
        trigger_price, trigger_day_change_bps, triggered_at
      ) VALUES (
        v_rule.id, v_rule.user_id, v_rule.stock_id, v_rule.condition_kind,
        v_rule.threshold_amount, v_rule.threshold_bps, v_rule.current_price, v_change, v_now
      );
      UPDATE public.member_stock_alert_rules
      SET last_condition_met = true, last_evaluated_at = v_now,
          last_triggered_at = v_now, updated_at = v_now
      WHERE id = v_rule.id;
      v_triggered := v_triggered + 1;
    ELSE
      IF v_met AND NOT v_rule.last_condition_met AND NOT v_ready THEN
        v_next_state := false;
      END IF;
      UPDATE public.member_stock_alert_rules
      SET last_condition_met = v_next_state, last_evaluated_at = v_now, updated_at = v_now
      WHERE id = v_rule.id;
    END IF;
  END LOOP;
  RETURN v_triggered;
END;
$$;

ALTER FUNCTION public.stock_alert_rule_create(uuid, uuid, text, bigint, integer, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_alert_rule_delete(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_alert_rules_list(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_alert_events_list(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.stock_alerts_evaluate_due() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON TABLE public.member_stock_alert_rules, public.member_stock_alert_events FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION
  public.stock_alert_rule_create(uuid, uuid, text, bigint, integer, integer),
  public.stock_alert_rule_delete(uuid, uuid),
  public.stock_alert_rules_list(uuid),
  public.stock_alert_events_list(uuid, integer),
  public.stock_alerts_evaluate_due()
FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION
  public.stock_alert_rule_create(uuid, uuid, text, bigint, integer, integer),
  public.stock_alert_rule_delete(uuid, uuid),
  public.stock_alert_rules_list(uuid),
  public.stock_alert_events_list(uuid, integer),
  public.stock_alerts_evaluate_due()
TO moneyverse_app;

COMMIT;
