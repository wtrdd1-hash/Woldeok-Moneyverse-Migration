-- P0: Read active/owner marketplace listings through narrowly scoped functions.
-- A clean PostgreSQL install revokes direct app-role reads of marketplace_listings.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.marketplace_listings FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.marketplace_active_listings(
  p_category text, p_search text, p_limit integer, p_offset integer
)
RETURNS TABLE (
  id text, seller_id text, item_code text, item_name text, category text,
  rarity text, quantity integer, price_wld text, listing_fee_wld text,
  status text, description text, created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT l.id::text, l.seller_id::text, l.item_code, l.item_name,
         l.category, l.rarity, l.quantity, l.price_wld::text,
         l.listing_fee_wld::text, l.status, l.description, l.created_at
  FROM public.marketplace_listings AS l
  WHERE l.status = 'ACTIVE'
    AND (p_category IS NULL OR l.category = p_category)
    AND (p_search IS NULL OR l.item_name ILIKE p_search OR l.description ILIKE p_search)
  ORDER BY l.created_at DESC, l.id DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100)
  OFFSET LEAST(GREATEST(COALESCE(p_offset, 0), 0), 10000);
$function$;

CREATE FUNCTION public.marketplace_owner_listings(p_actor uuid)
RETURNS TABLE (
  id text, seller_id text, item_code text, item_name text, category text,
  rarity text, quantity integer, price_wld text, listing_fee_wld text,
  status text, description text, created_at timestamptz,
  settled_at timestamptz, cancelled_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_actor = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION 'marketplace owner required' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT l.id::text, l.seller_id::text, l.item_code, l.item_name,
           l.category, l.rarity, l.quantity, l.price_wld::text,
           l.listing_fee_wld::text, l.status, l.description, l.created_at,
           l.settled_at, l.cancelled_at
    FROM public.marketplace_listings AS l
    WHERE l.seller_id = p_actor
    ORDER BY l.created_at DESC, l.id DESC;
END;
$function$;

ALTER FUNCTION public.marketplace_active_listings(text,text,integer,integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.marketplace_owner_listings(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.marketplace_active_listings(text,text,integer,integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.marketplace_owner_listings(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.marketplace_active_listings(text,text,integer,integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.marketplace_owner_listings(uuid) TO moneyverse_app;
COMMIT;
