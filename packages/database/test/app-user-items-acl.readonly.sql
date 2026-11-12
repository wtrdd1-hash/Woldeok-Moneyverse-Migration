-- Existing user_items is owner-private. App role must have no direct table privileges.
-- SECURITY DEFINER function EXECUTE is not a direct table grant.
SELECT privilege_type
FROM unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) AS privilege_type
WHERE pg_catalog.has_table_privilege('moneyverse_app', 'public.user_items', privilege_type)
ORDER BY privilege_type;
