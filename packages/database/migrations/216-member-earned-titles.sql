-- 216-member-earned-titles.sql
-- Update version: v2026.09.20.293
-- Let a signed-in member discover only the profile titles actually awarded to them.

BEGIN;

CREATE OR REPLACE FUNCTION public.member_earned_titles(p_actor uuid)
RETURNS TABLE(code text, name text, awarded_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $fn$
  SELECT title_row.code, title_row.name, holding_row.awarded_at
  FROM public.user_titles AS holding_row
  JOIN public.member_titles AS title_row ON title_row.id = holding_row.title_id
  JOIN public.users AS user_row ON user_row.id = holding_row.user_id
  WHERE holding_row.user_id = p_actor
    AND user_row.closed_at IS NULL
  ORDER BY holding_row.awarded_at DESC, title_row.code ASC;
$fn$;

REVOKE ALL ON FUNCTION public.member_earned_titles(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.member_earned_titles(uuid) TO moneyverse_app;

COMMIT;
