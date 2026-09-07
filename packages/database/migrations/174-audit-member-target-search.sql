-- The admin UI calls this filter "target member". Historical and current
-- audit writers do not all populate subject_user_id; member-scoped events can
-- instead carry the member UUID in target_id. Search both representations so
-- a member lookup does not incorrectly report an empty trail.

CREATE OR REPLACE FUNCTION public.admin_search_audit_events(
  p_actor uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_actor_filter uuid,
  p_subject_user_id uuid,
  p_feature text,
  p_action text,
  p_target_id uuid,
  p_transaction_id uuid,
  p_request_id uuid,
  p_trace_id uuid,
  p_client_ip inet,
  p_outcome text,
  p_cursor bigint,
  p_limit integer
)
RETURNS TABLE(
  sequence bigint,
  audit_id uuid,
  created_at timestamptz,
  hash_version smallint,
  actor_user_id uuid,
  action text,
  feature text,
  target_kind text,
  target_id uuid,
  subject_user_id uuid,
  transaction_id uuid,
  request_id uuid,
  trace_id uuid,
  session_hash text,
  client_ip text,
  outcome text,
  response_status integer,
  metadata jsonb,
  context jsonb,
  previous_integrity_hash text,
  integrity_hash text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 200);
BEGIN
  IF p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor is required';
  END IF;

  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'audit visibility requires an administrator';
  END IF;

  IF p_action IS NOT NULL AND p_action !~ '^[a-z][a-z0-9_.:-]{0,119}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'action filter is malformed';
  END IF;

  IF p_feature IS NOT NULL AND p_feature !~ '^[a-z][a-z0-9_.:-]{0,63}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'feature filter is malformed';
  END IF;

  IF p_outcome IS NOT NULL AND p_outcome NOT IN ('success', 'failure', 'partial') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'outcome filter is malformed';
  END IF;

  RETURN QUERY
  SELECT
    audit_row.sequence,
    audit_row.id,
    audit_row.created_at,
    audit_row.hash_version,
    audit_row.actor_user_id,
    audit_row.action,
    audit_row.feature,
    audit_row.target_kind,
    audit_row.target_id,
    audit_row.subject_user_id,
    audit_row.transaction_id,
    audit_row.request_id,
    audit_row.trace_id,
    pg_catalog.left(audit_row.session_hash, 12),
    public.audit_masked_ip(audit_row.client_ip),
    audit_row.outcome,
    audit_row.response_status,
    audit_row.metadata,
    public.audit_masked_context(audit_row.context),
    audit_row.previous_integrity_hash,
    audit_row.integrity_hash
  FROM public.audit_logs AS audit_row
  WHERE (p_from IS NULL OR audit_row.created_at >= p_from)
    AND (p_to IS NULL OR audit_row.created_at < p_to)
    AND (p_actor_filter IS NULL OR audit_row.actor_user_id = p_actor_filter)
    AND (
      p_subject_user_id IS NULL
      OR audit_row.subject_user_id = p_subject_user_id
      OR audit_row.target_id = p_subject_user_id
    )
    AND (p_feature IS NULL OR audit_row.feature = p_feature)
    AND (
      p_action IS NULL
      OR audit_row.action = p_action
      OR pg_catalog.starts_with(audit_row.action, p_action || '.')
    )
    AND (p_target_id IS NULL OR audit_row.target_id = p_target_id)
    AND (p_transaction_id IS NULL OR audit_row.transaction_id = p_transaction_id)
    AND (p_request_id IS NULL OR audit_row.request_id = p_request_id)
    AND (p_trace_id IS NULL OR audit_row.trace_id = p_trace_id)
    AND (p_client_ip IS NULL OR audit_row.client_ip = p_client_ip)
    AND (p_outcome IS NULL OR audit_row.outcome = p_outcome)
    AND (p_cursor IS NULL OR audit_row.sequence < p_cursor)
  ORDER BY audit_row.sequence DESC
  LIMIT v_limit;
END;
$$;
