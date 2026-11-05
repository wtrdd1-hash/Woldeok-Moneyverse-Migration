-- Restore the owner-only shop holdings boundary. The app role must call
-- SECURITY DEFINER shop functions; it must never read or mutate another
-- member's inventory through the base table. Existing migrations are immutable.
BEGIN;
REVOKE ALL PRIVILEGES ON TABLE public.user_items FROM PUBLIC, moneyverse_app;
DO $verify$
DECLARE v_privilege text;
BEGIN
  FOREACH v_privilege IN ARRAY ARRAY[
    'SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'
  ] LOOP
    IF pg_catalog.has_table_privilege('moneyverse_app','public.user_items',v_privilege) THEN
      RAISE EXCEPTION 'SHOP_HOLDINGS_APP_ACL_STILL_GRANTED: %',v_privilege USING ERRCODE='42501';
    END IF;
  END LOOP;
  FOREACH v_privilege IN ARRAY ARRAY['SELECT','INSERT','UPDATE','REFERENCES'] LOOP
    IF pg_catalog.has_any_column_privilege('moneyverse_app','public.user_items',v_privilege) THEN
      RAISE EXCEPTION 'SHOP_HOLDINGS_APP_COLUMN_ACL_STILL_GRANTED: %',v_privilege USING ERRCODE='42501';
    END IF;
  END LOOP;
END;
$verify$;
COMMIT;
