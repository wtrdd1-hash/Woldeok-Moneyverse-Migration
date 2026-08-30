-- Applying a policy, and the weekly run that writes one.
--
-- APPLICATION IS A TRIGGER, NOT A STEP. 059 already has two paths that make
-- a version the active one: the activation sweep and a rollback. If applying
-- the numbers were a step inside the sweep, a rollback would move the row
-- back and leave the shop selling at last week's prices -- the version
-- history would say one thing and the price tags another. Hanging it off the
-- row's transition to 'active' makes "the active version's values are the
-- live values" true by construction, and makes rollback work without 059
-- being touched.
--
-- A version created before this migration has no `new_values` and applies
-- nothing, which is right: those rows never described these numbers.
--
-- WHAT THE WEEKLY RUN DOES NOT DO. It has no actor. §15.4 wants the
-- reasoning recorded, not a person invented to be responsible for arithmetic
-- nobody performed -- 059 made the same call for the activation sweep, for
-- the same reason. The trail is the policy row: the metrics it read, the
-- values before, the values after, and the version to roll back to, all on
-- one row that cannot be edited afterwards without leaving a version behind.
--
-- It also refuses to run twice in a week by name. `version` is unique and
-- the name is the ISO week, so a second run inside the same window finds its
-- own row and does nothing, whatever the seven-day rule happens to say.

BEGIN;

