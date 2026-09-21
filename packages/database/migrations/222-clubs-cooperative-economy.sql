-- 222-clubs-cooperative-economy.sql
-- Update version: v2026.09.21.318
-- P0 CLUBS-SPEC: Clubs & Cooperative Economy System
-- Charter registration hard sink (10,000 WLD), non-P2W cooperative projects, member roles, club feed.

BEGIN;

-- 1. Clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  tag text NOT NULL UNIQUE CHECK (char_length(tag) BETWEEN 2 AND 8 AND tag ~ '^[A-Z0-9]+$'),
  name text NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 2 AND 30),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  charter text NOT NULL DEFAULT '' CHECK (char_length(charter) <= 2000),
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  charter_fee_paid text NOT NULL DEFAULT '10000' CHECK (charter_fee_paid ~ '^\d+$'),
  join_mode text NOT NULL DEFAULT 'public' CHECK (join_mode IN ('public', 'invite', 'request')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'archived', 'dissolved')),
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  experience bigint NOT NULL DEFAULT 0 CHECK (experience >= 0),
  member_count integer NOT NULL DEFAULT 1 CHECK (member_count >= 0),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- 2. Club members table
CREATE TABLE IF NOT EXISTS public.club_members (
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'steward', 'moderator', 'member')),
  joined_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (club_id, user_id)
);

-- 3. Club cooperative projects (P2W 배제, 순수 협동 펀딩)
CREATE TABLE IF NOT EXISTS public.club_projects (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 50),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  target_wld text NOT NULL CHECK (target_wld ~ '^\d+$' AND target_wld::numeric > 0),
  current_wld text NOT NULL DEFAULT '0' CHECK (current_wld ~ '^\d+$'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  reward_badge text,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  completed_at timestamptz
);

