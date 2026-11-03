-- v2026.11.03.1653: authorized money issuance must be canonical double-entry,
-- never an isolated policy limit update or a certificate that invents spendable WLD.
BEGIN;

-- Old records without this link, if any, remain explicitly unverified. Never
-- retroactively fill their proof or alter previously applied 244.
ALTER TABLE public.mint_certificates
  ADD COLUMN IF NOT EXISTS ledger_transaction_id uuid UNIQUE
    REFERENCES public.ledger_transactions(id),
  ADD COLUMN IF NOT EXISTS evidence_digest text
    CHECK (evidence_digest IS NULL OR evidence_digest ~ '^[0-9a-f]{64}$');

CREATE OR REPLACE FUNCTION public.mint_certificate_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,pg_temp
AS $immutable$
BEGIN
  RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='Mint certificates are immutable';
END;
$immutable$;
ALTER FUNCTION public.mint_certificate_immutable() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.mint_certificate_immutable() FROM PUBLIC;
CREATE TRIGGER mint_certificate_immutable
  BEFORE UPDATE OR DELETE OR TRUNCATE ON public.mint_certificates
  FOR EACH STATEMENT EXECUTE FUNCTION public.mint_certificate_immutable();

CREATE OR REPLACE FUNCTION public.monetary_execute_canonical_mint(
  p_actor uuid, p_policy_order uuid, p_amount_wld text,
  p_recipient uuid, p_key uuid
)
RETURNS TABLE (
  id uuid, policy_order_id uuid, amount_wld text, source_envelope text,
  recipient_user_id uuid, idempotency_key text, actor_id uuid,
  ledger_transaction_id uuid, evidence_digest text, created_at timestamptz,
  replayed boolean
)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path=pg_catalog,pg_temp
AS $mint$
DECLARE
  v_amount numeric;
  v_order public.monetary_policy_orders%ROWTYPE;
  v_previous public.mint_certificates%ROWTYPE;
  v_mint_account uuid;
  v_user_cash uuid;
  v_policy text;
  v_policy_count integer;
  v_mint_count integer;
  v_user_count integer;
  v_tx uuid;
  v_cert_id uuid;
  v_digest text;
BEGIN
  IF p_actor IS NULL OR p_policy_order IS NULL OR p_recipient IS NULL OR p_key IS NULL
    OR p_amount_wld IS NULL OR length(p_amount_wld) > 80
    OR p_amount_wld !~ '^[1-9][0-9]*$'
  THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid canonical Mint arguments'; END IF;
  v_amount := p_amount_wld::numeric;

  -- Admin HTTP guard binds actor to its session. DB also checks that the
  -- executor holds the independently audited policy-approver role.
  IF NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='active Mint approver required';
  END IF;

  -- A stable UUID key serializes conflicting/replayed issuance requests.
  PERFORM pg_advisory_xact_lock(hashtextextended('CANONICAL_MINT:'||p_key::text,0));
  SELECT * INTO v_previous FROM public.mint_certificates c
  WHERE c.idempotency_key=p_key::text;
  IF FOUND THEN
    IF v_previous.policy_order_id <> p_policy_order OR v_previous.actor_id IS DISTINCT FROM p_actor
      OR v_previous.recipient_user_id IS DISTINCT FROM p_recipient
      OR v_previous.amount_wld::numeric <> v_amount
      OR v_previous.ledger_transaction_id IS NULL
      OR v_previous.evidence_digest IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM public.ledger_transactions t
        WHERE t.id=v_previous.ledger_transaction_id
          AND t.idempotency_key=p_key AND t.actor_user_id=p_actor
          AND t.type='MONETARY_APPROVED_MINT'
      )
    THEN
      RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Mint key conflicts or prior certificate lacks canonical ledger';
    END IF;
    RETURN QUERY SELECT v_previous.id,v_previous.policy_order_id,v_previous.amount_wld,
      v_previous.source_envelope,v_previous.recipient_user_id,v_previous.idempotency_key,
      v_previous.actor_id,v_previous.ledger_transaction_id,v_previous.evidence_digest,
      v_previous.created_at,true;
    RETURN;
  END IF;

  SELECT * INTO v_order FROM public.monetary_policy_orders o
  WHERE o.id=p_policy_order FOR UPDATE;
  IF NOT FOUND OR v_order.order_type IS DISTINCT FROM 'MINT'
    OR v_order.status IS DISTINCT FROM 'APPROVED'
    OR v_order.proposed_by IS NULL OR v_order.approved_by IS NULL
    OR v_order.proposed_by = v_order.approved_by
    OR NOT (public.admin_role_holder(v_order.proposed_by, 'operator'::public.admin_role)
      OR public.admin_role_holder(v_order.proposed_by, 'approver'::public.admin_role))
    OR NOT public.admin_role_holder(v_order.approved_by, 'approver'::public.admin_role)
    OR v_order.expires_at <= clock_timestamp()
    OR v_order.executed_amount_wld::numeric + v_amount > v_order.max_amount_wld::numeric
  THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='distinct approved and unexpired Mint policy with capacity required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.monetary_system_status m
    WHERE m.id=1 AND m.is_issuance_frozen=false
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Mint issuance is frozen or status unknown';
  END IF;

  SELECT count(*), (array_agg(a.id))[1] INTO v_mint_count,v_mint_account
  FROM public.accounts a WHERE a.system_key='mint'
    AND a.account_type='MINT' AND a.status='active'
    AND a.currency='WLD' AND a.allow_negative;
  SELECT count(*), (array_agg(a.id))[1] INTO v_user_count,v_user_cash
  FROM public.accounts a JOIN public.users u ON u.id=a.owner_user_id
  WHERE a.owner_user_id=p_recipient AND a.account_type='USER_CASH'
    AND a.status='active' AND a.currency='WLD' AND u.status='active';
  IF v_mint_count<>1 OR v_user_count<>1 OR v_mint_account=v_user_cash THEN
    RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='unique active source and recipient accounts required';
  END IF;

  SELECT count(*),(array_agg(version))[1] INTO v_policy_count,v_policy
  FROM public.economy_policies WHERE status='active';
  IF v_policy_count<>1 THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='unique active monetary policy required';
  END IF;

  -- This primitive inserts canonical tx/postings, locks accounts, checks
  -- nonnegative recipients and updates balances with the same transaction.
  SELECT public.economy_post_transaction(
    p_key,'MONETARY_APPROVED_MINT',p_actor,v_policy,
    jsonb_build_array(
      jsonb_build_object('accountId',v_mint_account::text,'direction','credit','amount',v_amount::text),
      jsonb_build_object('accountId',v_user_cash::text,'direction','debit','amount',v_amount::text)
    ),
    'monetary.mint.canonical',
    jsonb_build_object('policyOrderId',p_policy_order,'recipientUserId',p_recipient,
      'amountWld',v_amount::text,'approvedBy',v_order.approved_by)
  ) INTO v_tx;

  v_digest := encode(public.digest(jsonb_build_object(
    'policyOrderId',p_policy_order,'actorId',p_actor,'recipientUserId',p_recipient,
    'amountWld',v_amount::text,'ledgerTransactionId',v_tx
  )::text,'sha256'),'hex');

  UPDATE public.monetary_policy_orders
  SET executed_amount_wld=(executed_amount_wld::numeric+v_amount)::text,
      status=CASE WHEN executed_amount_wld::numeric+v_amount=max_amount_wld::numeric
             THEN 'EXECUTED' ELSE 'APPROVED' END,
      updated_at=clock_timestamp()
  WHERE monetary_policy_orders.id=p_policy_order;

  INSERT INTO public.mint_certificates(
    policy_order_id,amount_wld,source_envelope,recipient_user_id,
    idempotency_key,actor_id,ledger_transaction_id,evidence_digest
  ) VALUES (
    p_policy_order,v_amount::text,v_order.target_envelope,p_recipient,
    p_key::text,p_actor,v_tx,v_digest
  )
  RETURNING mint_certificates.id INTO v_cert_id;

  RETURN QUERY SELECT c.id,c.policy_order_id,c.amount_wld,c.source_envelope,
    c.recipient_user_id,c.idempotency_key,c.actor_id,c.ledger_transaction_id,
    c.evidence_digest,c.created_at,false
  FROM public.mint_certificates c WHERE c.id=v_cert_id;
