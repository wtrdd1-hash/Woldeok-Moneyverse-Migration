CREATE OR REPLACE FUNCTION public.stock_admin_create(p_actor uuid, p_symbol text, p_name text, p_description text, p_price bigint)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='operator'::public.admin_role) THEN RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='operator role required'; END IF;
  IF p_symbol !~ '^[A-Z][A-Z0-9]{1,7}$' OR char_length(p_name) NOT BETWEEN 1 AND 80 OR char_length(p_description)>500 OR p_price<10 THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid stock'; END IF;
  INSERT INTO public.virtual_stocks(symbol,name,description,initial_price,current_price,day_open_price) VALUES(p_symbol,p_name,p_description,p_price,p_price,p_price) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.stock_trade(p_key uuid, p_actor uuid, p_stock uuid, p_side text, p_quantity bigint)
RETURNS TABLE(trade_id uuid, unit_price bigint, gross_amount bigint, tax_amount bigint, current_price bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_price bigint; v_open bigint; v_gross bigint; v_tax bigint:=0; v_cash uuid; v_sink uuid; v_position bigint:=0; v_trade uuid; v_next bigint;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_stock IS NULL OR p_side NOT IN ('buy','sell') OR p_quantity<1 OR p_quantity>1000000 THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid stock trade'; END IF;
  SELECT current_price,day_open_price INTO v_price,v_open FROM public.virtual_stocks WHERE id=p_stock AND active FOR UPDATE;
  IF v_price IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active stock required'; END IF;
  v_gross:=v_price*p_quantity;
  SELECT id INTO v_cash FROM public.accounts WHERE owner_user_id=p_actor AND account_type='USER_CASH'::public.account_type AND status='active'::public.account_status FOR UPDATE;
  SELECT id INTO v_sink FROM public.accounts WHERE system_key='sink' AND account_type='SINK'::public.account_type AND status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_sink IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active cash wallet required'; END IF;
  SELECT quantity INTO v_position FROM public.virtual_stock_positions WHERE user_id=p_actor AND stock_id=p_stock FOR UPDATE;
  v_position:=coalesce(v_position,0);
  IF p_side='sell' AND v_position<p_quantity THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='insufficient stock position'; END IF;
  IF p_side='sell' AND v_gross>1000000 THEN v_tax:=floor((v_gross-1000000)*0.01); END IF;
  PERFORM public.economy_post_transaction(p_key, 'VIRTUAL_STOCK_'||upper(p_side), p_actor, NULL,
    CASE WHEN p_side='buy' THEN jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_gross,'direction','credit'),jsonb_build_object('accountId',v_sink,'amount',v_gross,'direction','debit'))
    ELSE jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_gross-v_tax,'direction','debit'),jsonb_build_object('accountId',v_sink,'amount',v_gross-v_tax,'direction','credit')) END,
    'stock.trade.completed', jsonb_build_object('stockId',p_stock,'side',p_side,'quantity',p_quantity,'tax',v_tax));
  IF p_side='buy' THEN INSERT INTO public.virtual_stock_positions(user_id,stock_id,quantity,average_cost) VALUES(p_actor,p_stock,p_quantity,v_price) ON CONFLICT(user_id,stock_id) DO UPDATE SET average_cost=((virtual_stock_positions.quantity*virtual_stock_positions.average_cost+excluded.quantity*excluded.average_cost)/(virtual_stock_positions.quantity+excluded.quantity)),quantity=virtual_stock_positions.quantity+excluded.quantity,updated_at=now();
  ELSE UPDATE public.virtual_stock_positions SET quantity=quantity-p_quantity,updated_at=now() WHERE user_id=p_actor AND stock_id=p_stock; END IF;
  INSERT INTO public.virtual_stock_trades(idempotency_key,user_id,stock_id,side,quantity,unit_price,gross_amount,tax_amount) VALUES(p_key,p_actor,p_stock,p_side,p_quantity,v_price,v_gross,v_tax) RETURNING id INTO v_trade;
  v_next:=CASE WHEN p_side='buy' THEN least((v_price*101+99)/100,(v_open*115)/100) ELSE greatest((v_price*99)/100,(v_open*85)/100,10) END;
  UPDATE public.virtual_stocks SET current_price=v_next,updated_at=now() WHERE id=p_stock;
  RETURN QUERY SELECT v_trade,v_price,v_gross,v_tax,v_next;
END $$;

GRANT EXECUTE ON FUNCTION public.stock_admin_create(uuid,text,text,text,bigint), public.stock_trade(uuid,uuid,uuid,text,bigint) TO moneyverse_app;
