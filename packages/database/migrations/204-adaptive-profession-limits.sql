-- v2026.09.17.184 — bounded AI/classical profession quota control.
-- Existing work_task_catalog.daily_limit remains the runtime authority. This
-- migration makes its baseline explicit and lets the versioned economy policy
-- engine move only an allowlisted per-profession delta. Existing profession
-- choice/mastery is never rewritten.
BEGIN;

ALTER TABLE public.work_task_catalog
  ADD COLUMN IF NOT EXISTS baseline_daily_limit integer;
UPDATE public.work_task_catalog
SET baseline_daily_limit = daily_limit
WHERE baseline_daily_limit IS NULL;
ALTER TABLE public.work_task_catalog
  ALTER COLUMN baseline_daily_limit SET NOT NULL;
ALTER TABLE public.work_task_catalog
  DROP CONSTRAINT IF EXISTS work_task_catalog_baseline_daily_limit_check;
ALTER TABLE public.work_task_catalog
  ADD CONSTRAINT work_task_catalog_baseline_daily_limit_check
  CHECK (baseline_daily_limit BETWEEN 1 AND 100);

CREATE OR REPLACE FUNCTION public.work_capture_daily_limit_baseline()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  NEW.baseline_daily_limit := coalesce(NEW.baseline_daily_limit, NEW.daily_limit);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS work_task_capture_daily_limit_baseline ON public.work_task_catalog;
CREATE TRIGGER work_task_capture_daily_limit_baseline
  BEFORE INSERT ON public.work_task_catalog
  FOR EACH ROW EXECUTE FUNCTION public.work_capture_daily_limit_baseline();

INSERT INTO public.economy_policy_knobs (
  knob_key, title, unit, current_value, baseline_value, min_value, max_value,
  max_step_percent, max_step_absolute, auto_adjustable
) VALUES
  ('jobs.assignment_daily_limit_delta.developer', '개발자 과업 일일 제한 가감', 'amount', 0, 0, -1, 2, NULL, 1, true),
  ('jobs.assignment_daily_limit_delta.trader', '트레이더 과업 일일 제한 가감', 'amount', 0, 0, -1, 2, NULL, 1, true),
  ('jobs.assignment_daily_limit_delta.entertainer', '엔터테이너 과업 일일 제한 가감', 'amount', 0, 0, -1, 2, NULL, 1, true),
  ('jobs.assignment_daily_limit_delta.detective', '탐정 과업 일일 제한 가감', 'amount', 0, 0, -1, 2, NULL, 1, true),
  ('jobs.assignment_daily_limit_delta.miner', '광부 과업 일일 제한 가감', 'amount', 0, 0, -1, 2, NULL, 1, true),
  ('jobs.assignment_daily_limit_delta.farmer', '농부 과업 일일 제한 가감', 'amount', 0, 0, -1, 2, NULL, 1, true),
  ('jobs.assignment_daily_limit_delta.artisan', '장인 과업 일일 제한 가감', 'amount', 0, 0, -1, 2, NULL, 1, true),
  ('jobs.assignment_daily_limit_delta.civil_servant', '공무원 과업 일일 제한 가감', 'amount', 0, 0, -1, 2, NULL, 1, true)
