-- Unlimited work needs optional sinks across several price bands. These are
-- repeatable convenience purchases: they remove WLD without granting more WLD
-- or creating an investment return that would amplify the faucet.
BEGIN;

WITH items(code, name, description, price, preview) AS (
  VALUES
    ('sink_focus_snack', '집중 간식 상자', '작업 화면에서 사용하는 1회성 간식 연출 아이템', 350::bigint, '{"icon":"🍪"}'::jsonb),
    ('sink_job_stamp', '직업 인증 도장', '다음 작업 완료 기록에 특별 도장을 남기는 1회성 아이템', 750::bigint, '{"icon":"✅"}'::jsonb),
    ('sink_wallet_fireworks', '지갑 미니 불꽃', '다음 지갑 화면에 작은 축하 효과를 적용하는 1회성 아이템', 1800::bigint, '{"icon":"✨"}'::jsonb),
    ('sink_profile_banner', '프로필 배너 이용권', '프로필에 기간 한정 배너 연출을 적용하는 이용권', 4000::bigint, '{"icon":"🎟️"}'::jsonb),
    ('sink_market_bell', '거래소 종소리', '다음 거래 완료 화면에 특별 알림 연출을 적용하는 아이템', 8000::bigint, '{"icon":"🔔"}'::jsonb),
    ('sink_lunar_lounge', '달빛 라운지 이용권', '개인 화면에 프리미엄 라운지 연출을 적용하는 1회성 이용권', 15000::bigint, '{"icon":"🌙"}'::jsonb),
    ('sink_community_spotlight', '커뮤니티 스포트라이트', '커뮤니티 프로필을 기간 한정으로 강조하는 연출권', 30000::bigint, '{"icon":"🌟"}'::jsonb),
    ('sink_moonlight_gala', '월광 갈라 초대권', '최상위 개인 축하 연출을 적용하는 고가 1회성 이용권', 60000::bigint, '{"icon":"🎆"}'::jsonb)
), upserted AS (
  INSERT INTO public.shop_catalog (
    code, name, description, category, base_price, rarity, purchase_limit,
    effect_kind, preview_data, active, is_limited
  )
  SELECT code, name, description, 'convenience', price, 'common', 'unlimited',
    'convenience'::public.shop_effect_kind, preview, true, false
  FROM items
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    purchase_limit = 'unlimited',
    preview_data = EXCLUDED.preview_data,
    active = true
  RETURNING id
)
INSERT INTO public.shop_inventory (catalog_id, quantity, restock_rule)
SELECT id, NULL, 'continuous' FROM upserted
ON CONFLICT (catalog_id) DO UPDATE SET quantity = NULL, restock_rule = 'continuous';

COMMIT;
