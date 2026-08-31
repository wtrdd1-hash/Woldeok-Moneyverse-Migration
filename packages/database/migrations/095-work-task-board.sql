-- The board a member picks work from, and the receipts the work paid.
--
-- 066 seeded five tasks, 067 assigns one and takes a submission, 068 verifies
-- it and mints the reward, 069 reports the caps and the member's assignments.
-- Between them there was never a way to learn that a task exists.
-- `work_task_catalog` is revoked from `moneyverse_app` (066 line 90) and no
-- function read it back, so `POST /api/v1/work/assignments` could only be
-- called by somebody who already knew a task's uuid. The whole loop the
-- specification calls 14.5 and 14.6 -- take work, do it, submit it, get paid
-- -- was unreachable from a browser, and no screen had ever been built for
-- it. This is the read that opens it, and it is the same shape as the fix in
-- 047: a function that filters by the caller, never a GRANT on the table.
--
-- WHY A PREVIEW, AND WHY IT IS NOT THE CATALOGUE PRICE. `base_reward` is what
-- a task is worth before 068 decides what it pays: the reward decays by
-- `repeat_decay_percent` for every time the same task was already paid today,
-- and is then clamped to whatever is left of the daily and weekly caps. A
-- board that showed 100 WLD when the cap left 20 would be advertising a
-- number this application will not pay. `work_reward_preview` runs 068's
-- arithmetic without its locks, and `work.db.test.ts` asserts the two agree
-- on a real payout -- that test is what stops them drifting apart, because
-- the sum is written twice on purpose: the payer takes row locks in a fixed
-- order and a read model must not.

BEGIN;

