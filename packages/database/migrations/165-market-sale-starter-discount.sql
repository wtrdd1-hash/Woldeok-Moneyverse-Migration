-- Finish the early-game market-sale event: members who claimed today's
-- market_sale receive 10% off the starter-tools catalogue until the Seoul day
-- changes. The read model and purchase path share one effective-price function
-- so the amount displayed is the amount the ledger actually charges.
BEGIN;

-- 101 defined these books and entries. They are reference data, not member
-- progress; restoring a missing seed is safe and lets both the collection book
-- and this event use the same definition of "starter essentials".
INSERT INTO public.member_titles (code, name) VALUES
  ('job_explorer', 'Job explorer'),
  ('tool_collector', 'Tool collector')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.early_collection_books (code, ordinal, label, detail, reward_title, reward_note)
VALUES
  ('job_sampler', 1, '직업 체험 도감',
   '작업 보상을 받은 직업이 도감에 기록돼요. 상인은 아직 작업이 없어서 도감에도 없어요.',
   'job_explorer', '칭호 · 직업 체험가'),
  ('starter_tools', 2, '초보 도구 도감',
   '일반 상점에서 산 초보 물건이 도감에 기록돼요. 한 번만 사면 계속 남아요.',
   'tool_collector', '칭호 · 도구 수집가')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.early_collection_book_entries (
  book_code, entry_code, ordinal, label, evidence_kind, evidence_code
) VALUES
  ('job_sampler', 'farmer', 1, '농부 체험', 'work_job', 'farmer'),
  ('job_sampler', 'miner', 2, '광부 체험', 'work_job', 'miner'),
  ('job_sampler', 'carrier', 3, '운반원 체험', 'work_job', 'carrier'),
  ('job_sampler', 'technician', 4, '기술자 체험', 'work_job', 'technician'),
  ('starter_tools', 'work_gloves', 1, '초보 작업 장갑', 'shop_item', 'work_gloves'),
  ('starter_tools', 'toolbox', 2, '기본 공구함', 'shop_item', 'toolbox'),
  ('starter_tools', 'work_bag', 3, '작은 작업 가방', 'shop_item', 'work_bag'),
  ('starter_tools', 'energy_drink', 4, '작업 에너지 음료', 'shop_item', 'energy_drink'),
  ('starter_tools', 'bus_ticket', 5, '버스 이용권', 'shop_item', 'bus_ticket'),
  ('starter_tools', 'repair_kit', 6, '도구 수리 키트', 'shop_item', 'repair_kit'),
  ('starter_tools', 'work_insurance', 7, '작업 실패 보험', 'shop_item', 'work_insurance'),
  ('starter_tools', 'profile_tag', 8, '프로필 이름표', 'shop_item', 'profile_tag'),
  ('starter_tools', 'business_license', 9, '초보 사업 허가증', 'shop_item', 'business_license'),
  ('starter_tools', 'stall_crate', 10, '노점 재고 상자', 'shop_item', 'stall_crate')
