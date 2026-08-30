-- Profiles a member can actually have, and a self-exclusion that holds.
--
-- 079 creates `member_profiles` and nothing writes to it -- no function, no
-- backfill, no trigger, and `moneyverse_app` is revoked from the table. So
-- `member_profile_view` raised 28000 for every subject including the member's
-- own. `member_update_profile` below is the writer, and the view falls back
-- to a default profile so a member who has never opened the screen is still
-- visible on the terms 079 declares as the default.
--
-- The view also raised 42702 before it could answer: `display_name` and
-- `job_type` are OUT parameters and were referenced unqualified inside the
-- LATERAL subqueries, and plpgsql defaults to variable_conflict = error.
--
-- `casino_self_limits` was stored and enforced by nothing. A self-exclusion
-- control that does not hold is worse than none, because the member believes
-- it is holding. The enforcement is a trigger on `virtual_casino_coin_plays`
-- rather than a check inside `casino_play_coin`: the play function is long,
-- careful and correct, and copying its body here to add four lines would
-- freeze it at today's text -- exactly what 057's comment warns about. A
-- trigger cannot be bypassed by a future second game path either, and it
-- cannot be forgotten on the day the casino is switched on.

BEGIN;

CREATE OR REPLACE FUNCTION public.member_field_visible(
  p_profile_visibility public.profile_visibility,
  p_field_visibility jsonb,
  p_field text,
  p_is_self boolean,
  p_is_member boolean
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT CASE
    WHEN p_is_self THEN true
    ELSE CASE coalesce(p_field_visibility ->> p_field, p_profile_visibility::text)
      WHEN 'public' THEN true
      WHEN 'members' THEN coalesce(p_is_member, false)
      ELSE false
    END
  END
$$;

CREATE OR REPLACE FUNCTION public.member_update_profile(
  p_actor uuid,
  p_visibility text,
  p_display_name text,
  p_image_url text,
  p_field_visibility jsonb,
  p_featured_title text
)
RETURNS TABLE(
  visibility public.profile_visibility,
  display_name text,
  image_url text,
  field_visibility jsonb,
  featured_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_visibility public.profile_visibility;
  v_fields jsonb := coalesce(p_field_visibility, '{}'::jsonb);
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  IF coalesce(p_visibility, '') NOT IN ('public', 'members', 'private') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'visibility must be public, members or private';
  END IF;
  v_visibility := p_visibility::public.profile_visibility;

  IF pg_catalog.jsonb_typeof(v_fields) <> 'object'
    OR EXISTS (
      SELECT 1 FROM pg_catalog.jsonb_each_text(v_fields) AS entry(field_key, field_value)
      WHERE entry.field_value NOT IN ('public', 'members', 'private')
    ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'field visibility must map fields to a visibility';
  END IF;

  -- A title the member does not hold is not theirs to display.
  IF p_featured_title IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.user_titles AS holding_row
    JOIN public.member_titles AS title_row ON title_row.id = holding_row.title_id
    WHERE holding_row.user_id = p_actor AND title_row.code = p_featured_title
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'that title has not been awarded';
  END IF;

  INSERT INTO public.member_profiles AS profile_row (
    user_id, visibility, display_name, image_url, field_visibility, featured_title
  ) VALUES (
    p_actor, v_visibility, p_display_name, p_image_url, v_fields, p_featured_title
  )
  ON CONFLICT (user_id) DO UPDATE
  SET visibility = excluded.visibility,
      display_name = excluded.display_name,
      image_url = excluded.image_url,
      field_visibility = excluded.field_visibility,
      featured_title = excluded.featured_title,
      updated_at = pg_catalog.clock_timestamp()
  RETURNING profile_row.visibility, profile_row.display_name, profile_row.image_url,
            profile_row.field_visibility, profile_row.featured_title
  INTO visibility, display_name, image_url, field_visibility, featured_title;

  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_profile_view(p_actor uuid, p_subject uuid)
RETURNS TABLE(
  display_name text,
  image_url text,
  joined_at timestamptz,
  job_type public.work_job_type,
  job_level integer,
  work_completions bigint,
  visibility public.profile_visibility,
  featured_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_visibility public.profile_visibility;
  v_fields jsonb;
  v_is_self boolean;
  v_is_member boolean;
BEGIN
  IF p_subject IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'profile subject required';
  END IF;

  -- A deleted or restricted member is not on show. Without this, knowing a
  -- user id was enough to keep reading a profile after the account was closed.
  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_subject AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'profile is not available';
  END IF;

  v_is_self := p_actor IS NOT NULL AND p_actor = p_subject;
  v_is_member := p_actor IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  );

  -- A member who has never opened the screen has no row, and 079 declares the
  -- default. Refusing them would have made every profile unavailable.
  SELECT coalesce(profile_row.visibility, 'members'::public.profile_visibility),
         coalesce(profile_row.field_visibility, '{}'::jsonb)
  INTO v_visibility, v_fields
  FROM public.users AS user_row
  LEFT JOIN public.member_profiles AS profile_row ON profile_row.user_id = user_row.id
  WHERE user_row.id = p_subject;

  IF NOT public.member_field_visible(v_visibility, v_fields, 'profile', v_is_self, v_is_member) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'profile is not available';
  END IF;

  RETURN QUERY
  SELECT
    coalesce(profile_row.display_name, identity_row.identity_name),
    CASE WHEN public.member_field_visible(v_visibility, v_fields, 'imageUrl', v_is_self, v_is_member)
      THEN profile_row.image_url END,
    user_row.created_at,
    CASE WHEN public.member_field_visible(v_visibility, v_fields, 'jobType', v_is_self, v_is_member)
      THEN progress_row.progress_job END,
    CASE WHEN public.member_field_visible(v_visibility, v_fields, 'jobType', v_is_self, v_is_member)
      THEN progress_row.progress_level END,
    CASE WHEN public.member_field_visible(v_visibility, v_fields, 'workCompletions', v_is_self, v_is_member)
      THEN (SELECT count(*) FROM public.work_reward_receipts AS receipt_row
            WHERE receipt_row.user_id = user_row.id) END,
    v_visibility,
    CASE WHEN public.member_field_visible(v_visibility, v_fields, 'featuredTitle', v_is_self, v_is_member)
      THEN profile_row.featured_title END
  FROM public.users AS user_row
  LEFT JOIN public.member_profiles AS profile_row ON profile_row.user_id = user_row.id
  -- Aliased columns inside the LATERAL, because `display_name` and `job_type`
  -- are OUT parameters of this function as well as column names.
  LEFT JOIN LATERAL (
    SELECT identity.display_name AS identity_name
    FROM public.identities AS identity
    WHERE identity.user_id = user_row.id
    ORDER BY identity.linked_at
    LIMIT 1
  ) AS identity_row ON true
  LEFT JOIN LATERAL (
    SELECT progress.job_type AS progress_job, progress.level AS progress_level
    FROM public.user_job_progress AS progress
    WHERE progress.user_id = user_row.id
    ORDER BY progress.level DESC, progress.job_type
    LIMIT 1
  ) AS progress_row ON true
  WHERE user_row.id = p_subject;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_set_casino_self_limit(
  p_actor uuid,
  p_daily_bet bigint,
  p_daily_loss bigint,
  p_lock_until timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_changed integer;
BEGIN
  IF p_actor IS NULL OR p_daily_bet IS NULL OR p_daily_loss IS NULL
    OR p_daily_bet < 0 OR p_daily_loss < 0
    OR (p_lock_until IS NOT NULL AND p_lock_until <= pg_catalog.clock_timestamp()) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid casino self limit';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  -- The lock check lives inside the write. Reading it first and upserting
  -- afterwards left a window where two concurrent calls both saw an unlocked
  -- row and the weaker limit won -- on a control whose entire purpose is that
  -- it cannot be loosened on impulse.
  INSERT INTO public.casino_self_limits AS limit_row (
    user_id, daily_bet_limit, daily_loss_limit, locked_until
  ) VALUES (p_actor, p_daily_bet, p_daily_loss, p_lock_until)
  ON CONFLICT (user_id) DO UPDATE
  SET daily_bet_limit = excluded.daily_bet_limit,
      daily_loss_limit = excluded.daily_loss_limit,
      locked_until = excluded.locked_until,
      updated_at = pg_catalog.clock_timestamp()
  WHERE limit_row.locked_until IS NULL
     OR limit_row.locked_until <= pg_catalog.clock_timestamp();

  GET DIAGNOSTICS v_changed = ROW_COUNT;
  IF v_changed = 0 THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino self limit is locked';
  END IF;
END;
$$;

-- The self-limit, enforced where the play lands rather than where it is
-- requested. 060's `casino_play_coin` already holds the operator's daily
-- stake and loss caps; this is the member's own, and the stricter of the two
-- wins because both are checked.
CREATE OR REPLACE FUNCTION public.casino_enforce_self_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_bet_limit bigint;
  v_loss_limit bigint;
  v_locked timestamptz;
  v_staked bigint;
  v_lost bigint;
BEGIN
  SELECT limit_row.daily_bet_limit, limit_row.daily_loss_limit, limit_row.locked_until
  INTO v_bet_limit, v_loss_limit, v_locked
  FROM public.casino_self_limits AS limit_row
  WHERE limit_row.user_id = NEW.user_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF v_locked IS NOT NULL AND v_locked > pg_catalog.clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'you have locked yourself out of the casino';
  END IF;

  SELECT coalesce(sum(play_row.stake_amount), 0),
         coalesce(-sum(least(play_row.net_amount, 0)), 0)
  INTO v_staked, v_lost
  FROM public.virtual_casino_coin_plays AS play_row
  WHERE play_row.user_id = NEW.user_id AND play_row.play_date = NEW.play_date;

  IF v_staked + NEW.stake_amount > v_bet_limit THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'your own daily stake limit is reached';
  END IF;

  IF v_lost + greatest(-NEW.net_amount, 0) > v_loss_limit THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'your own daily loss limit is reached';
  END IF;

  RETURN NEW;
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.virtual_casino_coin_plays'::pg_catalog.regclass
      AND trigger_row.tgname = 'virtual_casino_coin_plays_self_limit'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER virtual_casino_coin_plays_self_limit
      BEFORE INSERT ON public.virtual_casino_coin_plays
      FOR EACH ROW
      EXECUTE FUNCTION public.casino_enforce_self_limit();
  END IF;
END;
$do$;

ALTER FUNCTION public.member_field_visible(public.profile_visibility, jsonb, text, boolean, boolean)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_update_profile(uuid, text, text, text, jsonb, text)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_profile_view(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_set_casino_self_limit(uuid, bigint, bigint, timestamptz)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_enforce_self_limit() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.member_field_visible(public.profile_visibility, jsonb, text, boolean, boolean)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_update_profile(uuid, text, text, text, jsonb, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_profile_view(uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_set_casino_self_limit(uuid, bigint, bigint, timestamptz)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_enforce_self_limit() FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.member_update_profile(uuid, text, text, text, jsonb, text)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_profile_view(uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_set_casino_self_limit(uuid, bigint, bigint, timestamptz)
  TO moneyverse_app;

COMMIT;
