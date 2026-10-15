-- Intended ONLY for isolated restored PostgreSQL Test, with 269..271 applied.
-- Invariants: app cannot read raw treasury financial tables, authorized operator
-- can invoke this purpose-scoped read function, unauthenticated/non-admin cannot.
DO $audit$
DECLARE v_actor uuid; v_count integer;
BEGIN
  IF current_database() <> 'wdmv_treasury_v680' THEN
    RAISE EXCEPTION 'Only isolated Treasury Test database is permitted';
  END IF;

  IF to_regprocedure('public.treasury_admin_reconciliation(uuid)') IS NULL THEN
    RAISE EXCEPTION 'missing secured Treasury reconciliation function';
  END IF;
  IF has_table_privilege('moneyverse_app', 'public.system_treasury_vaults','SELECT')
     OR has_table_privilege('moneyverse_app','public.system_treasury_ledger','SELECT')
     OR has_function_privilege('public','public.treasury_admin_reconciliation(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'unsafe public or raw Treasury read privilege';
  END IF;
  IF NOT has_function_privilege('moneyverse_app','public.treasury_admin_reconciliation(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'app cannot execute scoped financial read';
  END IF;
  SELECT u.id INTO v_actor FROM public.users u JOIN public.user_roles r ON r.user_id=u.id
  WHERE u.status='active' AND r.role::text IN ('operator','superadmin')
  LIMIT 1;
  IF v_actor IS NULL THEN RAISE EXCEPTION 'no operator Test fixture'; END IF;

  BEGIN
    PERFORM * FROM public.treasury_admin_reconciliation(NULL);
    RAISE EXCEPTION 'null identity unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  SELECT count(*) INTO v_count FROM public.treasury_admin_reconciliation(v_actor);
  IF v_count <> 1 THEN RAISE EXCEPTION 'operator expected one aggregate result'; END IF;
  RAISE NOTICE 'TREASURY_SECURED_RECONCILIATION_PASS';
END $audit$;
