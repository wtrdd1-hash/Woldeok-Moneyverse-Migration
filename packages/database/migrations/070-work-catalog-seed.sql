-- The five tasks the work loop opens with.
--
-- `economy_claim_work` is deliberately left working. An earlier revision of
-- this migration replaced it with an unconditional 55000, but the route
-- (`POST /api/v1/rewards/work/claims`), the wallet page's `작업 보상 받기`
-- button and the pinned entry in `packages/contract/src/route-map.ts` all
-- still point at it, and this stack ships no member-facing work screen. That
-- retirement would have answered every member's reward with "잠시 후 다시
-- 시도해 주세요", permanently, with nothing to use instead. It belongs in the
-- change that brings the replacement screen, together with the route removal
-- and a route-map row carrying a reason -- AGENTS.md section 8: a route
-- cannot disappear quietly.

BEGIN;

INSERT INTO public.work_task_catalog (
  code, name, description, job_type, difficulty,
  base_reward, base_experience, minimum_duration_seconds, daily_limit
)
VALUES
  ('logistics_sorting', '물류 정리', '순서형 작업을 완료합니다.', 'carrier', 1, 60, 10, 300, 3),
  ('farm_care', '농장 관리', '재배와 수확 목표를 완료합니다.', 'farmer', 2, 80, 14, 600, 2),
  ('mine_survey', '광산 조사', '지정 자원 목표를 완료합니다.', 'miner', 3, 100, 18, 900, 2),
  ('delivery_run', '배달 작업', '시간과 순서를 충족해 배달합니다.', 'carrier', 2, 90, 16, 900, 2),
  ('equipment_inspection', '장비 점검', '점검 작업을 완료합니다.', 'technician', 2, 90, 16, 900, 2)
ON CONFLICT (code) DO NOTHING;

COMMIT;
