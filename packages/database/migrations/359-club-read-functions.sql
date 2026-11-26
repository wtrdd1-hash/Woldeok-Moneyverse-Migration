-- Migration 359: club reads without tables the application role is not granted.
--
-- ClubReadService read member_profiles.image_url directly (ignoring each member's profile
-- visibility settings) and club_canvases directly; neither table is granted to moneyverse_app by
-- the migration chain. Its joins to users were redundant (RESTRICT foreign keys) and are dropped
-- in code. member_profile_view (080) already applies visibility but raises for a subject that is
-- not active, which would abort a whole member list; this wrapper returns NULL instead.

BEGIN;

CREATE OR REPLACE FUNCTION public.member_profile_image_for(p_actor uuid, p_subject uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_image text;
BEGIN
  IF p_subject IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT profile.image_url INTO v_image FROM public.member_profile_view(p_actor, p_subject) AS profile;
  RETURN v_image;
EXCEPTION WHEN SQLSTATE '28000' OR SQLSTATE '22023' THEN
  -- Not visible / not active: no avatar, and the list keeps the row.
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.club_canvas_read(p_club uuid)
RETURNS TABLE(grid jsonb, total_score integer, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT canvas.grid, canvas.total_score, canvas.updated_at
  FROM public.club_canvases AS canvas
  WHERE canvas.club_id = p_club
$$;

ALTER FUNCTION public.member_profile_image_for(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.club_canvas_read(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_profile_image_for(uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.club_canvas_read(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_profile_image_for(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.club_canvas_read(uuid) TO moneyverse_app;

COMMIT;
