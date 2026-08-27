SELECT 'TABLE  ' || table_name || ' :: ' || string_agg(column_name || ' ' || data_type || CASE WHEN is_nullable='NO' THEN ' NOT NULL' ELSE '' END, ', ' ORDER BY ordinal_position)
FROM information_schema.columns WHERE table_schema='public' GROUP BY table_name
UNION ALL
SELECT 'FUNC   ' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ') sec=' || CASE WHEN p.prosecdef THEN 'definer' ELSE 'invoker' END
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
UNION ALL
SELECT 'TYPE   ' || t.typname || ' :: ' || string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder)
FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid JOIN pg_namespace n ON n.oid=t.typnamespace
WHERE n.nspname='public' GROUP BY t.typname
UNION ALL
SELECT 'GRANT  ' || grantee || ' ' || privilege_type || ' ' || table_name
FROM information_schema.role_table_grants WHERE table_schema='public' AND grantee IN ('moneyverse_app','moneyverse_executor')
ORDER BY 1;
