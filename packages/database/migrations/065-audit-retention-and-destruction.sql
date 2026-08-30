-- Retention as a record, not as a DELETE (spec 14.9, 17.10, 18.6).
--
-- 14.9 is explicit: "the end of a retention period is not an automatic
-- deletion; it leaves a record of the retention or destruction decided by
-- policy". 062 makes that literally true -- `audit_logs` rejects DELETE --
-- so this migration supplies the two things that were then missing: what
-- the retention period actually is, and where the disposal of a range gets
-- written down.
--
-- APPEND-ONLY POLICY VERSIONS. A policy is never edited. Changing a
-- retention period appends a row with a later `effective_at`, and the
-- policy in force for a category is the newest row that has taken effect.
-- That is the same shape `economy_policies` uses, and it means the question
-- "what was the retention period on the day that row was disposed of" has
-- an answer.
--
-- TWO CATEGORIES, BECAUSE THE PUBLISHED POLICY SAYS TWO. The privacy
-- document promises "authentication and authorization-denial records 90
-- days, administrator and economy audit records 1 year". Inventing a third
-- category here would make the published document wrong, so the seeds below
-- are exactly those two and `audit_retention_category` decides which one an
-- action falls into. Changing the split means changing the document in the
-- same commit -- 18.6 requires the notice to describe real processing.
--
-- ARCHIVAL IS NOT MODELLED HERE. 14.9 also asks for online search and
-- long-term storage to be separated and the archive encrypted. That is the
-- encrypted backup path that already exists in `deploy/`; what belongs in
-- the database is the record that a range was archived, which is what
-- `method = 'archived'` on a destruction record means.

BEGIN;

