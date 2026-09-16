-- Dual classical + AI economy control. The existing 091/092 rule engine remains
-- authoritative and runnable by itself. This migration adds an append-only AI
-- review lane and a wrapper that can veto a matching classical proposal without
-- letting the AI write policy values directly.

BEGIN;

INSERT INTO public.feature_switches (
  feature_key, state, title, activation_preconditions, reason
) VALUES (
  'economy_ai_policy_review',
  'disabled',
  'AI 경제 정책 검토',
  pg_catalog.jsonb_build_array(
    'strict-output parser and adversarial prompt tests pass',
    'exact-proposal hash matching and expiry behavior pass on Test',
    'AI outage demonstrably falls back to the classical engine',
    'AI veto demonstrably blocks only the matching current proposal',
    'operator can inspect model, confidence, rationale and risks'
  ),
  'off until dual-lane Test evidence is recorded'
)
ON CONFLICT (feature_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.economy_ai_policy_reviews (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  proposal_hash text NOT NULL CHECK (proposal_hash ~ '^[0-9a-f]{32}$'),
  proposal jsonb NOT NULL CHECK (pg_catalog.jsonb_typeof(proposal) = 'object'),
  decision text NOT NULL CHECK (decision IN ('agree', 'veto', 'abstain')),
  confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  rationale text NOT NULL CHECK (pg_catalog.char_length(rationale) BETWEEN 1 AND 2000),
  risks jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (pg_catalog.jsonb_typeof(risks) = 'array'),
  model text NOT NULL CHECK (pg_catalog.char_length(model) BETWEEN 1 AND 200),
  prompt_version text NOT NULL CHECK (pg_catalog.char_length(prompt_version) BETWEEN 1 AND 80),
  council_evidence jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (pg_catalog.jsonb_typeof(council_evidence) = 'array'),
  reviewed_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > reviewed_at)
);

ALTER TABLE public.economy_ai_policy_reviews
  ADD COLUMN IF NOT EXISTS council_evidence jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.economy_ai_policy_reviews
  DROP CONSTRAINT IF EXISTS economy_ai_policy_reviews_council_evidence_check;
ALTER TABLE public.economy_ai_policy_reviews
  ADD CONSTRAINT economy_ai_policy_reviews_council_evidence_check
  CHECK (pg_catalog.jsonb_typeof(council_evidence) = 'array');

DROP FUNCTION IF EXISTS public.economy_record_ai_policy_review(
  jsonb, text, numeric, text, jsonb, text, text, integer
);

CREATE INDEX IF NOT EXISTS economy_ai_policy_reviews_lookup_idx
  ON public.economy_ai_policy_reviews (proposal_hash, reviewed_at DESC);