-- Writes the knob table and then the tables the game reads. Called by the
-- trigger below and by nothing else; it takes no actor and checks no role,
-- like 059's activation sweep and for the same reason.
CREATE OR REPLACE FUNCTION public.economy_apply_policy_values(p_values jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_changed integer := 0;
  v_essential numeric;
  v_general numeric;
  v_maintenance numeric;
  v_supply numeric;
  v_operating numeric;
  v_purchase numeric;
  v_daily bigint;
  v_weekly bigint;
  v_decay smallint;
  v_enabled boolean;
BEGIN
  IF p_values IS NULL OR pg_catalog.jsonb_typeof(p_values) <> 'object' THEN
    RETURN 0;
  END IF;

  -- A key that is not a number is ignored rather than cast: the values come
  -- from a jsonb column, and a bad one should not turn the activation sweep
  -- into a 22P02 that stops every other due version behind it.
  UPDATE public.economy_policy_knobs AS knob_row
  SET current_value = least(knob_row.max_value,
        greatest(knob_row.min_value, (p_values ->> knob_row.knob_key)::numeric)),
      updated_at = pg_catalog.clock_timestamp()
  WHERE CASE
    WHEN pg_catalog.jsonb_typeof(p_values -> knob_row.knob_key) = 'number'
      THEN (p_values ->> knob_row.knob_key)::numeric IS DISTINCT FROM knob_row.current_value
    ELSE false
  END;
  GET DIAGNOSTICS v_changed = ROW_COUNT;

  SELECT
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'shop.essential_price_percent'),
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'shop.general_price_percent'),
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'shop.maintenance_percent'),
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'shop.supply_percent'),
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'business.operating_cost_percent'),
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'business.purchase_cost_percent'),
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'work.daily_cap'),
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'work.weekly_cap'),
    pg_catalog.max(knob_row.current_value) FILTER (WHERE knob_row.knob_key = 'work.repeat_decay_percent')
  INTO v_essential, v_general, v_maintenance, v_supply, v_operating, v_purchase,
       v_daily, v_weekly, v_decay
  FROM public.economy_policy_knobs AS knob_row;

  -- Prices are computed from the reference price every time, never from the
  -- price they currently carry, so repeated application is the same as one
  -- application and eleven weeks of +5% is not +70%.
  UPDATE public.shop_catalog AS catalog_row
  SET base_price = greatest(1, pg_catalog.round(
        catalog_row.baseline_price
        * CASE WHEN catalog_row.category IN ('general', 'job')
            THEN coalesce(v_essential, 100) ELSE coalesce(v_general, 100) END / 100))::bigint,
      maintenance_cost = greatest(0, pg_catalog.round(
        catalog_row.baseline_maintenance_cost * coalesce(v_maintenance, 100) / 100))::bigint
  WHERE catalog_row.baseline_price IS NOT NULL;

  -- A line with no quantity is unlimited, which is not a supply the engine
  -- can raise or lower. §15.3's supply rule is about the lines that run out.
  UPDATE public.shop_inventory AS inventory_row
  SET quantity = greatest(0, pg_catalog.round(
        inventory_row.baseline_quantity * coalesce(v_supply, 100) / 100))::integer
  WHERE inventory_row.baseline_quantity IS NOT NULL;

  -- Both figures are clamped to what the table's own CHECKs accept: upkeep
  -- may not exceed the revenue it comes out of, and a business costs at
  -- least 100 to buy.
  UPDATE public.virtual_business_types AS business_row
  SET daily_operating_cost = least(business_row.daily_revenue,
        greatest(0, pg_catalog.round(
          business_row.baseline_operating_cost * coalesce(v_operating, 100) / 100)))::bigint,
      purchase_cost = greatest(100, pg_catalog.round(
        business_row.baseline_purchase_cost * coalesce(v_purchase, 100) / 100))::bigint
  WHERE business_row.baseline_operating_cost IS NOT NULL
    AND business_row.baseline_purchase_cost IS NOT NULL;

  -- The work policy is a version table, so this appends rather than edits --
  -- and only when something actually differs, or every activation would add
  -- a row that changed nothing. `enabled` is carried forward: switching
  -- rewards off is a person's decision and not one of these knobs.
  SELECT policy_row.enabled INTO v_enabled
  FROM public.work_reward_policy_versions AS policy_row
  ORDER BY policy_row.effective_at DESC, policy_row.id DESC LIMIT 1;

  IF v_daily IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM (
      SELECT policy_row.daily_cap, policy_row.weekly_cap, policy_row.repeat_decay_percent
      FROM public.work_reward_policy_versions AS policy_row
      ORDER BY policy_row.effective_at DESC, policy_row.id DESC
      LIMIT 1
    ) AS latest
    WHERE latest.daily_cap = v_daily
      AND latest.weekly_cap = v_weekly
      AND latest.repeat_decay_percent = v_decay
  ) THEN
    INSERT INTO public.work_reward_policy_versions (
      daily_cap, weekly_cap, repeat_decay_percent, enabled, reason
    ) VALUES (
      v_daily, v_weekly, v_decay, coalesce(v_enabled, true),
      'economy policy adjustment'
    );
  END IF;

  RETURN v_changed;
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_apply_activated_policy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.status <> 'active' OR NEW.new_values IS NULL THEN
    RETURN NULL;
  END IF;
  -- OLD is unassigned on INSERT, and an OR in one condition would still
  -- evaluate it: SQL does not promise to stop at the left operand.
  IF TG_OP = 'INSERT' THEN
    PERFORM public.economy_apply_policy_values(NEW.new_values);
  ELSIF OLD.status IS DISTINCT FROM 'active' THEN
    PERFORM public.economy_apply_policy_values(NEW.new_values);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS economy_policies_apply ON public.economy_policies;
CREATE TRIGGER economy_policies_apply
  AFTER INSERT OR UPDATE ON public.economy_policies
  FOR EACH ROW EXECUTE FUNCTION public.economy_apply_activated_policy();

