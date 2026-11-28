-- Effective privileges of moneyverse_app in schema public (tables and functions), as one md5 + count.
-- Compare before a revoke migration, after it, and after a rollback replay.
\pset tuples_only on
\pset format unaligned
SELECT md5(string_agg(x,'|' ORDER BY x)), count(*) FROM (
 SELECT 't:'||c.relname||':'||p.priv x FROM pg_class c CROSS JOIN (VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE')) p(priv)
  WHERE c.relnamespace='public'::regnamespace AND c.relkind IN ('r','v','m','p') AND has_table_privilege('moneyverse_app', c.oid, p.priv)
 UNION ALL SELECT 'f:'||p.oid::regprocedure::text FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND has_function_privilege('moneyverse_app', p.oid, 'EXECUTE')) s;
