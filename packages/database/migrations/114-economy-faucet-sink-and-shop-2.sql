-- 114-economy-faucet-sink-and-shop-2.sql
-- Store 2.0 (11 Categories, 78 Items), Inventory Equipment, Faucet/Sink Ledger Views

BEGIN;

-- 1. Expand shop_catalog category constraint to 11 categories + existing legacy categories
ALTER TABLE public.shop_catalog DROP CONSTRAINT IF EXISTS shop_catalog_category_check;
ALTER TABLE public.shop_catalog ADD CONSTRAINT shop_catalog_category_check
  CHECK (category = ANY (ARRAY[
    'frame'::text, 'background'::text, 'effect'::text, 'nameplate'::text,
    'title'::text, 'badge'::text, 'season'::text, 'limited'::text,
    'business'::text, 'convenience'::text, 'general'::text,
    'job'::text, 'vehicle'::text, 'luxury'::text
  ]));

-- 2. Add cosmetic & metadata columns to shop_catalog
ALTER TABLE public.shop_catalog
  ADD COLUMN IF NOT EXISTS rarity text NOT NULL DEFAULT 'common',
  ADD COLUMN IF NOT EXISTS animation_css text,
  ADD COLUMN IF NOT EXISTS preview_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS max_stock integer,
  ADD COLUMN IF NOT EXISTS current_stock integer,
  ADD COLUMN IF NOT EXISTS is_limited boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_tradeable boolean NOT NULL DEFAULT true;

ALTER TABLE public.shop_catalog DROP CONSTRAINT IF EXISTS shop_catalog_rarity_check;
ALTER TABLE public.shop_catalog ADD CONSTRAINT shop_catalog_rarity_check
  CHECK (rarity = ANY (ARRAY['common'::text, 'uncommon'::text, 'rare'::text, 'epic'::text, 'legendary'::text, 'mythic'::text]));

-- 3. Enhance user_items table for cosmetic equipment
ALTER TABLE public.user_items
  ADD COLUMN IF NOT EXISTS is_equipped boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS equipped_slot text,
  ADD COLUMN IF NOT EXISTS serial_number integer;

ALTER TABLE public.user_items DROP CONSTRAINT IF EXISTS user_items_equipped_slot_check;
ALTER TABLE public.user_items ADD CONSTRAINT user_items_equipped_slot_check
  CHECK (equipped_slot IS NULL OR equipped_slot = ANY (ARRAY[
    'frame'::text, 'background'::text, 'effect'::text, 'nameplate'::text,
    'title'::text, 'badge_1'::text, 'badge_2'::text, 'badge_3'::text
  ]));

CREATE INDEX IF NOT EXISTS idx_user_items_equipped
  ON public.user_items (user_id, is_equipped) WHERE is_equipped = true;

