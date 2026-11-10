-- Fail closed if the protected object or application role is missing.
-- Run before ACL checks; missing targets must never be interpreted as zero drift.
DO $check$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'moneyverse_app') THEN
   RAISE EXCEPTION 'ACL CHECK BLOCKED: moneyverse_app role missing';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = 'user_items' AND c.relkind IN ('r','p')
 ) THEN
   RAISE EXCEPTION 'ACL CHECK BLOCKED: public.user_items table missing';
 END IF;
END
$check$;
