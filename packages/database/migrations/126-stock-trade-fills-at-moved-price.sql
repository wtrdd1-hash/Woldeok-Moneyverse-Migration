-- A trade fills at the price it moved to.
--
-- 124's stock_trade computed the order's impact after the fill: the shares
-- changed hands at the quoted price and the market moved afterwards. Under
-- 053 that was harmless -- the move was a flat one percent, matched by the
-- one-percent sell tax -- but 124 sized the move by the order's share of
-- the float, up to five percent, and left the tax alone. That is a spread
-- anyone could pocket: buy three percent of the float at 100, watch the
-- price become 105, sell the same shares at 105 and back to 100, keep four
-- percent of the gross from the sink, repeat without limit.
--
-- 124 was merged before the review that found this, so its file stays as
-- it was and this migration replaces the function. The impact is computed
-- before the fill and the taker pays it: a buy fills at the price it pushed
-- to, a sell at the price it pushed down to, which is what slippage means
-- and what makes a round trip cost money. The position's average cost and
-- the trade row carry the filled price. Nothing else in the function
-- changes.

BEGIN;

-- 053's stock_trade, unchanged except where marked: the halt check after
-- the replay lookup, and the impact.
--
-- THE ORDER FILLS AT THE MOVED PRICE. 053 filled at the quoted price and
-- moved the market afterwards, which was harmless while the move was a flat
-- one percent matched by the one-percent sell tax. With a move that grows
-- with the order it would be a spread anyone could pocket: buy three percent
-- of the float at 100, watch the price become 105, sell the same shares at
-- 105 and back to 100, keep four percent of the gross from the sink, repeat.
-- So the impact is computed first and the taker pays it -- a buy fills at
-- the price it pushed to, a sell at the price it pushed down to -- which is
-- what slippage means and what makes a round trip cost money.
CREATE OR REPLACE FUNCTION public.stock_trade(
  p_key uuid, p_actor uuid, p_stock uuid, p_side text, p_quantity bigint
)
RETURNS TABLE(trade_id uuid, unit_price bigint, gross_amount bigint, tax_amount bigint, current_price bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_price bigint; v_open bigint; v_gross bigint; v_tax bigint := 0;
  v_cash uuid; v_sink uuid; v_treasury uuid; v_position bigint := 0;
  v_trade uuid; v_next bigint; v_wallet_net_worth bigint := 0;
  v_stock_net_worth bigint := 0; v_net_worth_before_tax bigint := 0;
  v_existing_user_id uuid; v_existing_unit_price bigint;
  v_existing_gross_amount bigint; v_existing_tax_amount bigint; v_existing_current_price bigint;
  v_shares bigint; v_held bigint; v_available bigint;
  prm public.virtual_stock_market_params%ROWTYPE;
  v_impact_bps numeric; v_exact numeric; v_low numeric; v_high numeric;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_stock IS NULL
    OR p_side NOT IN ('buy', 'sell') OR p_quantity < 1 OR p_quantity > 1000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock trade';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:stock-trade:' || p_key::text, 0));

  SELECT trade_row.id, trade_row.user_id, trade_row.unit_price, trade_row.gross_amount, trade_row.tax_amount, stock_row.current_price
  INTO v_trade, v_existing_user_id, v_existing_unit_price, v_existing_gross_amount, v_existing_tax_amount, v_existing_current_price
  FROM public.virtual_stock_trades AS trade_row
  JOIN public.virtual_stocks AS stock_row ON stock_row.id = trade_row.stock_id
  WHERE trade_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'stock trade receipt belongs to another user';
    END IF;
    RETURN QUERY SELECT v_trade, v_existing_unit_price, v_existing_gross_amount, v_existing_tax_amount, v_existing_current_price;
    RETURN;
  END IF;

  -- 124: 117's circuit breaker stops trades as well as the walk. After the
  -- replay lookup, so a receipt already issued is still answered.
  IF public.stock_market_halted() THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'the market is halted';
  END IF;

  PERFORM position_row.user_id
  FROM public.virtual_stock_positions AS position_row
  JOIN public.virtual_stocks AS position_stock ON position_stock.id = position_row.stock_id
  WHERE position_row.user_id = p_actor
  ORDER BY position_row.stock_id
  FOR UPDATE OF position_row, position_stock;

  SELECT stock_row.current_price, stock_row.day_open_price, stock_row.shares_outstanding
  INTO v_price, v_open, v_shares
  FROM public.virtual_stocks AS stock_row
  WHERE stock_row.id = p_stock AND stock_row.active
  FOR UPDATE;
  IF v_price IS NULL THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active stock required'; END IF;

  -- 124: the impact is the share of the float this order takes, in basis
  -- points per percent, capped; not 053's flat one percent. A buy of one
  -- share in a float of a million moves nothing, which is right. It is
  -- computed here, before the fill, because the fill is at this price.
  SELECT * INTO prm FROM public.virtual_stock_market_params WHERE id = 1;
  v_impact_bps := least(prm.impact_cap_bps,
                        prm.impact_bps_per_float_percent * (p_quantity::numeric * 100 / greatest(v_shares, 1)));
  v_exact := v_price * (1 + CASE WHEN p_side = 'buy' THEN v_impact_bps ELSE -v_impact_bps END / 10000.0);
  v_low := greatest(10, v_open * (1 - prm.day_range_cap_bps / 10000.0));
  v_high := v_open * (1 + prm.day_range_cap_bps / 10000.0);
  v_exact := greatest(v_low, least(v_high, v_exact));
  v_next := round(v_exact)::bigint;
  v_gross := v_next * p_quantity;

  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_sink FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink' AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_treasury FROM public.accounts AS account_row
  WHERE account_row.system_key = 'treasury' AND account_row.account_type = 'TREASURY'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_sink IS NULL OR v_treasury IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active game accounts required';
  END IF;

  SELECT position_row.quantity INTO v_position FROM public.virtual_stock_positions AS position_row
  WHERE position_row.user_id = p_actor AND position_row.stock_id = p_stock FOR UPDATE;
  v_position := coalesce(v_position, 0);
  IF p_side = 'sell' AND v_position < p_quantity THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'insufficient stock position';
  END IF;

  IF p_side = 'buy' THEN
    SELECT coalesce(sum(position_row.quantity), 0) INTO v_held
    FROM public.virtual_stock_positions AS position_row
    WHERE position_row.stock_id = p_stock;
    v_available := greatest(v_shares - v_held, 0);
    IF v_available < p_quantity THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'not enough shares available';
    END IF;
  END IF;

  IF p_side = 'sell' THEN
    SELECT coalesce(sum(balance_row.available_amount), 0) INTO v_wallet_net_worth
    FROM public.accounts AS account_row JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    WHERE account_row.owner_user_id = p_actor AND account_row.status = 'active'::public.account_status
      AND account_row.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type);
    SELECT coalesce(sum(position_row.quantity * stock_row.current_price), 0) INTO v_stock_net_worth
    FROM public.virtual_stock_positions AS position_row JOIN public.virtual_stocks AS stock_row ON stock_row.id = position_row.stock_id
    WHERE position_row.user_id = p_actor;
    v_net_worth_before_tax := v_wallet_net_worth + v_stock_net_worth;
    v_tax := least(floor(v_gross * 0.01)::bigint, greatest(v_net_worth_before_tax - 1000000, 0));
  END IF;

  PERFORM public.economy_post_transaction(
    p_key, 'VIRTUAL_STOCK_' || upper(p_side), p_actor, NULL,
    CASE WHEN p_side = 'buy' THEN jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'credit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'debit')
    ) WHEN v_tax = 0 THEN jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'debit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'credit')
    ) ELSE jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross - v_tax, 'direction', 'debit'),
      jsonb_build_object('accountId', v_treasury, 'amount', v_tax, 'direction', 'debit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'credit')
    ) END,
    'stock.trade.completed',
    jsonb_build_object('stockId', p_stock, 'side', p_side, 'quantity', p_quantity, 'tax', v_tax, 'netWorthBeforeTax', v_net_worth_before_tax)
  );

  IF p_side = 'buy' THEN
    INSERT INTO public.virtual_stock_positions(user_id, stock_id, quantity, average_cost)
    VALUES(p_actor, p_stock, p_quantity, v_next)
    ON CONFLICT(user_id, stock_id) DO UPDATE
    SET average_cost = ((virtual_stock_positions.quantity * virtual_stock_positions.average_cost + excluded.quantity * excluded.average_cost) / (virtual_stock_positions.quantity + excluded.quantity)),
        quantity = virtual_stock_positions.quantity + excluded.quantity, updated_at = now();
  ELSE
    UPDATE public.virtual_stock_positions AS position_row
    SET quantity = position_row.quantity - p_quantity, updated_at = now()
    WHERE position_row.user_id = p_actor AND position_row.stock_id = p_stock;
  END IF;

  INSERT INTO public.virtual_stock_trades(idempotency_key, user_id, stock_id, side, quantity, unit_price, gross_amount, tax_amount)
  VALUES(p_key, p_actor, p_stock, p_side, p_quantity, v_next, v_gross, v_tax)
  RETURNING id INTO v_trade;

  UPDATE public.virtual_stocks AS stock_row SET current_price = v_next, updated_at = now() WHERE stock_row.id = p_stock;

  -- The walk continues from the traded price, and a share of the move stays
  -- in the fair value: this is what makes demand raise a price for good.
  UPDATE public.virtual_stock_dynamics AS dynamics
  SET price_exact = v_exact,
      fair_value = greatest(10, dynamics.fair_value + (v_exact - v_price) * prm.impact_permanent_share),
      updated_at = clock_timestamp()
  WHERE dynamics.stock_id = p_stock;

  RETURN QUERY SELECT v_trade, v_next, v_gross, v_tax, v_next;
END;
$$;

ALTER FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) TO moneyverse_app;

COMMIT;
