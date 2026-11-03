-- v1715 read-only release gate for isolated Test / restored Production schema.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
DO $verify$
DECLARE
  v_privilege text;
  v_count integer;
  v_total numeric;
BEGIN
  FOREACH v_privilege IN ARRAY ARRAY[
    'INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'
  ] LOOP
    IF pg_catalog.has_table_privilege(
      'moneyverse_app','public.system_treasury_vaults',v_privilege
    ) THEN
      RAISE EXCEPTION 'DIRECT_TREASURY_VAULT_WRITE_REMAINS: %',v_privilege;
    END IF;
  END LOOP;
  FOREACH v_privilege IN ARRAY ARRAY['INSERT','UPDATE','REFERENCES'] LOOP
    IF pg_catalog.has_any_column_privilege(
      'moneyverse_app','public.system_treasury_vaults',v_privilege
    ) THEN
      RAISE EXCEPTION 'DIRECT_TREASURY_VAULT_COLUMN_WRITE_REMAINS: %',v_privilege;
    END IF;
  END LOOP;
  SELECT count(*),coalesce(sum(balance_wld::numeric),0)
    INTO v_count,v_total
  FROM public.system_treasury_vaults;
  IF v_count=0 THEN
    RAISE EXCEPTION 'MISSING_TREASURY_VAULT_MODELS';
  END IF;
  RAISE NOTICE 'FINANCE_VAULT_ACL_V1715_PASS vaults=% model_total_wld=%',v_count,v_total;
END;
$verify$;
ROLLBACK;