-- What verifying this task right now would actually pay this member.
--
-- NULL means the question has no answer rather than "nothing": an unknown or
-- inactive task, or work rewards switched off entirely, which 068 answers
-- with 55000. Zero means the caps are spent -- the work still records and
-- still awards experience, it just mints nothing.
CREATE OR REPLACE FUNCTION public.work_reward_preview(p_actor uuid, p_task uuid)
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_week date := date_trunc('week', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_reward bigint;
  v_decay smallint;
  v_daily_cap bigint;
  v_weekly_cap bigint;
  v_repeat bigint;
  v_day_paid bigint;
  v_week_paid bigint;
BEGIN
  IF p_actor IS NULL OR p_task IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT task_row.base_reward INTO v_reward
  FROM public.work_task_catalog AS task_row
  WHERE task_row.id = p_task AND task_row.active;

  IF v_reward IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT policy_row.daily_cap, policy_row.weekly_cap, policy_row.repeat_decay_percent
  INTO v_daily_cap, v_weekly_cap, v_decay
  FROM public.work_reward_policy_versions AS policy_row
  WHERE policy_row.enabled AND policy_row.effective_at <= pg_catalog.clock_timestamp()
  ORDER BY policy_row.effective_at DESC, policy_row.id DESC
  LIMIT 1;

  IF v_daily_cap IS NULL THEN
    RETURN NULL;
  END IF;

  -- 068's window, spelled the same way: receipts paid today for this task,
  -- counted from the start of the Seoul day rather than from 24 hours ago.
  SELECT count(*) INTO v_repeat
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = receipt_row.assignment_id
  WHERE receipt_row.user_id = p_actor
    AND assignment_row.task_id = p_task
    AND receipt_row.created_at >= (v_day::timestamp AT TIME ZONE 'Asia/Seoul');

  v_reward := greatest(v_reward - (v_reward * v_decay * v_repeat / 100), 0);

  SELECT coalesce((
    SELECT window_row.paid_amount FROM public.work_reward_windows AS window_row
    WHERE window_row.user_id = p_actor AND window_row.window_start = v_day
      AND window_row.window_kind = 'day'
  ), 0) INTO v_day_paid;

  SELECT coalesce((
    SELECT window_row.paid_amount FROM public.work_reward_windows AS window_row
    WHERE window_row.user_id = p_actor AND window_row.window_start = v_week
      AND window_row.window_kind = 'week'
  ), 0) INTO v_week_paid;

  RETURN least(
    v_reward,
    greatest(v_daily_cap - v_day_paid, 0),
    greatest(v_weekly_cap - v_week_paid, 0)
  );
END;
$$;

-- Every task on offer, with this member's standing against each.
--
-- `recommended` is three of them, and it is deliberately not a ranking. The
-- specification asks for three suggestions and for the candidates to change
-- day to day (14.6, 16.0); a stable hash of member, task and the Seoul date
-- gives both without a random number, so two reads of the same board in the
-- same day agree -- a suggestion that moved while a member was looking at it
-- would be worse than none. A task whose daily limit is already spent is
-- never suggested, because sending somebody at work they cannot take is the
-- one failure a suggestion must not have.
CREATE OR REPLACE FUNCTION public.work_task_board(p_actor uuid)
RETURNS TABLE(
  task_id uuid,
  code text,
  name text,
  description text,
  job_type public.work_job_type,
  difficulty smallint,
  base_reward bigint,
  base_experience bigint,
  minimum_duration_seconds integer,
  daily_limit integer,
  taken_today integer,
  reward_preview bigint,
  recommended boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_day_start timestamptz := (v_day::timestamp AT TIME ZONE 'Asia/Seoul');
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  -- Every column reference below is qualified. `code`, `name`, `difficulty`
  -- and six more are OUT parameters as well as columns of the table being
  -- read, and plpgsql defaults to variable_conflict = error -- 067 and 080
  -- both raised 42702 on their first version for exactly this.
  RETURN QUERY
  WITH standing AS (
    SELECT
      task_row.id AS id,
      task_row.code AS code,
      task_row.name AS name,
      task_row.description AS description,
      task_row.job_type AS job_type,
      task_row.difficulty AS difficulty,
      task_row.base_reward AS base_reward,
      task_row.base_experience AS base_experience,
      task_row.minimum_duration_seconds AS minimum_duration_seconds,
      task_row.daily_limit AS daily_limit,
      (
        SELECT count(*)
        FROM public.work_assignments AS assignment_row
        WHERE assignment_row.user_id = p_actor
          AND assignment_row.task_id = task_row.id
          AND assignment_row.assigned_at >= v_day_start
      )::integer AS taken_today
    FROM public.work_task_catalog AS task_row
    WHERE task_row.active
  ),
  suggested AS (
    SELECT standing_row.id AS id
    FROM standing AS standing_row
    WHERE standing_row.taken_today < standing_row.daily_limit
    ORDER BY pg_catalog.hashtextextended(
      'moneyverse:work-board:' || p_actor::text || ':' || standing_row.id::text || ':' || v_day::text,
      0
    ), standing_row.id
    LIMIT 3
  )
  SELECT
    standing_row.id,
    standing_row.code,
    standing_row.name,
    standing_row.description,
    standing_row.job_type,
    standing_row.difficulty,
    standing_row.base_reward,
    standing_row.base_experience,
    standing_row.minimum_duration_seconds,
    standing_row.daily_limit,
    standing_row.taken_today,
    public.work_reward_preview(p_actor, standing_row.id),
    EXISTS (SELECT 1 FROM suggested AS suggested_row WHERE suggested_row.id = standing_row.id)
  FROM standing AS standing_row
  ORDER BY standing_row.difficulty, standing_row.base_reward, standing_row.code;
END;
$$;

-- What the work actually paid, with the ledger transaction it paid through.
--
-- `work_my_assignments` (069) carries the amounts but not the transaction,
-- and the transaction is the point: the specification asks the work screen
-- for "최근 지급 영수증과 원장 거래 링크", and an amount with no way to find
-- it in the ledger is a claim rather than a receipt. A reward clamped to zero
-- by the caps has no transaction at all, which is why the column is nullable
-- and the screen has to say so rather than render a blank.
CREATE OR REPLACE FUNCTION public.work_my_receipts(p_actor uuid)
RETURNS TABLE(
  receipt_id uuid,
  assignment_id uuid,
  code text,
  name text,
  reward_amount bigint,
  experience_amount bigint,
  transaction_id uuid,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT receipt_row.id, receipt_row.assignment_id, task_row.code, task_row.name,
         receipt_row.reward_amount, receipt_row.experience_amount,
         receipt_row.transaction_id, receipt_row.created_at
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = receipt_row.assignment_id
  JOIN public.work_task_catalog AS task_row ON task_row.id = assignment_row.task_id
  WHERE receipt_row.user_id = p_actor
  ORDER BY receipt_row.created_at DESC, receipt_row.id DESC
  LIMIT 20
$$;

ALTER FUNCTION public.work_reward_preview(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_task_board(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_my_receipts(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.work_reward_preview(uuid, uuid),
  public.work_task_board(uuid), public.work_my_receipts(uuid) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.work_reward_preview(uuid, uuid),
  public.work_task_board(uuid), public.work_my_receipts(uuid) TO moneyverse_app;

-- Restated, so this migration cannot be read later as having relaxed the
-- boundary it works around. The catalogue is still not readable as a table.
REVOKE ALL PRIVILEGES ON TABLE public.work_task_catalog, public.work_assignments,
  public.work_reward_receipts FROM PUBLIC, moneyverse_app;

COMMIT;
