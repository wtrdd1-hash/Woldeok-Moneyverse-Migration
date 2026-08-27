-- Keep 018 immutable. PostgreSQL parses COALESCE as special SQL syntax, so
-- the schema-qualified `pg_catalog.coalesce` calls in the first function
-- definition resolve as a nonexistent ordinary function at runtime. This
-- repair changes only that stored function definition; it does not rewrite a
-- snapshot, balance, ledger row, grant, or migration record.
BEGIN;

DO $do$
DECLARE
  v_role pg_catalog.pg_roles%ROWTYPE;
  v_definition text;
  v_repaired_definition text;
BEGIN
  SELECT *
  INTO v_role
  FROM pg_catalog.pg_roles
  WHERE rolname = 'moneyverse_reconciler';

  IF NOT FOUND
    OR v_role.rolcanlogin
    OR v_role.rolsuper
    OR v_role.rolcreatedb
    OR v_role.rolcreaterole
    OR v_role.rolinherit
    OR v_role.rolreplication
    OR v_role.rolbypassrls THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'moneyverse_reconciler must remain a safe NOLOGIN group role';
  END IF;

  SELECT pg_catalog.pg_get_functiondef(
    'public.economy_record_reconciliation_snapshot()'::pg_catalog.regprocedure
  )
  INTO v_definition;

  IF v_definition IS NULL OR pg_catalog.strpos(v_definition, 'pg_catalog.coalesce') = 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'expected 018 reconciliation function definition was not found';
  END IF;

  v_repaired_definition := pg_catalog.replace(
    v_definition,
    'pg_catalog.coalesce',
    'COALESCE'
  );
  IF pg_catalog.strpos(v_repaired_definition, 'pg_catalog.coalesce') <> 0 THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'reconciliation function repair was incomplete';
  END IF;

  EXECUTE v_repaired_definition;
END;
$do$;

ALTER FUNCTION public.economy_record_reconciliation_snapshot() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_record_reconciliation_snapshot()
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_record_reconciliation_snapshot()
  TO moneyverse_reconciler;

COMMENT ON FUNCTION public.economy_record_reconciliation_snapshot() IS
  'Maintenance-only, append-only economy reconciliation snapshot; repaired by immutable migration 019';

COMMIT;
