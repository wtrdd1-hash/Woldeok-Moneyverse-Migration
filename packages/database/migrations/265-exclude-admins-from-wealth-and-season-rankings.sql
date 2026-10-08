-- 265-exclude-admins-from-wealth-and-season-rankings.sql
-- Exclude administrative accounts from wealth rankings (admin_list_users) and season settle rewards / hall of fame

BEGIN;

-- 1. admin_list_users: exclude admin roles from wealth rank ranking
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_actor uuid,
  p_limit integer DEFAULT 100
)
RETURNS TABLE(
  user_id uuid,
  status text,
  display_name text,
  created_at timestamp with time zone,
  restricted_at timestamp with time zone,
  restriction_reason text,
  cash_balance bigint,
  bank_balance bigint,
  bond_balance bigint,
  stock_eval bigint,
  total_net_worth bigint,
  wealth_rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  -- Verify caller has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p_actor 
      AND ur.role IN ('approver'::public.admin_role, 'operator'::public.admin_role, 'superadmin'::public.admin_role, 'server_operator'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'admin authority required';
  END IF;

  RETURN QUERY
  WITH user_wealth AS (
    SELECT 
      u.id AS uid,
      u.status::text AS ustatus,
      COALESCE(NULLIF(mp.display_name, ''), iden.iden_display_name, '사용자') AS udisplay_name,
      u.created_at AS ucreated_at,
      r.restricted_at AS urestricted_at,
      r.reason AS urestriction_reason,
      COALESCE((
        SELECT SUM(b.available_amount) 
        FROM public.accounts a 
        JOIN public.account_balances b ON a.id = b.account_id 
        WHERE a.owner_user_id = u.id AND a.account_type = 'USER_CASH' AND a.currency = 'WLD'
      ), 0)::bigint AS ucash,
      COALESCE((
        SELECT SUM(b.available_amount) 
        FROM public.accounts a 
        JOIN public.account_balances b ON a.id = b.account_id 
        WHERE a.owner_user_id = u.id AND a.account_type = 'USER_BANK' AND a.currency = 'WLD'
      ), 0)::bigint AS ubank,
      COALESCE((
        SELECT SUM(principal_amount) 
        FROM public.virtual_bank_bonds 
        WHERE virtual_bank_bonds.user_id = u.id AND virtual_bank_bonds.status = 'ACTIVE'
      ), 0)::bigint AS ubond,
      COALESCE((
        SELECT SUM(p.quantity * s.current_price) 
        FROM public.virtual_stock_positions p 
        JOIN public.virtual_stocks s ON p.stock_id = s.id 
        WHERE p.user_id = u.id AND p.quantity > 0
      ), 0)::bigint AS ustock,
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = u.id 
          AND ur.role IN ('approver'::public.admin_role, 'operator'::public.admin_role, 'superadmin'::public.admin_role, 'server_operator'::public.admin_role)
      ) AS is_admin
    FROM public.users u
    LEFT JOIN public.member_profiles mp ON u.id = mp.user_id
    LEFT JOIN LATERAL (SELECT id_row.display_name AS iden_display_name FROM public.identities id_row WHERE id_row.user_id = u.id ORDER BY id_row.linked_at LIMIT 1) iden ON true
    LEFT JOIN public.user_restrictions r ON r.user_id = u.id AND r.lifted_at IS NULL
  ),
  ranked_members AS (
    SELECT 
      uid,
      DENSE_RANK() OVER (ORDER BY (ucash + ubank + ubond + ustock) DESC, ucreated_at ASC) AS r_rank
    FROM user_wealth
    WHERE NOT is_admin
  )
  SELECT 
    w.uid,
    w.ustatus,
    w.udisplay_name,
    w.ucreated_at,
    w.urestricted_at,
    w.urestriction_reason,
    w.ucash,
    w.ubank,
    w.ubond,
    w.ustock,
    (w.ucash + w.ubank + w.ubond + w.ustock) AS utotal_net_worth,
    r.r_rank AS uwealth_rank
  FROM user_wealth w
  LEFT JOIN ranked_members r ON r.uid = w.uid
  ORDER BY 
    (CASE WHEN r.r_rank IS NOT NULL THEN 0 ELSE 1 END) ASC,
    r.r_rank ASC NULLS LAST,
    (w.ucash + w.ubank + w.ubond + w.ustock) DESC,
    w.ucreated_at ASC
  LIMIT greatest(1, least(p_limit, 200));
END;
$$;

ALTER FUNCTION public.admin_list_users(uuid, integer)
  OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_users(uuid, integer)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_list_users(uuid, integer)
  TO moneyverse_app;

-- 2. season_settle_rewards: exclude admin accounts from season rankings & hall of fame
CREATE OR REPLACE FUNCTION public.season_settle_rewards(p_season_id uuid)
RETURNS TABLE(settled_count integer, hall_of_fame_count integer, season_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_season_name text;
  v_active boolean;
  v_total_participants integer;
  v_hof_count integer := 0;
  v_settled integer := 0;
  v_rec record;
  v_tier text;
  v_reward_wld numeric;
  v_trophy text;
  v_pct numeric;
BEGIN
  -- 시즌 확인
  SELECT name, active INTO v_season_name, v_active
  FROM public.virtual_seasons
  WHERE id = p_season_id;

  IF v_season_name IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'season not found';
  END IF;

  -- 이미 정산되어 명예의 전당에 등록되었는지 확인
  SELECT count(*) INTO v_hof_count
  FROM public.season_hall_of_fame
  WHERE season_id = p_season_id;

  IF v_hof_count > 0 THEN
    RETURN QUERY SELECT 0, v_hof_count, v_season_name;
    RETURN;
  END IF;

  -- 총 참가자 수 및 점수 집계 템프 생성 (관리자 계정 전면 제외)
  DROP TABLE IF EXISTS _tmp_season_rankings;
  CREATE TEMP TABLE _tmp_season_rankings ON COMMIT DROP AS
  WITH totals AS (
    SELECT entry.user_id,
           SUM(entry.points_earned)::numeric AS points,
           COUNT(*)::bigint AS entries
    FROM public.virtual_consumption_event_entries entry
    JOIN public.virtual_consumption_events evt ON evt.id = entry.event_id
    WHERE evt.season_id = p_season_id
      AND entry.user_id NOT IN (
        SELECT user_id FROM public.user_roles 
        WHERE role IN ('superadmin'::public.admin_role, 'operator'::public.admin_role, 'approver'::public.admin_role, 'server_operator'::public.admin_role)
      )
    GROUP BY entry.user_id
  ),
  ranked AS (
    SELECT totals.user_id,
           totals.points,
           totals.entries,
           DENSE_RANK() OVER (ORDER BY totals.points DESC, totals.entries ASC, totals.user_id) AS rank,
           COALESCE(
             (SELECT iden.display_name FROM public.identities iden WHERE iden.user_id = totals.user_id ORDER BY iden.linked_at LIMIT 1),
             '도전자'
           ) AS display_name
    FROM totals
  )
  SELECT * FROM ranked;

  SELECT count(*) INTO v_total_participants FROM _tmp_season_rankings;

  IF v_total_participants = 0 THEN
    -- 참가자가 없을 경우 빈 정산 완료 처리
    UPDATE public.virtual_seasons
    SET active = false, lifecycle_state = 'closed', closed_at = pg_catalog.clock_timestamp()
    WHERE id = p_season_id;

    RETURN QUERY SELECT 0, 0, v_season_name;
    RETURN;
  END IF;

  -- 랭킹별 티어 및 보상 배정 루프
  FOR v_rec IN SELECT * FROM _tmp_season_rankings ORDER BY rank ASC LOOP
    v_pct := (v_rec.rank::numeric / v_total_participants::numeric) * 100.0;

    IF v_rec.rank <= 10 THEN
      v_tier := 'Capital Master';
      v_reward_wld := 500;
      v_trophy := 'TROPHY_SEASON_CHAMPION_#' || v_rec.rank;

      -- 명예의 전당 아카이빙
      INSERT INTO public.season_hall_of_fame (season_id, season_name, rank, user_id, display_name, score, trophy_code)
      VALUES (p_season_id, v_season_name, v_rec.rank, v_rec.user_id, v_rec.display_name, v_rec.points, v_trophy)
      ON CONFLICT (season_id, rank) DO NOTHING;

      v_hof_count := v_hof_count + 1;
    ELSIF v_pct <= 1.0 THEN
      v_tier := 'Diamond';
      v_reward_wld := 500;
      v_trophy := NULL;
    ELSIF v_pct <= 5.0 THEN
      v_tier := 'Platinum';
      v_reward_wld := 400;
      v_trophy := NULL;
    ELSIF v_pct <= 20.0 THEN
      v_tier := 'Gold';
      v_reward_wld := 250;
      v_trophy := NULL;
    ELSIF v_pct <= 50.0 THEN
      v_tier := 'Silver';
      v_reward_wld := 150;
      v_trophy := NULL;
    ELSE
      v_tier := 'Bronze';
      v_reward_wld := 100;
      v_trophy := NULL;
    END IF;

    INSERT INTO public.season_reward_claims (season_id, season_name, user_id, rank, tier, reward_wld, trophy_code)
    VALUES (p_season_id, v_season_name, v_rec.user_id, v_rec.rank, v_tier, v_reward_wld, v_trophy)
    ON CONFLICT (season_id, user_id) DO NOTHING;

    v_settled := v_settled + 1;
  END LOOP;

  -- 시즌 상태 closed 처리
  UPDATE public.virtual_seasons
  SET active = false, lifecycle_state = 'closed', closed_at = pg_catalog.clock_timestamp()
  WHERE id = p_season_id;

  RETURN QUERY SELECT v_settled, v_hof_count, v_season_name;
END;
$$;

ALTER FUNCTION public.season_settle_rewards(uuid)
  OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.season_settle_rewards(uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.season_settle_rewards(uuid)
  TO moneyverse_app;

COMMIT;
