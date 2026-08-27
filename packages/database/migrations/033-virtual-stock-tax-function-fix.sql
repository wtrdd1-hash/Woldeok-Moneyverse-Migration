-- 032 added an OUT parameter named current_price.  Qualify the stock column
-- in the procedure so PL/pgSQL cannot confuse it with that output variable.
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
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_stock IS NULL
    OR p_side NOT IN ('buy', 'sell') OR p_quantity < 1 OR p_quantity > 1000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock trade';
  END IF;

  RETURN QUERY
  SELECT trade_row.id, trade_row.unit_price, trade_row.gross_amount, trade_row.tax_amount, stock_row.current_price
  FROM public.virtual_stock_trades AS trade_row
  JOIN public.virtual_stocks AS stock_row ON stock_row.id = trade_row.stock_id
  WHERE trade_row.idempotency_key = p_key;
  IF FOUND THEN RETURN; END IF;

  PERFORM position_row.user_id
  FROM public.virtual_stock_positions AS position_row
  JOIN public.virtual_stocks AS position_stock ON position_stock.id = position_row.stock_id
  WHERE position_row.user_id = p_actor
  ORDER BY position_row.stock_id
  FOR UPDATE OF position_row, position_stock;

  SELECT stock_row.current_price, stock_row.day_open_price INTO v_price, v_open
  FROM public.virtual_stocks AS stock_row
  WHERE stock_row.id = p_stock AND stock_row.active
  FOR UPDATE;
  IF v_price IS NULL THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active stock required'; END IF;
  v_gross := v_price * p_quantity;

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
    VALUES(p_actor, p_stock, p_quantity, v_price)
    ON CONFLICT(user_id, stock_id) DO UPDATE
    SET average_cost = ((virtual_stock_positions.quantity * virtual_stock_positions.average_cost + excluded.quantity * excluded.average_cost) / (virtual_stock_positions.quantity + excluded.quantity)),
        quantity = virtual_stock_positions.quantity + excluded.quantity, updated_at = now();
  ELSE
    UPDATE public.virtual_stock_positions AS position_row
    SET quantity = position_row.quantity - p_quantity, updated_at = now()
    WHERE position_row.user_id = p_actor AND position_row.stock_id = p_stock;
  END IF;

  INSERT INTO public.virtual_stock_trades(idempotency_key, user_id, stock_id, side, quantity, unit_price, gross_amount, tax_amount)
  VALUES(p_key, p_actor, p_stock, p_side, p_quantity, v_price, v_gross, v_tax)
  RETURNING id INTO v_trade;
  v_next := CASE WHEN p_side = 'buy' THEN least((v_price * 101 + 99) / 100, (v_open * 115) / 100)
    ELSE greatest((v_price * 99) / 100, (v_open * 85) / 100, 10) END;
  UPDATE public.virtual_stocks AS stock_row SET current_price = v_next, updated_at = now() WHERE stock_row.id = p_stock;
  RETURN QUERY SELECT v_trade, v_price, v_gross, v_tax, v_next;
END;
$$;

ALTER FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) TO moneyverse_app;