END;
$mint$;
ALTER FUNCTION public.monetary_execute_canonical_mint(uuid,uuid,text,uuid,uuid)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.monetary_execute_canonical_mint(uuid,uuid,text,uuid,uuid)
  FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.monetary_execute_canonical_mint(uuid,uuid,text,uuid,uuid)
  TO moneyverse_app;

-- The historical two-statement SELECT/UPDATE approval raced and admitted
-- self-approval. A DB-owned single statement enforces a distinct second actor.
CREATE OR REPLACE FUNCTION public.monetary_approve_policy_order(
  p_approver uuid, p_policy_order uuid
)
RETURNS SETOF public.monetary_policy_orders
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path=pg_catalog,pg_temp
AS $approve$
DECLARE
  v_order public.monetary_policy_orders%ROWTYPE;
BEGIN
  IF p_approver IS NULL OR p_policy_order IS NULL
    OR NOT public.admin_role_holder(p_approver, 'approver'::public.admin_role)
  THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='active monetary approver required';
  END IF;
  UPDATE public.monetary_policy_orders o
  SET status='APPROVED',approved_by=p_approver,updated_at=clock_timestamp()
  WHERE o.id=p_policy_order AND o.status='PROPOSED'
    AND o.proposed_by IS NOT NULL AND o.proposed_by<>p_approver
    AND o.expires_at>clock_timestamp()
    AND (public.admin_role_holder(o.proposed_by, 'operator'::public.admin_role)
      OR public.admin_role_holder(o.proposed_by, 'approver'::public.admin_role))
  RETURNING o.* INTO v_order;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE='42501',
      MESSAGE='distinct valid proposer and unexpired proposed monetary order required';
  END IF;
  RETURN NEXT v_order;
END;
$approve$;
ALTER FUNCTION public.monetary_approve_policy_order(uuid,uuid)
  OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.monetary_approve_policy_order(uuid,uuid)
  FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.monetary_approve_policy_order(uuid,uuid)
  TO moneyverse_app;

-- Keep legacy read access but prevent the app role from creating new unlinked
-- certificates directly. Policy approval remains a separate workflow.
REVOKE INSERT,UPDATE,DELETE,TRUNCATE ON public.mint_certificates
  FROM PUBLIC,moneyverse_app;
COMMIT;
