-- The engagement loop, with the writers its tables were missing.
--
-- 081 creates seven tables and an earlier revision of this file wrote to
-- none of them: no quest could be progressed, no collection unlocked, no NPC
-- befriended, no preference set, and the activity signals a return campaign
-- would read stayed empty. An applied migration is checksum-frozen, so a
-- table that lands ahead of its code cannot be corrected later -- only added
-- to. The writers land here, with the readers.
--
-- The activity signals are maintained by triggers rather than by the
-- application. They are observations of things that already happen -- a work
-- reward, a shop purchase -- and asking every future caller to remember to
-- report them is how a signal quietly stops being recorded.
--
-- ORDER: this migration reads `public.user_progression`, which 076 creates.
-- plpgsql does not resolve table names at CREATE time, so applying this
-- without it would migrate green, deploy green, and fail on the first member
-- request. It sits above it in the stack for that reason.

BEGIN;

CREATE OR REPLACE FUNCTION public.engagement_period_key(p_kind text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT CASE p_kind
    WHEN 'weekly' THEN date_trunc('week', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date::text
    ELSE (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date::text
  END
$$;

CREATE OR REPLACE FUNCTION public.engagement_record_progress(
  p_key uuid,
  p_actor uuid,
  p_code text,
  p_amount integer
)
RETURNS TABLE(code text, progress integer, completed boolean, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_catalog uuid;
  v_kind text;
  v_target integer;
  v_reward jsonb;
  v_period text;
  v_owner uuid;
  v_progress integer;
  v_completed timestamptz;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_code IS NULL
    OR p_amount IS NULL OR p_amount < 1 OR p_amount > 1000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid engagement progress';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:engagement-progress:' || p_key::text, 0)
  );

  SELECT receipt_row.user_id, receipt_row.catalog_id, receipt_row.period_key
  INTO v_owner, v_catalog, v_period
  FROM public.engagement_progress_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'engagement receipt belongs to another user';
    END IF;
    SELECT catalog_row.code, progress_row.progress, progress_row.completed_at
    INTO code, v_progress, v_completed
    FROM public.engagement_progress AS progress_row
    JOIN public.engagement_catalog AS catalog_row ON catalog_row.id = progress_row.catalog_id
    WHERE progress_row.user_id = p_actor AND progress_row.catalog_id = v_catalog
      AND progress_row.period_key = v_period;
    progress := coalesce(v_progress, 0);
    completed := v_completed IS NOT NULL;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  SELECT catalog_row.id, catalog_row.kind, catalog_row.reward
  INTO v_catalog, v_kind, v_reward
  FROM public.engagement_catalog AS catalog_row
  WHERE catalog_row.code = p_code AND catalog_row.active
  FOR KEY SHARE;

  IF v_catalog IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown engagement goal';
  END IF;

  v_period := public.engagement_period_key(v_kind);

  INSERT INTO public.engagement_progress AS progress_row (user_id, catalog_id, period_key, progress)
  VALUES (p_actor, v_catalog, v_period, p_amount)
  ON CONFLICT (user_id, catalog_id, period_key) DO UPDATE
  SET progress = progress_row.progress + excluded.progress
  RETURNING progress_row.progress INTO v_progress;

  -- The requirement is the single number the catalogue entry declares. A goal
  -- with several is not modelled yet, and pretending otherwise here would let
  -- a half-finished quest report itself complete.
  SELECT max(entry.requirement_value::integer) INTO v_target
  FROM public.engagement_catalog AS catalog_row,
       LATERAL pg_catalog.jsonb_each_text(catalog_row.requirements) AS entry(requirement_key, requirement_value)
  WHERE catalog_row.id = v_catalog
    -- Numeric requirements only. A future entry carrying a word would
    -- otherwise raise 22P02 from a cast and take the whole call with it.
    AND entry.requirement_value ~ '^[0-9]{1,9}$';

  IF v_target IS NOT NULL AND v_progress >= v_target THEN
    UPDATE public.engagement_progress AS progress_row
    SET completed_at = coalesce(progress_row.completed_at, pg_catalog.clock_timestamp())
    WHERE progress_row.user_id = p_actor AND progress_row.catalog_id = v_catalog
      AND progress_row.period_key = v_period
    RETURNING progress_row.completed_at INTO v_completed;

    IF v_reward ? 'collection' THEN
      INSERT INTO public.collection_entries (user_id, collection_code, entry_code)
      VALUES (p_actor, v_reward ->> 'collection', p_code)
      ON CONFLICT (user_id, collection_code, entry_code) DO NOTHING;
    END IF;

    IF v_reward ? 'title' THEN
      INSERT INTO public.user_titles (user_id, title_id)
      SELECT p_actor, title_row.id FROM public.member_titles AS title_row
      WHERE title_row.code = v_reward ->> 'title'
      ON CONFLICT (user_id, title_id) DO NOTHING;
    END IF;
  END IF;

  INSERT INTO public.engagement_progress_receipts (
    idempotency_key, user_id, catalog_id, period_key, amount
  ) VALUES (p_key, p_actor, v_catalog, v_period, p_amount);

  code := p_code;
  progress := v_progress;
  completed := v_completed IS NOT NULL;
  replayed := false;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.engagement_record_npc_order(
  p_key uuid,
  p_actor uuid,
  p_npc_code text
)
RETURNS TABLE(npc_code text, affinity integer, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_npc uuid;
  v_existing boolean;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_npc_code IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid npc order';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:engagement-npc:' || p_key::text, 0)
  );

  SELECT npc_row.id INTO v_npc
  FROM public.npc_profiles AS npc_row
  WHERE npc_row.code = p_npc_code AND npc_row.active;

  IF v_npc IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown npc';
  END IF;

  -- The order itself is a piece of engagement progress, so the receipt table
  -- carries it and the affinity moves exactly once per key.
  SELECT true INTO v_existing
  FROM public.engagement_progress_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF coalesce(v_existing, false) THEN
    SELECT relationship_row.affinity INTO affinity
    FROM public.npc_relationships AS relationship_row
    WHERE relationship_row.user_id = p_actor AND relationship_row.npc_id = v_npc;
    npc_code := p_npc_code;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  PERFORM public.engagement_record_progress(p_key, p_actor, 'neighbour_help', 1);

  INSERT INTO public.npc_relationships AS relationship_row (user_id, npc_id, affinity)
  VALUES (p_actor, v_npc, 1)
  ON CONFLICT (user_id, npc_id) DO UPDATE
  SET affinity = relationship_row.affinity + 1
  RETURNING relationship_row.affinity INTO affinity;

  npc_code := p_npc_code;
  replayed := false;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_set_engagement_preferences(
  p_actor uuid,
  p_notifications boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_notifications IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  INSERT INTO public.member_engagement_preferences (user_id, notifications_enabled)
  VALUES (p_actor, p_notifications)
  ON CONFLICT (user_id) DO UPDATE
  SET notifications_enabled = excluded.notifications_enabled,
      updated_at = pg_catalog.clock_timestamp();

  RETURN p_notifications;
END;
$$;

-- Observed, not reported. A caller that has to remember to record a signal is
-- a caller that will eventually forget.
CREATE OR REPLACE FUNCTION public.engagement_note_work_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.member_activity_signals AS signal_row (user_id, last_work_at, repeated_task_count)
  VALUES (NEW.user_id, pg_catalog.clock_timestamp(), 1)
  ON CONFLICT (user_id) DO UPDATE
  SET last_work_at = pg_catalog.clock_timestamp(),
      repeated_task_count = signal_row.repeated_task_count + 1,
      updated_at = pg_catalog.clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.engagement_note_purchase_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.member_activity_signals AS signal_row (user_id, last_shop_purchase_at)
  VALUES (NEW.user_id, pg_catalog.clock_timestamp())
  ON CONFLICT (user_id) DO UPDATE
  SET last_shop_purchase_at = pg_catalog.clock_timestamp(),
      updated_at = pg_catalog.clock_timestamp();
  RETURN NEW;
END;
$$;

DO $do$
DECLARE
  v_pair text[];
BEGIN
  FOREACH v_pair SLICE 1 IN ARRAY ARRAY[
    ARRAY['work_reward_receipts', 'work_reward_receipts_activity_signal', 'engagement_note_work_signal'],
    ARRAY['shop_purchases', 'shop_purchases_activity_signal', 'engagement_note_purchase_signal']
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_trigger AS trigger_row
      WHERE trigger_row.tgrelid = ('public.' || v_pair[1])::pg_catalog.regclass
        AND trigger_row.tgname = v_pair[2]
        AND NOT trigger_row.tgisinternal
    ) THEN
      EXECUTE pg_catalog.format(
        'CREATE TRIGGER %I AFTER INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.%I()',
        v_pair[2], v_pair[1], v_pair[3]
      );
    END IF;
  END LOOP;
END;
$do$;

CREATE OR REPLACE FUNCTION public.member_engagement_dashboard(p_actor uuid)
RETURNS TABLE(today_tasks jsonb, weekly_goals jsonb, next_unlock jsonb, notifications_enabled boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day text := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date::text;
  v_week text := date_trunc('week', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date::text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  RETURN QUERY SELECT
    (SELECT coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
       'code', goal.code, 'title', goal.title, 'progress', coalesce(progress_row.progress, 0))), '[]'::jsonb)
     FROM (
       SELECT catalog_row.id, catalog_row.code, catalog_row.title
       FROM public.engagement_catalog AS catalog_row
       WHERE catalog_row.active AND catalog_row.kind IN ('quest', 'daily', 'npc_order')
       ORDER BY catalog_row.code LIMIT 3
     ) AS goal
     LEFT JOIN public.engagement_progress AS progress_row
       ON progress_row.catalog_id = goal.id AND progress_row.user_id = p_actor
       AND progress_row.period_key = v_day),
    (SELECT coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
       'code', goal.code, 'title', goal.title, 'progress', coalesce(progress_row.progress, 0))), '[]'::jsonb)
     FROM (
       SELECT catalog_row.id, catalog_row.code, catalog_row.title
       FROM public.engagement_catalog AS catalog_row
       WHERE catalog_row.active AND catalog_row.kind = 'weekly'
       ORDER BY catalog_row.code LIMIT 3
     ) AS goal
     LEFT JOIN public.engagement_progress AS progress_row
       ON progress_row.catalog_id = goal.id AND progress_row.user_id = p_actor
       AND progress_row.period_key = v_week),
    -- NULL at the top stage, not an object of nulls: the screen would
    -- otherwise render an empty "next unlock" card forever.
    (SELECT CASE WHEN next_row.code IS NULL THEN NULL
              ELSE pg_catalog.jsonb_build_object('stage', next_row.code,
                                                 'requirements', next_row.unlock_requirements) END
     FROM public.user_progression AS progression_row
     JOIN public.progression_stages AS stage_row ON stage_row.code = progression_row.stage_code
     LEFT JOIN public.progression_stages AS next_row ON next_row.ordinal = stage_row.ordinal + 1
     WHERE progression_row.user_id = p_actor),
    coalesce((SELECT preference_row.notifications_enabled
              FROM public.member_engagement_preferences AS preference_row
              WHERE preference_row.user_id = p_actor), true);
END;
$$;

CREATE OR REPLACE FUNCTION public.season_close_due()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.virtual_seasons AS season_row
  SET active = false, lifecycle_state = 'closed', closed_at = pg_catalog.clock_timestamp()
  WHERE season_row.active AND season_row.ends_at <= pg_catalog.clock_timestamp();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

ALTER FUNCTION public.engagement_period_key(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.engagement_record_progress(uuid, uuid, text, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.engagement_record_npc_order(uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_set_engagement_preferences(uuid, boolean) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.engagement_note_work_signal() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.engagement_note_purchase_signal() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_engagement_dashboard(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.season_close_due() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.engagement_period_key(text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.engagement_record_progress(uuid, uuid, text, integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.engagement_record_npc_order(uuid, uuid, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_set_engagement_preferences(uuid, boolean)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.engagement_note_work_signal() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.engagement_note_purchase_signal() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_engagement_dashboard(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.season_close_due() FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.engagement_record_progress(uuid, uuid, text, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.engagement_record_npc_order(uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_set_engagement_preferences(uuid, boolean) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_engagement_dashboard(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.season_close_due() TO moneyverse_app;

COMMIT;
