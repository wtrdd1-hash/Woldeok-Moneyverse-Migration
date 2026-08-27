CREATE OR REPLACE FUNCTION public.stock_market_tick(p_factor numeric DEFAULT 0)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE r record; v_factor numeric; v_price bigint; v_count integer:=0;
BEGIN
  v_factor := greatest(-0.05, least(0.05, coalesce(p_factor,0)));
  FOR r IN SELECT id,current_price,day_open_price FROM public.virtual_stocks WHERE active FOR UPDATE LOOP
    v_price := greatest(10, least(r.day_open_price*2, round(r.current_price*(1+v_factor))::bigint));
    UPDATE public.virtual_stocks SET current_price=v_price, updated_at=now() WHERE id=r.id; v_count:=v_count+1;
  END LOOP; RETURN v_count;
END $$;
CREATE OR REPLACE FUNCTION public.stock_admin_update(p_actor uuid,p_stock uuid,p_name text,p_description text,p_active boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='operator'::public.admin_role) THEN RAISE EXCEPTION USING ERRCODE='42501'; END IF;
 UPDATE public.virtual_stocks SET name=coalesce(p_name,name),description=coalesce(p_description,description),active=coalesce(p_active,active),updated_at=now() WHERE id=p_stock;
 RETURN FOUND;
END $$;
GRANT EXECUTE ON FUNCTION public.stock_market_tick(numeric),public.stock_admin_update(uuid,uuid,text,text,boolean) TO moneyverse_app;