-- 4. Club project contributions
CREATE TABLE IF NOT EXISTS public.club_project_contributions (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.club_projects(id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  amount_wld text NOT NULL CHECK (amount_wld ~ '^\d+$' AND amount_wld::numeric > 0),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- 5. Club feed / announcements
CREATE TABLE IF NOT EXISTS public.club_feed_posts (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  is_announcement boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clubs_status ON public.clubs(status);
CREATE INDEX IF NOT EXISTS idx_clubs_tag ON public.clubs(tag);
CREATE INDEX IF NOT EXISTS idx_club_members_user ON public.club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_projects_club ON public.club_projects(club_id, status);
CREATE INDEX IF NOT EXISTS idx_club_contributions_project ON public.club_project_contributions(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_club_feed_club ON public.club_feed_posts(club_id, created_at DESC);

-- 6. Helper Function: 클럽 창설 (10,000 WLD 영구 소각 SINK_CLUB_CHARTER)
CREATE OR REPLACE FUNCTION public.club_create(
  p_actor uuid,
  p_tag text,
  p_name text,
  p_description text,
  p_charter text,
  p_join_mode text,
  p_idempotency_key uuid
)
RETURNS TABLE(
  club_id uuid,
  tag text,
  name text,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_user_account_id uuid;
  v_sink_account_id uuid;
  v_available numeric;
  v_fee numeric := 10000;
  v_club_id uuid;
  v_tag text;
  v_name text;
  v_status text;
  v_created_at timestamptz;
BEGIN
  IF p_actor IS NULL OR p_tag IS NULL OR p_name IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid input parameters';
  END IF;

  -- 1. 유저 계좌 확인 및 잔액 확인 (USER_CASH)
  SELECT a.id, b.available_amount::numeric INTO v_user_account_id, v_available
  FROM public.accounts a
  JOIN public.account_balances b ON b.account_id = a.id
  WHERE a.owner_user_id = p_actor AND a.account_type = 'USER_CASH'::public.account_type AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_user_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'user cash account not found';
  END IF;

  IF v_available < v_fee THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'insufficient balance for club charter (10000 WLD required)';
  END IF;

  -- 2. 소각 계좌(SINK) 조회
  SELECT a.id INTO v_sink_account_id
  FROM public.accounts a
  WHERE a.account_type = 'SINK'::public.account_type AND a.status = 'active'::public.account_status
  LIMIT 1;

  IF v_sink_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'sink account not found';
  END IF;

  -- 3. 잔액 차감 및 소각 원장 트랜잭션 기록
  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric - v_fee), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_user_account_id;

  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric + v_fee), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_sink_account_id;

  INSERT INTO public.ledger_transactions (idempotency_key, type, actor_user_id)
  VALUES (p_idempotency_key, 'SINK_CLUB_CHARTER', p_actor)
  ON CONFLICT (idempotency_key) DO NOTHING;

  -- 4. 클럽 생성
  INSERT INTO public.clubs (tag, name, description, charter, owner_id, join_mode)
  VALUES (
    UPPER(TRIM(p_tag)),
    TRIM(p_name),
    COALESCE(p_description, ''),
    COALESCE(p_charter, ''),
    p_actor,
    COALESCE(p_join_mode, 'public')
  )
  RETURNING id, clubs.tag, clubs.name, clubs.status, clubs.created_at
  INTO v_club_id, v_tag, v_name, v_status, v_created_at;

  -- 5. 생성자를 OWNER로 등록
  INSERT INTO public.club_members (club_id, user_id, role)
  VALUES (v_club_id, p_actor, 'owner');

  -- 6. 클럽 1호 협동 프로젝트 기본 개설 (클럽하우스 1호 거점 구축)
  INSERT INTO public.club_projects (club_id, title, description, target_wld, reward_badge)
  VALUES (
    v_club_id,
    '클럽하우스 1호 거점 구축',
    '클럽원들의 협동 펀딩으로 첫 번째 공동 클럽하우스 거점을 마련합니다.',
    '50000',
    'CLUB_PIONEER'
  );

  RETURN QUERY SELECT v_club_id, v_tag, v_name, v_status, v_created_at;
END;
$$;

-- 7. Helper Function: 클럽 협동 프로젝트 기여 (WLD 영구 소각 SINK_CLUB_PROJECT)
CREATE OR REPLACE FUNCTION public.club_contribute_project(
  p_actor uuid,
  p_club_id uuid,
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
  IF p_actor IS NULL OR p_club_id IS NULL OR p_project_id IS NULL OR p_amount <= 0 OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid input parameters';
  END IF;

  -- 클럽 회원 여부 확인
  IF NOT EXISTS (SELECT 1 FROM public.club_members WHERE club_id = p_club_id AND user_id = p_actor) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'not a member of this club';
  END IF;

  -- 프로젝트 상태 및 잔여액 확인
  SELECT target_wld::numeric, current_wld::numeric, status
  INTO v_target, v_current, v_proj_status
  FROM public.club_projects
  WHERE id = p_project_id AND club_id = p_club_id
  FOR UPDATE;

  IF v_proj_status IS NULL OR v_proj_status <> 'active' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'project is not active';
  END IF;

  v_needed := v_target - v_current;
  IF v_needed <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'project already fully funded';
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

  -- 실제 기여액 계산 (초과 기여 방지: 남은 필요액과 잔액 중 최소값)
  v_actual := LEAST(p_amount, v_needed, v_user_balance);
  IF v_actual <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'cannot contribute 0 WLD';
  END IF;

  -- 소각 계좌 조회
  SELECT a.id INTO v_sink_account_id
  FROM public.accounts a
  WHERE a.account_type = 'SINK'::public.account_type AND a.status = 'active'::public.account_status
  LIMIT 1;

  -- 잔액 차감 및 소각
  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric - v_actual), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_user_account_id;

  UPDATE public.account_balances
  SET available_amount = (available_amount::numeric + v_actual), updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_sink_account_id;

  INSERT INTO public.ledger_transactions (idempotency_key, type, actor_user_id)
  VALUES (p_idempotency_key, 'SINK_CLUB_PROJECT', p_actor)
  ON CONFLICT (idempotency_key) DO NOTHING;

  -- 기여 내역 기록
  INSERT INTO public.club_project_contributions (project_id, club_id, user_id, amount_wld)
  VALUES (p_project_id, p_club_id, p_actor, v_actual::text)
  RETURNING id INTO v_contrib_id;

  -- 프로젝트 진행상황 갱신
  v_new_current := v_current + v_actual;
  IF v_new_current >= v_target THEN
    UPDATE public.club_projects
    SET current_wld = v_new_current::text, status = 'completed', completed_at = pg_catalog.clock_timestamp()
    WHERE id = p_project_id;
    v_proj_status := 'completed';
  ELSE
    UPDATE public.club_projects
    SET current_wld = v_new_current::text
    WHERE id = p_project_id;
  END IF;

  -- 클럽 경험치 누적
  UPDATE public.clubs
  SET experience = experience + v_actual::bigint,
      level = 1 + ((experience + v_actual::bigint) / 100000)::integer,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = p_club_id;

  RETURN QUERY SELECT v_contrib_id, v_actual, v_new_current::text, v_proj_status;
END;
$$;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clubs, public.club_members, public.club_projects, public.club_project_contributions, public.club_feed_posts TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.club_create(uuid, text, text, text, text, text, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.club_contribute_project(uuid, uuid, uuid, numeric, uuid) TO moneyverse_app;

COMMIT;
