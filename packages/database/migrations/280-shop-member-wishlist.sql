-- F675-111 member-owned wishlist; no purchase, reservation or ledger writes.
-- IMPORTANT: 280 is provisional on this independent branch; other unmerged PRs
-- already reserve 280. Do not merge until canonical migration order is resolved.
BEGIN;

CREATE TABLE public.shop_wishlist_items (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  catalog_id uuid NOT NULL REFERENCES public.shop_catalog(id) ON DELETE CASCADE,
  saved boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (user_id, catalog_id)
);
CREATE INDEX shop_wishlist_saved_idx ON public.shop_wishlist_items(user_id, updated_at DESC, catalog_id DESC) WHERE saved;
CREATE TABLE public.shop_wishlist_receipts (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  idempotency_key uuid NOT NULL,
  catalog_id uuid NOT NULL,
  desired_saved boolean NOT NULL,
  saved boolean NOT NULL,
  version integer NOT NULL,
  receipt_id uuid NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (user_id, idempotency_key)
);
REVOKE ALL PRIVILEGES ON TABLE public.shop_wishlist_items, public.shop_wishlist_receipts FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.shop_wishlist_list(p_actor uuid)
RETURNS TABLE(catalog_id uuid, name text, price text, available boolean, version integer, updated_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;
  RETURN QUERY
  SELECT w.catalog_id,
         CASE WHEN visibility.available THEN c.name ELSE NULL::text END,
         CASE WHEN visibility.available THEN c.base_price::text ELSE NULL::text END,
         visibility.available,
         w.version, w.updated_at
  FROM public.shop_wishlist_items AS w
  JOIN public.shop_catalog AS c ON c.id = w.catalog_id
  CROSS JOIN LATERAL (
    SELECT c.active AND EXISTS (
      SELECT 1 FROM public.shop_inventory AS i WHERE i.catalog_id = c.id
      AND (i.starts_at IS NULL OR i.starts_at <= pg_catalog.clock_timestamp())
      AND (i.ends_at IS NULL OR i.ends_at > pg_catalog.clock_timestamp())
    ) AS available
  ) AS visibility
  WHERE w.user_id = p_actor AND w.saved
  ORDER BY w.updated_at DESC, w.catalog_id DESC
  LIMIT 50;
END;
$$;
ALTER FUNCTION public.shop_wishlist_list(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_wishlist_list(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_wishlist_list(uuid) TO moneyverse_app;

CREATE FUNCTION public.shop_wishlist_set(p_actor uuid, p_catalog uuid, p_saved boolean, p_key uuid)
RETURNS TABLE(saved boolean, replayed boolean, version integer, receipt_id uuid)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_receipt public.shop_wishlist_receipts%ROWTYPE;
  v_existing public.shop_wishlist_items%ROWTYPE;
  v_version integer;
  v_receipt_id uuid;
  v_count integer;
BEGIN
  IF p_actor IS NULL OR p_catalog IS NULL OR p_saved IS NULL OR p_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'wishlist arguments required';
  END IF;
  -- Actor row lock serializes this user's replay, count and state transitions.
  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor AND u.status = 'active'::public.user_status FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;
  SELECT * INTO v_receipt FROM public.shop_wishlist_receipts AS r
  WHERE r.user_id = p_actor AND r.idempotency_key = p_key;
  IF FOUND THEN
    IF v_receipt.catalog_id <> p_catalog OR v_receipt.desired_saved <> p_saved THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key payload conflict';
    END IF;
    RETURN QUERY SELECT v_receipt.saved, true, v_receipt.version, v_receipt.receipt_id;
    RETURN;
  END IF;
  IF p_saved AND NOT EXISTS (
    SELECT 1 FROM public.shop_catalog AS c
    JOIN public.shop_inventory AS i ON i.catalog_id = c.id
    WHERE c.id = p_catalog AND c.active
    AND (i.starts_at IS NULL OR i.starts_at <= pg_catalog.clock_timestamp())
    AND (i.ends_at IS NULL OR i.ends_at > pg_catalog.clock_timestamp())
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'catalogue item is unavailable';
  END IF;
  SELECT * INTO v_existing FROM public.shop_wishlist_items AS w
  WHERE w.user_id = p_actor AND w.catalog_id = p_catalog FOR UPDATE;
  IF FOUND THEN
    v_version := v_existing.version;
    IF v_existing.saved IS DISTINCT FROM p_saved THEN
      IF p_saved THEN
        SELECT count(*)::integer INTO v_count FROM public.shop_wishlist_items AS w
        WHERE w.user_id = p_actor AND w.saved;
        IF v_count >= 50 THEN
          RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'wishlist limit reached';
        END IF;
      END IF;
      UPDATE public.shop_wishlist_items AS w
      SET saved = p_saved, version = w.version + 1, updated_at = pg_catalog.clock_timestamp()
      WHERE w.user_id = p_actor AND w.catalog_id = p_catalog
      RETURNING w.version INTO v_version;
    END IF;
  ELSIF p_saved THEN
    SELECT count(*)::integer INTO v_count FROM public.shop_wishlist_items AS w
    WHERE w.user_id = p_actor AND w.saved;
    IF v_count >= 50 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'wishlist limit reached';
    END IF;
    INSERT INTO public.shop_wishlist_items(user_id, catalog_id, saved, version)
    VALUES (p_actor, p_catalog, true, 1);
    v_version := 1;
  ELSE
    -- An unavailable or never-saved catalogue ID can always be removed safely.
    v_version := 0;
  END IF;
  INSERT INTO public.shop_wishlist_receipts(user_id, idempotency_key, catalog_id, desired_saved, saved, version)
  VALUES (p_actor, p_key, p_catalog, p_saved, p_saved, v_version)
  RETURNING shop_wishlist_receipts.receipt_id INTO v_receipt_id;
  RETURN QUERY SELECT p_saved, false, v_version, v_receipt_id;
END;
$$;
ALTER FUNCTION public.shop_wishlist_set(uuid, uuid, boolean, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_wishlist_set(uuid, uuid, boolean, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_wishlist_set(uuid, uuid, boolean, uuid) TO moneyverse_app;
COMMIT;
