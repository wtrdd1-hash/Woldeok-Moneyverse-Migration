-- 262-exclude-admins-from-rankings.sql
-- Exclude administrative accounts (superadmin, operator, approver, server_operator) from public leaderboards

CREATE OR REPLACE FUNCTION public.season_event_leaderboard(p_event uuid, p_limit integer DEFAULT 20)
RETURNS TABLE(rank bigint, points bigint, entries bigint, display_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  WITH totals AS (
    SELECT entry.user_id, sum(entry.points_earned)::bigint AS points, count(*)::bigint AS entries
    FROM public.virtual_consumption_event_entries AS entry
    WHERE entry.event_id = p_event
      AND entry.user_id NOT IN (
        SELECT user_id FROM public.user_roles 
        WHERE role IN ('superadmin'::public.admin_role, 'operator'::public.admin_role, 'approver'::public.admin_role, 'server_operator'::public.admin_role)
      )
    GROUP BY entry.user_id
  ), ranked AS (
    SELECT totals.*, dense_rank() OVER (ORDER BY totals.points DESC, totals.entries ASC, totals.user_id) AS rank
    FROM totals
  )
  SELECT ranked.rank, ranked.points, ranked.entries,
         coalesce(public.member_public_name(ranked.user_id), '참여자')
  FROM ranked
  ORDER BY ranked.rank
  LIMIT greatest(1, least(p_limit, 50))
$$;

ALTER FUNCTION public.season_event_leaderboard(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.season_event_leaderboard(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.season_event_leaderboard(uuid, integer) TO moneyverse_app;
