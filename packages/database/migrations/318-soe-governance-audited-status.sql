-- v1613: independently auditable nonmonetary SOE governance.
-- No issuance, dividend, account balance or ledger mutation.
BEGIN;
CREATE TABLE IF NOT EXISTS public.soe_governance_receipts (
  idempotency_key uuid PRIMARY KEY,
  enterprise_id uuid NOT NULL REFERENCES public.state_enterprises(id),
  actor_id uuid NOT NULL,
  enterprise_code text NOT NULL,
  previous_status text NOT NULL,
  next_status text NOT NULL,
  previous_dividend_rate_bps integer NOT NULL,
  next_dividend_rate_bps integer NOT NULL,
  change_reason text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.soe_governance_receipts OWNER TO moneyverse_migrator;
REVOKE ALL ON TABLE public.soe_governance_receipts FROM PUBLIC, moneyverse_app;
CREATE OR REPLACE FUNCTION public.admin_soe_update_status(
  p_actor uuid, p_code text, p_status text, p_rate_bps integer,
  p_reason text, p_idempotency_key uuid
) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_existing public.soe_governance_receipts%ROWTYPE;
  v_enterprise public.state_enterprises%ROWTYPE;
  v_rate integer;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='SOE approver role required';
  END IF;
  IF p_idempotency_key IS NULL OR p_code IS NULL OR p_code !~ '^SOE_[A-Z0-9_]{2,40}$'
     OR p_status IS NULL OR p_status NOT IN ('ACTIVE','PAUSED','PRIVATIZING')
     OR p_rate_bps IS NOT NULL AND (p_rate_bps < 0 OR p_rate_bps > 10000)
     OR p_reason IS NULL OR length(btrim(p_reason)) < 12 OR length(p_reason) > 500 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid SOE governance request';
  END IF;
  -- Serialize repeated request keys across transactions.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key::text, 8731));
  SELECT * INTO v_existing
  FROM public.soe_governance_receipts
  WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF v_existing.actor_id <> p_actor OR v_existing.enterprise_code <> p_code
       OR v_existing.next_status <> p_status
       OR v_existing.next_dividend_rate_bps <> COALESCE(p_rate_bps, v_existing.previous_dividend_rate_bps)
       OR v_existing.change_reason <> btrim(p_reason) THEN
      RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='idempotency key reused for a different SOE command';
    END IF;
    RETURN jsonb_build_object('receipt_id',v_existing.idempotency_key,
      'code',v_existing.enterprise_code,'old_status',v_existing.previous_status,
      'new_status',v_existing.next_status,'dividend_rate_bps',v_existing.next_dividend_rate_bps,
      'applied',true,'settled',false);
  END IF;
  SELECT * INTO v_enterprise FROM public.state_enterprises
    WHERE code = p_code FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='unknown SOE code';
  END IF;
  v_rate := COALESCE(p_rate_bps, v_enterprise.dividend_rate_bps);
  IF v_enterprise.status = p_status AND v_enterprise.dividend_rate_bps = v_rate THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='SOE governance unchanged';
  END IF;
  UPDATE public.state_enterprises
  SET status=p_status, dividend_rate_bps=v_rate, updated_at=clock_timestamp()
  WHERE id=v_enterprise.id;
  INSERT INTO public.soe_governance_receipts (
    idempotency_key,enterprise_id,actor_id,enterprise_code,previous_status,next_status,
    previous_dividend_rate_bps,next_dividend_rate_bps,change_reason
  ) VALUES (
    p_idempotency_key,v_enterprise.id,p_actor,p_code,v_enterprise.status,p_status,
    v_enterprise.dividend_rate_bps,v_rate,btrim(p_reason)
  );
  RETURN jsonb_build_object('receipt_id',p_idempotency_key,'code',p_code,
    'old_status',v_enterprise.status,'new_status',p_status,'dividend_rate_bps',v_rate,
    'applied',true,'settled',false);
END;
$function$;
ALTER FUNCTION public.admin_soe_update_status(uuid,text,text,integer,text,uuid)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_soe_update_status(uuid,text,text,integer,text,uuid)
  FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_soe_update_status(uuid,text,text,integer,text,uuid)
  TO moneyverse_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.state_enterprises FROM PUBLIC,moneyverse_app;
COMMIT;
