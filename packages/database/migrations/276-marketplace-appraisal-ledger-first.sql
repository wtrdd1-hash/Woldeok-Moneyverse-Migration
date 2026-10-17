-- v2026.10.17.796 — settle marketplace appraisal fees with one real ledger receipt.
-- The app role never writes account_balances or ledger tables directly. An
-- existing certificate for the same actor/item/rarity is returned without
-- charging twice. A failing insert or insufficient balance rolls back the
-- journal and the certificate together.
BEGIN;

CREATE OR REPLACE FUNCTION public.marketplace_create_appraisal_certificate(
  p_actor uuid, p_item_id text, p_item_name text, p_rarity text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $appraisal$
DECLARE
  v_cash uuid;
  v_sink uuid;
  v_key uuid;
  v_tx uuid;
  v_cert_id text;
  v_cert jsonb;
  v_ref numeric;
  v_fee numeric := 250;
  v_cert_hash text;
BEGIN
  IF p_actor IS NULL OR p_item_id IS NULL OR p_item_name IS NULL OR p_rarity IS NULL
    OR btrim(p_item_id)='' OR btrim(p_item_name)='' OR btrim(p_rarity)=''
    OR length(p_item_id)>128 OR length(p_item_name)>200 OR length(p_rarity)>40 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid appraisal details';
  END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.users u
    WHERE u.id=p_actor AND u.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active member required';
  END IF;

  -- All supported labels use the same deterministic valuation as v232.
  v_ref := CASE p_rarity
    WHEN 'LEGENDARY' THEN 10000
    WHEN 'EPIC' THEN 4000
    ELSE 1500 END;

  -- The feature catalog has no immutable item-instance identity. Do not charge
  -- the same member twice for an identical item/rarity appraisal.
  v_key := md5('marketplace-appraisal-v796:'||p_actor::text||':'||
               p_item_id||':'||p_rarity)::uuid;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_key::text, 0)
  );

  SELECT pg_catalog.jsonb_build_object(
    'certId', cert_id,
    'itemId', item_id,
    'itemName', item_name,
    'rarity', rarity,
    'appraisedValueWld', appraised_value_wld::text,
    'fairBandP25', fair_band_p25::text,
    'fairBandP75', fair_band_p75::text,
    'provenanceAuthor', provenance_author,
    'craftedAt', crafted_at::text,
    'appraisedAt', appraised_at::text,
    'certHash', cert_hash
  ) INTO v_cert
  FROM public.marketplace_appraisal_certificates
  WHERE user_id=p_actor AND item_id=p_item_id AND rarity=p_rarity
  ORDER BY appraised_at DESC, cert_id DESC LIMIT 1;

  IF v_cert IS NOT NULL THEN RETURN v_cert; END IF;

  SELECT a.id INTO v_cash FROM public.accounts a
  WHERE a.owner_user_id=p_actor
    AND a.account_type='USER_CASH'::public.account_type
    AND a.status='active'::public.account_status
  ORDER BY a.id LIMIT 1;
  SELECT a.id INTO v_sink FROM public.accounts a
  WHERE a.account_type='SINK'::public.account_type
    AND a.status='active'::public.account_status
  ORDER BY a.id LIMIT 1;
  IF v_cash IS NULL OR v_sink IS NULL OR v_cash=v_sink THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='appraisal settlement accounts missing';
  END IF;

  -- Economy journal enforces cash sufficiency, balanced debit/credit,
  -- deterministic account locks and idempotency.
  SELECT public.economy_post_transaction(
    v_key, 'MARKETPLACE_APPRAISAL', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_cash,'amount',v_fee::bigint::text,'direction','credit'),
      pg_catalog.jsonb_build_object('accountId',v_sink,'amount',v_fee::bigint::text,'direction','debit')
    ),
    'marketplace.appraisal.settled',
    pg_catalog.jsonb_build_object('actorId',p_actor,'itemId',p_item_id,'feeWld',v_fee::text)
  ) INTO v_tx;

  v_cert_id := 'CERT-2026-' || upper(substring(replace(v_key::text,'-',''),1,16));
  v_cert_hash := '0x' || pg_catalog.encode(
    public.digest(v_key::text || ':' || v_tx::text || ':' || p_item_name, 'sha256'),'hex');

  INSERT INTO public.marketplace_appraisal_certificates(
    cert_id,user_id,item_id,item_name,rarity,appraised_value_wld,
    fair_band_p25,fair_band_p75,provenance_author,cert_hash,fee_paid_wld
  ) VALUES (
    v_cert_id,p_actor,p_item_id,p_item_name,p_rarity,v_ref,
    round(v_ref*0.9),round(v_ref*1.15),
    '사용자 제공 정보 (원작자 미검증)',v_cert_hash,v_fee
  );

  SELECT pg_catalog.jsonb_build_object(
    'certId', cert_id,
    'itemId', item_id,
    'itemName', item_name,
    'rarity', rarity,
    'appraisedValueWld', appraised_value_wld::text,
    'fairBandP25', fair_band_p25::text,
    'fairBandP75', fair_band_p75::text,
    'provenanceAuthor', provenance_author,
    'craftedAt', crafted_at::text,
    'appraisedAt', appraised_at::text,
    'certHash', cert_hash
  ) INTO v_cert
  FROM public.marketplace_appraisal_certificates
  WHERE cert_id=v_cert_id;
  IF v_cert IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='appraisal certificate creation failed';
  END IF;
  RETURN v_cert;
END;
$appraisal$;

REVOKE ALL ON FUNCTION public.marketplace_create_appraisal_certificate(uuid,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marketplace_create_appraisal_certificate(uuid,text,text,text) TO moneyverse_app;

COMMIT;
