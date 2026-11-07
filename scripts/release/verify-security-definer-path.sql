-- Read-only release preflight. Never repair an applied routine in place.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
SELECT pg_catalog.set_config('mv_release.expected_database', :'expected_database', true);
DO $audit$
DECLARE
  expected_database text := pg_catalog.current_setting('mv_release.expected_database');
  routine_count bigint;
  unsafe_count bigint;
  examples text;
BEGIN
  IF pg_catalog.current_database() <> expected_database THEN
    RAISE EXCEPTION 'SECDEF_PATH_BLOCKED: database identity mismatch (actual %, expected %)',
      pg_catalog.current_database(), expected_database;
  END IF;

  SELECT count(*),
         count(*) FILTER (
           WHERE p.proconfig IS NULL
             OR NOT (p.proconfig @> ARRAY['search_path=pg_catalog, pg_temp']::text[])
             OR EXISTS (
               SELECT 1 FROM pg_catalog.unnest(p.proconfig) AS config(value)
               WHERE config.value LIKE 'search_path=%'
                 AND config.value <> 'search_path=pg_catalog, pg_temp'
             )
         )
    INTO routine_count, unsafe_count
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.prosecdef;

  IF routine_count = 0 THEN
    RAISE EXCEPTION 'SECDEF_PATH_BLOCKED: no public SECURITY DEFINER routines; cannot verify inventory';
  END IF;

  IF unsafe_count > 0 THEN
    SELECT pg_catalog.string_agg(label, ', ')
      INTO examples
      FROM (
        SELECT pg_catalog.format('%I(%s)', p.proname,
          pg_catalog.pg_get_function_identity_arguments(p.oid)) AS label
          FROM pg_catalog.pg_proc p
          JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public' AND p.prosecdef
           AND (p.proconfig IS NULL
             OR NOT (p.proconfig @> ARRAY['search_path=pg_catalog, pg_temp']::text[])
             OR EXISTS (
               SELECT 1 FROM pg_catalog.unnest(p.proconfig) AS config(value)
               WHERE config.value LIKE 'search_path=%'
                 AND config.value <> 'search_path=pg_catalog, pg_temp'
             ))
         ORDER BY p.proname, p.oid LIMIT 5
      ) samples;
    RAISE EXCEPTION 'SECDEF_PATH_BLOCKED: % of % public SECURITY DEFINER routines lack the approved path; examples: %',
      unsafe_count, routine_count, examples;
  END IF;
  RAISE NOTICE 'SECDEF_PATH_PASS: % public SECURITY DEFINER routines verified in %',
    routine_count, pg_catalog.current_database();
END
$audit$;
ROLLBACK;
