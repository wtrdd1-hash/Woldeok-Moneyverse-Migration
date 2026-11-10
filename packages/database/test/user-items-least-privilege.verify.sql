-- Run as a non-superuser migration verifier against an isolated migrated database.
-- Never run against a shared DEV, Test, or Production database.
DO $check$
DECLARE
  p text;
BEGIN
  IF current_database() !~ '(^|_)(isolated|scratch|test)(_|$)' THEN
    RAISE EXCEPTION 'Refusing ACL verification outside isolated/test database: %', current_database();
  END IF;
  FOREACH p IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] LOOP
    IF has_table_privilege('moneyverse_app', 'public.user_items', p) THEN
      RAISE EXCEPTION 'moneyverse_app unexpectedly has % on public.user_items', p;
    END IF;
  END LOOP;
  IF NOT has_function_privilege('moneyverse_app', 'public.shop_my_items_v2(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'moneyverse_app lacks shop_my_items_v2(uuid) EXECUTE';
  END IF;
END
$check$;