-- The weekly run. Returns what it did rather than raising, because the
-- scheduler records an outcome either way and "blocked" is an outcome.
CREATE OR REPLACE FUNCTION public.economy_run_auto_policy()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_proposal jsonb;
  v_version text;
  v_previous jsonb;
  v_new jsonb;
  v_rollback text;
  v_policy uuid;
  v_observation text;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:economy-auto-policy', 0)
  );

  v_proposal := public.economy_propose_policy_adjustment(7);

  -- §15.1 has two indicators nothing acts on. They are raised for a person
  -- whether or not anything else about this week was eligible.
  FOR v_observation IN
    SELECT pg_catalog.jsonb_array_elements_text(v_proposal -> 'observations')
  LOOP
    PERFORM public.admin_raise_alert(
      'economy.target.missed', 'warning', v_observation,
      pg_catalog.md5(v_observation || ':'
        || coalesce(v_proposal -> 'sourceMetrics' ->> 'to', '')),
      v_proposal -> 'sourceMetrics'
    );
  END LOOP;

  IF NOT coalesce((v_proposal ->> 'eligible')::boolean, false) THEN
    RETURN pg_catalog.jsonb_build_object(
      'applied', false,
      'blockedBy', v_proposal -> 'blockedBy',
      'adjustments', v_proposal -> 'adjustments'
    );
  END IF;

  v_version := 'auto-' || pg_catalog.to_char(
    (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul') - interval '4 hours 30 minutes',
    'IYYY"-W"IW');

  IF EXISTS (
    SELECT 1 FROM public.economy_policies AS policy_row
    WHERE policy_row.version = v_version
  ) THEN
    RETURN pg_catalog.jsonb_build_object(
      'applied', false,
      'blockedBy', pg_catalog.jsonb_build_array('this week already has an automatic policy'),
      'version', v_version
    );
  END IF;

  v_previous := public.economy_policy_values();

  SELECT v_previous || coalesce(
    pg_catalog.jsonb_object_agg(entry ->> 'knob',
      pg_catalog.to_jsonb((entry ->> 'to')::numeric)), '{}'::jsonb)
  INTO v_new
  FROM pg_catalog.jsonb_array_elements(v_proposal -> 'adjustments') AS entry;

  SELECT policy_row.version INTO v_rollback
  FROM public.economy_policies AS policy_row WHERE policy_row.status = 'active';

  INSERT INTO public.economy_policies (
    version, effective_at, status, payload, origin, source_metrics,
    previous_values, new_values, rollback_version, reason
  ) VALUES (
    v_version, pg_catalog.clock_timestamp(), 'approved', v_proposal, 'automatic',
    v_proposal -> 'sourceMetrics', v_previous, v_new, v_rollback,
    'automatic weekly adjustment under 15.3'
  )
  RETURNING id INTO v_policy;

  PERFORM public.economy_activate_due_policies();

  PERFORM public.admin_raise_alert(
    'economy.policy.auto_applied', 'info',
    pg_catalog.format('automatic policy %s changed %s value(s)', v_version,
      pg_catalog.jsonb_array_length(v_proposal -> 'adjustments')),
    v_version,
    pg_catalog.jsonb_build_object(
      'policyId', v_policy, 'version', v_version, 'rollbackVersion', v_rollback,
      'adjustments', v_proposal -> 'adjustments',
      'sourceMetrics', v_proposal -> 'sourceMetrics')
  );

  RETURN pg_catalog.jsonb_build_object(
    'applied', true, 'policyId', v_policy, 'version', v_version,
    'rollbackVersion', v_rollback, 'adjustments', v_proposal -> 'adjustments'
  );
END;
$$;

-- §15.4's operator controls that are not already somewhere else. Stopping
-- the engine outright is 059's feature switch and restoring a previous
-- version is 059's rollback; what was missing is per-knob suspension, moving
-- an approved range, and running the thing by hand.
CREATE OR REPLACE FUNCTION public.admin_set_policy_knob(
  p_key uuid,
  p_actor uuid,
  p_knob text,
  p_auto_adjustable boolean,
  p_min_value numeric,
  p_max_value numeric,
  p_reason text
)
RETURNS TABLE(knob_key text, auto_adjustable boolean, min_value numeric, max_value numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_reason text;
  v_existing public.admin_command_receipts%ROWTYPE;
  v_knob public.economy_policy_knobs%ROWTYPE;
  v_min numeric;
  v_max numeric;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_knob IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key, actor and knob are required';
  END IF;

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_set_policy_knob:' || p_key::text, 0)
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
    SELECT stored_row.knob_key, stored_row.auto_adjustable,
           stored_row.min_value, stored_row.max_value
    FROM public.economy_policy_knobs AS stored_row
    WHERE stored_row.knob_key = v_existing.result ->> 'knob';
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  SELECT stored_row.* INTO v_knob
  FROM public.economy_policy_knobs AS stored_row
  WHERE stored_row.knob_key = p_knob
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown policy knob';
  END IF;

  v_min := coalesce(p_min_value, v_knob.min_value);
  v_max := coalesce(p_max_value, v_knob.max_value);

  -- The range may be moved but not moved out from under the value in force,
  -- because the CHECK would refuse it anyway and 23514 says less than this.
  IF v_min > v_max THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'the lower bound is above the upper bound';
  END IF;
  IF v_knob.current_value < v_min OR v_knob.current_value > v_max THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'the value in force is outside the range being set; move the policy first';
  END IF;

  UPDATE public.economy_policy_knobs AS stored_row
  SET auto_adjustable = coalesce(p_auto_adjustable, stored_row.auto_adjustable),
      min_value = v_min,
      max_value = v_max,
      paused_reason = CASE
        WHEN coalesce(p_auto_adjustable, stored_row.auto_adjustable) THEN ''
        ELSE v_reason END,
      updated_by = p_actor,
      updated_at = pg_catalog.clock_timestamp()
  WHERE stored_row.knob_key = p_knob;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'economy.policy.knob_set', NULL, v_reason,
    pg_catalog.jsonb_build_object('knob', p_knob)
  );

  PERFORM public.admin_append_audit_event(
    p_actor, 'economy.policy.knob_set', NULL, p_key,
    pg_catalog.jsonb_build_object(
      'knob', p_knob,
      'autoAdjustable', coalesce(p_auto_adjustable, v_knob.auto_adjustable),
      'minValue', v_min, 'maxValue', v_max, 'reason', v_reason)
  );

  RETURN QUERY
  SELECT stored_row.knob_key, stored_row.auto_adjustable,
         stored_row.min_value, stored_row.max_value
  FROM public.economy_policy_knobs AS stored_row
  WHERE stored_row.knob_key = p_knob;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_run_auto_policy_now(
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
    pg_catalog.hashtextextended('moneyverse:admin_run_auto_policy_now:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN v_existing.result;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  v_result := public.economy_run_auto_policy();

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (p_key, p_actor, 'economy.policy.auto_run', NULL, v_reason, v_result);

  PERFORM public.admin_append_audit_event(
    p_actor, 'economy.policy.auto_run', NULL, p_key,
    pg_catalog.jsonb_build_object('reason', v_reason, 'result', v_result)
  );

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_policy_knobs(p_actor uuid)
RETURNS TABLE(
  knob_key text, title text, unit text, current_value numeric,
  baseline_value numeric, min_value numeric, max_value numeric,
  auto_adjustable boolean, paused_reason text, updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'reading the policy knobs requires an administrator';
  END IF;
  RETURN QUERY
  SELECT knob_row.knob_key, knob_row.title, knob_row.unit, knob_row.current_value,
         knob_row.baseline_value, knob_row.min_value, knob_row.max_value,
         knob_row.auto_adjustable, knob_row.paused_reason, knob_row.updated_at
  FROM public.economy_policy_knobs AS knob_row
  ORDER BY knob_row.knob_key;
END;
$$;

-- What the engine would do right now, for the console. Reading a proposal
-- changes nothing, so it is the wider admin role rather than the superadmin.
CREATE OR REPLACE FUNCTION public.admin_preview_auto_policy(p_actor uuid, p_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'previewing a policy requires an administrator';
  END IF;
  RETURN public.economy_propose_policy_adjustment(p_days);
END;
$$;

ALTER FUNCTION public.economy_apply_policy_values(jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_apply_activated_policy() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_run_auto_policy() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_set_policy_knob(uuid, uuid, text, boolean, numeric, numeric, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_run_auto_policy_now(uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_list_policy_knobs(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_preview_auto_policy(uuid, integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.economy_apply_policy_values(jsonb) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_apply_activated_policy() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_run_auto_policy() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_set_policy_knob(uuid, uuid, text, boolean, numeric, numeric, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_run_auto_policy_now(uuid, uuid, text) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_policy_knobs(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_preview_auto_policy(uuid, integer) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.economy_run_auto_policy() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_set_policy_knob(uuid, uuid, text, boolean, numeric, numeric, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_run_auto_policy_now(uuid, uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_policy_knobs(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_preview_auto_policy(uuid, integer) TO moneyverse_app;

COMMIT;
