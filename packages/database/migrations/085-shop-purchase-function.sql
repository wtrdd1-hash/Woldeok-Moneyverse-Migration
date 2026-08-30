BEGIN;
CREATE OR REPLACE FUNCTION public.shop_purchase_catalog(p_key uuid,p_actor uuid,p_catalog uuid,p_quantity integer)
RETURNS TABLE(purchase_id uuid,amount bigint,transaction_id uuid,replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_owner uuid; v_price bigint; v_stock integer; v_cash uuid; v_sink uuid;
BEGIN
 IF p_key IS NULL OR p_actor IS NULL OR p_catalog IS NULL OR p_quantity NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid shop purchase'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:shop-catalog-purchase:'||p_key::text,0));
 SELECT id,user_id,unit_price*p_quantity,transaction_id INTO purchase_id,v_owner,amount,transaction_id FROM public.shop_purchases WHERE idempotency_key=p_key;
 IF FOUND THEN IF v_owner IS DISTINCT FROM p_actor THEN RAISE EXCEPTION USING ERRCODE='28000',MESSAGE='shop receipt belongs to another user'; END IF; replayed:=true; RETURN NEXT; RETURN; END IF;
 SELECT c.base_price,i.quantity INTO v_price,v_stock FROM public.shop_catalog c JOIN public.shop_inventory i ON i.catalog_id=c.id WHERE c.id=p_catalog AND c.active AND (i.starts_at IS NULL OR i.starts_at<=clock_timestamp()) AND (i.ends_at IS NULL OR i.ends_at>clock_timestamp()) FOR UPDATE OF c,i;
 IF v_price IS NULL OR (v_stock IS NOT NULL AND v_stock<p_quantity) THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='shop item is unavailable'; END IF;
 SELECT id INTO v_cash FROM public.accounts WHERE owner_user_id=p_actor AND account_type='USER_CASH'::public.account_type AND status='active'::public.account_status FOR UPDATE; SELECT id INTO v_sink FROM public.accounts WHERE system_key='sink' AND account_type='SINK'::public.account_type AND status='active'::public.account_status FOR UPDATE; IF v_cash IS NULL OR v_sink IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='active shop accounts required'; END IF;
 SELECT public.economy_post_transaction(p_key,'SHOP_CATALOG_PURCHASE',p_actor,NULL,jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_price*p_quantity,'direction','credit'),jsonb_build_object('accountId',v_sink,'amount',v_price*p_quantity,'direction','debit')),'shop.catalog.purchased',jsonb_build_object('catalogId',p_catalog,'quantity',p_quantity)) INTO transaction_id;
 INSERT INTO public.shop_purchases(idempotency_key,user_id,catalog_id,quantity,unit_price,transaction_id) VALUES(p_key,p_actor,p_catalog,p_quantity,v_price,transaction_id) RETURNING id INTO purchase_id;
 IF v_stock IS NOT NULL THEN UPDATE public.shop_inventory SET quantity=quantity-p_quantity WHERE catalog_id=p_catalog; END IF; INSERT INTO public.user_items(user_id,catalog_id,quantity) VALUES(p_actor,p_catalog,p_quantity) ON CONFLICT(user_id,catalog_id) DO UPDATE SET quantity=user_items.quantity+excluded.quantity;
 RETURN QUERY SELECT purchase_id,v_price*p_quantity,transaction_id,false;
END; $$;
ALTER FUNCTION public.shop_purchase_catalog(uuid,uuid,uuid,integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_purchase_catalog(uuid,uuid,uuid,integer) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_purchase_catalog(uuid,uuid,uuid,integer) TO moneyverse_app;
COMMIT;
