-- v2026.11.04.1741: bounded and owner-scoped-to-admin-Nest read projection.
-- No certificate is represented as proof of minted or retired currency: legacy
-- certificates lack an explicit canonical ledger_transaction_id foreign key.
-- The Nest controller requires an authenticated admin session for all calls.
BEGIN;
CREATE OR REPLACE FUNCTION public.mint_evidence_read_v1741(p_limit integer)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $read$
DECLARE v_mint_count bigint; v_retire_count bigint;
DECLARE v_mint_rows jsonb; v_retire_rows jsonb;
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 50 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid mint evidence limit';
  END IF;
  SELECT count(*) INTO v_mint_count FROM public.mint_certificates;
  SELECT count(*) INTO v_retire_count FROM public.retirement_certificates;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id',r.id::text,'amountWld',r.amount_wld,
    'createdAt',r.created_at,'evidenceStatus','UNCERTIFIED') ORDER BY r.created_at DESC,r.id), '[]'::jsonb)
    INTO v_mint_rows FROM (
      SELECT id,amount_wld,created_at FROM public.mint_certificates
      ORDER BY created_at DESC,id DESC LIMIT p_limit
    ) r;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id',r.id::text,'amountWld',r.amount_wld,
    'createdAt',r.created_at,'evidenceStatus','UNCERTIFIED') ORDER BY r.created_at DESC,r.id), '[]'::jsonb)
    INTO v_retire_rows FROM (
      SELECT id,amount_wld,created_at FROM public.retirement_certificates
      ORDER BY created_at DESC,id DESC LIMIT p_limit
    ) r;
  RETURN jsonb_build_object(
    'status', CASE WHEN v_mint_count=0 AND v_retire_count=0 THEN 'VERIFIED_EMPTY'
      ELSE 'UNVERIFIED' END,
    'mintRecordCount',v_mint_count::text,
    'retirementRecordCount',v_retire_count::text,
    'mintRecords',v_mint_rows,'retirementRecords',v_retire_rows,
    'monetaryIssuanceCertified',false,
    'reason','Legacy certificates have no independent canonical ledger transaction link');
END;
$read$;
ALTER FUNCTION public.mint_evidence_read_v1741(integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.mint_evidence_read_v1741(integer) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.mint_evidence_read_v1741(integer) TO moneyverse_app;
COMMIT;
