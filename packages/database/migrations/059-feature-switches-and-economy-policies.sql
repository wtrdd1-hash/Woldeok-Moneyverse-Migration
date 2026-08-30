-- Two switchboards the superadmin now needs, because there is nobody else to
-- ask: which features are on, and which economy policy is in force.
--
-- FEATURE SWITCHES. Nothing in this schema could turn a whole feature off.
-- The only on/off flags are per-row `active` columns on stocks, business
-- types and consumption events, plus `enabled` on the two reward-policy
-- singletons -- so an abuse discovered at midnight had no answer short of a
-- deploy. §14.9 asks for individual and whole-system safe mode; this is the
-- registry that makes that possible, with four states rather than a boolean
-- because "paused" (existing positions settle, no new requests) and "safe
-- mode" (reduced limits, no new exposure) are different answers and both are
-- different from "off".
--
-- The three stage-3 features are seeded DISABLED and stay that way in
-- production until the four gates in §3 are passed on the test server. The
-- preconditions are stored on the row rather than written into a document,
-- because the row is what a person reads at the moment they are deciding to
-- flip it.
--
-- ECONOMY POLICIES. `economy_policies` has existed since init/001 --
-- version, effective_at, status, payload, and a foreign key from every ledger
-- transaction -- and nothing has ever written a row. The two action keys that
-- referred to it, `economy.policy.activate` and `economy.policy.rollback`,
-- were approval keys with no executor behind them. This adds the three verbs
-- §10 requires: a new version, a scheduled effective_at, and a return to the
-- previous version, with the older version preserved rather than edited.
--
-- 'superseded' is added to the status CHECK. The four original statuses have
-- no word for "was active, something newer took over", and reusing
-- 'rolled_back' for it would make the audit trail unable to distinguish a
-- normal succession from an operator undoing a mistake -- which is the one
-- distinction anybody reading policy history is looking for.
--
-- No BEGIN/COMMIT, for the reason given in 057.

