-- Read-only roles/holdings boundary integration. Run only on disposable CI DB
-- or an isolated Test copy; no live account or permission mutation.
\set ON_ERROR_STOP on
BEGIN READ ONLY;
SET LOCAL statement_timeout='10000ms';
SET LOCAL ROLE moneyverse_app;
SELECT public.stock_league_is_admin(NULL::uuid) AS unknown_admin \gset
SELECT public.stock_league_is_admin('00000000-0000-4000-8000-000000000000'::uuid) AS anonymous_admin \gset
SELECT public.stock_league_portfolio_value('00000000-0000-4000-8000-000000000000'::uuid)::text AS portfolio_value \gset
RESET ROLE;
\if :unknown_admin
\else
  \echo 'ERROR: unknown actor was not denied as an administrator'
  \quit 4
\endif
\if :anonymous_admin
  \echo 'ERROR: unknown actor appears to hold admin roles'
  \quit 5
\endif
DO $verify$
BEGIN
 IF has_table_privilege('moneyverse_app','public.user_roles','SELECT')
  OR has_table_privilege('moneyverse_app','public.virtual_stock_positions','SELECT')
  OR has_table_privilege('moneyverse_app','public.virtual_stocks','SELECT') THEN
   RAISE EXCEPTION 'sensitive base table exposed to application role';
 END IF;
 IF NOT has_function_privilege('moneyverse_app','public.stock_league_is_admin(uuid)','EXECUTE')
  OR NOT has_function_privilege('moneyverse_app','public.stock_league_portfolio_value(uuid)','EXECUTE') THEN
   RAISE EXCEPTION 'missing scoped application role execution';
 END IF;
 IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    CROSS JOIN LATERAL pg_catalog.aclexplode(p.proacl) x
    WHERE p.oid = ANY(ARRAY[
        'public.stock_league_is_admin(uuid)'::pg_catalog.regprocedure,
        'public.stock_league_portfolio_value(uuid)'::pg_catalog.regprocedure])
      AND x.grantee=0 AND x.privilege_type='EXECUTE'
 ) THEN RAISE EXCEPTION 'private helper exposed to PUBLIC'; END IF;
END;
$verify$;
SELECT 'STOCK_LEAGUE_PRIVATE_READ_ROLE_NONDISCLOSURE_PASS' AS verdict;
ROLLBACK;