CREATE TABLE IF NOT EXISTS public.audit_retention_policies (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  category text NOT NULL CHECK (category ~ '^[a-z][a-z0-9_]{2,31}$'),
  retention_days integer NOT NULL CHECK (retention_days BETWEEN 1 AND 3650),
  legal_basis text NOT NULL,
  description text NOT NULL,
  effective_at timestamptz NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE UNIQUE INDEX IF NOT EXISTS audit_retention_policies_category_effective
  ON public.audit_retention_policies (category, effective_at);

REVOKE ALL PRIVILEGES ON TABLE public.audit_retention_policies
  FROM PUBLIC, moneyverse_app;

CREATE TABLE IF NOT EXISTS public.audit_destruction_records (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  category text NOT NULL,
  policy_id uuid REFERENCES public.audit_retention_policies(id),
  from_sequence bigint NOT NULL,
  to_sequence bigint NOT NULL CHECK (to_sequence >= from_sequence),
  row_count bigint NOT NULL CHECK (row_count >= 0),
  method text NOT NULL CHECK (method IN ('archived', 'destroyed', 'retained_on_hold')),
  note text NOT NULL DEFAULT '',
  evidence_hash text,
  performed_by uuid NOT NULL REFERENCES public.users(id),
  performed_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS audit_destruction_records_recent
  ON public.audit_destruction_records (performed_at DESC);

REVOKE ALL PRIVILEGES ON TABLE public.audit_destruction_records
  FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.audit_reject_retention_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'audit retention and destruction records are append-only';
END;
$$;

DO $do$
DECLARE
  v_table text;
  v_trigger text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['audit_retention_policies', 'audit_destruction_records'] LOOP
    v_trigger := v_table || '_immutable';
    IF NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_trigger AS trigger_row
      WHERE trigger_row.tgrelid = ('public.' || v_table)::pg_catalog.regclass
        AND trigger_row.tgname = v_trigger
        AND NOT trigger_row.tgisinternal
    ) THEN
      EXECUTE pg_catalog.format(
        'CREATE TRIGGER %I BEFORE UPDATE OR DELETE ON public.%I '
        || 'FOR EACH ROW EXECUTE FUNCTION public.audit_reject_retention_mutation()',
        v_trigger,
        v_table
      );
    END IF;
  END LOOP;
END;
$do$;

-- Which promise in the privacy document covers this action.
CREATE OR REPLACE FUNCTION public.audit_retention_category(p_action text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT CASE
    WHEN p_action IS NULL THEN 'administration'
    -- The trailing separator matters: without it `admin.login_policy.
    -- allowlist_set` -- an administrator changing policy, a one-year record --
    -- matched `login` and was filed under the ninety-day promise.
    WHEN p_action ~ '^admin\.(login|second_factor|session)\.' THEN 'authentication'
    -- `denied` only. The trail middleware writes `admin.<feature>.failed` for
    -- every status at or above 400 that is not a refusal, so `failed` swept
    -- ordinary administrative errors into the shorter period as well.
    WHEN p_action ~ '\.denied$' THEN 'authentication'
    ELSE 'administration'
  END
$$;

INSERT INTO public.audit_retention_policies (
  category, retention_days, legal_basis, description, effective_at, reason
)
SELECT
  seed.category,
  seed.retention_days,
  seed.legal_basis,
  seed.description,
  '2026-01-01T00:00:00Z'::timestamptz,
  'initial policy, matching the published privacy notice'
FROM (
  VALUES
    (
      'authentication',
      90,
      'PIPA art. 15 -- minimum processing for account security',
      'Administrator sign-in, second factor and authorization-denial records.'
    ),
    (
      'administration',
      365,
      'PIPA art. 15 -- record of administrative and economic decisions',
      'Administrator actions and economy ledger decisions, including policy changes.'
    )
) AS seed(category, retention_days, legal_basis, description)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.audit_retention_policies AS policy_row
  WHERE policy_row.category = seed.category
);

CREATE OR REPLACE FUNCTION public.audit_active_retention_policy(p_category text)
RETURNS TABLE(
  policy_id uuid,
  category text,
  retention_days integer,
  legal_basis text,
  description text,
  effective_at timestamptz
)
LANGUAGE sql
STABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT
    policy_row.id,
    policy_row.category,
    policy_row.retention_days,
    policy_row.legal_basis,
    policy_row.description,
    policy_row.effective_at
  FROM public.audit_retention_policies AS policy_row
  WHERE policy_row.category = p_category
    AND policy_row.effective_at <= pg_catalog.clock_timestamp()
  ORDER BY policy_row.effective_at DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.admin_set_audit_retention_policy(
  p_key uuid,
  p_actor uuid,
  p_category text,
  p_retention_days integer,
  p_legal_basis text,
  p_description text,
  p_effective_at timestamptz,
  p_reason text
)
RETURNS TABLE(
  policy_id uuid,
  category text,
  retention_days integer,
  effective_at timestamptz,
  replaced_retention_days integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.admin_command_receipts%ROWTYPE;
  v_category text;
  v_legal_basis text;
  v_description text;
  v_reason text;
  v_effective_at timestamptz;
  v_previous integer;
  v_policy_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key and actor are required';
  END IF;

  v_category := pg_catalog.lower(pg_catalog.btrim(coalesce(p_category, '')));
  IF v_category !~ '^[a-z][a-z0-9_]{2,31}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'retention category is malformed';
  END IF;

  IF p_retention_days IS NULL OR p_retention_days < 1 OR p_retention_days > 3650 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'retention must be between 1 and 3650 days';
  END IF;

  v_legal_basis := public.audit_normalize_text(p_legal_basis, 500);
  v_description := public.audit_normalize_text(p_description, 1000);
  IF v_legal_basis IS NULL OR v_description IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'legal basis and description are required';
  END IF;

  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));
  v_effective_at := coalesce(p_effective_at, pg_catalog.clock_timestamp());

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_set_audit_retention_policy:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT
      (v_existing.result ->> 'policyId')::uuid,
      v_existing.result ->> 'category',
      (v_existing.result ->> 'retentionDays')::integer,
      (v_existing.result ->> 'effectiveAt')::timestamptz,
      (v_existing.result ->> 'replacedRetentionDays')::integer;
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  SELECT active.retention_days INTO v_previous
  FROM public.audit_active_retention_policy(v_category) AS active;

  INSERT INTO public.audit_retention_policies (
    category, retention_days, legal_basis, description, effective_at, reason, created_by
  ) VALUES (
    v_category, p_retention_days, v_legal_basis, v_description, v_effective_at, v_reason, p_actor
  )
  RETURNING id INTO v_policy_id;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'audit.retention.set', v_policy_id, v_reason,
    pg_catalog.jsonb_build_object(
      'policyId', v_policy_id,
      'category', v_category,
      'retentionDays', p_retention_days,
      'effectiveAt', v_effective_at,
      'replacedRetentionDays', v_previous
    )
  );

  PERFORM public.admin_append_audit_event(
    p_actor,
    'audit.retention.set',
    v_policy_id,
    p_key,
    pg_catalog.jsonb_build_object(
      'category', v_category,
      'retentionDays', p_retention_days,
      'previousRetentionDays', v_previous,
      'legalBasis', v_legal_basis
    ),
    pg_catalog.jsonb_build_object(
      'feature', 'audit',
      'targetKind', 'retention_policy',
      'reason', v_reason,
      'effectiveAt', v_effective_at,
      'outcome', 'success'
    )
  );

  RETURN QUERY SELECT v_policy_id, v_category, p_retention_days, v_effective_at, v_previous;
END;
$$;

