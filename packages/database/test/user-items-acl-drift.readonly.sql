-- Read-only environment drift report. Safe on DEV/Test/Production; never changes ACLs.
-- A returned row means the app role has an unexpected direct or effective table privilege.
WITH target AS (
 SELECT c.oid, c.relacl FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname='user_items' AND c.relkind IN ('r','p')
), privileges(privilege) AS (
 VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER'),('MAINTAIN')
), observed AS (
 SELECT p.privilege,
   has_table_privilege('moneyverse_app', t.oid, p.privilege) AS effective_grant,
   EXISTS (SELECT 1 FROM aclexplode(t.relacl) a
           WHERE a.grantee = 'moneyverse_app'::regrole::oid
             AND a.privilege_type = p.privilege) AS direct_grant
 FROM target t CROSS JOIN privileges p
)
SELECT privilege, direct_grant, effective_grant
FROM observed WHERE direct_grant OR effective_grant ORDER BY privilege;