REVOKE ALL PRIVILEGES ON TABLE public.economy_ai_policy_reviews FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.economy_policy_proposal_hash(p_proposal jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT pg_catalog.md5(p_proposal::text)
$$;

CREATE OR REPLACE FUNCTION public.economy_record_ai_policy_review(
  p_proposal jsonb,
  p_decision text,
  p_confidence numeric,
  p_rationale text,
  p_risks jsonb,
  p_model text,
  p_prompt_version text,
  p_ttl_minutes integer DEFAULT 120,
  p_council_evidence jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_id uuid;
  v_ttl integer := least(greatest(coalesce(p_ttl_minutes, 120), 15), 1440);
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

  INSERT INTO public.economy_ai_policy_reviews (
    proposal_hash, proposal, decision, confidence, rationale, risks,
    model, prompt_version, council_evidence, expires_at
  ) VALUES (
    public.economy_policy_proposal_hash(p_proposal), p_proposal, p_decision,
    p_confidence, pg_catalog.btrim(p_rationale), coalesce(p_risks, '[]'::jsonb),
    pg_catalog.btrim(p_model), pg_catalog.btrim(p_prompt_version),
    coalesce(p_council_evidence, '[]'::jsonb),
    pg_catalog.clock_timestamp() + pg_catalog.make_interval(mins => v_ttl)
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_ai_policy_guard(p_proposal jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_state text := public.feature_switch_state('economy_ai_policy_review');
  v_hash text;
  v_review public.economy_ai_policy_reviews%ROWTYPE;
BEGIN
  IF v_state <> 'enabled' THEN
    RETURN pg_catalog.jsonb_build_object(
      'active', false, 'blocked', false, 'status', 'ai_disabled_classical_fallback',
      'switchState', v_state
    );
  END IF;

  v_hash := public.economy_policy_proposal_hash(p_proposal);
  SELECT review_row.* INTO v_review
  FROM public.economy_ai_policy_reviews AS review_row
  WHERE review_row.proposal_hash = v_hash
    AND review_row.expires_at > pg_catalog.clock_timestamp()
  ORDER BY review_row.reviewed_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object(
      'active', true, 'blocked', false, 'status', 'ai_missing_classical_fallback',
      'proposalHash', v_hash
    );
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'active', true,
    'blocked', v_review.decision = 'veto',
    'status', CASE v_review.decision
      WHEN 'agree' THEN 'dual_agree'
      WHEN 'veto' THEN 'ai_veto'
      ELSE 'ai_abstain_classical_fallback'
    END,
    'proposalHash', v_hash,
    'reviewId', v_review.id,
    'decision', v_review.decision,
    'confidence', v_review.confidence,
    'rationale', v_review.rationale,
    'risks', v_review.risks,
    'model', v_review.model,
    'promptVersion', v_review.prompt_version,
    'councilEvidence', v_review.council_evidence,
    'reviewedAt', v_review.reviewed_at,
    'expiresAt', v_review.expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_run_dual_auto_policy()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_proposal jsonb := public.economy_propose_policy_adjustment(7);
  v_guard jsonb := public.economy_ai_policy_guard(v_proposal);
  v_result jsonb;
BEGIN
  IF coalesce((v_guard ->> 'blocked')::boolean, false) THEN
    PERFORM public.admin_raise_alert(
      'economy.policy.ai_veto', 'warning',
      'AI review vetoed the matching automatic economy proposal',
      'ai-veto:' || coalesce(v_guard ->> 'proposalHash', ''),
      pg_catalog.jsonb_build_object('aiReview', v_guard, 'proposal', v_proposal)
    );
    RETURN pg_catalog.jsonb_build_object(
      'applied', false,
      'blockedBy', pg_catalog.jsonb_build_array('AI review vetoed the matching current proposal'),
      'adjustments', coalesce(v_proposal -> 'adjustments', '[]'::jsonb),
      'aiReview', v_guard
    );
  END IF;

  v_result := public.economy_run_auto_policy();
  RETURN coalesce(v_result, '{}'::jsonb) || pg_catalog.jsonb_build_object('aiReview', v_guard);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_preview_dual_auto_policy(
  p_actor uuid,
  p_days integer DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_proposal jsonb;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'previewing a policy requires an administrator';
  END IF;
  v_proposal := public.economy_propose_policy_adjustment(p_days);
  RETURN pg_catalog.jsonb_build_object(
    'classical', v_proposal,
    'aiReview', public.economy_ai_policy_guard(v_proposal)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_run_dual_auto_policy_now(
  p_key uuid,
  p_actor uuid,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_existing public.admin_command_receipts%ROWTYPE;
  v_result jsonb;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key and actor are required';
  END IF;
  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_run_dual_auto_policy_now:' || p_key::text, 0)
  );
  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;
  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN v_existing.result;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);
  v_result := public.economy_run_dual_auto_policy();

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (p_key, p_actor, 'economy.policy.dual_auto_run', NULL, v_reason, v_result);

  PERFORM public.admin_append_audit_event(
    p_actor, 'economy.policy.dual_auto_run', NULL, p_key,
    pg_catalog.jsonb_build_object('reason', v_reason, 'result', v_result)
  );
  RETURN v_result;
END;
$$;

ALTER FUNCTION public.economy_policy_proposal_hash(jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_record_ai_policy_review(jsonb, text, numeric, text, jsonb, text, text, integer, jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_ai_policy_guard(jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_run_dual_auto_policy() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_preview_dual_auto_policy(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_run_dual_auto_policy_now(uuid, uuid, text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.economy_policy_proposal_hash(jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_record_ai_policy_review(jsonb, text, numeric, text, jsonb, text, text, integer, jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_ai_policy_guard(jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_run_dual_auto_policy() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_preview_dual_auto_policy(uuid, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_run_dual_auto_policy_now(uuid, uuid, text) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.economy_record_ai_policy_review(jsonb, text, numeric, text, jsonb, text, text, integer, jsonb) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_ai_policy_guard(jsonb) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_run_dual_auto_policy() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_preview_dual_auto_policy(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_run_dual_auto_policy_now(uuid, uuid, text) TO moneyverse_app;

COMMIT;