-- 4. Equipment management SQL function
CREATE OR REPLACE FUNCTION public.inventory_equip_item(
  p_actor uuid,
  p_catalog_id uuid,
  p_slot text,
  p_equip boolean
)
RETURNS TABLE(
  success boolean,
  catalog_id uuid,
  slot text,
  is_equipped boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_owned integer;
  v_category text;
  v_target_slot text;
BEGIN
  -- 1. Check ownership
  SELECT ui.quantity, sc.category INTO v_owned, v_category
  FROM public.user_items ui
  JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
  WHERE ui.user_id = p_actor AND ui.catalog_id = p_catalog_id;

  IF v_owned IS NULL OR v_owned <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'item is not owned by user';
  END IF;

  -- 2. Slot determination
  IF p_slot IS NOT NULL AND p_slot <> '' THEN
    v_target_slot := p_slot;
  ELSE
    IF v_category = 'badge' THEN
      v_target_slot := 'badge_1';
    ELSE
      v_target_slot := v_category;
    END IF;
  END IF;

  IF v_target_slot NOT IN ('frame', 'background', 'effect', 'nameplate', 'title', 'badge_1', 'badge_2', 'badge_3') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid equipment slot';
  END IF;

  IF p_equip THEN
    -- Unequip any existing item in that slot
    UPDATE public.user_items
    SET is_equipped = false, equipped_slot = NULL
    WHERE user_id = p_actor AND equipped_slot = v_target_slot;

    -- Equip the targeted item
    UPDATE public.user_items
    SET is_equipped = true, equipped_slot = v_target_slot
    WHERE user_id = p_actor AND catalog_id = p_catalog_id;

    RETURN QUERY SELECT true, p_catalog_id, v_target_slot, true;
  ELSE
    -- Unequip
    UPDATE public.user_items
    SET is_equipped = false, equipped_slot = NULL
    WHERE user_id = p_actor AND catalog_id = p_catalog_id;

    RETURN QUERY SELECT true, p_catalog_id, v_target_slot, false;
  END IF;
END;
$$;

ALTER FUNCTION public.inventory_equip_item(uuid, uuid, text, boolean) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.inventory_equip_item(uuid, uuid, text, boolean) TO moneyverse_app;

-- 5. User equipped cosmetics composite view function
CREATE OR REPLACE FUNCTION public.profile_get_cosmetics(p_target_user_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT jsonb_build_object(
    'frame', (
      SELECT jsonb_build_object('code', sc.code, 'name', sc.name, 'rarity', sc.rarity, 'animation_css', sc.animation_css, 'preview_data', sc.preview_data)
      FROM public.user_items ui JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
      WHERE ui.user_id = p_target_user_id AND ui.is_equipped = true AND ui.equipped_slot = 'frame' LIMIT 1
    ),
    'background', (
      SELECT jsonb_build_object('code', sc.code, 'name', sc.name, 'rarity', sc.rarity, 'animation_css', sc.animation_css, 'preview_data', sc.preview_data)
      FROM public.user_items ui JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
      WHERE ui.user_id = p_target_user_id AND ui.is_equipped = true AND ui.equipped_slot = 'background' LIMIT 1
    ),
    'effect', (
      SELECT jsonb_build_object('code', sc.code, 'name', sc.name, 'rarity', sc.rarity, 'animation_css', sc.animation_css, 'preview_data', sc.preview_data)
      FROM public.user_items ui JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
      WHERE ui.user_id = p_target_user_id AND ui.is_equipped = true AND ui.equipped_slot = 'effect' LIMIT 1
    ),
    'nameplate', (
      SELECT jsonb_build_object('code', sc.code, 'name', sc.name, 'rarity', sc.rarity, 'animation_css', sc.animation_css, 'preview_data', sc.preview_data)
      FROM public.user_items ui JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
      WHERE ui.user_id = p_target_user_id AND ui.is_equipped = true AND ui.equipped_slot = 'nameplate' LIMIT 1
    ),
    'title', (
      SELECT jsonb_build_object('code', sc.code, 'name', sc.name, 'rarity', sc.rarity)
      FROM public.user_items ui JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
      WHERE ui.user_id = p_target_user_id AND ui.is_equipped = true AND ui.equipped_slot = 'title' LIMIT 1
    ),
    'badges', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('slot', ui.equipped_slot, 'code', sc.code, 'name', sc.name, 'rarity', sc.rarity))
      FROM public.user_items ui JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
      WHERE ui.user_id = p_target_user_id AND ui.is_equipped = true AND ui.equipped_slot LIKE 'badge_%'
    ), '[]'::jsonb)
  );
$$;

ALTER FUNCTION public.profile_get_cosmetics(uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.profile_get_cosmetics(uuid) TO PUBLIC, moneyverse_app;

-- 6. Realtime Economy Faucet / Sink views
CREATE OR REPLACE VIEW public.v_daily_economy_stats AS
WITH daily_postings AS (
  SELECT
    date_trunc('day', p.created_at AT TIME ZONE 'Asia/Seoul')::date AS stat_date,
    a.account_type,
    a.system_key,
    p.direction,
    p.amount
  FROM public.ledger_postings p
  JOIN public.accounts a ON a.id = p.account_id
)
SELECT
  stat_date,
  COALESCE(SUM(CASE WHEN system_key = 'mint' AND direction = 'credit' THEN amount ELSE 0 END), 0) AS faucet_amount,
  COALESCE(SUM(CASE WHEN system_key = 'sink' AND direction = 'debit' THEN amount ELSE 0 END), 0) AS sink_amount,
  COALESCE(SUM(CASE WHEN system_key = 'treasury' AND direction = 'debit' THEN amount ELSE 0 END), 0) AS tax_amount,
  COALESCE(SUM(CASE WHEN system_key = 'mint' AND direction = 'credit' THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN system_key = 'sink' AND direction = 'debit' THEN amount ELSE 0 END), 0) AS net_change,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN system_key = 'mint' AND direction = 'credit' THEN amount ELSE 0 END), 0) > 0 THEN
      ROUND((COALESCE(SUM(CASE WHEN system_key = 'sink' AND direction = 'debit' THEN amount ELSE 0 END), 0)::numeric / 
             COALESCE(SUM(CASE WHEN system_key = 'mint' AND direction = 'credit' THEN amount ELSE 0 END), 1)::numeric) * 100, 2)
    ELSE 0
  END AS sink_ratio_percent
