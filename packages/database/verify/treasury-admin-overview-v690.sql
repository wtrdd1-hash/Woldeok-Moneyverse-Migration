-- Only a disposable restored Test clone, all probes must roll back.
BEGIN;
DO $safety$
BEGIN
  IF current_database()<>'wdmv_treasury_v680' THEN
    RAISE EXCEPTION 'Refusing finance Test on non-isolated database';
  END IF;
END $safety$;
SELECT u.id AS operator_id FROM public.users u JOIN public.user_roles ur ON ur.user_id=u.id
WHERE u.status='active' AND ur.role::text IN ('operator','superadmin') LIMIT 1
\gset
SELECT u.id AS member_id FROM public.users u WHERE u.status='active'
AND NOT public.admin_role_holder(u.id,'operator'::public.admin_role) LIMIT 1
\gset
SELECT set_config('test.operator',:'operator_id',true);
SELECT set_config('test.member',:'member_id',true);
SET LOCAL ROLE moneyverse_app;
DO $verify$
DECLARE result jsonb; denied boolean:=false;
BEGIN
  IF has_table_privilege(current_user,'public.system_treasury_vaults','SELECT')
    OR has_table_privilege(current_user,'public.system_treasury_ledger','SELECT') THEN
    RAISE EXCEPTION 'Raw financial SELECT privilege unexpectedly exposed';
  END IF;
  SELECT public.treasury_admin_overview_snapshot(current_setting('test.operator')::uuid) INTO result;
  IF result->>'funding_status'<>'UNVERIFIED'
    OR jsonb_array_length(result->'vaults')<>5
    OR (result->>'total_treasury_wld')::numeric<=0 THEN
    RAISE EXCEPTION 'Invalid fiscal snapshot';
  END IF;
  BEGIN
    PERFORM public.treasury_admin_overview_snapshot(current_setting('test.member')::uuid);
  EXCEPTION WHEN insufficient_privilege THEN
    denied:=true;
  END;
  IF NOT denied THEN RAISE EXCEPTION 'Nonoperator gained financial read access'; END IF;
  RAISE NOTICE 'V690_SCOPE_PASS: app-role operator snapshot, nonoperator denied, raw tables revoked';
END $verify$;
ROLLBACK;
