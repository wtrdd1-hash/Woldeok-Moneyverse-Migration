-- Isolated restored Test only. psql \gset is intentional: actor fixture is private.
\set ON_ERROR_STOP on
BEGIN;
SELECT a.owner_user_id AS actor
FROM public.accounts a JOIN public.account_balances b ON b.account_id=a.id
WHERE a.account_type='USER_CASH'::public.account_type
  AND a.status='active'::public.account_status
  AND b.available_amount>2
  AND a.owner_user_id IS NOT NULL
LIMIT 1
\gset
SET LOCAL ROLE moneyverse_app;
SELECT (public.treasury_donate_v2(gen_random_uuid(), :'actor'::uuid,'1','role test')
  ->>'success')::boolean AS app_scoped_settlement;
ROLLBACK;
