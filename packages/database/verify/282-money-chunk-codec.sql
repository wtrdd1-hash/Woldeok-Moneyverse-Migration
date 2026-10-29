-- Read-only round-trip acceptance after migration 282 on disposable Test.
DO $$ DECLARE v numeric; a numeric[] := ARRAY[0,100,1000000000,100000000000000000100000000100,-100000000000000000100000000100]::numeric[];
BEGIN
 FOREACH v IN ARRAY a LOOP
  IF public.money_from_chunks(public.money_to_chunks(v)) IS DISTINCT FROM v THEN RAISE EXCEPTION 'money codec mismatch: %',v; END IF;
 END LOOP;
 BEGIN PERFORM public.money_from_chunks('{"version":1,"base":1000000000,"negative":false,"chunks":[1000000000]}'::jsonb); RAISE EXCEPTION 'invalid chunk accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.money_to_chunks(1.5); RAISE EXCEPTION 'fractional amount accepted';
 EXCEPTION WHEN numeric_value_out_of_range THEN NULL; END;
END $$;
