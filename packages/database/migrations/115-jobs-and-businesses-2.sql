-- 115-jobs-and-businesses-2.sql
-- Job 2.0 (8 Professional Jobs, Proficiency Tree) & Business 2.0 (Licenses, Boosts, Sinks)

-- 1. Extend work_job_type enum
DO $$
BEGIN
  ALTER TYPE public.work_job_type ADD VALUE IF NOT EXISTS 'developer';
  ALTER TYPE public.work_job_type ADD VALUE IF NOT EXISTS 'trader';
  ALTER TYPE public.work_job_type ADD VALUE IF NOT EXISTS 'entertainer';
  ALTER TYPE public.work_job_type ADD VALUE IF NOT EXISTS 'detective';
  ALTER TYPE public.work_job_type ADD VALUE IF NOT EXISTS 'artisan';
  ALTER TYPE public.work_job_type ADD VALUE IF NOT EXISTS 'civil_servant';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Enhance user_job_progress table
ALTER TABLE public.user_job_progress
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_job_progress_active
  ON public.user_job_progress (user_id, is_active) WHERE is_active = true;

-- 3. Enhance virtual_business_types table
INSERT INTO public.virtual_business_types (
  id, symbol, name, description, purchase_cost, daily_revenue, daily_operating_cost, active, created_at, updated_at
) VALUES 
  ('88888888-0001-4000-8000-000000000001', 'CONVENIENCE', '24시 편의점', '새벽에도 꺼지지 않는 밝은 조명 아래 생필품과 간편식을 판매하여 연중무휴 안정적인 현금 흐름을 창출하는 편의점 프랜차이즈.', 300000, 18000, 5000, true, now(), now()),
  ('88888888-0002-4000-8000-000000000002', 'ORGANIC_FARM', '유기농 스마트 농장', '첨단 IoT 수경재배 시스템으로 고부가가치 특수 약초 및 과채류를 대량 생산하여 높은 마진을 거두는 미래형 스마트 농업 법인.', 500000, 32000, 9000, true, now(), now()),
  ('88888888-0003-4000-8000-000000000003', 'LOGISTICS', '스마트 운송회사', '대형 친환경 물류 트럭 플릿과 AI 배차 시스템을 결합해 도시 간 주요 화물과 원자재를 독점 수송하는 초대형 운송 법인.', 1200000, 85000, 25000, true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  purchase_cost = EXCLUDED.purchase_cost,
  daily_revenue = EXCLUDED.daily_revenue,
  daily_operating_cost = EXCLUDED.daily_operating_cost,
  active = EXCLUDED.active;

-- 4. Enhance virtual_business_ownerships table
ALTER TABLE public.virtual_business_ownerships
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS boost_active jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 5. Seed Tasks for all 8 Jobs in work_task_catalog
INSERT INTO public.work_task_catalog (
  id, code, name, description, job_type, difficulty, base_reward, base_experience, minimum_duration_seconds, daily_limit, active, policy_version, created_at, updated_at
) VALUES
  -- Developer
  ('77777777-0101-4000-8000-000000000001', 'dev_refactor', '코드 리팩터링 및 성능 튜닝', '레거시 모듈의 비효율적 쿼리를 최적화하고 메모리 누수를 해결합니다.', 'developer', 2, 220, 35, 60, 5, true, 1, now(), now()),
  ('77777777-0102-4000-8000-000000000002', 'dev_bugfix', '치명적 보안 취약점 패치', '금융 원장 트랜잭션의 경쟁 상태(Race Condition)를 긴급 패치합니다.', 'developer', 3, 320, 70, 120, 3, true, 1, now(), now()),
  ('77777777-0103-4000-8000-000000000003', 'dev_architecture', '분산 결함 감내 아키텍처 구축', '동시 접속 10만 명을 수용할 수 있는 고가용성 샤딩 시스템을 설계합니다.', 'developer', 4, 400, 130, 180, 2, true, 1, now(), now()),

  -- Trader
  ('77777777-0201-4000-8000-000000000001', 'trd_orderbook', '호가창 유동성 심층 분석', '가상 주식 거래소의 매수/매도 벽과 스프레드 괴리율을 분석합니다.', 'trader', 2, 200, 30, 60, 5, true, 1, now(), now()),
  ('77777777-0202-4000-8000-000000000002', 'trd_arbitrage', '시장간 차익 거래 포지션 구축', '선물-현물 간 베이시스를 포착하여 무위험 차익을 실현합니다.', 'trader', 3, 300, 65, 120, 3, true, 1, now(), now()),
  ('77777777-0203-4000-8000-000000000003', 'trd_whale_report', '거대 고래 자금 흐름 추적', '시장 조작 징후를 선제 파악하여 포트폴리오 헤지 보고서를 작성합니다.', 'trader', 4, 390, 125, 180, 2, true, 1, now(), now()),

  -- Entertainer
  ('77777777-0301-4000-8000-000000000001', 'ent_busking', '커뮤니티 로비 라이브 버스킹', '로비 광장에서 감미로운 음악을 연주하여 유저들의 사기를 북돋웁니다.', 'entertainer', 1, 160, 25, 60, 5, true, 1, now(), now()),
  ('77777777-0302-4000-8000-000000000002', 'ent_talkshow', '머니버스 심야 토크쇼 진행', '가상경제 화제의 인물을 초청하여 실시간 인터뷰 방송을 송출합니다.', 'entertainer', 3, 280, 60, 120, 3, true, 1, now(), now()),
  ('77777777-0303-4000-8000-000000000003', 'ent_carnival', '카지노 럭키 카니발 총괄 기획', '모든 멤버가 열광하는 역대급 경품 추첨 축제를 성공적으로 개최합니다.', 'entertainer', 4, 380, 120, 180, 2, true, 1, now(), now()),

  -- Detective
  ('77777777-0401-4000-8000-000000000001', 'det_trace_tx', '이상 금융 송금 거래 내역 추적', '세탁 의심 차명 계좌들 사이의 복잡한 믹서 거래 경로를 추적합니다.', 'detective', 2, 240, 38, 60, 5, true, 1, now(), now()),
  ('77777777-0402-4000-8000-000000000002', 'det_botnet_bust', '매크로 봇 클러스터 잠입 수사', '시세를 조작하던 불법 자동화 봇넷의 IP 대역과 조종자를 특정합니다.', 'detective', 3, 330, 75, 120, 3, true, 1, now(), now()),
  ('77777777-0403-4000-8000-000000000003', 'det_shadow_syndicate', '지하 암시장 카르텔 일망타진', '머니버스 지하 경제를 주무르던 암시장 총책을 검거하고 현상금을 받습니다.', 'detective', 4, 400, 140, 180, 2, true, 1, now(), now()),

  -- Miner
  ('77777777-0501-4000-8000-000000000001', 'min_deep_vein', '심층 흑요석 광맥 채굴', '지하 1,000m 고온의 암반층에서 단단한 흑요석 원석을 채굴합니다.', 'miner', 2, 190, 30, 60, 5, true, 1, now(), now()),
  ('77777777-0502-4000-8000-000000000002', 'min_crystal_gem', '신비로운 마력 크리스탈 발굴', '테두리 및 이펙트 장착 아이템 제작에 필요한 보석 결정을 정밀 채취합니다.', 'miner', 3, 300, 60, 120, 3, true, 1, now(), now()),
  ('77777777-0503-4000-8000-000000000003', 'min_ancient_core', '고대 마그마 코어 추출', '전설의 장비 제련에 쓰이는 응축된 순수 에너지 결정을 성공적으로 추출합니다.', 'miner', 4, 380, 115, 180, 2, true, 1, now(), now()),

  -- Farmer
  ('77777777-0601-4000-8000-000000000001', 'frm_hydroponic', '스마트 수경재배 고당도 과채 수확', '최적의 온습도 제어로 당도가 극대화된 딸기와 토마토를 수확해 납품합니다.', 'farmer', 2, 180, 28, 60, 5, true, 1, now(), now()),
  ('77777777-0602-4000-8000-000000000002', 'frm_golden_wheat', '품종 개량 황금 밀 대량 수확', '가상경제 식량 원자재 시장에 독점 공급할 황금 밀 100가마를 납품합니다.', 'farmer', 3, 290, 58, 120, 3, true, 1, now(), now()),
  ('77777777-0603-4000-8000-000000000003', 'frm_world_tree', '세계수 수액 및 영약 재료 정제', '100년에 한 번 채취 가능한 신성한 수액을 정제하여 프리미엄 수익을 얻습니다.', 'farmer', 4, 370, 110, 180, 2, true, 1, now(), now()),

  -- Artisan
  ('77777777-0701-4000-8000-000000000001', 'art_cosmetic_polish', '상점 치장품 정밀 세공 및 연마', '빛을 잃어가는 네임플레이트와 프레임에 금박 인챈트를 입혀 가치를 높입니다.', 'artisan', 2, 220, 34, 60, 5, true, 1, now(), now()),
  ('77777777-0702-4000-8000-000000000002', 'art_gem_socketing', '다이아몬드 소켓 가공 및 조각', '최고급 장신구에 보석을 완벽한 각도로 결합하여 영구적인 광채를 부여합니다.', 'artisan', 3, 310, 68, 120, 3, true, 1, now(), now()),
  ('77777777-0703-4000-8000-000000000003', 'art_mythic_masterpiece', '신화급 국보 공예품 제작', '머니버스 역사에 영구 보존될 기념비적 조각상을 완성하여 거액의 보수를 받습니다.', 'artisan', 4, 400, 135, 180, 2, true, 1, now(), now()),

  -- Civil Servant
  ('77777777-0801-4000-8000-000000000001', 'csv_tax_audit', '일일 법인세 정산 및 영수증 실사', '사업체들이 납부한 세무 내역을 원장과 대조 검증하여 탈세를 방지합니다.', 'civil_servant', 2, 210, 32, 60, 5, true, 1, now(), now()),
  ('77777777-0802-4000-8000-000000000002', 'csv_treasury_inspect', '중앙은행 국고 금고실 정기 검사', '시스템 소각(Sink) 계정의 파기 증빙과 통화량 보존 상태를 점검합니다.', 'civil_servant', 3, 300, 62, 120, 3, true, 1, now(), now()),
  ('77777777-0803-4000-8000-000000000003', 'csv_policy_review', '가상경제 번영 특별법 입법 심의', '지속 가능한 통화 가치와 복지 기금을 확충하기 위한 정책 조례를 입안합니다.', 'civil_servant', 4, 390, 118, 180, 2, true, 1, now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  job_type = EXCLUDED.job_type,
  difficulty = EXCLUDED.difficulty,
  base_reward = EXCLUDED.base_reward,
  base_experience = EXCLUDED.base_experience,
  minimum_duration_seconds = EXCLUDED.minimum_duration_seconds,
  active = EXCLUDED.active;

-- 6. SQL Procedures & Functions

-- 6.1. Job Switch (Zero cooldown, zero fee as requested)
CREATE OR REPLACE FUNCTION public.job_switch_active(
  p_actor uuid,
  p_job_type text
)
RETURNS TABLE(
  job_type text,
  level integer,
  experience bigint,
  is_active boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_job_enum public.work_job_type;
BEGIN
  BEGIN
    v_job_enum := p_job_type::public.work_job_type;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid job type';
  END;

  -- 1. Deactivate all existing jobs for user
  UPDATE public.user_job_progress
  SET is_active = false
  WHERE user_id = p_actor;

  -- 2. Activate or create selected job
  INSERT INTO public.user_job_progress (
    user_id, job_type, experience, level, is_active, selected_at, changed_at
  ) VALUES (
    p_actor, v_job_enum, 0, 1, true, clock_timestamp(), clock_timestamp()
  )
  ON CONFLICT (user_id, job_type) DO UPDATE SET
    is_active = true,
    selected_at = clock_timestamp(),
    changed_at = clock_timestamp();

  RETURN QUERY
  SELECT ujp.job_type::text, ujp.level, ujp.experience, ujp.is_active
  FROM public.user_job_progress ujp
  WHERE ujp.user_id = p_actor AND ujp.job_type = v_job_enum;
END;
$$;

ALTER FUNCTION public.job_switch_active(uuid, text) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.job_switch_active(uuid, text) TO moneyverse_app;

-- 6.2. Job Profile (Returns active job and all 8 job progressions)
CREATE OR REPLACE FUNCTION public.job_get_my_profile(p_actor uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_active jsonb;
  v_all jsonb;
BEGIN
  -- Active job
  SELECT jsonb_build_object(
    'job_type', ujp.job_type::text,
    'level', ujp.level,
    'experience', ujp.experience,
    'next_level_exp', (ujp.level * ujp.level * 100),
    'selected_at', ujp.selected_at
  ) INTO v_active
  FROM public.user_job_progress ujp
  WHERE ujp.user_id = p_actor AND ujp.is_active = true
  LIMIT 1;

  -- Fallback if no active job: default to farmer or null
  IF v_active IS NULL THEN
    v_active := jsonb_build_object(
      'job_type', null,
      'level', 1,
      'experience', 0,
      'next_level_exp', 100,
      'selected_at', null
    );
  END IF;

  -- All jobs list
  SELECT jsonb_agg(jsonb_build_object(
    'job_type', t.job_type::text,
    'level', COALESCE(ujp.level, 1),
    'experience', COALESCE(ujp.experience, 0),
    'next_level_exp', (COALESCE(ujp.level, 1) * COALESCE(ujp.level, 1) * 100),
    'is_active', COALESCE(ujp.is_active, false)
  )) INTO v_all
  FROM (
    SELECT unnest(ARRAY[
      'developer', 'trader', 'entertainer', 'detective', 
      'miner', 'farmer', 'artisan', 'civil_servant'
    ]::public.work_job_type[]) AS job_type
  ) t
  LEFT JOIN public.user_job_progress ujp 
    ON ujp.user_id = p_actor AND ujp.job_type = t.job_type;

  RETURN jsonb_build_object(
    'active_job', v_active,
    'all_jobs', COALESCE(v_all, '[]'::jsonb)
  );
END;
$$;

ALTER FUNCTION public.job_get_my_profile(uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.job_get_my_profile(uuid) TO moneyverse_app;

-- 6.3. Task Completion (EXP, Level Up, and WLD Faucet payout)
CREATE OR REPLACE FUNCTION public.work_complete_task_v2(
  p_actor uuid,
  p_task_id uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  reward_amount bigint,
  experience_gained bigint,
  current_level integer,
  current_experience bigint,
  level_up boolean,
  transaction_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_task record;
  v_progress record;
  v_cash uuid;
  v_mint uuid;
  v_level_mult numeric;
  v_reward bigint;
  v_exp bigint;
  v_new_exp bigint;
  v_new_level integer;
  v_level_up boolean := false;
  v_tx_id uuid;
  v_today_completions integer;
BEGIN
  -- 1. Get task
  SELECT * INTO v_task FROM public.work_task_catalog WHERE id = p_task_id AND active = true;
  IF v_task IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'task not found or inactive';
  END IF;

  -- 2. Get active job progress
  SELECT * INTO v_progress FROM public.user_job_progress 
  WHERE user_id = p_actor AND is_active = true FOR UPDATE;
  
  IF v_progress IS NULL OR v_progress.job_type <> v_task.job_type THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'task job type does not match caller active job';
  END IF;

  -- 3. Daily limit check
  SELECT COUNT(*) INTO v_today_completions 
  FROM public.work_completion_records 
  WHERE worker_user_id = p_actor 
    AND task_id = p_task_id 
    AND completed_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Seoul');

  IF v_today_completions >= v_task.daily_limit THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'daily completion limit reached for this task';
  END IF;

  -- 4. Calculate reward & EXP with Level Scaling
  v_level_mult := 1.0 + ((v_progress.level - 1) * 0.05);
  v_reward := ROUND(v_task.base_reward * v_level_mult);
  v_exp := ROUND(v_task.base_experience * v_level_mult);

  -- 5. Calculate New Level & EXP
  v_new_exp := v_progress.experience + v_exp;
  v_new_level := v_progress.level;
  
  -- Level threshold: level * level * 100
  WHILE v_new_level < 50 AND v_new_exp >= (v_new_level * v_new_level * 100) LOOP
    v_new_level := v_new_level + 1;
    v_level_up := true;
  END LOOP;

  -- 6. Accounts for payment
  SELECT id INTO v_cash FROM public.accounts 
  WHERE owner_user_id = p_actor AND account_type = 'USER_CASH' AND status = 'active' FOR UPDATE;

  SELECT id INTO v_mint FROM public.accounts 
  WHERE system_key = 'mint' AND account_type = 'MINT' AND status = 'active' FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash or mint account required';
  END IF;

  -- 7. Post Ledger Transaction (Faucet)
  SELECT public.economy_post_transaction(
    p_idempotency_key, 'WORK_REWARD', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_reward, 'direction', 'debit'),
      jsonb_build_object('accountId', v_mint, 'amount', v_reward, 'direction', 'credit')
    ),
    'work.task_completed',
    jsonb_build_object('taskId', p_task_id, 'jobType', v_task.job_type, 'reward', v_reward, 'exp', v_exp)
  ) INTO v_tx_id;

  -- 8. Record Completion
  INSERT INTO public.work_completion_records (
    assignment_id, task_id, worker_user_id, status, reward_amount, experience_gained, completed_at
  ) VALUES (
    p_idempotency_key, p_task_id, p_actor, 'approved', v_reward, v_exp, clock_timestamp()
  );

  -- 9. Update user_job_progress
  UPDATE public.user_job_progress
  SET experience = v_new_exp,
      level = v_new_level,
      changed_at = clock_timestamp()
  WHERE user_id = p_actor AND job_type = v_task.job_type;

  RETURN QUERY SELECT v_reward, v_exp, v_new_level, v_new_exp, v_level_up, v_tx_id;
END;
$$;

ALTER FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) TO moneyverse_app;

-- 6.4. Business License Activation from Inventory
CREATE OR REPLACE FUNCTION public.business_activate_from_license(
  p_actor uuid,
  p_catalog_code text,
  p_idempotency_key uuid
)
RETURNS TABLE(
  ownership_id uuid,
  business_symbol text,
  business_name text,
  daily_revenue bigint,
  daily_operating_cost bigint
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_catalog record;
  v_user_item record;
  v_biz_symbol text;
  v_biz_type record;
  v_new_id uuid;
  v_existing uuid;
BEGIN
  -- 1. Map catalog code to business symbol
  IF p_catalog_code = 'biz_cvs_license' THEN
    v_biz_symbol := 'CONVENIENCE';
  ELSIF p_catalog_code = 'biz_farm_license' THEN
    v_biz_symbol := 'ORGANIC_FARM';
  ELSIF p_catalog_code = 'biz_logistics_license' THEN
    v_biz_symbol := 'LOGISTICS';
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'item is not a recognized business license';
  END IF;

  -- 2. Find business type
  SELECT * INTO v_biz_type FROM public.virtual_business_types WHERE symbol = v_biz_symbol AND active = true;
  IF v_biz_type IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business type not found';
  END IF;

  -- 3. Check if user already owns this business
  SELECT id INTO v_existing FROM public.virtual_business_ownerships 
  WHERE user_id = p_actor AND business_type_id = v_biz_type.id;
  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'user already owns this type of business';
  END IF;

  -- 4. Check user_items ownership
  SELECT ui.*, sc.id AS sc_id INTO v_user_item 
  FROM public.user_items ui 
  JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
  WHERE ui.user_id = p_actor AND sc.code = p_catalog_code AND ui.quantity > 0
  FOR UPDATE;

  IF v_user_item IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'license item not owned by user';
  END IF;

  -- 5. Consume 1 license item
  UPDATE public.user_items
  SET quantity = quantity - 1
  WHERE id = v_user_item.id;

  -- 6. Create business ownership
  v_new_id := gen_random_uuid();
  INSERT INTO public.virtual_business_ownerships (
    id, user_id, business_type_id, purchase_idempotency_key, purchase_transaction_id, purchased_at, status, boost_active
  ) VALUES (
    v_new_id, p_actor, v_biz_type.id, p_idempotency_key, p_idempotency_key, clock_timestamp(), 'active', '{}'::jsonb
  );

  RETURN QUERY SELECT v_new_id, v_biz_type.symbol, v_biz_type.name, v_biz_type.daily_revenue, v_biz_type.daily_operating_cost;
END;
$$;

ALTER FUNCTION public.business_activate_from_license(uuid, text, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.business_activate_from_license(uuid, text, uuid) TO moneyverse_app;

-- 6.5. Apply Boost Item from Inventory to Business
CREATE OR REPLACE FUNCTION public.business_apply_boost(
  p_actor uuid,
  p_ownership_id uuid,
  p_boost_code text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_ownership record;
  v_user_item record;
  v_boost_data jsonb;
  v_boost_name text;
BEGIN
  -- 1. Verify business ownership
  SELECT * INTO v_ownership FROM public.virtual_business_ownerships 
  WHERE id = p_ownership_id AND user_id = p_actor FOR UPDATE;
  
  IF v_ownership IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business ownership not found';
  END IF;

  -- 2. Verify and consume boost item
  SELECT ui.*, sc.id AS sc_id INTO v_user_item
  FROM public.user_items ui
  JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
  WHERE ui.user_id = p_actor AND sc.code = p_boost_code AND ui.quantity > 0
  FOR UPDATE;

  IF v_user_item IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'boost item not owned by user';
  END IF;

  UPDATE public.user_items
  SET quantity = quantity - 1
  WHERE id = v_user_item.id;

  -- 3. Construct boost data
  IF p_boost_code = 'biz_cvs_boost_7d' THEN
    v_boost_name := '매출 1.2배 부스트(7일)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.2, 'cost_mult', 1.0, 'expires_at', (clock_timestamp() + interval '7 days'));
  ELSIF p_boost_code = 'biz_farm_fertilizer' THEN
    v_boost_name := '급속 비료(매출 1.25배)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.25, 'cost_mult', 1.0, 'expires_at', (clock_timestamp() + interval '7 days'));
  ELSIF p_boost_code = 'biz_truck_tuning' THEN
    v_boost_name := '엔진 튜닝(운영비 30% 감면)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.0, 'cost_mult', 0.7, 'expires_at', (clock_timestamp() + interval '7 days'));
  ELSIF p_boost_code = 'biz_manager_auto' THEN
    v_boost_name := '매니저 자동 정비(운영비 20% 감면)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.0, 'cost_mult', 0.8, 'expires_at', (clock_timestamp() + interval '30 days'));
  ELSIF p_boost_code = 'biz_tax_relief' THEN
    v_boost_name := '사업 세금 감면권(비용 50% 절감)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.0, 'cost_mult', 0.5, 'expires_at', (clock_timestamp() + interval '14 days'));
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unrecognized boost item code';
  END IF;

  -- 4. Save into ownership
  UPDATE public.virtual_business_ownerships
  SET boost_active = v_boost_data
  WHERE id = p_ownership_id;

  RETURN v_boost_data;
END;
$$;

ALTER FUNCTION public.business_apply_boost(uuid, uuid, text) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.business_apply_boost(uuid, uuid, text) TO moneyverse_app;

-- 6.6. Business Daily Settlement v2 (with Boosts, Sinks, and Suspension Check)
CREATE OR REPLACE FUNCTION public.business_settle_daily_v2(
  p_actor uuid,
  p_ownership_id uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  ownership_id uuid,
  settlement_date date,
  gross_revenue bigint,
  operating_cost bigint,
  net_amount bigint,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_ownership record;
  v_biz_type record;
  v_date date;
  v_gross bigint;
  v_cost bigint;
  v_cash uuid;
  v_mint uuid;
  v_sink uuid;
  v_tx_id uuid;
  v_rev_mult numeric := 1.0;
  v_cost_mult numeric := 1.0;
  v_boost jsonb;
BEGIN
  -- Idempotency check
  SELECT s.ownership_id, s.settlement_date, s.gross_revenue, s.operating_cost, s.net_amount, s.transaction_id, true
  INTO ownership_id, settlement_date, gross_revenue, operating_cost, net_amount, transaction_id, replayed
  FROM public.virtual_business_settlements s
  WHERE s.idempotency_key = p_idempotency_key;

  IF transaction_id IS NOT NULL THEN
    RETURN NEXT;
    RETURN;
  END IF;

  -- Verify ownership
  SELECT bo.*, bt.symbol, bt.name, bt.daily_revenue, bt.daily_operating_cost
  INTO v_ownership
  FROM public.virtual_business_ownerships bo
  JOIN public.virtual_business_types bt ON bt.id = bo.business_type_id
  WHERE bo.id = p_ownership_id AND bo.user_id = p_actor FOR UPDATE;

  IF v_ownership IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business ownership not found';
  END IF;

  v_date := (now() AT TIME ZONE 'Asia/Seoul')::date;

  -- Check if already settled today
  IF EXISTS (
    SELECT 1 FROM public.virtual_business_settlements 
    WHERE ownership_id = p_ownership_id AND settlement_date = v_date
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business already settled today';
  END IF;

  -- Calculate Boosts if valid
  v_boost := v_ownership.boost_active;
  IF v_boost IS NOT NULL AND v_boost ? 'expires_at' THEN
    IF (v_boost->>'expires_at')::timestamptz > clock_timestamp() THEN
      v_rev_mult := COALESCE((v_boost->>'revenue_mult')::numeric, 1.0);
      v_cost_mult := COALESCE((v_boost->>'cost_mult')::numeric, 1.0);
    END IF;
  END IF;

  v_gross := ROUND(v_ownership.daily_revenue * v_rev_mult);
  v_cost := ROUND(v_ownership.daily_operating_cost * v_cost_mult);

  -- Accounts
  SELECT id INTO v_cash FROM public.accounts 
  WHERE owner_user_id = p_actor AND account_type = 'USER_CASH' AND status = 'active' FOR UPDATE;
  
  SELECT id INTO v_mint FROM public.accounts 
  WHERE system_key = 'mint' AND account_type = 'MINT' AND status = 'active' FOR UPDATE;
  
  SELECT id INTO v_sink FROM public.accounts 
  WHERE system_key = 'sink' AND account_type = 'SINK' AND status = 'active' FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL OR v_sink IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash, mint or sink account required';
  END IF;

  -- Post transaction: Mint revenue to User Cash, Sink operating cost from User Cash to System Sink
  SELECT public.economy_post_transaction(
    p_idempotency_key, 'BUSINESS_SETTLEMENT', p_actor, NULL,
    jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'debit'),
      jsonb_build_object('accountId', v_mint, 'amount', v_gross, 'direction', 'credit'),
      jsonb_build_object('accountId', v_cash, 'amount', v_cost, 'direction', 'credit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_cost, 'direction', 'debit')
    ),
    'business.daily_settled_v2',
    jsonb_build_object('ownershipId', p_ownership_id, 'grossRevenue', v_gross, 'operatingCost', v_cost)
  ) INTO v_tx_id;

  INSERT INTO public.virtual_business_settlements (
    ownership_id, settlement_date, idempotency_key, gross_revenue, operating_cost, net_amount, transaction_id
  ) VALUES (
    p_ownership_id, v_date, p_idempotency_key, v_gross, v_cost, v_gross - v_cost, v_tx_id
  );

  RETURN QUERY SELECT p_ownership_id, v_date, v_gross, v_cost, v_gross - v_cost, v_tx_id, false;
END;
$$;

ALTER FUNCTION public.business_settle_daily_v2(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.business_settle_daily_v2(uuid, uuid, uuid) TO moneyverse_app;

-- 6.7. Business List for Member (with Boosts, Days Unsettled, and Today Status)
CREATE OR REPLACE FUNCTION public.business_my_ownerships_v2(p_actor uuid)
RETURNS TABLE(
  ownership_id uuid,
  business_type_id uuid,
  symbol text,
  name text,
  description text,
  purchase_cost bigint,
  daily_revenue bigint,
  daily_operating_cost bigint,
  purchased_at timestamptz,
  last_settlement_date date,
  is_settled_today boolean,
  boost_active jsonb,
  status text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT 
    bo.id AS ownership_id,
    bt.id AS business_type_id,
    bt.symbol,
    bt.name,
    bt.description,
    bt.purchase_cost,
    bt.daily_revenue,
    bt.daily_operating_cost,
    bo.purchased_at,
    (SELECT MAX(s.settlement_date) FROM public.virtual_business_settlements s WHERE s.ownership_id = bo.id) AS last_settlement_date,
    EXISTS (
      SELECT 1 FROM public.virtual_business_settlements s 
      WHERE s.ownership_id = bo.id AND s.settlement_date = (now() AT TIME ZONE 'Asia/Seoul')::date
    ) AS is_settled_today,
    bo.boost_active,
    bo.status
  FROM public.virtual_business_ownerships bo
  JOIN public.virtual_business_types bt ON bt.id = bo.business_type_id
  WHERE bo.user_id = p_actor
  ORDER BY bo.purchased_at ASC;
$$;

ALTER FUNCTION public.business_my_ownerships_v2(uuid) OWNER TO moneyverse_migrator;
GRANT EXECUTE ON FUNCTION public.business_my_ownerships_v2(uuid) TO moneyverse_app;
