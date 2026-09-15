BEGIN;

CREATE TABLE public.server_game_clock_policy (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  epoch_at timestamptz NOT NULL,
  real_seconds_per_day integer NOT NULL CHECK (real_seconds_per_day BETWEEN 60 AND 86400),
  game_days_per_week smallint NOT NULL DEFAULT 7 CHECK (game_days_per_week BETWEEN 2 AND 14),
  policy_version text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

INSERT INTO public.server_game_clock_policy (
  singleton, epoch_at, real_seconds_per_day, game_days_per_week, policy_version
) VALUES (
  true, '2026-09-15 00:00:00+09'::timestamptz, 600, 7, 'v2026.09.15.114'
);

REVOKE ALL ON TABLE public.server_game_clock_policy FROM PUBLIC, moneyverse_app;
ALTER TABLE public.server_game_clock_policy OWNER TO moneyverse_migrator;

CREATE OR REPLACE FUNCTION public.server_game_clock(
  p_at timestamptz DEFAULT pg_catalog.clock_timestamp()
)
RETURNS TABLE(
  policy_version text, day_index bigint, week_index bigint, day_of_week smallint,
  real_seconds_per_day integer, game_days_per_week smallint,
  day_started_at timestamptz, day_ends_at timestamptz,
  week_started_at timestamptz, week_ends_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  WITH policy AS (
    SELECT * FROM public.server_game_clock_policy WHERE singleton
  ), indexed AS (
    SELECT policy.*,
           pg_catalog.floor(
             extract(epoch FROM (p_at - policy.epoch_at)) / policy.real_seconds_per_day
           )::bigint AS d
    FROM policy
  ), resolved AS (
    SELECT indexed.*,
           pg_catalog.floor(indexed.d::numeric / indexed.game_days_per_week)::bigint AS w
    FROM indexed
  )
  SELECT resolved.policy_version,
         resolved.d,
         resolved.w,
         (((resolved.d % resolved.game_days_per_week) + resolved.game_days_per_week)
           % resolved.game_days_per_week + 1)::smallint,
         resolved.real_seconds_per_day,
         resolved.game_days_per_week,
         resolved.epoch_at + pg_catalog.make_interval(secs => resolved.d * resolved.real_seconds_per_day),
         resolved.epoch_at + pg_catalog.make_interval(secs => (resolved.d + 1) * resolved.real_seconds_per_day),
         resolved.epoch_at + pg_catalog.make_interval(secs => resolved.w * resolved.game_days_per_week * resolved.real_seconds_per_day),
         resolved.epoch_at + pg_catalog.make_interval(secs => (resolved.w + 1) * resolved.game_days_per_week * resolved.real_seconds_per_day)
  FROM resolved
$$;

ALTER FUNCTION public.server_game_clock(timestamptz) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.server_game_clock(timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.server_game_clock(timestamptz) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.server_game_day_key(
  p_at timestamptz DEFAULT pg_catalog.clock_timestamp()
)
RETURNS date LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT DATE '2000-01-01' + clock.day_index::integer
  FROM public.server_game_clock(p_at) AS clock
$$;

CREATE OR REPLACE FUNCTION public.server_game_week_key(
  p_at timestamptz DEFAULT pg_catalog.clock_timestamp()
)
RETURNS date LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT DATE '2000-01-01' + (clock.week_index * clock.game_days_per_week)::integer
  FROM public.server_game_clock(p_at) AS clock
$$;

CREATE OR REPLACE FUNCTION public.server_game_day_start(
  p_at timestamptz DEFAULT pg_catalog.clock_timestamp()
)
RETURNS timestamptz LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$ SELECT clock.day_started_at FROM public.server_game_clock(p_at) AS clock $$;

CREATE OR REPLACE FUNCTION public.server_game_week_start(
  p_at timestamptz DEFAULT pg_catalog.clock_timestamp()
)
RETURNS timestamptz LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$ SELECT clock.week_started_at FROM public.server_game_clock(p_at) AS clock $$;

ALTER FUNCTION public.server_game_day_key(timestamptz) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.server_game_week_key(timestamptz) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.server_game_day_start(timestamptz) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.server_game_week_start(timestamptz) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION public.server_game_day_key(timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.server_game_week_key(timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.server_game_day_start(timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.server_game_week_start(timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.server_game_day_key(timestamptz) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.server_game_week_key(timestamptz) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.server_game_day_start(timestamptz) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.server_game_week_start(timestamptz) TO moneyverse_app;

-- Daily/weekly shop limits follow the accelerated server clock.
CREATE OR REPLACE FUNCTION public.shop_assert_purchase_limit(
  p_actor uuid, p_catalog uuid, p_limit text, p_quantity integer
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_allowed integer;
  v_taken integer;
  v_since timestamptz;
BEGIN
  IF p_limit IN ('once', 'account_one', 'permanent') THEN
    SELECT coalesce(sum(purchase_row.quantity), 0) INTO v_taken
    FROM public.shop_purchases AS purchase_row
    WHERE purchase_row.user_id = p_actor AND purchase_row.catalog_id = p_catalog;
    IF v_taken + p_quantity > 1 THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'this item may be held once';
    END IF;
    RETURN;
  END IF;

  IF p_limit ~ '^daily_[0-9]{1,2}$' THEN
    v_allowed := pg_catalog.substr(p_limit, 7)::integer;
    v_since := public.server_game_day_start();
  ELSIF p_limit ~ '^weekly_[0-9]{1,2}$' THEN
    v_allowed := pg_catalog.substr(p_limit, 8)::integer;
    v_since := public.server_game_week_start();
  ELSE
    RETURN;
  END IF;

  SELECT coalesce(sum(purchase_row.quantity), 0) INTO v_taken
  FROM public.shop_purchases AS purchase_row
  WHERE purchase_row.user_id = p_actor
    AND purchase_row.catalog_id = p_catalog
    AND purchase_row.purchased_at >= v_since;

  IF v_taken + p_quantity > v_allowed THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'the purchase limit for this item is reached';
  END IF;
END;
$$;
ALTER FUNCTION public.shop_assert_purchase_limit(uuid,uuid,text,integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.shop_assert_purchase_limit(uuid,uuid,text,integer) FROM PUBLIC, moneyverse_app;

-- Work board quota reads use the same accelerated day.
CREATE OR REPLACE FUNCTION public.work_task_board(p_actor uuid)
RETURNS TABLE(
  task_id uuid, code text, name text, description text,
  job_type public.work_job_type, difficulty smallint,
  base_reward bigint, base_experience bigint,
  minimum_duration_seconds integer, daily_limit integer,
  taken_today integer, reward_preview bigint, recommended boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day date := public.server_game_day_key();
  v_day_start timestamptz := public.server_game_day_start();
  v_active_job text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  SELECT progress_row.job_type::text INTO v_active_job
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor AND progress_row.is_active
  ORDER BY progress_row.selected_at DESC NULLS LAST
  LIMIT 1;
  RETURN QUERY
  WITH standing AS (
    SELECT task_row.id, task_row.code, task_row.name, task_row.description,
           task_row.job_type, task_row.difficulty, task_row.base_reward,
           task_row.base_experience, task_row.minimum_duration_seconds,
           task_row.daily_limit,
           (
             SELECT pg_catalog.count(*)
             FROM public.work_reward_receipts AS receipt_row
             JOIN public.work_assignments AS assignment_row
               ON assignment_row.id = receipt_row.assignment_id
             WHERE receipt_row.user_id = p_actor
               AND assignment_row.task_id = task_row.id
               AND receipt_row.created_at >= v_day_start
           )::integer AS taken_today
    FROM public.work_task_catalog AS task_row
    WHERE task_row.active
  ), suggested AS (
    SELECT standing_row.id
    FROM standing AS standing_row
    WHERE v_active_job IS NULL OR standing_row.job_type::text = v_active_job
    ORDER BY pg_catalog.hashtextextended(
      'moneyverse:work-board:' || p_actor::text || ':' || standing_row.id::text || ':' || v_day::text,
      0
    ), standing_row.id
    LIMIT CASE WHEN v_active_job IS NULL THEN 3 ELSE 1 END
  )
  SELECT standing_row.id, standing_row.code, standing_row.name,
         standing_row.description, standing_row.job_type,
         standing_row.difficulty, standing_row.base_reward,
         standing_row.base_experience, standing_row.minimum_duration_seconds,
         standing_row.daily_limit, standing_row.taken_today,
         public.work_reward_preview(p_actor, standing_row.id),
         EXISTS (SELECT 1 FROM suggested AS suggested_row WHERE suggested_row.id = standing_row.id)
  FROM standing AS standing_row
  ORDER BY
    (v_active_job IS NOT NULL AND standing_row.job_type::text = v_active_job) DESC,
    standing_row.difficulty,
    standing_row.base_reward,
    standing_row.code;
END;
$$;
ALTER FUNCTION public.work_task_board(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_task_board(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_task_board(uuid) TO moneyverse_app;

-- Patch large authoritative work functions in place so their existing reward logic is preserved.
DO $$
DECLARE
  v_definition text;
  v_updated text;
BEGIN
  SELECT pg_catalog.pg_get_functiondef('public.work_complete_task_v2(uuid,uuid,uuid)'::regprocedure)
  INTO v_definition;
  v_updated := pg_catalog.replace(
    v_definition,
    'v_day date := (v_now AT TIME ZONE ''Asia/Seoul'')::date;',
    'v_day date := public.server_game_day_key(v_now);'
  );
  v_updated := pg_catalog.replace(
    v_updated,
    'v_week date := date_trunc(''week'', v_now AT TIME ZONE ''Asia/Seoul'')::date;',
    'v_week date := public.server_game_week_key(v_now);'
  );
  v_updated := pg_catalog.replace(
    v_updated,
    E'receipt_row.created_at >= pg_catalog.date_trunc(''day'', v_now AT TIME ZONE ''Asia/Seoul'')\n      AT TIME ZONE ''Asia/Seoul''',
    'receipt_row.created_at >= public.server_game_day_start(v_now)'
  );
  IF v_updated = v_definition THEN
    RAISE EXCEPTION 'work_complete_task_v2 game-clock patch did not match';
  END IF;
  EXECUTE v_updated;

  SELECT pg_catalog.pg_get_functiondef('public.work_verify_and_reward(uuid,uuid,uuid)'::regprocedure)
  INTO v_definition;
  v_updated := pg_catalog.replace(
    v_definition,
    'v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE ''Asia/Seoul'')::date;',
    'v_day date := public.server_game_day_key();'
  );
  v_updated := pg_catalog.replace(
    v_updated,
    'v_week date := date_trunc(''week'', pg_catalog.clock_timestamp() AT TIME ZONE ''Asia/Seoul'')::date;',
    'v_week date := public.server_game_week_key();'
  );
  v_updated := pg_catalog.replace(
    v_updated,
    'receipt_row.created_at >= (v_day::timestamp AT TIME ZONE ''Asia/Seoul'')',
    'receipt_row.created_at >= public.server_game_day_start()'
  );
  IF v_updated = v_definition THEN
    RAISE EXCEPTION 'work_verify_and_reward game-clock patch did not match';
  END IF;
  EXECUTE v_updated;
END;
$$;

COMMIT;
