BEGIN;
CREATE OR REPLACE FUNCTION public.shop_use_item(p_key uuid,p_actor uuid,p_catalog uuid)
RETURNS TABLE(catalog_id uuid,remaining_quantity integer,expires_at timestamptz,replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_owner uuid; v_quantity integer; v_kind public.shop_effect_kind;
BEGIN
 IF p_key IS NULL OR p_actor IS NULL OR p_catalog IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid item use'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:shop-use:'||p_key::text,0));
 SELECT user_id,catalog_id INTO v_owner,catalog_id FROM public.item_effect_receipts WHERE idempotency_key=p_key; IF FOUND THEN IF v_owner IS DISTINCT FROM p_actor THEN RAISE EXCEPTION USING ERRCODE='28000',MESSAGE='item effect belongs to another user'; END IF; SELECT quantity INTO remaining_quantity FROM public.user_items WHERE user_id=p_actor AND catalog_id=p_catalog; replayed:=true; RETURN NEXT; RETURN; END IF;
 SELECT i.quantity,c.effect_kind INTO v_quantity,v_kind FROM public.user_items i JOIN public.shop_catalog c ON c.id=i.catalog_id WHERE i.user_id=p_actor AND i.catalog_id=p_catalog FOR UPDATE OF i; IF v_quantity IS NULL OR v_quantity<1 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='item is not owned'; END IF;
 IF v_kind <> 'convenience' THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='item cannot be consumed'; END IF;
 UPDATE public.user_items SET quantity=quantity-1 WHERE user_id=p_actor AND catalog_id=p_catalog RETURNING quantity INTO remaining_quantity; INSERT INTO public.item_effect_receipts(user_id,catalog_id,idempotency_key) VALUES(p_actor,p_catalog,p_key); RETURN QUERY SELECT p_catalog,remaining_quantity,NULL::timestamptz,false;
END; $$;
ALTER FUNCTION public.shop_use_item(uuid,uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_use_item(uuid,uuid,uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_use_item(uuid,uuid,uuid) TO moneyverse_app;
COMMIT;
