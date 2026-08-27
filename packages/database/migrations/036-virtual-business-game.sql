-- Game-only businesses. They never represent a real company, investment,
-- employment relationship, or entitlement to real-world money.
CREATE TABLE IF NOT EXISTS public.virtual_business_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL UNIQUE CHECK (symbol ~ '^[A-Z][A-Z0-9_]{1,15}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  purchase_cost bigint NOT NULL CHECK (purchase_cost >= 100),
  daily_revenue bigint NOT NULL CHECK (daily_revenue >= 1),
  daily_operating_cost bigint NOT NULL CHECK (daily_operating_cost >= 0 AND daily_operating_cost <= daily_revenue),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.virtual_business_ownerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  business_type_id uuid NOT NULL REFERENCES public.virtual_business_types(id),
  purchase_idempotency_key uuid NOT NULL UNIQUE,
  purchase_transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_type_id)
);

CREATE TABLE IF NOT EXISTS public.virtual_business_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ownership_id uuid NOT NULL REFERENCES public.virtual_business_ownerships(id),
  settlement_date date NOT NULL,
  idempotency_key uuid NOT NULL UNIQUE,
  gross_revenue bigint NOT NULL CHECK (gross_revenue >= 1),
  operating_cost bigint NOT NULL CHECK (operating_cost >= 0),
  net_amount bigint NOT NULL CHECK (net_amount >= 0),
  transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
  settled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ownership_id, settlement_date)
);

INSERT INTO public.virtual_business_types(symbol,name,description,purchase_cost,daily_revenue,daily_operating_cost)
VALUES
  ('CAFE','동네 카페','커뮤니티 방문객에게 가상 음료를 판매합니다.',25000,1000,300),
  ('FARM','월덕 농장','커뮤니티 식재료를 생산하는 게임 내 농장입니다.',60000,2400,700),
  ('STUDIO','창작 스튜디오','커뮤니티용 디지털 굿즈를 만드는 게임 내 스튜디오입니다.',125000,4800,1500)
ON CONFLICT (symbol) DO NOTHING;

CREATE OR REPLACE FUNCTION public.business_catalog()
RETURNS TABLE(id uuid, symbol text, name text, description text, purchase_cost bigint, daily_revenue bigint, daily_operating_cost bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT business.id, business.symbol, business.name, business.description, business.purchase_cost, business.daily_revenue, business.daily_operating_cost
  FROM public.virtual_business_types AS business WHERE business.active ORDER BY business.purchase_cost, business.symbol
$$;

CREATE OR REPLACE FUNCTION public.business_my_ownerships(p_actor uuid)
RETURNS TABLE(ownership_id uuid, business_type_id uuid, symbol text, name text, description text, purchase_cost bigint, daily_revenue bigint, daily_operating_cost bigint, purchased_at timestamptz, last_settlement_date date)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT ownership.id, business.id, business.symbol, business.name, business.description, business.purchase_cost, business.daily_revenue, business.daily_operating_cost, ownership.purchased_at,
    (SELECT max(settlement.settlement_date) FROM public.virtual_business_settlements AS settlement WHERE settlement.ownership_id=ownership.id)
  FROM public.virtual_business_ownerships AS ownership JOIN public.virtual_business_types AS business ON business.id=ownership.business_type_id
  WHERE ownership.user_id=p_actor ORDER BY ownership.purchased_at DESC, ownership.id DESC
$$;

CREATE OR REPLACE FUNCTION public.business_purchase(p_key uuid, p_actor uuid, p_business_type uuid)
RETURNS TABLE(ownership_id uuid, business_type_id uuid, purchase_cost bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_cash uuid; v_sink uuid; v_cost bigint; v_transaction uuid; v_ownership uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_business_type IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='business purchase identity is required'; END IF;
  SELECT ownership.id, ownership.business_type_id, business.purchase_cost, ownership.purchase_transaction_id
  INTO v_ownership, business_type_id, purchase_cost, transaction_id
  FROM public.virtual_business_ownerships AS ownership JOIN public.virtual_business_types AS business ON business.id=ownership.business_type_id
  WHERE ownership.purchase_idempotency_key=p_key;
  IF FOUND THEN ownership_id:=v_ownership; replayed:=true; RETURN NEXT; RETURN; END IF;
  SELECT business.purchase_cost INTO v_cost FROM public.virtual_business_types AS business WHERE business.id=p_business_type AND business.active FOR KEY SHARE;
  IF v_cost IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='business is unavailable'; END IF;
  PERFORM ownership.id FROM public.virtual_business_ownerships AS ownership WHERE ownership.user_id=p_actor AND ownership.business_type_id=p_business_type FOR UPDATE;
  IF FOUND THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='business is already owned'; END IF;
  SELECT account.id INTO v_cash FROM public.accounts AS account WHERE account.owner_user_id=p_actor AND account.account_type='USER_CASH'::public.account_type AND account.status='active'::public.account_status FOR UPDATE;
  SELECT account.id INTO v_sink FROM public.accounts AS account WHERE account.system_key='sink' AND account.account_type='SINK'::public.account_type AND account.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_sink IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active business accounts required'; END IF;
  SELECT public.economy_post_transaction(p_key,'BUSINESS_PURCHASE',p_actor,NULL,
    jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_cost,'direction','credit'),jsonb_build_object('accountId',v_sink,'amount',v_cost,'direction','debit')),
    'business.purchased',jsonb_build_object('businessTypeId',p_business_type,'cost',v_cost)) INTO v_transaction;
  INSERT INTO public.virtual_business_ownerships(user_id,business_type_id,purchase_idempotency_key,purchase_transaction_id)
    VALUES(p_actor,p_business_type,p_key,v_transaction) RETURNING id INTO v_ownership;
  RETURN QUERY SELECT v_ownership,p_business_type,v_cost,v_transaction,false;
