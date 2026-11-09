-- v2026.11.09.1946: authenticated Admin Mint and Central Bank policy-only paths.
-- No new WLD is created: mint_certificates are NOT canonical settlement receipts.
-- Keep direct app DML on ledger, vault, mint/retirement certificates denied.
-- This repairs the live 500 (mint_certificates INSERT denied) and the Test
-- restored DB's missing app-role READ rights, without granting app-role writes.
BEGIN;

-- Restored PG17 clones built with --no-acl need the migrator's narrowly
-- scoped privileges explicitly restored before owned SECURITY DEFINER writes.
GRANT SELECT, INSERT, UPDATE ON public.monetary_policy_orders,
  public.mint_certificates TO moneyverse_migrator;
GRANT SELECT ON public.monetary_system_status TO moneyverse_migrator;

GRANT SELECT ON TABLE public.monetary_policy_orders,
  public.mint_certificates, public.retirement_certificates,
  public.monetary_system_status TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_monetary_policy_propose(
  p_actor uuid, p_type text, p_envelope text, p_max_amount text,
  p_reason text, p_valid_hours integer DEFAULT 72
)
RETURNS SETOF public.monetary_policy_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $propose$
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor,'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor,'approver'::public.admin_role)
    OR public.admin_role_holder(p_actor,'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='monetary policy proposal requires an active administrator';
  END IF;
  IF NOT ((p_type='MINT' AND p_envelope IN (
      'WORK_REWARD','QUEST_REWARD','EVENT_REWARD','INCIDENT_COMPENSATION',
      'STABILIZATION_POOL','GENERAL_CIRCULATION'))
    OR (p_type='RETIRE' AND p_envelope='HARD_SINK_PURGE'))
    OR p_max_amount IS NULL OR p_max_amount !~ '^[0-9]{1,30}$'
    OR p_max_amount::numeric <= 0
    OR p_reason IS NULL OR length(btrim(p_reason)) < 10
    OR p_valid_hours IS NULL OR p_valid_hours NOT BETWEEN 1 AND 720 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='unsupported monetary policy type, envelope or policy parameters';
  END IF;
  RETURN QUERY INSERT INTO public.monetary_policy_orders
    (order_type, target_envelope, max_amount_wld, status, proposed_by, reason, expires_at)
  VALUES (p_type,p_envelope,p_max_amount,'PROPOSED',p_actor,btrim(p_reason),
    clock_timestamp() + make_interval(hours=>p_valid_hours))
  RETURNING *;
END;
$propose$;
ALTER FUNCTION public.admin_monetary_policy_propose(uuid,text,text,text,text,integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_monetary_policy_propose(uuid,text,text,text,text,integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_monetary_policy_propose(uuid,text,text,text,text,integer) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.admin_monetary_policy_approve(p_actor uuid,p_order_id uuid)
RETURNS SETOF public.monetary_policy_orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $approve$
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor,'approver'::public.admin_role)
    OR public.admin_role_holder(p_actor,'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor,'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='monetary policy approval requires an active administrator';
  END IF;
  RETURN QUERY UPDATE public.monetary_policy_orders
    SET status='APPROVED',approved_by=p_actor,updated_at=clock_timestamp()
    WHERE id=p_order_id AND status='PROPOSED' AND expires_at>clock_timestamp()
    RETURNING *;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='policy order is missing, expired or not proposed';
  END IF;
END;
$approve$;
ALTER FUNCTION public.admin_monetary_policy_approve(uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_monetary_policy_approve(uuid,uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_monetary_policy_approve(uuid,uuid) TO moneyverse_app;

-- Policy capacity and certificate are saved atomically, and only once for a
-- particular client idempotency key. This does NOT credit VAULT_MAIN or mint WLD.
CREATE OR REPLACE FUNCTION public.admin_monetary_mint_certificate(
  p_actor uuid,p_order_id uuid,p_amount text,p_recipient uuid,p_idempotency_key text
)
RETURNS SETOF public.mint_certificates
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $certificate$
DECLARE
  v_existing public.mint_certificates%ROWTYPE;
  v_order public.monetary_policy_orders%ROWTYPE;
  v_record public.mint_certificates%ROWTYPE;
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor,'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor,'approver'::public.admin_role)
    OR public.admin_role_holder(p_actor,'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='mint certificate requires active administrator';
  END IF;
  IF p_order_id IS NULL OR p_amount IS NULL OR p_amount !~ '^[0-9]{1,30}$'
    OR p_amount::numeric <= 0
    OR p_idempotency_key IS NULL OR length(p_idempotency_key) NOT BETWEEN 8 AND 128
    OR p_recipient IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid policy order, certificate amount or idempotency key';
  END IF;
  -- Ordering this idempotency lock ahead of the policy row lock avoids
  -- duplicate-policy-capacity reservation under concurrent retries.
  PERFORM pg_catalog.pg_advisory_xact_lock(1946,pg_catalog.hashtext(p_idempotency_key));
  SELECT * INTO v_existing FROM public.mint_certificates
    WHERE idempotency_key=p_idempotency_key;
  IF FOUND THEN
    IF v_existing.policy_order_id<>p_order_id OR v_existing.amount_wld<>p_amount
      OR v_existing.actor_id IS DISTINCT FROM p_actor
      OR v_existing.recipient_user_id IS NOT NULL THEN
      RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='idempotency key belongs to another certificate request';
    END IF;
    RETURN NEXT v_existing;
    RETURN;
  END IF;
  SELECT * INTO v_order FROM public.monetary_policy_orders
    WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND OR v_order.order_type<>'MINT' OR v_order.status<>'APPROVED'
    OR v_order.expires_at<=clock_timestamp()
    OR p_amount::numeric + v_order.executed_amount_wld::numeric > v_order.max_amount_wld::numeric
    OR NOT EXISTS (SELECT 1 FROM public.monetary_system_status
      WHERE id=1 AND is_issuance_frozen=false) THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='policy order is unavailable, frozen, expired or beyond its approved limit';
  END IF;
  -- Legacy supported policy target only: no unverified Treasury auto-credit.
  IF v_order.target_envelope NOT IN ('WORK_REWARD','QUEST_REWARD','EVENT_REWARD',
    'INCIDENT_COMPENSATION','STABILIZATION_POOL','GENERAL_CIRCULATION') THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='unsupported mint settlement target';
  END IF;
  UPDATE public.monetary_policy_orders
    SET executed_amount_wld=(executed_amount_wld::numeric+p_amount::numeric)::text,
        status=CASE WHEN executed_amount_wld::numeric+p_amount::numeric=max_amount_wld::numeric
          THEN 'EXECUTED' ELSE 'APPROVED' END,
        updated_at=clock_timestamp()
    WHERE id=p_order_id;
  INSERT INTO public.mint_certificates
    (policy_order_id,amount_wld,source_envelope,recipient_user_id,idempotency_key,actor_id)
  VALUES (p_order_id,p_amount,v_order.target_envelope,NULL,p_idempotency_key,p_actor)
  RETURNING * INTO v_record;
  RETURN NEXT v_record;
END;
$certificate$;
ALTER FUNCTION public.admin_monetary_mint_certificate(uuid,uuid,text,uuid,text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_monetary_mint_certificate(uuid,uuid,text,uuid,text) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_monetary_mint_certificate(uuid,uuid,text,uuid,text) TO moneyverse_app;
COMMIT;
