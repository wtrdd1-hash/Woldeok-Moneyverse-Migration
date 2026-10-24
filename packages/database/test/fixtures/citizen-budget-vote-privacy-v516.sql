-- Disposable CI-only PostgreSQL regression; no persistent fixtures or live DB.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout = '10000ms';
DO $acl$
BEGIN
  IF has_table_privilege('moneyverse_app', 'public.treasury_citizen_budget_votes', 'SELECT')
    OR EXISTS (
      SELECT 1 FROM pg_catalog.pg_class AS c
      CROSS JOIN LATERAL pg_catalog.aclexplode(
        coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
      ) AS acl
      WHERE c.oid = 'public.treasury_citizen_budget_votes'::pg_catalog.regclass
        AND acl.grantee = 0 AND acl.privilege_type = 'SELECT'
    )
    OR has_table_privilege('moneyverse_app', 'public.treasury_citizen_budget_votes', 'INSERT')
    OR has_table_privilege('moneyverse_app', 'public.treasury_citizen_budget_votes', 'UPDATE') THEN
    RAISE EXCEPTION 'raw budget vote table privilege exposed';
  END IF;
  IF NOT has_function_privilege('moneyverse_app', 'public.treasury_budget_vote_totals(uuid,text)', 'EXECUTE')
    OR EXISTS (
      SELECT 1 FROM pg_catalog.pg_proc AS p
      CROSS JOIN LATERAL pg_catalog.aclexplode(
        coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
      ) AS acl
      WHERE p.oid = 'public.treasury_budget_vote_totals(uuid,text)'::pg_catalog.regprocedure
        AND acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
    ) THEN
    RAISE EXCEPTION 'aggregate function execution ACL invalid';
  END IF;
END;
$acl$;
INSERT INTO public.users(id) VALUES
  ('c5160000-0000-4000-8000-000000000001'),
  ('c5160000-0000-4000-8000-000000000002'),
  ('c5160000-0000-4000-8000-000000000003');
INSERT INTO public.user_roles(user_id, role) VALUES
  ('c5160000-0000-4000-8000-000000000001', 'operator');
INSERT INTO public.treasury_citizen_budget_votes(user_id, quarter, priority_choice) VALUES
  ('c5160000-0000-4000-8000-000000000002', '2099-Q1', 'WELFARE'),
  ('c5160000-0000-4000-8000-000000000003', '2099-Q1', 'INFRASTRUCTURE');
SET LOCAL ROLE moneyverse_app;
DO $isolation$
DECLARE
  v_total bigint;
  v_denied boolean := false;
BEGIN
  BEGIN
    PERFORM public.treasury_budget_vote_totals('c5160000-0000-4000-8000-000000000002', '2099-Q1');
  EXCEPTION WHEN insufficient_privilege THEN
    v_denied := true;
  END;
  IF NOT v_denied THEN
    RAISE EXCEPTION 'ordinary member obtained private budget vote aggregate';
  END IF;
  SELECT coalesce(sum(vote_count), 0) INTO v_total
    FROM public.treasury_budget_vote_totals('c5160000-0000-4000-8000-000000000001', '2099-Q1');
  IF v_total <> 2 THEN
    RAISE EXCEPTION 'authorized admin aggregate changed: %', v_total;
  END IF;
  IF (SELECT count(*) FROM public.treasury_budget_vote_totals('c5160000-0000-4000-8000-000000000001', '2099-Q1')) <> 2 THEN
    RAISE EXCEPTION 'admin aggregate must group by choice without user IDs';
  END IF;
  IF NOT public.treasury_cast_citizen_budget_vote(
    'c5160000-0000-4000-8000-000000000002', '2099-Q1', 'CITIZEN_DIVIDEND'
  ) THEN
    RAISE EXCEPTION 'existing authorized vote write path regressed';
  END IF;
END;
$isolation$;
RESET ROLE;
SELECT 'CITIZEN_BUDGET_VOTE_PRIVACY_PASS' AS verdict;
ROLLBACK;
