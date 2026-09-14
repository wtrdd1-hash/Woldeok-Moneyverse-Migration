-- v2026.09.14.89
-- Expand the shop with repeatable cosmetic/convenience sinks across higher
-- price bands. These purchases remove WLD without creating WLD, investment
-- returns, random rewards, or pay-to-win economic advantages.
BEGIN;

WITH items(code, name, description, price, preview) AS (
  VALUES
    ('sink_profile_aurora_frame', '오로라 프로필 프레임', '프로필에 오로라 테두리 연출을 적용하는 1회성 꾸미기 아이템', 6500::bigint, '{"icon":"🌈"}'::jsonb),
    ('sink_wallet_constellation', '별자리 지갑 테마', '다음 지갑 화면에 별자리 테마를 적용하는 1회성 꾸미기 아이템', 9500::bigint, '{"icon":"🌌"}'::jsonb),
    ('sink_work_gold_stamp', '황금 작업 도장', '다음 작업 완료 기록에 황금 도장 연출을 남기는 1회성 아이템', 12000::bigint, '{"icon":"🏅"}'::jsonb),
    ('sink_market_comet_trail', '거래소 혜성 궤적', '다음 거래 완료 화면에 혜성 궤적 연출을 적용하는 1회성 아이템', 16000::bigint, '{"icon":"☄️"}'::jsonb),
    ('sink_lobby_moon_dust', '로비 달빛 가루', '로비 입장 화면에 달빛 입자 연출을 적용하는 1회성 아이템', 20000::bigint, '{"icon":"🌙"}'::jsonb),
    ('sink_profile_hologram_badge', '홀로그램 프로필 배지', '프로필에 홀로그램 배지 연출을 적용하는 1회성 꾸미기 아이템', 26000::bigint, '{"icon":"💠"}'::jsonb),
    ('sink_receipt_royal_seal', '왕실 영수증 인장', '다음 지갑 영수증에 특별 인장 연출을 적용하는 1회성 아이템', 34000::bigint, '{"icon":"👑"}'::jsonb),
    ('sink_community_fireflies', '커뮤니티 반딧불 연출', '커뮤니티 프로필을 반딧불 효과로 강조하는 1회성 연출권', 45000::bigint, '{"icon":"✨"}'::jsonb),
    ('sink_lunar_crown', '달빛 왕관 연출권', '개인 프로필에 달빛 왕관 연출을 적용하는 고급 1회성 아이템', 70000::bigint, '{"icon":"🌙"}'::jsonb),
    ('sink_cosmic_stage', '코스믹 스테이지 이용권', '개인 화면에 최상위 우주 무대 연출을 적용하는 고가 1회성 이용권', 100000::bigint, '{"icon":"🪐"}'::jsonb)
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
    category = EXCLUDED.category,
    base_price = EXCLUDED.base_price,
    rarity = EXCLUDED.rarity,
    purchase_limit = EXCLUDED.purchase_limit,
    effect_kind = EXCLUDED.effect_kind,
    preview_data = EXCLUDED.preview_data,
    active = EXCLUDED.active,
    is_limited = EXCLUDED.is_limited
  RETURNING id
)
INSERT INTO public.shop_inventory (catalog_id, quantity, restock_rule)
SELECT id, NULL, 'continuous' FROM upserted
ON CONFLICT (catalog_id) DO UPDATE
SET quantity = NULL, restock_rule = 'continuous';

COMMIT;
