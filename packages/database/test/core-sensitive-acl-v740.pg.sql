-- Isolated PostgreSQL only. Validate effective privileges, not just SQL text.
SET ROLE moneyverse_app;
DO $test$
DECLARE
  t text;
  p text;
  read_allowed boolean;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'account_balances','accounts','daily_rewards','outbox_events',
    'users','identities','user_items'
  ] LOOP
    FOREACH p IN ARRAY ARRAY[
      'INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'
    ] LOOP
      IF has_table_privilege(current_user, 'public.' || t, p) THEN
        RAISE EXCEPTION 'unsafe direct privilege %.%', t, p;
      END IF;
    END LOOP;
    read_allowed := t = ANY(ARRAY[
      'account_balances','accounts','daily_rewards','outbox_events'
    ]);
    IF has_table_privilege(current_user, 'public.' || t, 'SELECT') <> read_allowed THEN
      RAISE EXCEPTION 'wrong read permission on %', t;
    END IF;
  END LOOP;
  IF public.auth_session_has_current_consent('00000000-0000-4000-8000-000000000000'::uuid) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'auth SECURITY DEFINER function changed behavior';
  END IF;
  IF (SELECT count(*) FROM public.shop_my_items_v2('00000000-0000-4000-8000-000000000000'::uuid)) <> 0 THEN
    RAISE EXCEPTION 'shop owner-scoped read unexpectedly returned rows';
  END IF;
END;
$test$;
SELECT count(*) FROM public.account_balances;
RESET ROLE;
SELECT 'PASS: seven sensitive tables and owner-scoped functions' AS verdict;
