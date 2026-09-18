-- v2026.09.19.234 — Economy AI shadow health and adaptive-limit safety.
--
-- Authoritative AI policy reviews remain in economy_ai_policy_reviews and are the
-- only AI evidence the dual-policy guard may consume. Shadow reviews prove that
-- the configured model path is alive without making an ineligible proposal
-- applicable or reopening a weekly scheduler window.
BEGIN;

INSERT INTO public.feature_switches (
  feature_key, state, title, activation_preconditions, reason
) VALUES (
  'economy_job_limit_tightening',
  'disabled',
  '직업 과업 제한 자동 강화',
  pg_catalog.jsonb_build_array(
    'all seven economy metric days satisfy the minimum active-member sample',
    'limit-hit, abandonment and progression welfare telemetry is reviewed',
    'repeat-reward soft control has already been applied and measured',
    'Test proves effective task limits never fall below two per day',
    'rollback and automatic relaxation are verified'
  ),
  'hard assignment-limit tightening remains human/shadow only until evidence is sufficient'
)
ON CONFLICT (feature_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.economy_ai_shadow_reviews (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  proposal_hash text NOT NULL CHECK (proposal_hash ~ '^[0-9a-f]{32}$'),
  proposal jsonb NOT NULL CHECK (pg_catalog.jsonb_typeof(proposal) = 'object'),
  proposal_eligible boolean NOT NULL,
  blocked_reasons jsonb NOT NULL DEFAULT '[]'::jsonb
    CHECK (pg_catalog.jsonb_typeof(blocked_reasons) = 'array'),
  decision text NOT NULL CHECK (decision IN ('agree', 'veto', 'abstain')),
  confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  rationale text NOT NULL CHECK (pg_catalog.char_length(rationale) BETWEEN 1 AND 2000),
  risks jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (pg_catalog.jsonb_typeof(risks) = 'array'),
  model text NOT NULL CHECK (pg_catalog.char_length(model) BETWEEN 1 AND 200),
  prompt_version text NOT NULL CHECK (pg_catalog.char_length(prompt_version) BETWEEN 1 AND 80),
  council_evidence jsonb NOT NULL DEFAULT '[]'::jsonb
    CHECK (pg_catalog.jsonb_typeof(council_evidence) = 'array'),
  reviewed_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS economy_ai_shadow_reviews_recent_idx
  ON public.economy_ai_shadow_reviews (reviewed_at DESC);
CREATE INDEX IF NOT EXISTS economy_ai_shadow_reviews_proposal_idx
  ON public.economy_ai_shadow_reviews (proposal_hash, reviewed_at DESC);
REVOKE ALL PRIVILEGES ON TABLE public.economy_ai_shadow_reviews FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.economy_ai_shadow_reviews_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'economy AI shadow reviews are append-only';
END;
$$;

DROP TRIGGER IF EXISTS economy_ai_shadow_reviews_immutable ON public.economy_ai_shadow_reviews;
CREATE TRIGGER economy_ai_shadow_reviews_immutable
  BEFORE UPDATE OR DELETE ON public.economy_ai_shadow_reviews
  FOR EACH ROW EXECUTE FUNCTION public.economy_ai_shadow_reviews_immutable();

CREATE OR REPLACE FUNCTION public.economy_record_ai_shadow_review(
  p_proposal jsonb,
  p_decision text,
  p_confidence numeric,
  p_rationale text,
  p_risks jsonb,
  p_model text,
  p_prompt_version text,
  p_council_evidence jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_proposal IS NULL OR pg_catalog.jsonb_typeof(p_proposal) <> 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'proposal must be a JSON object';
  END IF;
  IF p_decision NOT IN ('agree', 'veto', 'abstain') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'AI review decision is invalid';
  END IF;
  IF p_confidence IS NULL OR p_confidence < 0 OR p_confidence > 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'AI review confidence must be between zero and one';
  END IF;
  IF p_rationale IS NULL OR pg_catalog.char_length(pg_catalog.btrim(p_rationale)) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'AI review rationale is required';
  END IF;
  IF p_model IS NULL OR pg_catalog.char_length(pg_catalog.btrim(p_model)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'AI review model is required';
  END IF;
  IF p_prompt_version IS NULL OR pg_catalog.char_length(pg_catalog.btrim(p_prompt_version)) NOT BETWEEN 1 AND 80 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'AI review prompt version is required';
  END IF;
  IF p_council_evidence IS NULL OR pg_catalog.jsonb_typeof(p_council_evidence) <> 'array' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'council evidence must be a JSON array';
  END IF;

  INSERT INTO public.economy_ai_shadow_reviews (
    proposal_hash, proposal, proposal_eligible, blocked_reasons,
    decision, confidence, rationale, risks, model, prompt_version, council_evidence
  ) VALUES (
    public.economy_policy_proposal_hash(p_proposal),
    p_proposal,
    coalesce((p_proposal ->> 'eligible')::boolean, false),
    coalesce(p_proposal -> 'blockedBy', '[]'::jsonb),
    p_decision,
    p_confidence,
    pg_catalog.btrim(p_rationale),
    coalesce(p_risks, '[]'::jsonb),
    pg_catalog.btrim(p_model),
    pg_catalog.btrim(p_prompt_version),
    p_council_evidence
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE VIEW public.economy_ai_shadow_agent_scoreboard AS
SELECT
  evidence ->> 'domain' AS domain,
  evidence ->> 'seat' AS seat,
  evidence ->> 'model' AS model,
  count(*)::bigint AS review_count,
  count(*) FILTER (WHERE evidence ->> 'decision' = 'agree')::bigint AS agree_count,
  count(*) FILTER (WHERE evidence ->> 'decision' = 'veto')::bigint AS veto_count,
  count(*) FILTER (WHERE evidence ->> 'decision' = 'abstain')::bigint AS abstain_count,
  round(avg((evidence ->> 'confidence')::numeric), 4) AS avg_confidence,
  round(avg(nullif(evidence ->> 'latencyMs', '')::numeric), 1) AS avg_latency_ms,
  round(avg(nullif(evidence ->> 'totalTokens', '')::numeric), 1) AS avg_total_tokens,
  max(review_row.reviewed_at) AS last_reviewed_at
FROM public.economy_ai_shadow_reviews AS review_row
CROSS JOIN LATERAL pg_catalog.jsonb_array_elements(review_row.council_evidence) AS evidence
GROUP BY evidence ->> 'domain', evidence ->> 'seat', evidence ->> 'model';

ALTER VIEW public.economy_ai_shadow_agent_scoreboard OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON public.economy_ai_shadow_agent_scoreboard FROM PUBLIC;
GRANT SELECT ON public.economy_ai_shadow_agent_scoreboard TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.economy_clamp_knob(p_knob_key text, p_desired numeric)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_knob public.economy_policy_knobs%ROWTYPE;
  v_step numeric;
  v_value numeric;
  v_min numeric;
BEGIN
  SELECT knob_row.* INTO v_knob
  FROM public.economy_policy_knobs AS knob_row
  WHERE knob_row.knob_key = p_knob_key;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown policy knob';
  END IF;
  IF p_desired IS NULL THEN
    RETURN v_knob.current_value;
  END IF;

  v_step := CASE
    WHEN v_knob.max_step_percent IS NOT NULL AND v_knob.max_step_absolute IS NOT NULL
      THEN least(pg_catalog.abs(v_knob.baseline_value) * v_knob.max_step_percent / 100,
                 v_knob.max_step_absolute)
    WHEN v_knob.max_step_percent IS NOT NULL
      THEN pg_catalog.abs(v_knob.baseline_value) * v_knob.max_step_percent / 100
    ELSE v_knob.max_step_absolute
  END;

  v_value := least(v_knob.current_value + v_step,
                   greatest(v_knob.current_value - v_step, p_desired));
  v_value := CASE v_knob.unit
    WHEN 'percent' THEN pg_catalog.round(v_value, 2)
    ELSE pg_catalog.round(v_value, 0)
  END;

  v_min := v_knob.min_value;
  IF p_knob_key LIKE 'jobs.assignment_daily_limit_delta.%'
    AND public.feature_switch_state('economy_job_limit_tightening') <> 'enabled' THEN
    v_min := greatest(v_min, 0);
  END IF;

  RETURN least(v_knob.max_value, greatest(v_min, v_value));
END;
$$;

CREATE OR REPLACE FUNCTION public.jobs_guard_assignment_limit_tightening()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.knob_key LIKE 'jobs.assignment_daily_limit_delta.%'
    AND NEW.current_value < 0
    AND public.feature_switch_state('economy_job_limit_tightening') <> 'enabled' THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'automatic profession-limit tightening is disabled';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS economy_policy_guard_job_limit_tightening ON public.economy_policy_knobs;
CREATE TRIGGER economy_policy_guard_job_limit_tightening
  BEFORE UPDATE OF current_value ON public.economy_policy_knobs
  FOR EACH ROW EXECUTE FUNCTION public.jobs_guard_assignment_limit_tightening();

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
  IF NEW.knob_key !~ '^jobs[.]assignment_daily_limit_delta[.]'
    OR NEW.current_value IS NOT DISTINCT FROM OLD.current_value THEN
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
  SET daily_limit = least(100, greatest(2, task_row.baseline_daily_limit + v_delta)),
      policy_version = task_row.policy_version + 1,
      updated_at = pg_catalog.clock_timestamp()
  WHERE task_row.job_type::text = v_job
    AND task_row.daily_limit IS DISTINCT FROM
      least(100, greatest(2, task_row.baseline_daily_limit + v_delta));

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_economy_ai_status(p_actor uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_switch text;
  v_proposal jsonb;
  v_latest_review jsonb;
  v_latest_shadow jsonb;
  v_evidence jsonb := '[]'::jsonb;
  v_model_reachability text := 'unknown';
  v_operational_state text;
  v_review_count bigint;
  v_shadow_count bigint;
  v_last_ai_run_status text;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'AI status requires an administrator';
  END IF;

  v_switch := public.feature_switch_state('economy_ai_policy_review');
  v_proposal := public.economy_propose_policy_adjustment(7);
  SELECT count(*) INTO v_review_count FROM public.economy_ai_policy_reviews;
  SELECT count(*) INTO v_shadow_count FROM public.economy_ai_shadow_reviews;

  SELECT to_jsonb(review_row) INTO v_latest_review
  FROM public.economy_ai_policy_reviews AS review_row
  ORDER BY review_row.reviewed_at DESC LIMIT 1;

  SELECT to_jsonb(review_row) INTO v_latest_shadow
  FROM public.economy_ai_shadow_reviews AS review_row
  ORDER BY review_row.reviewed_at DESC LIMIT 1;

  SELECT run_row.status INTO v_last_ai_run_status
  FROM public.scheduled_job_runs AS run_row
  WHERE run_row.job IN ('economy.ai_shadow_health', 'economy.ai_policy_review')
  ORDER BY run_row.started_at DESC
  LIMIT 1;

  v_evidence := coalesce(v_latest_shadow -> 'council_evidence',
                         v_latest_review -> 'council_evidence', '[]'::jsonb);
  IF pg_catalog.jsonb_array_length(v_evidence) > 0 THEN
    v_model_reachability := CASE WHEN EXISTS (
      SELECT 1
      FROM pg_catalog.jsonb_array_elements(v_evidence) AS evidence
      WHERE evidence -> 'risks' ? 'model_unavailable'
         OR coalesce(evidence ->> 'rationale', '') LIKE 'model unavailable:%'
    ) THEN 'degraded' ELSE 'healthy' END;
  END IF;

  v_operational_state := CASE
    WHEN v_switch <> 'enabled' THEN 'disabled'
    WHEN v_last_ai_run_status = 'failed' THEN 'failed'
    WHEN coalesce((v_proposal ->> 'eligible')::boolean, false) = false
      THEN 'blocked_by_evidence'
    WHEN v_latest_review IS NOT NULL
      AND (v_latest_review ->> 'expires_at')::timestamptz > pg_catalog.clock_timestamp()
      THEN 'active_reviewed'
    WHEN v_latest_shadow IS NOT NULL
      AND (v_latest_shadow ->> 'reviewed_at')::timestamptz
        > pg_catalog.clock_timestamp() - interval '36 hours'
      THEN 'shadow_reviewed'
    WHEN v_review_count = 0 AND v_shadow_count = 0 THEN 'configured_not_exercised'
    ELSE 'stale'
  END;

  RETURN pg_catalog.jsonb_build_object(
    'switchState', v_switch,
    'autoPolicySwitchState', public.feature_switch_state('economy_auto_policy'),
    'jobLimitTighteningSwitchState', public.feature_switch_state('economy_job_limit_tightening'),
    'operationalState', v_operational_state,
    'modelReachability', v_model_reachability,
    'reviewCount', v_review_count,
    'shadowReviewCount', v_shadow_count,
    'latestReview', CASE WHEN v_latest_review IS NULL THEN NULL
      ELSE v_latest_review - 'proposal' - 'council_evidence' END,
    'latestShadowReview', CASE WHEN v_latest_shadow IS NULL THEN NULL
      ELSE v_latest_shadow - 'proposal' - 'council_evidence' END,
    'proposalState', pg_catalog.jsonb_build_object(
      'eligible', coalesce((v_proposal ->> 'eligible')::boolean, false),
      'blockedBy', coalesce(v_proposal -> 'blockedBy', '[]'::jsonb),
      'adjustmentCount', pg_catalog.jsonb_array_length(coalesce(v_proposal -> 'adjustments', '[]'::jsonb)),
      'activeMemberCount', v_proposal -> 'sourceMetrics' -> 'activeMemberCount',
      'minimumActiveSample', public.economy_minimum_active_sample(),
      'sampleSufficientDays', v_proposal -> 'sourceMetrics' -> 'sampleSufficientDays',
      'days', v_proposal -> 'sourceMetrics' -> 'days'
    ),
    'lastRuns', pg_catalog.jsonb_build_object(
      'authoritativeReview', (
        SELECT to_jsonb(run_row) FROM public.scheduled_job_runs AS run_row
        WHERE run_row.job = 'economy.ai_policy_review'
        ORDER BY run_row.started_at DESC LIMIT 1
      ),
      'shadowHealth', (
        SELECT to_jsonb(run_row) FROM public.scheduled_job_runs AS run_row
        WHERE run_row.job = 'economy.ai_shadow_health'
        ORDER BY run_row.started_at DESC LIMIT 1
      ),
      'autoPolicy', (
        SELECT to_jsonb(run_row) FROM public.scheduled_job_runs AS run_row
        WHERE run_row.job = 'economy.auto_policy'
        ORDER BY run_row.started_at DESC LIMIT 1
      )
    ),
    'agents', coalesce((
      SELECT pg_catalog.jsonb_agg(to_jsonb(score_row) ORDER BY domain, seat, model)
      FROM public.economy_ai_agent_scoreboard AS score_row
    ), '[]'::jsonb),
    'shadowAgents', coalesce((
      SELECT pg_catalog.jsonb_agg(to_jsonb(score_row) ORDER BY domain, seat, model)
      FROM public.economy_ai_shadow_agent_scoreboard AS score_row
    ), '[]'::jsonb)
  );
END;
$$;

ALTER FUNCTION public.economy_ai_shadow_reviews_immutable() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_record_ai_shadow_review(jsonb, text, numeric, text, jsonb, text, text, jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_clamp_knob(text, numeric) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.jobs_guard_assignment_limit_tightening() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.jobs_apply_assignment_limit_knob() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_economy_ai_status(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.economy_record_ai_shadow_review(jsonb, text, numeric, text, jsonb, text, text, jsonb)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_clamp_knob(text, numeric)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_economy_ai_status(uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_record_ai_shadow_review(jsonb, text, numeric, text, jsonb, text, text, jsonb)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_economy_ai_status(uuid)
  TO moneyverse_app;

COMMIT;