-- What is past its retention period right now, per category, and what was
-- last done about it. The action-to-category mapping is a function rather
-- than a stored column, so this scans; at administrator-scale volume that is
-- cheaper than the rewrite a stored generated column would have cost.
CREATE OR REPLACE FUNCTION public.admin_audit_retention_overview(p_actor uuid)
RETURNS TABLE(
  category text,
  retention_days integer,
  cutoff_at timestamptz,
  total_rows bigint,
  expired_rows bigint,
  oldest_expired_sequence bigint,
  newest_expired_sequence bigint,
  last_disposition text,
  last_disposition_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'audit visibility requires an administrator';
  END IF;

  RETURN QUERY
  WITH classified AS (
    SELECT
      public.audit_retention_category(audit_row.action) AS category,
      audit_row.sequence,
      audit_row.created_at
    FROM public.audit_logs AS audit_row
  ),
  policies AS (
    SELECT DISTINCT ON (policy_row.category)
      policy_row.category,
      policy_row.retention_days
    FROM public.audit_retention_policies AS policy_row
    WHERE policy_row.effective_at <= pg_catalog.clock_timestamp()
    ORDER BY policy_row.category, policy_row.effective_at DESC
  ),
  dispositions AS (
    SELECT DISTINCT ON (record_row.category)
      record_row.category,
      record_row.method,
      record_row.performed_at
    FROM public.audit_destruction_records AS record_row
    ORDER BY record_row.category, record_row.performed_at DESC
  )
  SELECT
    policies.category,
    policies.retention_days,
    pg_catalog.clock_timestamp() - pg_catalog.make_interval(days => policies.retention_days),
    count(classified.sequence),
    count(classified.sequence) FILTER (
      WHERE classified.created_at
        < pg_catalog.clock_timestamp() - pg_catalog.make_interval(days => policies.retention_days)
    ),
    min(classified.sequence) FILTER (
      WHERE classified.created_at
        < pg_catalog.clock_timestamp() - pg_catalog.make_interval(days => policies.retention_days)
    ),
    max(classified.sequence) FILTER (
      WHERE classified.created_at
        < pg_catalog.clock_timestamp() - pg_catalog.make_interval(days => policies.retention_days)
    ),
    min(dispositions.method),
    max(dispositions.performed_at)
  FROM policies
  LEFT JOIN classified ON classified.category = policies.category
  LEFT JOIN dispositions ON dispositions.category = policies.category
  GROUP BY policies.category, policies.retention_days
  ORDER BY policies.category;
END;
$$;

-- Records what was decided about a range. It deliberately does not delete:
-- `audit_logs` rejects DELETE (062), and a disposal that erased its own
-- subject would leave the record unverifiable against the chain.
CREATE OR REPLACE FUNCTION public.admin_record_audit_destruction(
  p_key uuid,
  p_actor uuid,
  p_category text,
  p_from_sequence bigint,
  p_to_sequence bigint,
  p_method text,
  p_note text,
  p_reason text
)
RETURNS TABLE(
  record_id uuid,
  category text,
  from_sequence bigint,
  to_sequence bigint,
  row_count bigint,
  method text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.admin_command_receipts%ROWTYPE;
  v_category text;
  v_method text;
  v_note text;
  v_reason text;
  v_policy_id uuid;
  v_row_count bigint;
  v_evidence_hash text;
  v_record_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key and actor are required';
  END IF;

  IF p_from_sequence IS NULL OR p_to_sequence IS NULL OR p_to_sequence < p_from_sequence THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a sequence range is required';
  END IF;

  v_category := pg_catalog.lower(pg_catalog.btrim(coalesce(p_category, '')));
  IF v_category !~ '^[a-z][a-z0-9_]{2,31}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'retention category is malformed';
  END IF;

  v_method := pg_catalog.lower(pg_catalog.btrim(coalesce(p_method, '')));
  IF v_method NOT IN ('archived', 'destroyed', 'retained_on_hold') THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'method must be archived, destroyed or retained_on_hold';
  END IF;

  v_note := coalesce(public.audit_normalize_text(p_note, 1000), '');
  v_reason := public.admin_normalized_reason(public.audit_normalize_text(p_reason, 1000));

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:admin_record_audit_destruction:' || p_key::text, 0)
  );

  SELECT receipt_row.* INTO v_existing
  FROM public.admin_command_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing.actor_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'command receipt belongs to another administrator';
    END IF;
    RETURN QUERY SELECT
      (v_existing.result ->> 'recordId')::uuid,
      v_existing.result ->> 'category',
      (v_existing.result ->> 'fromSequence')::bigint,
      (v_existing.result ->> 'toSequence')::bigint,
      (v_existing.result ->> 'rowCount')::bigint,
      v_existing.result ->> 'method';
    RETURN;
  END IF;

  PERFORM public.admin_require_superadmin(p_actor);

  SELECT active.policy_id INTO v_policy_id
  FROM public.audit_active_retention_policy(v_category) AS active;

  -- The evidence hash pins exactly which rows the record is about: the
  -- range, and every chain hash inside it in sequence order. Re-examining
  -- the range later reproduces this digest only if the same rows, unchanged,
  -- are still there.
  SELECT
    count(*),
    pg_catalog.encode(
      public.digest(
        pg_catalog.concat_ws(
          ':',
          p_from_sequence::text,
          p_to_sequence::text,
          coalesce(
            pg_catalog.string_agg(audit_row.integrity_hash, ':' ORDER BY audit_row.sequence),
            ''
          )
        ),
        'sha256'
      ),
      'hex'
    )
  INTO v_row_count, v_evidence_hash
  FROM public.audit_logs AS audit_row
  WHERE audit_row.sequence BETWEEN p_from_sequence AND p_to_sequence
    AND public.audit_retention_category(audit_row.action) = v_category;

  INSERT INTO public.audit_destruction_records (
    category, policy_id, from_sequence, to_sequence, row_count,
    method, note, evidence_hash, performed_by
  ) VALUES (
    v_category, v_policy_id, p_from_sequence, p_to_sequence, v_row_count,
    v_method, v_note, v_evidence_hash, p_actor
  )
  RETURNING id INTO v_record_id;

  INSERT INTO public.admin_command_receipts (
    idempotency_key, actor_user_id, command, target_id, reason, result
  ) VALUES (
    p_key, p_actor, 'audit.retention.disposed', v_record_id, v_reason,
    pg_catalog.jsonb_build_object(
      'recordId', v_record_id,
      'category', v_category,
      'fromSequence', p_from_sequence,
      'toSequence', p_to_sequence,
      'rowCount', v_row_count,
      'method', v_method
    )
  );

  PERFORM public.admin_append_audit_event(
    p_actor,
    'audit.retention.disposed',
    v_record_id,
    p_key,
    pg_catalog.jsonb_build_object(
      'category', v_category,
      'fromSequence', p_from_sequence,
      'toSequence', p_to_sequence,
      'rowCount', v_row_count,
      'method', v_method,
      'evidenceHash', v_evidence_hash
    ),
    pg_catalog.jsonb_build_object(
      'feature', 'audit',
      'targetKind', 'retention_disposition',
      'reason', v_reason,
      'targetCount', v_row_count,
      'outcome', 'success'
    )
  );

  RETURN QUERY SELECT v_record_id, v_category, p_from_sequence, p_to_sequence, v_row_count, v_method;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_audit_dispositions(
  p_actor uuid,
  p_limit integer
)
RETURNS TABLE(
  record_id uuid,
  category text,
  from_sequence bigint,
  to_sequence bigint,
  row_count bigint,
  method text,
  note text,
  evidence_hash text,
  performed_by uuid,
  performed_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'audit visibility requires an administrator';
  END IF;

  RETURN QUERY
  SELECT
    record_row.id,
    record_row.category,
    record_row.from_sequence,
    record_row.to_sequence,
    record_row.row_count,
    record_row.method,
    record_row.note,
    record_row.evidence_hash,
    record_row.performed_by,
    record_row.performed_at
  FROM public.audit_destruction_records AS record_row
  ORDER BY record_row.performed_at DESC
  LIMIT v_limit;
END;
$$;

ALTER TABLE public.audit_retention_policies OWNER TO moneyverse_migrator;
ALTER TABLE public.audit_destruction_records OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_reject_retention_mutation() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_retention_category(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.audit_active_retention_policy(text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_set_audit_retention_policy(uuid, uuid, text, integer, text, text, timestamptz, text)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_audit_retention_overview(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_record_audit_destruction(uuid, uuid, text, bigint, bigint, text, text, text)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_list_audit_dispositions(uuid, integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.audit_reject_retention_mutation()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_retention_category(text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.audit_active_retention_policy(text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_set_audit_retention_policy(uuid, uuid, text, integer, text, text, timestamptz, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_audit_retention_overview(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_record_audit_destruction(uuid, uuid, text, bigint, bigint, text, text, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_audit_dispositions(uuid, integer)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_set_audit_retention_policy(uuid, uuid, text, integer, text, text, timestamptz, text)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_audit_retention_overview(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_record_audit_destruction(uuid, uuid, text, bigint, bigint, text, text, text)
  TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_audit_dispositions(uuid, integer) TO moneyverse_app;

COMMIT;