END;
$$;

CREATE OR REPLACE FUNCTION public.business_settle_daily(p_key uuid, p_actor uuid, p_ownership uuid)
RETURNS TABLE(ownership_id uuid, settlement_date date, gross_revenue bigint, operating_cost bigint, net_amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_cash uuid; v_mint uuid; v_sink uuid; v_date date := (clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date; v_gross bigint; v_cost bigint; v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_ownership IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='business settlement identity is required'; END IF;
  SELECT settlement.ownership_id, settlement.settlement_date, settlement.gross_revenue, settlement.operating_cost, settlement.net_amount, settlement.transaction_id
  INTO ownership_id, settlement_date, gross_revenue, operating_cost, net_amount, transaction_id
  FROM public.virtual_business_settlements AS settlement WHERE settlement.idempotency_key=p_key;
  IF FOUND THEN replayed:=true; RETURN NEXT; RETURN; END IF;
  SELECT business.daily_revenue, business.daily_operating_cost INTO v_gross,v_cost
  FROM public.virtual_business_ownerships AS ownership JOIN public.virtual_business_types AS business ON business.id=ownership.business_type_id
  WHERE ownership.id=p_ownership AND ownership.user_id=p_actor FOR UPDATE OF ownership, business;
  IF v_gross IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='business ownership is unavailable'; END IF;
  IF EXISTS(SELECT 1 FROM public.virtual_business_settlements AS settlement WHERE settlement.ownership_id=p_ownership AND settlement.settlement_date=v_date) THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='daily settlement already claimed'; END IF;
  SELECT account.id INTO v_cash FROM public.accounts AS account WHERE account.owner_user_id=p_actor AND account.account_type='USER_CASH'::public.account_type AND account.status='active'::public.account_status FOR UPDATE;
  SELECT account.id INTO v_mint FROM public.accounts AS account WHERE account.system_key='mint' AND account.account_type='MINT'::public.account_type AND account.status='active'::public.account_status FOR UPDATE;
  SELECT account.id INTO v_sink FROM public.accounts AS account WHERE account.system_key='sink' AND account.account_type='SINK'::public.account_type AND account.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_mint IS NULL OR v_sink IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active business accounts required'; END IF;
  SELECT public.economy_post_transaction(p_key,'BUSINESS_SETTLEMENT',p_actor,NULL,
    jsonb_build_array(
      jsonb_build_object('accountId',v_cash,'amount',v_gross,'direction','debit'), jsonb_build_object('accountId',v_mint,'amount',v_gross,'direction','credit'),
      jsonb_build_object('accountId',v_cash,'amount',v_cost,'direction','credit'), jsonb_build_object('accountId',v_sink,'amount',v_cost,'direction','debit')
    ), 'business.daily_settled',jsonb_build_object('ownershipId',p_ownership,'grossRevenue',v_gross,'operatingCost',v_cost)) INTO v_transaction;
  INSERT INTO public.virtual_business_settlements(ownership_id,settlement_date,idempotency_key,gross_revenue,operating_cost,net_amount,transaction_id)
    VALUES(p_ownership,v_date,p_key,v_gross,v_cost,v_gross-v_cost,v_transaction);
  RETURN QUERY SELECT p_ownership,v_date,v_gross,v_cost,v_gross-v_cost,v_transaction,false;
END;
$$;

ALTER FUNCTION public.business_catalog() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.business_my_ownerships(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.business_purchase(uuid,uuid,uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.business_settle_daily(uuid,uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON public.virtual_business_types, public.virtual_business_ownerships, public.virtual_business_settlements FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.business_catalog(), public.business_my_ownerships(uuid), public.business_purchase(uuid,uuid,uuid), public.business_settle_daily(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.business_catalog(), public.business_my_ownerships(uuid), public.business_purchase(uuid,uuid,uuid), public.business_settle_daily(uuid,uuid,uuid) TO moneyverse_app;
