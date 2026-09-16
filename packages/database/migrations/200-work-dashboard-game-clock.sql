BEGIN;

-- v2026.09.16.149
-- work_my_dashboard remained on the civil Asia/Seoul day/week even after the
-- authoritative work settlement paths moved to the accelerated Moneyverse
-- clock. Patch only the live read model so displayed quota usage resets at the
-- same 10-minute day / 70-minute week boundaries used by settlement.
DO $$
DECLARE
  v_definition text;
  v_updated text;
BEGIN
  SELECT pg_catalog.pg_get_functiondef('public.work_my_dashboard(uuid)'::regprocedure)
    INTO v_definition;

  v_updated := pg_catalog.replace(
    v_definition,
    'v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE ''Asia/Seoul'')::date;',
    'v_day date := public.server_game_day_key();'
  );
  v_updated := pg_catalog.replace(
    v_updated,
    'v_week date := date_trunc(''week'', pg_catalog.clock_timestamp() AT TIME ZONE ''Asia/Seoul'')::date;',
    'v_week date := public.server_game_week_key();'
  );

  IF v_updated = v_definition
     OR position('server_game_day_key()' IN v_updated) = 0
     OR position('server_game_week_key()' IN v_updated) = 0 THEN
    RAISE EXCEPTION 'work_my_dashboard game-clock patch did not match';
  END IF;

  EXECUTE v_updated;
END;
$$;

ALTER FUNCTION public.work_my_dashboard(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_my_dashboard(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_my_dashboard(uuid) TO moneyverse_app;

COMMIT;
