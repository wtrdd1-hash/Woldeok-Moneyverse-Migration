-- 223-personal-spaces-city-projects.sql
-- Update version: v2026.09.21.318
-- P0 SPACES-CITY-SPEC: Personal Spaces & Public City Infrastructure Projects
-- Non-P2W personal spaces (Starter Room, Studio, Gallery, HQ) & Public city infrastructure crowdfunding with WLD burn.

BEGIN;

-- 1. User spaces table
CREATE TABLE IF NOT EXISTS public.user_spaces (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  space_type text NOT NULL CHECK (space_type IN ('SPACE_ROOM_STARTER', 'SPACE_STUDIO', 'SPACE_GALLERY', 'SPACE_OFFICE', 'SPACE_PENTHOUSE', 'SPACE_HQ')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  privacy text NOT NULL DEFAULT 'public' CHECK (privacy IN ('private', 'club', 'public')),
  layout jsonb NOT NULL DEFAULT '{"theme":"default","furniture":[]}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- 2. City public projects table
CREATE TABLE IF NOT EXISTS public.city_projects (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (char_length(code) BETWEEN 2 AND 30),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 50),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  target_wld text NOT NULL CHECK (target_wld ~ '^\d+$' AND target_wld::numeric > 0),
  current_wld text NOT NULL DEFAULT '0' CHECK (current_wld ~ '^\d+$'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  stage integer NOT NULL DEFAULT 1 CHECK (stage >= 1),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  completed_at timestamptz
);

-- 3. City project contributions
CREATE TABLE IF NOT EXISTS public.city_project_contributions (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.city_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  amount_wld text NOT NULL CHECK (amount_wld ~ '^\d+$' AND amount_wld::numeric > 0),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_spaces_user ON public.user_spaces(user_id);
CREATE INDEX IF NOT EXISTS idx_city_projects_status ON public.city_projects(status);
CREATE INDEX IF NOT EXISTS idx_city_contributions_project ON public.city_project_contributions(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_contributions_user ON public.city_project_contributions(user_id);

-- 4. Initial Seed for City Public Projects
INSERT INTO public.city_projects (code, title, description, target_wld)
VALUES
  ('CITY_GARDEN_01', '강변정원 복원 프로젝트', '시민 모두가 휴식할 수 있는 아름다운 강변 공공 정원을 조성합니다.', '250000'),
  ('CITY_PLAZA_01', '중앙광장 확장 및 분수대 건립', '머니버스 중심부의 중앙광장을 대형 랜드마크로 리모델링합니다.', '1000000'),
  ('CITY_MUSEUM_01', 'Moneyverse 역사박물관', '도시의 경제 성장사와 유저들의 명예로운 발자취를 영구 보존하는 박물관입니다.', '3000000')
ON CONFLICT (code) DO NOTHING;

-- 5. Helper Function: 개인 공간 구매 (WLD 소각 SINK_HOUSING_PURCHASE)
CREATE OR REPLACE FUNCTION public.space_purchase(
  p_actor uuid,
  p_space_type text,
  p_name text,
  p_idempotency_key uuid
)
RETURNS TABLE(
  space_id uuid,
  space_type text,
  name text,
  created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_user_account_id uuid;
  v_sink_account_id uuid;
  v_available numeric;
  v_price numeric;
  v_space_id uuid;
  v_created_at timestamptz;
BEGIN
  IF p_actor IS NULL OR p_space_type IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid input parameters';
  END IF;

  -- 가격 결정
  CASE p_space_type
    WHEN 'SPACE_ROOM_STARTER' THEN v_price := 5000;
    WHEN 'SPACE_STUDIO' THEN v_price := 25000;
    WHEN 'SPACE_GALLERY' THEN v_price := 75000;
    WHEN 'SPACE_OFFICE' THEN v_price := 100000;
    WHEN 'SPACE_PENTHOUSE' THEN v_price := 250000;
    WHEN 'SPACE_HQ' THEN v_price := 1500000;
    ELSE
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown space type';
  END CASE;

  -- 잔액 확인
  SELECT a.id, b.available_amount::numeric INTO v_user_account_id, v_available
  FROM public.accounts a
  JOIN public.account_balances b ON b.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_user_account_id IS NULL OR v_available < v_price THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'insufficient cash balance';
  END IF;

  -- 소각 계좌
  SELECT a.id INTO v_sink_account_id
  FROM public.accounts a
  WHERE a.account_type = 'SINK'::public.account_type AND a.status = 'active'::public.account_status
  LIMIT 1;

  -- 차감 및 소각
  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric - v_price), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_user_account_id;

  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric + v_price), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_sink_account_id;

  INSERT INTO public.ledger_transactions (idempotency_key, type, actor_user_id)
  VALUES (p_idempotency_key, 'SINK_HOUSING_PURCHASE', p_actor)
  ON CONFLICT (idempotency_key) DO NOTHING;

  -- 공간 생성
  INSERT INTO public.user_spaces (user_id, space_type, name)
  VALUES (p_actor, p_space_type, COALESCE(NULLIF(TRIM(p_name), ''), '나만의 공간'))
  RETURNING id, user_spaces.space_type, user_spaces.name, user_spaces.created_at
  INTO v_space_id, p_space_type, p_name, v_created_at;

  RETURN QUERY SELECT v_space_id, p_space_type, p_name, v_created_at;
END;
$$;

-- 6. Helper Function: 도시 공공 프로젝트 기여 (WLD 소각 SINK_PROJECT_DONATION)
CREATE OR REPLACE FUNCTION public.city_project_contribute(
  p_actor uuid,
  p_project_id uuid,
  p_amount numeric,
  p_idempotency_key uuid
)
RETURNS TABLE(
  contribution_id uuid,
  accepted_amount numeric,
  project_current_wld text,
  project_status text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_user_account_id uuid;
  v_sink_account_id uuid;
  v_user_balance numeric;
  v_target numeric;
  v_current numeric;
  v_needed numeric;
  v_actual numeric;
  v_contrib_id uuid;
  v_new_current numeric;
  v_proj_status text;
BEGIN
  IF p_actor IS NULL OR p_project_id IS NULL OR p_amount <= 0 OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid input parameters';
  END IF;

  SELECT target_wld::numeric, current_wld::numeric, status
  INTO v_target, v_current, v_proj_status
  FROM public.city_projects
  WHERE id = p_project_id
  FOR UPDATE;

  IF v_proj_status IS NULL OR v_proj_status <> 'active' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'city project is not active';
  END IF;

  v_needed := v_target - v_current;
  IF v_needed <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'city project already fully funded';
  END IF;

  -- 유저 잔액 확인
  SELECT a.id, b.available_amount::numeric INTO v_user_account_id, v_user_balance
  FROM public.accounts a
  JOIN public.account_balances b ON b.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_user_account_id IS NULL OR v_user_balance <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'insufficient cash balance';
  END IF;

  v_actual := LEAST(p_amount, v_needed, v_user_balance);
  IF v_actual <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'cannot contribute 0 WLD';
  END IF;

  -- 소각 계좌
  SELECT a.id INTO v_sink_account_id
  FROM public.accounts a
  WHERE a.account_type = 'SINK'::public.account_type AND a.status = 'active'::public.account_status
  LIMIT 1;

  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric - v_actual), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_user_account_id;

  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric + v_actual), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_sink_account_id;

  INSERT INTO public.ledger_transactions (idempotency_key, type, actor_user_id)
  VALUES (p_idempotency_key, 'SINK_PROJECT_DONATION', p_actor)
  ON CONFLICT (idempotency_key) DO NOTHING;

  INSERT INTO public.city_project_contributions (project_id, user_id, amount_wld)
  VALUES (p_project_id, p_actor, v_actual::text)
  RETURNING id INTO v_contrib_id;

  v_new_current := v_current + v_actual;
  IF v_new_current >= v_target THEN
    UPDATE public.city_projects
    SET current_wld = v_new_current::text, status = 'completed', completed_at = pg_catalog.clock_timestamp()
    WHERE id = p_project_id;
    v_proj_status := 'completed';
  ELSE
    UPDATE public.city_projects
    SET current_wld = v_new_current::text
    WHERE id = p_project_id;
  END IF;

  RETURN QUERY SELECT v_contrib_id, v_actual, v_new_current::text, v_proj_status;
END;
$$;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_spaces, public.city_projects, public.city_project_contributions TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.space_purchase(uuid, text, text, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.city_project_contribute(uuid, uuid, numeric, uuid) TO moneyverse_app;

COMMIT;