ON CONFLICT (book_code, entry_code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.shop_effective_unit_price(
  p_actor uuid,
  p_catalog uuid
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT CASE
    WHEN p_actor IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.early_event_claims AS claim_row
        WHERE claim_row.user_id = p_actor
          AND claim_row.event_code = 'market_sale'
          AND claim_row.event_date = pg_catalog.timezone(
            'Asia/Seoul', pg_catalog.clock_timestamp()
          )::date
      )
      AND EXISTS (
        SELECT 1
        FROM public.early_collection_book_entries AS entry_row
        WHERE entry_row.book_code = 'starter_tools'
          AND entry_row.evidence_kind = 'shop_item'
          AND entry_row.evidence_code = catalogue.code
      )
      THEN GREATEST(1::bigint, (catalogue.base_price * 9) / 10)
    ELSE catalogue.base_price
  END
  FROM public.shop_catalog AS catalogue
  WHERE catalogue.id = p_catalog
$$;

ALTER FUNCTION public.shop_effective_unit_price(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_effective_unit_price(uuid, uuid)
FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.shop_catalog_list_v2(p_actor uuid)
RETURNS TABLE(
  catalog_id uuid,
  code text,
  name text,
  description text,
  category text,
  price bigint,
  quantity integer,
  purchase_limit text,
  effect_kind public.shop_effect_kind,
  maintenance_cost bigint,
  sale_ends_at timestamptz,
  rarity text,
  animation_css text,
  preview_data jsonb,
  max_stock integer,
  is_limited boolean,
  user_owned_quantity integer,
  user_is_equipped boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    catalogue.id,
    catalogue.code,
    catalogue.name,
    catalogue.description,
    catalogue.category,
    public.shop_effective_unit_price(p_actor, catalogue.id),
    inventory.quantity,
    catalogue.purchase_limit,
    catalogue.effect_kind,
    catalogue.maintenance_cost,
    catalogue.sale_ends_at,
    catalogue.rarity,
    catalogue.animation_css,
    catalogue.preview_data,
    catalogue.max_stock,
    catalogue.is_limited,
    COALESCE(held.quantity, 0) AS user_owned_quantity,
    COALESCE(held.is_equipped, false) AS user_is_equipped
  FROM public.shop_catalog AS catalogue
  JOIN public.shop_inventory AS inventory ON inventory.catalog_id = catalogue.id
  LEFT JOIN public.user_items AS held
    ON held.catalog_id = catalogue.id AND held.user_id = p_actor
  WHERE catalogue.active
    AND (inventory.starts_at IS NULL OR inventory.starts_at <= pg_catalog.clock_timestamp())
    AND (inventory.ends_at IS NULL OR inventory.ends_at > pg_catalog.clock_timestamp())
  ORDER BY
    CASE catalogue.category
      WHEN 'frame' THEN 1
      WHEN 'background' THEN 2
      WHEN 'effect' THEN 3
      WHEN 'nameplate' THEN 4
      WHEN 'title' THEN 5
      WHEN 'badge' THEN 6
      WHEN 'season' THEN 7
      WHEN 'limited' THEN 8
      WHEN 'business' THEN 9
      WHEN 'convenience' THEN 10
      ELSE 11
    END,
    catalogue.base_price ASC,
    catalogue.code ASC
$$;

ALTER FUNCTION public.shop_catalog_list_v2(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_catalog_list_v2(uuid)
FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_catalog_list_v2(uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.shop_purchase_catalog(
  p_key uuid,
  p_actor uuid,
  p_catalog uuid,
  p_quantity integer
)
RETURNS TABLE(purchase_id uuid, amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_owner uuid;
  v_price bigint;
  v_stock integer;
  v_limit text;
  v_cash uuid;
  v_sink uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_catalog IS NULL
    OR p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid shop purchase';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:shop-catalog-purchase:' || p_key::text, 0)
  );

  SELECT purchase_row.id, purchase_row.user_id,
         purchase_row.unit_price * purchase_row.quantity, purchase_row.transaction_id
  INTO purchase_id, v_owner, amount, transaction_id
  FROM public.shop_purchases AS purchase_row
  WHERE purchase_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'shop receipt belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  SELECT public.shop_effective_unit_price(p_actor, catalog_row.id),
         inventory_row.quantity,
         catalog_row.purchase_limit
  INTO v_price, v_stock, v_limit
  FROM public.shop_catalog AS catalog_row
  JOIN public.shop_inventory AS inventory_row ON inventory_row.catalog_id = catalog_row.id
  WHERE catalog_row.id = p_catalog
    AND catalog_row.active
    AND (inventory_row.starts_at IS NULL OR inventory_row.starts_at <= pg_catalog.clock_timestamp())
    AND (inventory_row.ends_at IS NULL OR inventory_row.ends_at > pg_catalog.clock_timestamp())
  FOR UPDATE OF catalog_row, inventory_row;

  IF v_price IS NULL OR (v_stock IS NOT NULL AND v_stock < p_quantity) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'shop item is unavailable';
  END IF;

  PERFORM public.shop_assert_purchase_limit(p_actor, p_catalog, v_limit, p_quantity);

  SELECT account_row.id INTO v_cash
  FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_sink
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink'
    AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_sink IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active shop accounts required';
  END IF;

  SELECT public.economy_post_transaction(
    p_key,
    'SHOP_CATALOG_PURCHASE',
    p_actor,
    NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_price * p_quantity, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_sink, 'amount', v_price * p_quantity, 'direction', 'debit')
    ),
    'shop.catalog.purchased',
    pg_catalog.jsonb_build_object('catalogId', p_catalog, 'quantity', p_quantity)
  ) INTO transaction_id;

  INSERT INTO public.shop_purchases (
    idempotency_key, user_id, catalog_id, quantity, unit_price, transaction_id
  ) VALUES (p_key, p_actor, p_catalog, p_quantity, v_price, transaction_id)
  RETURNING shop_purchases.id INTO purchase_id;

  IF v_stock IS NOT NULL THEN
    UPDATE public.shop_inventory AS inventory_row
    SET quantity = inventory_row.quantity - p_quantity
    WHERE inventory_row.catalog_id = p_catalog;
  END IF;

  INSERT INTO public.user_items (user_id, catalog_id, quantity)
  VALUES (p_actor, p_catalog, p_quantity)
  ON CONFLICT (user_id, catalog_id) DO UPDATE
  SET quantity = user_items.quantity + excluded.quantity;

  amount := v_price * p_quantity;
  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer)
OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer)
FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_purchase_catalog(uuid, uuid, uuid, integer)
TO moneyverse_app;

-- The advertised effect is now real, so the generic "not ready" note must no
-- longer be returned by the event read model.
UPDATE public.early_event_catalog
SET pending_effect = NULL
WHERE code = 'market_sale';

COMMIT;