CREATE TABLE IF NOT EXISTS public.feature_switches (
  feature_key text PRIMARY KEY CHECK (feature_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  state text NOT NULL CHECK (state IN ('enabled', 'paused', 'safe_mode', 'disabled')),
  title text NOT NULL CHECK (pg_catalog.char_length(title) BETWEEN 1 AND 100),
  -- What has to be true before this may be enabled. Read by a person, not by
  -- code: a machine-checked gate would need every one of these to be a metric
  -- this system already collects, and "legal review" is not.
  activation_preconditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  reason text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES public.users(id),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

REVOKE ALL PRIVILEGES ON TABLE public.feature_switches FROM PUBLIC, moneyverse_app;

-- ON CONFLICT DO NOTHING, not DO UPDATE: re-running a migration must never
-- switch a feature back on behind an operator who deliberately switched it
-- off, and must never switch one off that was deliberately enabled on the
-- test server to run the very trials these rows demand.
INSERT INTO public.feature_switches (feature_key, state, title, activation_preconditions, reason)
VALUES
  (
    'casino',
    'disabled',
    '카지노',
    pg_catalog.jsonb_build_array(
      'distribution trial recorded on the test server',
      'ledger reconciliation clean across the trial window',
      'abuse and self-limit controls exercised',
      'game rating and gambling-law review completed'
    ),
    'stage 3: off in production until the §3 gates pass on the test server'
  ),
  (
    'stock_corporate_action',
    'disabled',
    '주식 분할·병합',
    pg_catalog.jsonb_build_array(
      'split and reverse-split trials recorded on the test server',
      'position and average-cost rounding reconciled',
      'concurrent trading during a corporate action exercised',
      'ledger reconciliation clean across the trial window'
    ),
    'stage 3: off in production until the §3 gates pass on the test server'
  ),
  (
    'economy_auto_policy',
    'disabled',
    '자동 경제 조정',
    pg_catalog.jsonb_build_array(
      'engine profitability targets met on the test server',
      'concurrency of scheduled runs proven under load',
      'abuse resistance of the adjustment inputs reviewed',
      'ledger reconciliation clean across the trial window'
    ),
    'stage 3: off in production until the §3 gates pass on the test server'
  )
ON CONFLICT (feature_key) DO NOTHING;

-- The state a feature is in, for the code that has to decide whether to
-- accept a request. Unknown features answer 'enabled': a switch is a way to
-- take something away, and a feature nobody has registered has not been
-- taken away. Failing closed here would mean every new feature is dark until
-- somebody remembers to insert a row, which is a worse failure than this one.
CREATE OR REPLACE FUNCTION public.feature_switch_state(p_feature text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  -- An unregistered feature reads as 'disabled', not 'enabled'. This registry
  -- exists because 3 requires the stage-3 features to stay off in production
  -- until their gates pass, and one of them is a coin game with gambling-law
  -- exposure. Defaulting to 'enabled' would mean that forgetting to seed a row
  -- ships the feature ON, silently and in the dangerous direction; defaulting
  -- to 'disabled' means forgetting ships it OFF, which is visible the first
  -- time somebody uses it and costs a seed row to fix.
  --
  -- The cost of this choice is that a switch added to an already-live feature
  -- turns it off until its row exists. That is the intended order of work:
  -- seed the row, then add the gate.
  SELECT coalesce(
    (SELECT switch_row.state FROM public.feature_switches AS switch_row
     WHERE switch_row.feature_key = p_feature),
    'disabled'
  )
$$;

CREATE OR REPLACE FUNCTION public.admin_list_feature_switches(p_actor uuid)
RETURNS TABLE(
  feature_key text,
  state text,
  title text,
  activation_preconditions jsonb,
  reason text,
  updated_by uuid,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  RETURN QUERY
  SELECT switch_row.feature_key, switch_row.state, switch_row.title,
         switch_row.activation_preconditions, switch_row.reason,
         switch_row.updated_by, switch_row.updated_at
  FROM public.feature_switches AS switch_row
  ORDER BY switch_row.feature_key;
END;
$$;

-- Flipping a switch. Returns both the state it was in and the state it is in
-- now, so the screen that asked for the change can show what actually
-- happened rather than what it hoped would.
CREATE OR REPLACE FUNCTION public.admin_set_feature_switch(
  p_key uuid,
  p_actor uuid,
  p_feature text,
  p_state text,
  p_reason text
)
RETURNS TABLE(feature_key text, previous_state text, next_state text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_state text;
  v_existing public.admin_command_receipts%ROWTYPE;
  v_previous text;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_feature IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid feature switch request';
  END IF;
  v_state := pg_catalog.lower(pg_catalog.btrim(coalesce(p_state, '')));
  IF v_state NOT IN ('enabled', 'paused', 'safe_mode', 'disabled') THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'state must be enabled, paused, safe_mode or disabled';
  END IF;
  v_reason := public.admin_normalized_reason(p_reason);

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_set_feature_switch:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT v_existing.result ->> 'featureKey',
                        v_existing.result ->> 'previousState',
                        v_existing.result ->> 'nextState';
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  SELECT switch_row.state INTO v_previous
  FROM public.feature_switches AS switch_row
  WHERE switch_row.feature_key = p_feature
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown feature';
  END IF;

  UPDATE public.feature_switches AS switch_row
  SET state = v_state,
      reason = v_reason,
      updated_by = p_actor,
      updated_at = pg_catalog.clock_timestamp()
  WHERE switch_row.feature_key = p_feature;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'feature_switch.set', NULL, v_reason,
    pg_catalog.jsonb_build_object(
      'featureKey', p_feature, 'previousState', v_previous, 'nextState', v_state
    )
  );

  PERFORM public.admin_append_audit_event(
    p_actor, 'feature_switch.set', NULL, p_key,
    pg_catalog.jsonb_build_object(
      'featureKey', p_feature,
      'previousState', v_previous,
      'nextState', v_state,
      'reason', v_reason
    )
  );

  RETURN QUERY SELECT p_feature, v_previous, v_state;
END;
$$;

ALTER TABLE public.economy_policies
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS reason text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS superseded_at timestamptz,
  ADD COLUMN IF NOT EXISTS superseded_by text;

ALTER TABLE public.economy_policies DROP CONSTRAINT IF EXISTS economy_policies_status_check;
ALTER TABLE public.economy_policies
  ADD CONSTRAINT economy_policies_status_check
  CHECK (status IN ('draft', 'approved', 'active', 'superseded', 'rolled_back'));

-- One version in force at a time. Without this the activation sweep and a
-- hand rollback racing each other could leave two, and every ledger row
-- written in between would name a version that was not the only truth.
CREATE UNIQUE INDEX IF NOT EXISTS economy_policies_single_active
  ON public.economy_policies ((status))
  WHERE status = 'active';

-- The whole table becomes function-only. init/001 granted the application
-- SELECT on it, from a time when nothing wrote it and reading it directly was
-- harmless; a table with a write path needs the same treatment as every other
-- one in this schema.
REVOKE ALL PRIVILEGES ON TABLE public.economy_policies FROM PUBLIC, moneyverse_app;

-- A new version. `p_effective_at` in the past or now means "apply it as soon
-- as the sweep runs", which the function then runs itself, so an operator who
-- wants it now gets it now without a second command.
CREATE OR REPLACE FUNCTION public.admin_create_economy_policy_version(
  p_key uuid,
  p_actor uuid,
  p_version text,
  p_effective_at timestamptz,
  p_payload jsonb,
  p_reason text
)
RETURNS TABLE(policy_id uuid, version text, status text, effective_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_version text;
  v_effective timestamptz;
  v_existing public.admin_command_receipts%ROWTYPE;
  v_policy uuid;
  v_status text;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_payload IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid policy version';
  END IF;
  v_version := pg_catalog.btrim(coalesce(p_version, ''));
  IF v_version !~ '^[A-Za-z0-9][A-Za-z0-9_.:-]{2,63}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid policy version name';
  END IF;
  IF pg_catalog.jsonb_typeof(p_payload) <> 'object'
    OR pg_catalog.octet_length(p_payload::text) > 16384 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'policy payload must be an object of at most 16 KiB';
  END IF;
  v_reason := public.admin_normalized_reason(p_reason);
  v_effective := coalesce(p_effective_at, pg_catalog.clock_timestamp());
  IF v_effective > pg_catalog.clock_timestamp() + pg_catalog.make_interval(days => 365) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'effective_at must be within a year';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_create_economy_policy_version:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY
    SELECT policy_row.id, policy_row.version, policy_row.status, policy_row.effective_at
    FROM public.economy_policies AS policy_row
    WHERE policy_row.id = (v_existing.result ->> 'policyId')::uuid;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  IF EXISTS (
    SELECT 1 FROM public.economy_policies AS policy_row WHERE policy_row.version = v_version
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'this policy version already exists';
  END IF;

  INSERT INTO public.economy_policies (
    version, effective_at, status, payload, created_by, reason
  ) VALUES (
    v_version, v_effective, 'approved', p_payload, p_actor, v_reason
  )
  RETURNING id INTO v_policy;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'economy.policy.version_created', v_policy, v_reason,
    pg_catalog.jsonb_build_object('policyId', v_policy::text, 'version', v_version)
  );

  PERFORM public.admin_append_audit_event(
    p_actor, 'economy.policy.version_created', v_policy, p_key,
    pg_catalog.jsonb_build_object(
      'version', v_version,
      'effectiveAt', v_effective,
      'reason', v_reason
    )
  );

  -- Immediate application is the same act as the scheduled one, run now.
  IF v_effective <= pg_catalog.clock_timestamp() THEN
    PERFORM public.economy_activate_due_policies();
  END IF;

  SELECT policy_row.status INTO v_status
  FROM public.economy_policies AS policy_row WHERE policy_row.id = v_policy;

  RETURN QUERY SELECT v_policy, v_version, v_status, v_effective;
END;
$$;

-- The scheduled half of `effective_at`. Called by the command above when a
-- version is due immediately, and by the scheduler PR7 introduces otherwise.
--
-- It audits under the version's own author rather than under a system
-- account, because `admin_append_audit_event` requires a real actor and
-- inventing one would put a user id in the chain that nobody can be asked
-- about. The author is who decided this would happen; the clock only decided
-- when.
--
-- It takes no actor and checks no role, which is the one function here that
-- does not. That is deliberate and bounded: it can only bring forward a
-- version a superadmin already created and scheduled, and it is granted to
-- the application because a scheduler with no session has to be able to call
-- it. Adding an actor parameter would mean inventing one for the scheduler,
-- and a role check would mean the scheduler holding a role.
CREATE OR REPLACE FUNCTION public.economy_activate_due_policies()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_due public.economy_policies%ROWTYPE;
  v_previous public.economy_policies%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_activated integer := 0;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:economy-policy-activation', 0)
  );

  FOR v_due IN
    SELECT policy_row.*
    FROM public.economy_policies AS policy_row
    WHERE policy_row.status = 'approved' AND policy_row.effective_at <= v_now
    ORDER BY policy_row.effective_at, policy_row.created_at, policy_row.id
    FOR UPDATE
  LOOP
    SELECT policy_row.* INTO v_previous
    FROM public.economy_policies AS policy_row
    WHERE policy_row.status = 'active'
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.economy_policies AS policy_row
      SET status = 'superseded', superseded_at = v_now, superseded_by = v_due.version
      WHERE policy_row.id = v_previous.id;
    END IF;

    UPDATE public.economy_policies AS policy_row
    SET status = 'active', activated_at = v_now
    WHERE policy_row.id = v_due.id;

    v_activated := v_activated + 1;

    IF v_due.created_by IS NOT NULL THEN
      PERFORM public.admin_append_audit_event(
        v_due.created_by, 'economy.policy.activated', v_due.id, NULL,
        pg_catalog.jsonb_build_object(
          'version', v_due.version,
          'previousVersion', v_previous.version,
          'effectiveAt', v_due.effective_at
        )
      );
    END IF;
  END LOOP;

  RETURN v_activated;
END;
$$;

-- Back to the version that was in force before this one.
--
-- The rolled-back version is marked, not deleted, and the restored one is
-- made active again rather than copied into a new row: §10 requires the older
-- version be preserved, and a copy would make the ledger's policy_version
-- references ambiguous about which of two identical versions applied.
CREATE OR REPLACE FUNCTION public.admin_rollback_economy_policy(
  p_key uuid,
  p_actor uuid,
  p_reason text
)
RETURNS TABLE(rolled_back_version text, restored_version text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_existing public.admin_command_receipts%ROWTYPE;
  v_active public.economy_policies%ROWTYPE;
  v_previous public.economy_policies%ROWTYPE;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_key IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid rollback request';
  END IF;
  v_reason := public.admin_normalized_reason(p_reason);

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_rollback_economy_policy:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT v_existing.result ->> 'rolledBackVersion',
                        v_existing.result ->> 'restoredVersion';
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:economy-policy-activation', 0)
  );

  SELECT policy_row.* INTO v_active
  FROM public.economy_policies AS policy_row
  WHERE policy_row.status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'no active policy version to roll back';
  END IF;

  SELECT policy_row.* INTO v_previous
  FROM public.economy_policies AS policy_row
  WHERE policy_row.status = 'superseded' AND policy_row.superseded_by = v_active.version
  ORDER BY policy_row.superseded_at DESC, policy_row.id DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'the active policy version has no predecessor to restore';
  END IF;

  UPDATE public.economy_policies AS policy_row
  SET status = 'rolled_back', reason = v_reason
  WHERE policy_row.id = v_active.id;

  UPDATE public.economy_policies AS policy_row
  SET status = 'active', activated_at = v_now, superseded_at = NULL, superseded_by = NULL
  WHERE policy_row.id = v_previous.id;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'economy.policy.rolled_back', v_active.id, v_reason,
    pg_catalog.jsonb_build_object(
      'rolledBackVersion', v_active.version, 'restoredVersion', v_previous.version
    )
  );

  PERFORM public.admin_append_audit_event(
    p_actor, 'economy.policy.rolled_back', v_active.id, p_key,
    pg_catalog.jsonb_build_object(
      'rolledBackVersion', v_active.version,
      'restoredVersion', v_previous.version,
      'reason', v_reason
    )
  );

  RETURN QUERY SELECT v_active.version, v_previous.version;
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_active_policy()
RETURNS TABLE(version text, effective_at timestamptz, activated_at timestamptz, payload jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT policy_row.version, policy_row.effective_at, policy_row.activated_at,
         policy_row.payload
  FROM public.economy_policies AS policy_row
  WHERE policy_row.status = 'active'
$$;

CREATE OR REPLACE FUNCTION public.admin_list_economy_policies(
  p_actor uuid,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  policy_id uuid,
  version text,
  status text,
  effective_at timestamptz,
  activated_at timestamptz,
  superseded_at timestamptz,
  superseded_by text,
  reason text,
  created_by uuid,
  created_at timestamptz,
  payload jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator role required';
  END IF;

  RETURN QUERY
  SELECT policy_row.id, policy_row.version, policy_row.status, policy_row.effective_at,
         policy_row.activated_at, policy_row.superseded_at, policy_row.superseded_by,
         policy_row.reason, policy_row.created_by, policy_row.created_at, policy_row.payload
  FROM public.economy_policies AS policy_row
  ORDER BY policy_row.created_at DESC, policy_row.id DESC
  LIMIT greatest(1, least(p_limit, 100));
END;
$$;

ALTER FUNCTION public.feature_switch_state(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_list_feature_switches(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_set_feature_switch(uuid, uuid, text, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_create_economy_policy_version(uuid, uuid, text, timestamptz, jsonb, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_activate_due_policies() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_rollback_economy_policy(uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_active_policy() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_list_economy_policies(uuid, integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.feature_switch_state(text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_feature_switches(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_set_feature_switch(uuid, uuid, text, text, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_create_economy_policy_version(uuid, uuid, text, timestamptz, jsonb, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_activate_due_policies() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_rollback_economy_policy(uuid, uuid, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_active_policy() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_economy_policies(uuid, integer) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.feature_switch_state(text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_feature_switches(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_set_feature_switch(uuid, uuid, text, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_create_economy_policy_version(uuid, uuid, text, timestamptz, jsonb, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_activate_due_policies() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_rollback_economy_policy(uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_active_policy() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_economy_policies(uuid, integer) TO moneyverse_app;