FROM daily_postings
GROUP BY stat_date
ORDER BY stat_date DESC;

GRANT SELECT ON public.v_daily_economy_stats TO moneyverse_app;

CREATE OR REPLACE VIEW public.v_economy_summary AS
SELECT
  COALESCE((SELECT SUM(amount) FROM public.ledger_postings p JOIN public.accounts a ON a.id = p.account_id WHERE a.system_key = 'mint' AND p.direction = 'credit'), 0) AS total_minted,
  COALESCE((SELECT SUM(amount) FROM public.ledger_postings p JOIN public.accounts a ON a.id = p.account_id WHERE a.system_key = 'sink' AND p.direction = 'debit'), 0) AS total_burned,
  COALESCE((SELECT SUM(amount) FROM public.ledger_postings p JOIN public.accounts a ON a.id = p.account_id WHERE a.account_type = 'USER_CASH' AND p.direction = 'debit') -
           (SELECT SUM(amount) FROM public.ledger_postings p JOIN public.accounts a ON a.id = p.account_id WHERE a.account_type = 'USER_CASH' AND p.direction = 'credit'), 0) AS total_circulating,
  COALESCE((SELECT SUM(amount) FROM public.ledger_postings p JOIN public.accounts a ON a.id = p.account_id WHERE a.system_key = 'mint' AND p.direction = 'credit' AND p.created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Seoul')), 0) AS today_minted,
  COALESCE((SELECT SUM(amount) FROM public.ledger_postings p JOIN public.accounts a ON a.id = p.account_id WHERE a.system_key = 'sink' AND p.direction = 'debit' AND p.created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Seoul')), 0) AS today_burned;

GRANT SELECT ON public.v_economy_summary TO moneyverse_app;

-- 7. Seed 78 Items (11 Categories)
DO $$
DECLARE
  v_cat record;
BEGIN
  -- We define the 78 items in a JSON array and unpack
  FOR v_cat IN
    SELECT * FROM jsonb_to_recordset('[
      {"code":"frame_neon_cyber","name":"네온 사이버","description":"사이버펑크 네온 블루와 핑크빛이 교차하는 미래형 아바타 프레임","category":"frame","price":2500,"rarity":"rare","css":"frame-neon-cyber","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#00f0ff","glow":"#ff007f"}},
      {"code":"frame_gold_dragon","name":"황금 용의 위엄","description":"전설적인 황금빛 용 비늘과 골드 오라가 아바타를 감싸는 최고급 프레임","category":"frame","price":20000,"rarity":"legendary","css":"frame-gold-dragon","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#ffd700","glow":"#ffaa00"}},
      {"code":"frame_moonlight_crystal","name":"달빛 크리스탈","description":"신비로운 달빛을 머금은 은빛 보석 테두리","category":"frame","price":8000,"rarity":"epic","css":"frame-moonlight-crystal","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#a8e6cf","glow":"#ffffff"}},
      {"code":"frame_retro_pixel","name":"레트로 픽셀","description":"80년대 아케이드 오락실 느낌의 정겨운 도트 프레임","category":"frame","price":1200,"rarity":"uncommon","css":"frame-retro-pixel","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#48dbfb","glow":"#0abde3"}},
      {"code":"frame_inferno_flame","name":"불꽃의 숨결","description":"타오르는 진홍빛 화염이 솟구치는 열정적인 테두리","category":"frame","price":3500,"rarity":"rare","css":"frame-inferno-flame","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#ff4757","glow":"#ffa502"}},
      {"code":"frame_cherry_blossom","name":"벚꽃 엔딩","description":"은은한 핑크빛 꽃잎이 테두리 주위를 맴도는 서정적 프레임","category":"frame","price":1500,"rarity":"uncommon","css":"frame-cherry-blossom","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#ff9ff3","glow":"#feca57"}},
      {"code":"frame_obsidian_armor","name":"흑요석 아머","description":"단단한 다크 메탈과 보랏빛 흑요석 광채의 프레임","category":"frame","price":4000,"rarity":"rare","css":"frame-obsidian-armor","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#57606f","glow":"#70a1ff"}},
      {"code":"frame_diamond_tiara","name":"다이아몬드 티아라","description":"찬란하게 반짝이는 다이아몬드 보석 왕관 프레임","category":"frame","price":25000,"rarity":"legendary","css":"frame-diamond-tiara","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#e0f7fa","glow":"#80deea"}},
      {"code":"frame_ocean_wave","name":"심해의 파도","description":"푸른 바다의 파도 물결이 살아 움직이는 듯한 프레임","category":"frame","price":1800,"rarity":"uncommon","css":"frame-ocean-wave","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#00d2d3","glow":"#54a0ff"}},
      {"code":"frame_galaxy_ring","name":"은하수 링","description":"아바타 주위를 회전하는 우주 성운과 별자리 고리","category":"frame","price":9500,"rarity":"epic","css":"frame-galaxy-ring","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#5f27cd","glow":"#341f97"}},

      {"code":"bg_cyberpunk_2099","name":"사이버펑크 2099","description":"네온 빛 마천루와 비 내리는 첨단 메트로폴리스 야경","category":"background","price":6000,"rarity":"epic","css":"bg-cyberpunk-2099","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #0f0c29, #302b63, #24243e)"}},
      {"code":"bg_moonlight_lake","name":"달빛 호수","description":"잔잔한 호수 수면에 비친 보름달과 안개","category":"background","price":3000,"rarity":"rare","css":"bg-moonlight-lake","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #141e30, #243b55)"}},
      {"code":"bg_golden_vault","name":"황금빛 금고실","description":"WLD 골드바와 보물상자가 가득 채워진 중앙은행 금고실","category":"background","price":18000,"rarity":"legendary","css":"bg-golden-vault","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #f7971e, #ffd200)"}},
      {"code":"bg_neon_shinjuku","name":"네온 신주쿠","description":"도심 빌딩의 화려한 네온 간판과 레트로 사이버 감성","category":"background","price":3200,"rarity":"rare","css":"bg-neon-shinjuku","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #2b5876, #4e4376)"}},
      {"code":"bg_deep_space","name":"은하수 우주","description":"끝없는 심우주와 찬란한 보랏빛 은하수 성운","category":"background","price":7500,"rarity":"epic","css":"bg-deep-space","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #000428, #004e92)"}},
      {"code":"bg_mystic_forest","name":"신비로운 숲","description":"반딧불이가 춤추는 고요한 마법의 숲","category":"background","price":1600,"rarity":"uncommon","css":"bg-mystic-forest","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #134e5e, #71b280)"}},
      {"code":"bg_retro_arcade","name":"레트로 아케이드","description":"80년대 CRT 모니터와 픽셀 게임 센터 분위기","category":"background","price":1400,"rarity":"uncommon","css":"bg-retro-arcade","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #1f4037, #99f2c8)"}},
      {"code":"bg_steampunk_workshop","name":"스팀펑크 공방","description":"황동 톱니바퀴와 증기 파이프가 얽힌 장인의 공방","category":"background","price":4200,"rarity":"rare","css":"bg-steampunk-workshop","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)"}},
      {"code":"bg_blazing_battlefield","name":"불타는 전장","description":"타오르는 용암과 붉은 노을이 펼쳐진 전장","category":"background","price":3800,"rarity":"rare","css":"bg-blazing-battlefield","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #ed213a, #93291e)"}},
      {"code":"bg_pixel_dungeon","name":"픽셀 던전","description":"고전 RPG 던전의 돌벽과 횃불 조명","category":"background","price":1100,"rarity":"uncommon","css":"bg-pixel-dungeon","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #232526, #414345)"}},

      {"code":"fx_sparkle_stars","name":"반짝이는 별무리","description":"아바타 주위에서 끊임없이 생성되는 황금빛 별가루","category":"effect","price":1800,"rarity":"uncommon","css":"fx-sparkle-stars","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"particle","color":"#ffd700"}},
      {"code":"fx_swirling_aura","name":"휘몰아치는 오라","description":"신비로운 푸른색 마력 파동이 부드럽게 소용돌이침","category":"effect","price":3500,"rarity":"rare","css":"fx-swirling-aura","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"aura","color":"#00d2d3"}},
      {"code":"fx_spark_lightning","name":"스파크 번개","description":"짜릿한 전기 스파크가 간헐적으로 방출됨","category":"effect","price":4000,"rarity":"rare","css":"fx-spark-lightning","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"lightning","color":"#fbc531"}},
      {"code":"fx_cherry_petals","name":"벚꽃 잎날림","description":"바람에 실려 흩날리는 분홍빛 벚꽃 잎 파티클","category":"effect","price":1500,"rarity":"uncommon","css":"fx-cherry-petals","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"petal","color":"#ff9ff3"}},
      {"code":"fx_dark_flame","name":"다크 플레임","description":"아래에서 위로 일렁이며 솟아오르는 흑자색 불꽃","category":"effect","price":8500,"rarity":"epic","css":"fx-dark-flame","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"flame","color":"#8c7ae6"}},
      {"code":"fx_holy_halo","name":"신성한 빛무리","description":"머리 위에 떠오르는 성스러운 엔젤 헤일로 링","category":"effect","price":15000,"rarity":"legendary","css":"fx-holy-halo","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"halo","color":"#f5cd79"}},
      {"code":"fx_neon_glitch","name":"네온 글리치","description":"RGB 색수차 디지털 노이즈와 글리치 효과","category":"effect","price":7000,"rarity":"epic","css":"fx-neon-glitch","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"glitch","color":"#e056fd"}},
      {"code":"fx_heart_bubble","name":"하트 버블","description":"사랑스러운 핑크빛 하트 방울이 퐁퐁 솟아오름","category":"effect","price":1200,"rarity":"uncommon","css":"fx-heart-bubble","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"bubble","color":"#ff7979"}},

      {"code":"np_golden_banner","name":"황금빛 명찰","description":"고급스러운 금박 테두리와 부드러운 골드 하이라이트","category":"nameplate","price":3000,"rarity":"rare","css":"np-golden-banner","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#ffd700","bg":"rgba(255,215,0,0.15)"}},
      {"code":"np_neon_hologram","name":"네온 홀로그램","description":"사이버네틱 반투명 청록색 홀로그램 명패","category":"nameplate","price":6500,"rarity":"epic","css":"np-neon-hologram","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#00ffff","bg":"rgba(0,255,255,0.15)"}},
      {"code":"np_retro_arcade","name":"레트로 명찰","description":"도트 폰트와 픽셀 박스로 구성된 클래식 명패","category":"nameplate","price":1200,"rarity":"uncommon","css":"np-retro-arcade","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#4cd137","bg":"rgba(76,209,55,0.15)"}},
      {"code":"np_dark_iron","name":"흑철 배너","description":"묵직한 흑철 질감과 음각 각인이 새겨진 명패","category":"nameplate","price":1500,"rarity":"uncommon","css":"np-dark-iron","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#718093","bg":"rgba(113,128,147,0.2)"}},
      {"code":"np_cyber_badge","name":"사이버 뱃지","description":"기판 회로 라인이 흐르는 미래지향적 명패","category":"nameplate","price":3500,"rarity":"rare","css":"np-cyber-badge","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#8c7ae6","bg":"rgba(140,122,230,0.15)"}},
      {"code":"np_royal_scroll","name":"왕실 양피지","description":"고풍스러운 왕가 인장과 금박 리본 명패","category":"nameplate","price":12000,"rarity":"legendary","css":"np-royal-scroll","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#e1b12c","bg":"rgba(225,177,44,0.2)"}},
      {"code":"np_fire_crest","name":"불꽃 엠블럼","description":"타오르는 불꽃 테두리와 불사조 깃털 명패","category":"nameplate","price":4000,"rarity":"rare","css":"np-fire-crest","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#e84118","bg":"rgba(232,65,24,0.15)"}},
      {"code":"np_diamond_plate","name":"다이아몬드 플레이트","description":"빛을 굴절시키는 프리즘 크리스탈 명패","category":"nameplate","price":30000,"rarity":"mythic","css":"np-diamond-plate","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#dff9fb","bg":"rgba(223,249,251,0.25)"}},

      {"code":"title_pioneer","name":"[월덕의 개척자]","description":"머니버스 초기 경제 생태계를 함께 일군 선구자 칭호","category":"title","price":1000,"rarity":"uncommon","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[월덕의 개척자]","color":"#4cd137"}},
      {"code":"title_gold_master","name":"[골드 마스터]","description":"풍부한 WLD 자산을 운용하는 자산가의 품격","category":"title","price":10000,"rarity":"epic","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[골드 마스터]","color":"#ffd700"}},
      {"code":"title_moonlight_wanderer","name":"[달빛의 방랑자]","description":"고요한 밤하늘을 유영하는 신비로운 여행자","category":"title","price":3000,"rarity":"rare","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[달빛의 방랑자]","color":"#00d2d3"}},
      {"code":"title_economy_baron","name":"[가상경제의 거물]","description":"월덕 머니버스의 시장 흐름을 쥐고 흔드는 대부호","category":"title","price":25000,"rarity":"legendary","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[가상경제의 거물]","color":"#ffa502"}},
      {"code":"title_lucky_gambler","name":"[행운의 승부사]","description":"카지노 럭키존에서 승리를 거머쥔 담대한 승부사","category":"title","price":4500,"rarity":"rare","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[행운의 승부사]","color":"#ff4757"}},
      {"code":"title_diligent_worker","name":"[성실한 노동자]","description":"매일매일 퀘스트와 노동을 묵묵히 수행한 근면의 상징","category":"title","price":500,"rarity":"common","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[성실한 노동자]","color":"#a4b0be"}},
      {"code":"title_legendary_collector","name":"[전설의 컬렉터]","description":"상점의 진귀한 보물들을 수집하는 감정가","category":"title","price":12000,"rarity":"epic","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[전설의 컬렉터]","color":"#9b59b6"}},
      {"code":"title_night_walker","name":"[밤을 걷는 자]","description":"모두가 잠든 새벽에도 머니버스를 지키는 파수꾼","category":"title","price":2800,"rarity":"rare","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[밤을 걷는 자]","color":"#57606f"}},
      {"code":"title_money_maker","name":"[머니 메이커]","description":"모든 활동을 수익으로 치환하는 자본주의의 총아","category":"title","price":5000,"rarity":"rare","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[머니 메이커]","color":"#2ed573"}},
      {"code":"title_eternal_patron","name":"[영원한 후원자]","description":"머니버스 커뮤니티의 번영을 영구히 지지하는 대수호자","category":"title","price":50000,"rarity":"legendary","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[영원한 후원자]","color":"#e056fd"}},

      {"code":"badge_early_adopter","name":"얼리 어답터","description":"초기 오픈 멤버에게 수여되는 기념 배지","category":"badge","price":1000,"rarity":"uncommon","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"🌱","color":"#2ed573"}},
      {"code":"badge_million_club","name":"100만 WLD 클럽","description":"누적 자산 100만 WLD를 돌파한 부유층의 상징","category":"badge","price":20000,"rarity":"legendary","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"💰","color":"#ffd700"}},
      {"code":"badge_stock_expert","name":"주식 투자왕","description":"거래소에서 탁월한 안목으로 수익을 낸 투자 전문가","category":"badge","price":8000,"rarity":"epic","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"📈","color":"#ff4757"}},
      {"code":"badge_lucky_star","name":"카지노 럭키스타","description":"연속 당첨의 기적을 기록한 행운의 별","category":"badge","price":3500,"rarity":"rare","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"⭐","color":"#ffa502"}},
      {"code":"badge_perfect_day","name":"완벽한 하루","description":"일일 모든 퀘스트와 출석을 100% 달성한 증표","category":"badge","price":1500,"rarity":"uncommon","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"🎯","color":"#1e90ff"}},
      {"code":"badge_shop_enthusiast","name":"상점 애호가","description":"상점에서 10종 이상의 물품을 구매한 고객 배지","category":"badge","price":1200,"rarity":"uncommon","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"🛍️","color":"#ff6b81"}},
      {"code":"badge_community_guardian","name":"커뮤니티 수호자","description":"게시판과 로비의 건전한 대화를 이끄는 수호자","category":"badge","price":4000,"rarity":"rare","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"🛡️","color":"#70a1ff"}},
      {"code":"badge_iron_will","name":"불굴의 의지","description":"어떤 경제 위기에도 흔들리지 않는 굳은 의지","category":"badge","price":3000,"rarity":"rare","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"⚓","color":"#747d8c"}},
      {"code":"badge_golden_key","name":"황금 열쇠","description":"머니버스의 모든 비밀 문을 여는 특권의 상징","category":"badge","price":10000,"rarity":"epic","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"🗝️","color":"#eccc68"}},
      {"code":"badge_diamond_hands","name":"다이아몬드 핸드","description":"절대 패닉 셀하지 않는 전설적인 강심장 투자자","category":"badge","price":35000,"rarity":"mythic","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"💎","color":"#70edff"}},

      {"code":"season1_moon_cape","name":"달빛 망토","description":"시즌 1 Moonlight 패스 한정 치장 망토","category":"season","price":9000,"rarity":"epic","css":"fx-moon-cape","limit":"account_one","kind":"decoration","stock":null,"preview":{"icon":"🌙","color":"#a8e6cf"}},
      {"code":"season1_fullmoon_frame","name":"보름달 테두리","description":"시즌 1 완주자를 위해 은은한 달빛이 깃든 액자","category":"season","price":11000,"rarity":"epic","css":"frame-fullmoon","limit":"account_one","kind":"decoration","stock":null,"preview":{"border":"#ffffff","glow":"#a8e6cf"}},
      {"code":"season1_rabbit_effect","name":"달빛 토끼 이펙트","description":"달에서 방아 찧는 토끼와 별똥별이 쏟아지는 효과","category":"season","price":5500,"rarity":"rare","css":"fx-lunar-rabbit","limit":"account_one","kind":"decoration","stock":null,"preview":{"type":"rabbit","color":"#ffcccc"}},
      {"code":"season1_lunar_emperor_title","name":"[월광의 지배자]","description":"시즌 1 최상위 랭커를 기리는 위엄 있는 칭호","category":"season","price":18000,"rarity":"legendary","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"text":"[월광의 지배자]","color":"#dff9fb"}},
      {"code":"season1_crescent_badge","name":"초승달 뱃지","description":"시즌 1 참가 기념 초승달 문양 뱃지","category":"season","price":4500,"rarity":"rare","css":null,"limit":"account_one","kind":"display","stock":null,"preview":{"icon":"🌘","color":"#f1f2f6"}},
      {"code":"season1_lunar_city_bg","name":"달빛 도시 배경","description":"달 표면에 건설된 미래형 돔 시티 야경 배경","category":"season","price":8500,"rarity":"epic","css":"bg-lunar-city","limit":"account_one","kind":"decoration","stock":null,"preview":{"gradient":"linear-gradient(135deg, #090979, #00d4ff)"}},

      {"code":"ltd_founders_pocketwatch","name":"창립자의 황금 회중시계","description":"전 서버 100개 한정 발행! 고유 시리얼 넘버가 영구 각인되는 창립 기념품","category":"limited","price":100000,"rarity":"mythic","css":"fx-gold-pocketwatch","limit":"limited","kind":"display","stock":100,"preview":{"icon":"⏱️","serial":true}},
      {"code":"ltd_starlight_pendant","name":"오리온의 별빛 펜던트","description":"전 서버 50개 한정 발행! 영롱한 성운 빛을 담은 최상위 컬렉터의 보석","category":"limited","price":150000,"rarity":"mythic","css":"fx-star-pendant","limit":"limited","kind":"display","stock":50,"preview":{"icon":"✨","serial":true}},
      {"code":"ltd_moneyverse_genesis_cert","name":"머니버스 제1호 인증서","description":"전 서버 단 10개 한정! 머니버스 경제 헌장을 기리는 불멸의 황금 인증서","category":"limited","price":500000,"rarity":"mythic","css":"fx-genesis-cert","limit":"limited","kind":"display","stock":10,"preview":{"icon":"📜","serial":true}},

      {"code":"biz_cvs_license","name":"24시 편의점 개설권","description":"동네 상권에 편의점을 창업할 수 있는 정식 사업자 라이선스","category":"business","price":30000,"rarity":"rare","css":null,"limit":"once","kind":"convenience","stock":null,"preview":{"icon":"🏪"}},
      {"code":"biz_farm_license","name":"유기농 농장 설립권","description":"교외 부지에 농장을 설립하고 수확물 계약을 체결할 권리","category":"business","price":45000,"rarity":"rare","css":null,"limit":"once","kind":"convenience","stock":null,"preview":{"icon":"🚜"}},
      {"code":"biz_logistics_license","name":"스마트 운송회사 면허","description":"물류 트럭을 운용하여 대형 운송 계약을 수주하는 면허증","category":"business","price":80000,"rarity":"epic","css":null,"limit":"once","kind":"convenience","stock":null,"preview":{"icon":"🚛"}},
      {"code":"biz_cvs_boost_7d","name":"편의점 매출 1.2배 부스트(7일)","description":"7일간 편의점 일매출이 20% 상승하는 마케팅 계약권","category":"business","price":3000,"rarity":"uncommon","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"📈"}},
      {"code":"biz_farm_fertilizer","name":"농장 작물 급속 비료","description":"농장 생산 주기를 단축하고 수확량을 늘려주는 특수 비료","category":"business","price":2500,"rarity":"uncommon","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"🌱"}},
      {"code":"biz_truck_tuning","name":"운송 트럭 엔진 튜닝","description":"운송 트럭의 정비 비용을 낮추고 운행 속도를 높여주는 정밀 튜닝","category":"business","price":5000,"rarity":"rare","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"🔧"}},
      {"code":"biz_manager_auto","name":"매니저 자동 정비권(30일)","description":"30일간 사업체 정비를 자동으로 처리하여 결근/감액을 방지","category":"business","price":6000,"rarity":"rare","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"👔"}},
      {"code":"biz_tax_relief","name":"사업 세금 감면권","description":"다음 정산 시 법인 소득세의 50%를 합법적으로 감면받는 절세 증서","category":"business","price":10000,"rarity":"epic","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"🧾"}},

      {"code":"item_rename_ticket","name":"닉네임 1회 변경권","description":"프로필 및 세계관 내 표시 닉네임을 1회 자유롭게 변경","category":"convenience","price":5000,"rarity":"rare","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"🏷️"}},
      {"code":"item_inventory_expand_20","name":"인벤토리 슬롯 확장(+20)","description":"보관 가능한 개인 인벤토리 슬롯 한도를 20칸 영구 확장","category":"convenience","price":2000,"rarity":"uncommon","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"🎒"}},
      {"code":"item_stock_fee_discount","name":"주식 수수료 50% 할인권(30일)","description":"30일 동안 가상 주식 거래소 매수/매도 거래세 50% 할인","category":"convenience","price":4000,"rarity":"rare","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"📉"}},
      {"code":"item_global_megaphone","name":"확성기(글로벌 알림)","description":"머니버스 전체 접속자 화면 상단에 1회 공지 메시지 송출","category":"convenience","price":1000,"rarity":"uncommon","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"📢"}},
      {"code":"item_vip_lounge_pass","name":"VIP 라운지 30일 입장권","description":"VIP 전용 게시판 및 특별 배당 혜택이 주어지는 라운지 패스","category":"convenience","price":15000,"rarity":"epic","css":null,"limit":"unlimited","kind":"convenience","stock":null,"preview":{"icon":"🥂"}}
    ]'::jsonb) AS (
      code text, name text, description text, category text, price bigint,
      rarity text, css text, "limit" text, kind text, stock integer, preview jsonb
    )
  LOOP
    INSERT INTO public.shop_catalog (
      code, name, description, category, base_price,
      rarity, animation_css, purchase_limit, effect_kind,
      max_stock, current_stock, is_limited, preview_data, active
    ) VALUES (
      v_cat.code, v_cat.name, v_cat.description, v_cat.category, v_cat.price,
      v_cat.rarity, v_cat.css, v_cat.limit, v_cat.kind::public.shop_effect_kind,
      v_cat.stock, v_cat.stock, (v_cat.stock IS NOT NULL), v_cat.preview, true
    )
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      base_price = EXCLUDED.base_price,
      rarity = EXCLUDED.rarity,
      animation_css = EXCLUDED.animation_css,
      purchase_limit = EXCLUDED.purchase_limit,
      effect_kind = EXCLUDED.effect_kind,
      max_stock = EXCLUDED.max_stock,
      current_stock = COALESCE(shop_catalog.current_stock, EXCLUDED.current_stock),
      is_limited = EXCLUDED.is_limited,
      preview_data = EXCLUDED.preview_data,
      active = true;

    -- Ensure inventory record exists so shop_catalog_list can find it
    INSERT INTO public.shop_inventory (catalog_id, quantity, restock_rule)
    SELECT id, v_cat.stock, 'none'
    FROM public.shop_catalog
    WHERE code = v_cat.code
    ON CONFLICT (catalog_id) DO UPDATE SET
      quantity = COALESCE(shop_inventory.quantity, EXCLUDED.quantity);
  END LOOP;
END;
$$;

COMMIT;
