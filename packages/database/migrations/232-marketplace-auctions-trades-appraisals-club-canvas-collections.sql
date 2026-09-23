-- 232-marketplace-auctions-trades-appraisals-club-canvas-collections.sql
-- Update version: v2026.09.23.396
-- P0: Complete Player Marketplace (English Auctions, P2P 1:1 Trades, Appraisal Service), Clubhouse Canvas, and Collections Hub.

BEGIN;

-- 1. Base Marketplace Listings (P0 Fixed Price Listings if not exists)
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  item_code text NOT NULL,
  item_name text NOT NULL,
  category text NOT NULL DEFAULT 'misc',
  rarity text NOT NULL DEFAULT 'COMMON',
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_wld numeric(20, 4) NOT NULL CHECK (price_wld > 0),
  listing_fee_wld numeric(20, 4) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESERVED', 'SETTLED', 'CANCELLED', 'EXPIRED')),
  description text NOT NULL DEFAULT '',
  buyer_id uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  settled_at timestamptz,
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON public.marketplace_listings(seller_id);

-- 2. Real-Time English Auctions Table
CREATE TABLE IF NOT EXISTS public.marketplace_auctions (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  seller_name text NOT NULL DEFAULT '시민',
  item_code text NOT NULL,
  item_name text NOT NULL,
  category text NOT NULL DEFAULT 'misc',
  rarity text NOT NULL DEFAULT 'RARE' CHECK (rarity IN ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  start_price_wld numeric(20, 4) NOT NULL CHECK (start_price_wld > 0),
  current_bid_wld numeric(20, 4) NOT NULL CHECK (current_bid_wld >= start_price_wld),
  highest_bidder_id uuid REFERENCES public.users(id),
  highest_bidder_name text,
  bid_count integer NOT NULL DEFAULT 0,
  buy_now_price_wld numeric(20, 4),
  ends_at timestamptz NOT NULL,
  is_extended boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SETTLED', 'CANCELLED', 'EXPIRED')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  settled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_marketplace_auctions_status ON public.marketplace_auctions(status, ends_at ASC);
CREATE INDEX IF NOT EXISTS idx_marketplace_auctions_seller ON public.marketplace_auctions(seller_id);

-- 3. Auction Bids History Table
CREATE TABLE IF NOT EXISTS public.marketplace_auction_bids (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.marketplace_auctions(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  bidder_name text NOT NULL,
  bid_amount_wld numeric(20, 4) NOT NULL CHECK (bid_amount_wld > 0),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_auction_bids_auction ON public.marketplace_auction_bids(auction_id, created_at DESC);

-- 4. P2P 1:1 Direct Trades (Dual Sign-Off Escrow)
CREATE TABLE IF NOT EXISTS public.marketplace_p2p_trades (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  sender_name text NOT NULL,
  recipient_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  recipient_name text NOT NULL,
  offered_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  offered_wld numeric(20, 4) NOT NULL DEFAULT 0,
  requested_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  requested_wld numeric(20, 4) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'ACCEPTED_BY_PEER', 'COMPLETED', 'CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  completed_at timestamptz,
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_marketplace_p2p_trades_users ON public.marketplace_p2p_trades(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_p2p_trades_status ON public.marketplace_p2p_trades(status, created_at DESC);

-- 5. System Appraisal Certificates Table
CREATE TABLE IF NOT EXISTS public.marketplace_appraisal_certificates (
  cert_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  item_id text NOT NULL,
  item_name text NOT NULL,
  rarity text NOT NULL,
  appraised_value_wld numeric(20, 4) NOT NULL,
  fair_band_p25 numeric(20, 4) NOT NULL,
  fair_band_p75 numeric(20, 4) NOT NULL,
  provenance_author text NOT NULL,
  crafted_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  appraised_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  cert_hash text NOT NULL,
  fee_paid_wld numeric(20, 4) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appraisal_certs_user ON public.marketplace_appraisal_certificates(user_id, appraised_at DESC);

-- 6. Clubhouse 12x12 Collaborative Canvas Persistence Table
CREATE TABLE IF NOT EXISTS public.club_canvases (
  club_id uuid PRIMARY KEY REFERENCES public.clubs(id) ON DELETE CASCADE,
  grid jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_score integer NOT NULL DEFAULT 0,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- 7. User Collections & Ownership Curation Ladder Hub
CREATE TABLE IF NOT EXISTS public.user_collections (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  code text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  provenance text NOT NULL,
  icon text NOT NULL DEFAULT '🏛️',
  is_favorite boolean NOT NULL DEFAULT false,
  user_note text NOT NULL DEFAULT '',
  acquired_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CONSTRAINT uq_user_collection UNIQUE (user_id, code)
);

CREATE INDEX IF NOT EXISTS idx_user_collections_user ON public.user_collections(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_curation_progress (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  ladder_step integer NOT NULL DEFAULT 1 CHECK (ladder_step BETWEEN 1 AND 7),
  timeline_day text NOT NULL DEFAULT 'D7' CHECK (timeline_day IN ('D1', 'D3', 'D7')),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- =========================================================================
-- Helper Functions & Procedures
-- =========================================================================

-- Helper 1: marketplace_create_listing
CREATE OR REPLACE FUNCTION public.marketplace_create_listing(
  p_actor uuid,
  p_item_code text,
  p_quantity integer,
  p_price_wld text,
  p_idempotency_key text,
  p_description text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_listing_id uuid;
  v_fee numeric;
  v_price numeric;
  v_user_account_id uuid;
  v_sink_account_id uuid;
  v_available numeric;
BEGIN
  IF p_actor IS NULL OR p_item_code IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid listing arguments';
  END IF;

  v_price := p_price_wld::numeric;
  IF v_price <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'price must be positive';
  END IF;

  -- listing_fee = max(25, ceil(price * 0.001))
  v_fee := GREATEST(25::numeric, CEIL(v_price * 0.001));

  -- Lock user cash balance
  SELECT a.id, b.available_amount::numeric INTO v_user_account_id, v_available
  FROM public.accounts a
  JOIN public.account_balances b ON b.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_user_account_id IS NULL OR v_available < v_fee THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'insufficient balance for listing fee';
  END IF;

  SELECT a.id INTO v_sink_account_id
  FROM public.accounts a
  WHERE a.account_type = 'SINK'::public.account_type AND a.status = 'active'::public.account_status
  LIMIT 1;

  -- Deduct fee and credit sink
  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric - v_fee), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_user_account_id;

  IF v_sink_account_id IS NOT NULL THEN
    UPDATE public.account_balances
    SET available_amount = (available_amount::numeric + v_fee), updated_at = pg_catalog.clock_timestamp()
    WHERE account_id = v_sink_account_id;
  END IF;

  INSERT INTO public.marketplace_listings (
    seller_id, item_code, item_name, category, rarity, quantity,
    price_wld, listing_fee_wld, status, description
  ) VALUES (
    p_actor, p_item_code, p_item_code, 'crafting', 'UNCOMMON', p_quantity,
    v_price, v_fee, 'ACTIVE', COALESCE(p_description, '')
  ) RETURNING id INTO v_listing_id;

  RETURN v_listing_id;
END;
$$;

-- Helper 2: marketplace_buy_listing
CREATE OR REPLACE FUNCTION public.marketplace_buy_listing(
  p_actor uuid,
  p_listing_id uuid,
  p_idempotency_key text
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_listing record;
  v_buyer_account_id uuid;
  v_seller_account_id uuid;
  v_sink_account_id uuid;
  v_buyer_available numeric;
  v_fee numeric;
  v_seller_net numeric;
BEGIN
  IF p_actor IS NULL OR p_listing_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid buy arguments';
  END IF;

  SELECT * INTO v_listing
  FROM public.marketplace_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'listing not found';
  END IF;

  IF v_listing.status != 'ACTIVE' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'listing is not active';
  END IF;

  IF v_listing.seller_id = p_actor THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'cannot buy own listing';
  END IF;

  -- sale_fee = ceil(price * 0.01)
  v_fee := CEIL(v_listing.price_wld * 0.01);
  v_seller_net := v_listing.price_wld - v_fee;

  -- Buyer balance
  SELECT a.id, b.available_amount::numeric INTO v_buyer_account_id, v_buyer_available
  FROM public.accounts a
  JOIN public.account_balances b ON b.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_buyer_account_id IS NULL OR v_buyer_available < v_listing.price_wld THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'insufficient cash balance';
  END IF;

  -- Seller balance
  SELECT a.id INTO v_seller_account_id
  FROM public.accounts a
  WHERE a.owner_user_id = v_listing.seller_id AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
  FOR UPDATE;

  -- Sink account
  SELECT a.id INTO v_sink_account_id
  FROM public.accounts a
  WHERE a.account_type = 'SINK'::public.account_type AND a.status = 'active'::public.account_status
  LIMIT 1;

  -- Deduct buyer full price
  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric - v_listing.price_wld), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_buyer_account_id;

  -- Credit seller net
  IF v_seller_account_id IS NOT NULL THEN
    UPDATE public.account_balances
    SET available_amount = (available_amount::numeric + v_seller_net), updated_at = pg_catalog.clock_timestamp()
    WHERE account_id = v_seller_account_id;
  END IF;

  -- Credit sink fee
  IF v_sink_account_id IS NOT NULL THEN
    UPDATE public.account_balances
    SET available_amount = (available_amount::numeric + v_fee), updated_at = pg_catalog.clock_timestamp()
    WHERE account_id = v_sink_account_id;
  END IF;

  -- Update listing to SETTLED
  UPDATE public.marketplace_listings
  SET status = 'SETTLED', buyer_id = p_actor, settled_at = pg_catalog.clock_timestamp()
  WHERE id = p_listing_id;

  RETURN p_listing_id;
END;
$$;

-- Helper 3: marketplace_cancel_listing
CREATE OR REPLACE FUNCTION public.marketplace_cancel_listing(
  p_actor uuid,
  p_listing_id uuid
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_listing record;
BEGIN
  SELECT * INTO v_listing
  FROM public.marketplace_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'listing not found';
  END IF;

  IF v_listing.seller_id != p_actor THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'not the owner of listing';
  END IF;

  IF v_listing.status != 'ACTIVE' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'cannot cancel non-active listing';
  END IF;

  UPDATE public.marketplace_listings
  SET status = 'CANCELLED', cancelled_at = pg_catalog.clock_timestamp()
  WHERE id = p_listing_id;

  RETURN true;
END;
$$;

-- Helper 4: marketplace_bid_auction (English Auction Bid with Escrow Refund & Anti-Sniping)
CREATE OR REPLACE FUNCTION public.marketplace_bid_auction(
  p_actor uuid,
  p_actor_name text,
  p_auction_id uuid,
  p_bid_wld text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_auc record;
  v_bid_numeric numeric;
  v_buyer_account_id uuid;
  v_prev_bidder_account_id uuid;
  v_buyer_available numeric;
  v_is_extended boolean := false;
  v_new_ends_at timestamptz;
  v_remaining_secs double precision;
BEGIN
  IF p_actor IS NULL OR p_auction_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid auction bid arguments';
  END IF;

  v_bid_numeric := p_bid_wld::numeric;

  SELECT * INTO v_auc
  FROM public.marketplace_auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'auction not found';
  END IF;

  IF v_auc.status != 'ACTIVE' OR v_auc.ends_at <= pg_catalog.clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'auction has ended or is inactive';
  END IF;

  IF v_auc.seller_id = p_actor THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'seller cannot bid on own auction';
  END IF;

  IF v_bid_numeric <= v_auc.current_bid_wld THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'bid must be higher than current highest bid';
  END IF;

  -- Lock current bidder balance
  SELECT a.id, b.available_amount::numeric INTO v_buyer_account_id, v_buyer_available
  FROM public.accounts a
  JOIN public.account_balances b ON b.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_buyer_account_id IS NULL OR v_buyer_available < v_bid_numeric THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'insufficient balance for auction bid';
  END IF;

  -- If previous highest bidder exists, refund previous bid 100% immediately
  IF v_auc.highest_bidder_id IS NOT NULL AND v_auc.highest_bidder_id != p_actor THEN
    SELECT a.id INTO v_prev_bidder_account_id
    FROM public.accounts a
    WHERE a.owner_user_id = v_auc.highest_bidder_id AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
    FOR UPDATE;

    IF v_prev_bidder_account_id IS NOT NULL THEN
      UPDATE public.account_balances
      SET available_amount = (available_amount::numeric + v_auc.current_bid_wld), updated_at = pg_catalog.clock_timestamp()
      WHERE account_id = v_prev_bidder_account_id;
    END IF;
  END IF;

  -- Deduct new bid from actor
  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric - v_bid_numeric), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_buyer_account_id;

  -- Check Anti-Sniping: if remaining time < 30 seconds, extend by 60 seconds
  v_remaining_secs := EXTRACT(EPOCH FROM (v_auc.ends_at - pg_catalog.clock_timestamp()));
  v_new_ends_at := v_auc.ends_at;
  IF v_remaining_secs < 30 THEN
    v_new_ends_at := v_auc.ends_at + interval '60 seconds';
    v_is_extended := true;
  END IF;

  -- Update auction record
  UPDATE public.marketplace_auctions
  SET current_bid_wld = v_bid_numeric,
      highest_bidder_id = p_actor,
      highest_bidder_name = COALESCE(p_actor_name, '시민'),
      bid_count = bid_count + 1,
      ends_at = v_new_ends_at,
      is_extended = (is_extended OR v_is_extended)
  WHERE id = p_auction_id;

  -- Record bid history
  INSERT INTO public.marketplace_auction_bids (
    auction_id, bidder_id, bidder_name, bid_amount_wld
  ) VALUES (
    p_auction_id, p_actor, COALESCE(p_actor_name, '시민'), v_bid_numeric
  );

  RETURN jsonb_build_object(
    'auctionId', p_auction_id,
    'currentBidWld', v_bid_numeric::text,
    'bidCount', v_auc.bidCount + 1,
    'endsAt', v_new_ends_at,
    'isExtended', (v_auc.is_extended OR v_is_extended)
  );
END;
$$;

-- Seed Sample Auctions if empty
DO $$
DECLARE
  v_sample_user uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.marketplace_auctions LIMIT 1) THEN
    SELECT id INTO v_sample_user FROM public.users ORDER BY created_at ASC LIMIT 1;
    IF v_sample_user IS NOT NULL THEN
      INSERT INTO public.marketplace_auctions (
        seller_id, seller_name, item_code, item_name, category, rarity,
        start_price_wld, current_bid_wld, highest_bidder_id, highest_bidder_name,
        bid_count, buy_now_price_wld, ends_at, description
      ) VALUES
      (
        v_sample_user, '초대총독_알렉스', 'ITEM_TROPHY_FIRST_CAPITAL_GOLD',
        '제1회 First Capital 기념 골드 메달', 'display', 'LEGENDARY',
        5000, 8500, NULL, '월덕헤지펀드', 7, 15000,
        pg_catalog.clock_timestamp() + interval '45 minutes',
        '시즌 1 설립자에게만 단 1개 한정 지급된 영구 보존용 골드 명예 트로피 메달입니다.'
      ),
      (
        v_sample_user, '장인_마스터킴', 'ITEM_FRAME_NEON_CYBER',
        '네온 사이버 하우징 네임플레이트', 'nameplate', 'EPIC',
        2000, 3400, NULL, '희귀템사냥꾼', 5, NULL,
        pg_catalog.clock_timestamp() + interval '18 minutes',
        '클럽하우스 및 개인 룸 출입문에 장착 가능한 네온 애니메이션 특수 네임플레이트.'
      ),
      (
        v_sample_user, '무역상인_박', 'ITEM_BIZ_LOGISTICS_KIT',
        '사업체 고효율 물류 부스트 키트 (대형)', 'business', 'RARE',
        1500, 2100, NULL, '월덕물류협동조합', 4, 4000,
        pg_catalog.clock_timestamp() + interval '4 minutes',
        '가상 사업체 원자재 조달 시 운송비 10%를 영구 감면해 주는 고효율 물류 부스트 모듈.'
      );
    END IF;
  END IF;
END $$;

COMMIT;