ON CONFLICT (knob_key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.jobs_apply_assignment_limit_knob()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_job text;
  v_delta integer;
BEGIN
  IF NEW.knob_key !~ '^jobs[.]assignment_daily_limit_delta[.]' OR
     NEW.current_value IS NOT DISTINCT FROM OLD.current_value THEN
    RETURN NULL;
  END IF;

  v_job := pg_catalog.regexp_replace(
    NEW.knob_key, '^jobs[.]assignment_daily_limit_delta[.]', ''
  );
  IF v_job NOT IN (
    'developer', 'trader', 'entertainer', 'detective',
    'miner', 'farmer', 'artisan', 'civil_servant'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unsupported adaptive profession';
  END IF;
  v_delta := pg_catalog.round(NEW.current_value)::integer;

  UPDATE public.work_task_catalog AS task_row
  SET daily_limit = least(100, greatest(1, task_row.baseline_daily_limit + v_delta)),
      policy_version = task_row.policy_version + 1,
      updated_at = pg_catalog.clock_timestamp()
  WHERE task_row.job_type::text = v_job
    AND task_row.daily_limit IS DISTINCT FROM
      least(100, greatest(1, task_row.baseline_daily_limit + v_delta));

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS economy_policy_apply_job_limit ON public.economy_policy_knobs;
CREATE TRIGGER economy_policy_apply_job_limit
  AFTER UPDATE OF current_value ON public.economy_policy_knobs
  FOR EACH ROW EXECUTE FUNCTION public.jobs_apply_assignment_limit_knob();
-- Preserve the v181 proposer as the classical core and extend the public
-- proposal contract with adaptive profession-limit candidates.
ALTER FUNCTION public.economy_propose_policy_adjustment(integer)
  RENAME TO economy_propose_policy_adjustment_v181;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_propose_policy_adjustment_v181(integer)
  FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.economy_profession_limit_adjustments(p_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_jobs jsonb := '[]'::jsonb;
  v_total numeric := 0;
  v_work_share numeric;
  v_repeat_decay numeric := 0;
  v_adjustments jsonb := '[]'::jsonb;
  v_shares jsonb := '{}'::jsonb;
  v_row record;
  v_job text;
  v_taken numeric;
  v_share numeric;
  v_desired numeric;
  v_to numeric;
  v_rule text;
BEGIN
  SELECT snapshot_row.job_selection, snapshot_row.work_issue_share_percent
    INTO v_jobs, v_work_share
  FROM public.economy_recent_metrics(p_days) AS snapshot_row
  ORDER BY snapshot_row.metric_date DESC
  LIMIT 1;
  v_jobs := coalesce(v_jobs, '[]'::jsonb);
  SELECT coalesce(pg_catalog.sum((entry ->> 'assignments')::numeric), 0)
    INTO v_total
  FROM pg_catalog.jsonb_array_elements(v_jobs) AS entry;

  SELECT coalesce(knob_row.current_value, 0)
    INTO v_repeat_decay
  FROM public.economy_policy_knobs AS knob_row
  WHERE knob_row.knob_key = 'work.repeat_decay_percent';

  FOR v_row IN
    SELECT knob_row.knob_key, knob_row.current_value
    FROM public.economy_policy_knobs AS knob_row
    WHERE knob_row.knob_key LIKE 'jobs.assignment_daily_limit_delta.%'
      AND knob_row.auto_adjustable
    ORDER BY knob_row.knob_key
  LOOP
    v_job := pg_catalog.regexp_replace(
      v_row.knob_key, '^jobs[.]assignment_daily_limit_delta[.]', ''
    );
    SELECT coalesce(pg_catalog.sum((entry ->> 'assignments')::numeric), 0)
      INTO v_taken
    FROM pg_catalog.jsonb_array_elements(v_jobs) AS entry
    WHERE entry ->> 'jobType' = v_job;
    v_share := CASE WHEN v_total > 0
      THEN pg_catalog.round(100 * v_taken / v_total, 2) ELSE 0 END;
    v_shares := v_shares || pg_catalog.jsonb_build_object(v_job, v_share);

    v_desired := v_row.current_value;
    v_rule := NULL;
    IF v_total < 40 AND v_row.current_value <> 0 THEN
      v_desired := v_row.current_value - pg_catalog.sign(v_row.current_value);
      v_rule := 'profession_low_evidence_return_baseline';
    ELSIF v_total >= 40 AND v_share < 3 THEN
      v_desired := v_row.current_value + 1;
      v_rule := 'profession_shortage';
    ELSIF v_total >= 40 AND v_share > 60
      AND coalesce(v_work_share, 0) > 50 AND v_repeat_decay >= 25 THEN
      v_desired := v_row.current_value - 1;
      v_rule := 'profession_overconcentration_after_soft_control';
    ELSIF v_row.current_value < 0
      AND (v_share <= 45 OR coalesce(v_work_share, 0) <= 50) THEN
      v_desired := v_row.current_value + 1;
      v_rule := 'profession_recovered_relax_limit';
    ELSIF v_row.current_value > 0 AND v_share >= 8 THEN
      v_desired := v_row.current_value - 1;
      v_rule := 'profession_recovered_return_baseline';
    END IF;

    IF v_rule IS NOT NULL THEN
      v_to := public.economy_clamp_knob(v_row.knob_key, v_desired);
      IF v_to IS DISTINCT FROM v_row.current_value THEN
        v_adjustments := v_adjustments || pg_catalog.jsonb_build_array(
          pg_catalog.jsonb_build_object(
            'knob', v_row.knob_key,
            'title', '직업별 과업 일일 제한 자동조절',
            'unit', 'amount',
            'from', v_row.current_value,
            'to', v_to,
            'rules', pg_catalog.jsonb_build_array(v_rule),
            'profession', v_job,
            'assignmentSharePercent', v_share
          )
        );
      END IF;
    END IF;
  END LOOP;
  RETURN pg_catalog.jsonb_build_object(
    'adjustments', v_adjustments,
    'assignmentCount', v_total,
    'professionSharesPercent', v_shares,
    'workIssueSharePercent', v_work_share,
    'repeatDecayPercent', v_repeat_decay,
    'hardLimitTighteningRequiresRepeatDecayPercent', 25,
    'minimumAssignments', 40
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_propose_policy_adjustment(p_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_base jsonb := public.economy_propose_policy_adjustment_v181(p_days);
  v_profession jsonb := public.economy_profession_limit_adjustments(p_days);
  v_adjustments jsonb;
  v_blocked jsonb;
  v_eligible boolean;
BEGIN
  v_adjustments := coalesce(v_base -> 'adjustments', '[]'::jsonb)
    || coalesce(v_profession -> 'adjustments', '[]'::jsonb);
  v_blocked := coalesce(v_base -> 'blockedBy', '[]'::jsonb);
  v_eligible := pg_catalog.jsonb_array_length(v_blocked) = 0
    AND pg_catalog.jsonb_array_length(v_adjustments) > 0;
  RETURN v_base || pg_catalog.jsonb_build_object(
    'eligible', v_eligible,
    'adjustments', v_adjustments,
    'professionLimitEvidence', v_profession,
    'sourceMetrics', coalesce(v_base -> 'sourceMetrics', '{}'::jsonb)
      || pg_catalog.jsonb_build_object(
        'professionAssignmentCount', v_profession -> 'assignmentCount',
        'professionSharesPercent', v_profession -> 'professionSharesPercent'
      )
  );
END;
$$;

ALTER FUNCTION public.work_capture_daily_limit_baseline() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.jobs_apply_assignment_limit_knob() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_profession_limit_adjustments(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_propose_policy_adjustment(integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.work_capture_daily_limit_baseline()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.jobs_apply_assignment_limit_knob()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_profession_limit_adjustments(integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_propose_policy_adjustment(integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_propose_policy_adjustment(integer)
  TO moneyverse_app;

COMMIT;
