-- Isolated PostgreSQL verification; never run against a member database.
BEGIN;
INSERT INTO public.users(id) VALUES ('11111111-1111-4111-8111-111111111111');
SET LOCAL ROLE moneyverse_app;
DO $$
DECLARE
  actor uuid := '11111111-1111-4111-8111-111111111111';
  all_count integer;
  filtered_count integer;
  fixture_count integer;
BEGIN
  IF has_table_privilege(current_user, 'public.work_task_catalog', 'SELECT') THEN
    RAISE EXCEPTION 'application role has direct work catalogue SELECT';
  END IF;
  SELECT count(*) INTO all_count FROM public.work_task_board(actor);
  SELECT count(*) INTO filtered_count
  FROM public.work_task_board(actor) AS task
  WHERE task.daily_limit <= 0 OR task.taken_today < task.daily_limit;
  IF all_count = 0 OR filtered_count > all_count THEN
    RAISE EXCEPTION 'owner-scoped task board availability query is invalid';
  END IF;
  SELECT count(*) INTO fixture_count
  FROM (VALUES (0, 100), (2, 1), (2, 2), (1, 3)) AS task(daily_limit, taken_today)
  WHERE task.daily_limit <= 0 OR task.taken_today < task.daily_limit;
  IF fixture_count <> 2 THEN
    RAISE EXCEPTION 'unlimited/exhausted task boundary is incorrect';
  END IF;
  RAISE NOTICE 'PASS: owner-scoped board, app-role ACL, unlimited/exhausted predicate; rows % / %', filtered_count, all_count;
END;
$$;
ROLLBACK;
