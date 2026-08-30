-- Three things the features merged today need in order to be true.
--
-- A LOAN THAT IS OVERDUE THE NEXT MORNING. 076 seeded the `new` credit grade
-- with `term_days = 1`, and until now that number was never read by anything:
-- 078's maturity sweep had no caller, so every loan stayed 'active' for ever
-- and the status shown to a borrower was decorative. Giving the sweep a
-- schedule makes the seed load-bearing, and it says that a member who has
-- been here less than a week -- which is who `new` means -- must repay a
-- twenty-four hour loan or be marked in arrears. `bank_borrow` does not check
-- `credit_limit`, so that member can borrow, and the grade cannot stop them.
-- Thirty days is the term `bank_borrow` already falls back to when a grade
-- has no policy row at all, so it is the number this schema already treats as
-- the default rather than one invented here.
--
-- A STAGE NOBODY COMPUTES. `progression_refresh` is the only writer of
-- `user_progression`, and its only caller is a button on the member's own
-- page. Four readers depend on that table -- the stage screen, the engagement
-- dashboard's next unlock, the bulk payout's stage filter, and the shop's
-- stage-based purchase limits -- and all four answer "not calculated yet"
-- until a member happens to press it. A stage is a consequence of activity
-- that already happened, so it belongs on a clock rather than on a button.
--
-- A PRIVACY CONTROL THAT FAILS OPEN. `member_update_profile` replaces
-- `field_visibility` wholesale, and nothing granted to the application could
-- read the stored map back -- so a form had to render every field as
-- "inherit", and saving a display name republished an image the member had
-- made private. A settings read is the missing half of a write that replaces.

BEGIN;

UPDATE public.bank_credit_policies
SET term_days = 30
WHERE grade = 'new' AND term_days = 1;

-- Every active member's stage, recomputed. Returns how many rows it touched
-- so the scheduler has something to record.
--
-- It takes no actor and checks no role, like 059's activation sweep: it can
-- only recompute a value from activity that already happened, and a scheduler
-- with no session has to be able to call it. `progression_refresh` is
-- SECURITY DEFINER and does its own work; this is the loop around it.
CREATE OR REPLACE FUNCTION public.progression_refresh_all()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_user uuid;
  v_count integer := 0;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:progression-refresh-all', 0)
  );

  FOR v_user IN
    SELECT user_row.id FROM public.users AS user_row
    WHERE user_row.status = 'active'::public.user_status
    ORDER BY user_row.id
  LOOP
    PERFORM public.progression_refresh(v_user);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- The member's own profile as it is stored, including the per-field
-- visibility map. `member_profile_view` deliberately answers what a *reader*
-- may see, which is the wrong question for the owner editing their own
-- settings: a field they have hidden is absent there, and a form built from
-- that cannot tell "hidden" from "never set".
CREATE OR REPLACE FUNCTION public.member_profile_settings(p_actor uuid)
RETURNS TABLE(
  visibility public.profile_visibility,
  display_name text,
  image_url text,
  field_visibility jsonb,
  featured_title text,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  -- One row whether or not a profile has ever been saved, so the form has
  -- defaults to render rather than an empty result it would have to invent
  -- them for.
  RETURN QUERY
  SELECT
    coalesce(profile_row.visibility, 'members'::public.profile_visibility),
    profile_row.display_name,
    profile_row.image_url,
    coalesce(profile_row.field_visibility, '{}'::jsonb),
    profile_row.featured_title,
    profile_row.updated_at
  FROM (SELECT p_actor AS user_id) AS actor
  LEFT JOIN public.member_profiles AS profile_row ON profile_row.user_id = actor.user_id;
END;
$$;

ALTER FUNCTION public.progression_refresh_all() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_profile_settings(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.progression_refresh_all() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_profile_settings(uuid) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.progression_refresh_all() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_profile_settings(uuid) TO moneyverse_app;

COMMIT;
