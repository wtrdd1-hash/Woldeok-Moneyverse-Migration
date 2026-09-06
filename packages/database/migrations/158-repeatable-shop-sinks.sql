-- Add seven repeatable virtual purchases so unrestricted work income has more
-- voluntary sinks without limiting how much a member can earn.
BEGIN;

WITH items(code, name, description, price, preview) AS (
  VALUES
    ('sink_moon_cafe', '달빛 카페 이용권', '커뮤니티 활동 중 사용하는 1회성 달빛 음료 이용권', 600::bigint, '{"icon":"☕"}'::jsonb),
    ('sink_work_report_skin', '작업 보고서 스킨', '다음 작업 완료 기록을 꾸미는 1회성 보고서 디자인', 900::bigint, '{"icon":"📝"}'::jsonb),
    ('sink_lobby_emote_pack', '로비 이모트 팩', '로비에서 사용할 수 있는 1회성 특별 이모트 묶음', 1200::bigint, '{"icon":"🎭"}'::jsonb),
    ('sink_receipt_theme', '원장 영수증 테마', '다음 지갑 영수증을 꾸미는 1회성 테마', 1500::bigint, '{"icon":"🧾"}'::jsonb),
    ('sink_profile_spotlight', '프로필 스포트라이트', '프로필을 일정 시간 강조하는 1회성 연출권', 2200::bigint, '{"icon":"🔦"}'::jsonb),
    ('sink_market_confetti', '거래소 축하 폭죽', '거래 완료 화면에 사용하는 1회성 축하 효과', 3000::bigint, '{"icon":"🎉"}'::jsonb),
    ('sink_moon_festival', '개인 달빛 축제', '나만의 화면에 달빛 축제 연출을 적용하는 1회성 이용권', 5000::bigint, '{"icon":"🌕"}'::jsonb)
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
