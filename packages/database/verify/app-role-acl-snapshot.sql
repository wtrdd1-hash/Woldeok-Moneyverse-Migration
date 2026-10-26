-- Read-only snapshot for scripts/check-app-role-acl.py.
-- Execute against the exact target DB; never assume an isolated Test DB matches Production.
BEGIN READ ONLY;

WITH
required(name) AS (
  VALUES ('account_balances'), ('accounts'), ('ledger_transactions'),
         ('ledger_postings'), ('users'), ('identities'),
         ('user_consents'), ('audit_logs')
),
protected AS (
  SELECT c.oid, c.relname
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
),
missing AS (
  SELECT r.name
  FROM required r
  WHERE NOT EXISTS (SELECT 1 FROM protected p WHERE p.relname = r.name)
),
direct_dml AS (
  SELECT p.relname, v.privilege
  FROM protected p
  JOIN required r ON r.name = p.relname
  CROSS JOIN LATERAL (VALUES ('INSERT'), ('UPDATE'), ('DELETE')) v(privilege)
  WHERE pg_catalog.has_table_privilege(pg_catalog.to_regrole('moneyverse_app'), p.oid, v.privilege)
),
unreviewed_dml AS (
  SELECT p.relname, v.privilege
  FROM protected p
  CROSS JOIN LATERAL (VALUES ('INSERT'), ('UPDATE'), ('DELETE')) v(privilege)
  -- These two session tables are explicitly documented direct-write exceptions.
  -- Other direct writers need an individually reviewed allowlist entry.
  WHERE p.relname NOT IN ('auth_sessions', 'oauth_challenges')
    AND pg_catalog.has_table_privilege(
      pg_catalog.to_regrole('moneyverse_app'), p.oid, v.privilege
    )
),
default_app AS (
  SELECT d.defaclobjtype, a.privilege_type
  FROM pg_catalog.pg_default_acl d
  CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) a
  WHERE d.defaclrole = pg_catalog.to_regrole('moneyverse_migrator')::oid
    AND d.defaclnamespace IN (0, 'public'::pg_catalog.regnamespace::oid)
    AND a.grantee = pg_catalog.to_regrole('moneyverse_app')::oid
),
bank AS (
  SELECT p.oid, p.proname,
         pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments,
         p.proacl, p.proowner
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('bank_archive_pocket', 'bank_customize_pocket', 'bank_transfer_pocket')
    AND p.prosecdef
),
public_bank AS (
  SELECT b.proname, b.arguments
  FROM bank b
  WHERE EXISTS (
    SELECT 1
    FROM pg_catalog.aclexplode(
      COALESCE(b.proacl, pg_catalog.acldefault('f', b.proowner))
    ) a
    WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'
  )
)
SELECT pg_catalog.jsonb_build_object(
  'database', pg_catalog.current_database(),
  'app_role_exists', pg_catalog.to_regrole('moneyverse_app') IS NOT NULL,
  'required_tables_missing',
    COALESCE((SELECT pg_catalog.jsonb_agg(name ORDER BY name) FROM missing), '[]'::jsonb),
  'bank_overload_count', (SELECT count(*) FROM bank),
  'protected_direct_dml',
    COALESCE((SELECT pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object('table', relname, 'privilege', privilege)
      ORDER BY relname, privilege
    ) FROM direct_dml), '[]'::jsonb),
  'unreviewed_direct_dml',
    COALESCE((SELECT pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object('table', relname, 'privilege', privilege)
      ORDER BY relname, privilege
    ) FROM unreviewed_dml), '[]'::jsonb),
  'default_app_grants',
    COALESCE((SELECT pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object('object', defaclobjtype, 'privilege', privilege_type)
      ORDER BY defaclobjtype, privilege_type
    ) FROM default_app), '[]'::jsonb),
  'public_bank_overloads',
    COALESCE((SELECT pg_catalog.jsonb_agg(
      proname || '(' || arguments || ')' ORDER BY proname, arguments
    ) FROM public_bank), '[]'::jsonb)
)::text;

ROLLBACK;
