-- 124-admin-users-wealth-and-rich-list.sql
--
-- Expose member wealth metrics (cash, bank, bond, stocks, total net worth, wealth rank)
-- to admin console, plus single-user detailed asset portfolio inspection.

BEGIN;

DROP FUNCTION IF EXISTS public.admin_list_users(uuid, integer);

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
      ), 0)::bigint AS ustock
    FROM public.users u
    LEFT JOIN public.member_profiles mp ON u.id = mp.user_id
    LEFT JOIN LATERAL (SELECT id_row.display_name AS iden_display_name FROM public.identities id_row WHERE id_row.user_id = u.id ORDER BY id_row.linked_at LIMIT 1) iden ON true
    LEFT JOIN public.user_restrictions r ON r.user_id = u.id AND r.lifted_at IS NULL
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
    DENSE_RANK() OVER (ORDER BY (w.ucash + w.ubank + w.ubond + w.ustock) DESC, w.ucreated_at ASC) AS uwealth_rank
  FROM user_wealth w
  ORDER BY uwealth_rank ASC, w.ucreated_at DESC
  LIMIT greatest(1, least(p_limit, 200));
END;
$$;

ALTER FUNCTION public.admin_list_users(uuid, integer)
  OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_users(uuid, integer)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_list_users(uuid, integer)
  TO moneyverse_app;

-- Detailed user asset portfolio breakdown function
CREATE OR REPLACE FUNCTION public.admin_get_user_portfolio(
  p_actor uuid,
  p_target_user uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Verify caller has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p_actor 
      AND ur.role IN ('approver'::public.admin_role, 'operator'::public.admin_role, 'superadmin'::public.admin_role, 'server_operator'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'admin authority required';
  END IF;

  SELECT jsonb_build_object(
    'userId', u.id,
    'displayName', COALESCE(NULLIF(mp.display_name, ''), iden.iden_display_name, '사용자'),
    'status', u.status,
    'createdAt', u.created_at,
    'restrictedAt', r.restricted_at,
    'restrictionReason', r.reason,
    'cashBalance', COALESCE((
      SELECT SUM(b.available_amount) 
      FROM public.accounts a 
      JOIN public.account_balances b ON a.id = b.account_id 
      WHERE a.owner_user_id = u.id AND a.account_type = 'USER_CASH' AND a.currency = 'WLD'
    ), 0),
    'bankBalance', COALESCE((
      SELECT SUM(b.available_amount) 
      FROM public.accounts a 
      JOIN public.account_balances b ON a.id = b.account_id 
      WHERE a.owner_user_id = u.id AND a.account_type = 'USER_BANK' AND a.currency = 'WLD'
    ), 0),
    'bondBalance', COALESCE((
      SELECT SUM(principal_amount) 
      FROM public.virtual_bank_bonds 
      WHERE virtual_bank_bonds.user_id = u.id AND virtual_bank_bonds.status = 'ACTIVE'
    ), 0),
    'stockEval', COALESCE((
      SELECT SUM(p.quantity * s.current_price) 
      FROM public.virtual_stock_positions p 
      JOIN public.virtual_stocks s ON p.stock_id = s.id 
      WHERE p.user_id = u.id AND p.quantity > 0
    ), 0),
    'stocks', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'stockId', p.stock_id,
        'symbol', s.symbol,
        'name', s.name,
        'quantity', p.quantity,
        'averageCost', p.average_cost,
        'currentPrice', s.current_price,
        'evalAmount', p.quantity * s.current_price,
        'profitLoss', p.quantity * (s.current_price - p.average_cost)
      ))
      FROM public.virtual_stock_positions p
      JOIN public.virtual_stocks s ON p.stock_id = s.id
      WHERE p.user_id = u.id AND p.quantity > 0
    ), '[]'::jsonb),
    'bonds', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', b.id,
        'bondCode', b.bond_code,
        'bondName', b.bond_name,
        'principalAmount', b.principal_amount,
        'yieldBps', b.yield_bps,
        'maturityAmount', b.maturity_amount,
        'purchasedAt', b.purchased_at,
        'maturityAt', b.maturity_at,
        'status', b.status
      ))
      FROM public.virtual_bank_bonds b
      WHERE b.user_id = u.id AND b.status = 'ACTIVE'
    ), '[]'::jsonb)
  )
  INTO v_result
  FROM public.users u
  LEFT JOIN public.member_profiles mp ON u.id = mp.user_id
  LEFT JOIN LATERAL (SELECT id_row.display_name AS iden_display_name FROM public.identities id_row WHERE id_row.user_id = u.id ORDER BY id_row.linked_at LIMIT 1) iden ON true
  LEFT JOIN public.user_restrictions r ON r.user_id = u.id AND r.lifted_at IS NULL
  WHERE u.id = p_target_user;

  IF v_result IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'user not found';
  END IF;

  RETURN v_result;
END;
$$;

ALTER FUNCTION public.admin_get_user_portfolio(uuid, uuid)
  OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_get_user_portfolio(uuid, uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_get_user_portfolio(uuid, uuid)
  TO moneyverse_app;

COMMIT;
