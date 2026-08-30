-- §15.1's indicators, measured once a day and kept.
--
-- The engine in 091 decides from a week of these rather than from the live
-- tables, for three reasons. A weekly job that queried the ledger directly
-- would read whatever state the database happens to be in on Monday morning
-- and call it the week. A ratio has to be recomputed identically when
-- somebody asks why a change was made, and "run the same query again" does
-- not do that against a moving table. And §15.4 requires each policy to
-- record the metrics it was derived from, which means those metrics have to
-- exist as rows before the policy does.
--
-- One row per KST day, written by the daily 04:00 job. `metric_date` is the
-- day being measured, not the day it ran.
--
-- SAMPLE SUFFICIENCY. §15.2 stops automatic change when the active-user
-- sample is too small. The judgement is recorded per day rather than made
-- once at proposal time, because a week containing one empty day is a week
-- whose averages are wrong, and the proposer can only see that if the day
-- itself says so.

BEGIN;

CREATE TABLE IF NOT EXISTS public.economy_metric_snapshots (
  metric_date date PRIMARY KEY,
  computed_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),

  m2_amount numeric NOT NULL,
  issued_amount numeric NOT NULL,
  burned_amount numeric NOT NULL,
  -- NULL when nothing was issued: a ratio with a zero denominator is not
  -- zero, and a proposer that read it as zero would see the strongest
  -- possible inflation signal on the quietest possible day.
  burn_to_issue_percent numeric,
  work_issued_amount numeric NOT NULL,
  work_issue_share_percent numeric,

  new_member_count integer NOT NULL,
  new_member_median_holdings numeric,
  top_decile_share_percent numeric,
  -- Bank share of member money. §15.3 lowers the deposit rate when too much
  -- of the supply is parked rather than circulating.
  bank_share_percent numeric,
  -- Median days from joining to a first business, over the thirty days
  -- ending here. §15.2 makes this a monthly question, so a daily row uses a
  -- monthly window rather than pretending one day answers it.
  first_business_days_median numeric,

  active_member_count integer NOT NULL,
  trading_member_count integer NOT NULL,
  purchasing_member_count integer NOT NULL,

  -- Per-entity figures §15.3 needs but that have no fixed shape: one entry
  -- per job type, one per catalogue line.
  job_selection jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_demand jsonb NOT NULL DEFAULT '[]'::jsonb,

  sample_sufficient boolean NOT NULL,
  CONSTRAINT economy_metric_snapshots_counts CHECK (
    new_member_count >= 0 AND active_member_count >= 0
    AND trading_member_count >= 0 AND purchasing_member_count >= 0
  )
);

REVOKE ALL PRIVILEGES ON TABLE public.economy_metric_snapshots FROM PUBLIC, moneyverse_app;

-- Below this many active members a day's ratios are noise. It is a constant
-- rather than a setting because the number that matters is not the threshold
-- but whether an operator can move it to make an unwanted answer go away.
-- The test server passes it by seeding members, which is what the §3 gate
-- asks for anyway.
CREATE OR REPLACE FUNCTION public.economy_minimum_active_sample()
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = pg_catalog, pg_temp AS $$
  SELECT 20
$$;

CREATE OR REPLACE FUNCTION public.economy_record_metric_snapshot(p_date date DEFAULT NULL)
-- The OUT names avoid `metric_date` and `sample_sufficient`: plpgsql
-- substitutes parameters into the ON CONFLICT target below, where a name
-- shared with a column raises 42702 at runtime and nowhere earlier.
RETURNS TABLE(snapshot_date date, recomputed boolean, sample_ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_date date := coalesce(
    p_date,
    ((pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date - 1)
  );
  v_existing boolean;
  v_issued numeric;
  v_burned numeric;
  v_work numeric;
  v_m2 numeric;
  v_new_count integer;
  v_new_median numeric;
  v_top_decile numeric;
  v_active integer;
  v_trading integer;
  v_purchasing integer;
  v_bank_share numeric;
  v_first_business numeric;
  v_jobs jsonb;
  v_items jsonb;
  v_sufficient boolean;
BEGIN
  IF v_date > (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'cannot measure a day that has not happened';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:economy-metric-snapshot:' || v_date::text, 0)
  );

  SELECT true INTO v_existing
  FROM public.economy_metric_snapshots AS snapshot_row
  WHERE snapshot_row.metric_date = v_date;

  -- Issuance is a credit to MINT and absorption is a debit to SINK, because
  -- in this ledger a debit raises a balance and a credit lowers it, and MINT
  -- is the account money comes out of.
  SELECT
    coalesce(pg_catalog.sum(posting_row.amount::numeric) FILTER (
      WHERE account_row.account_type = 'MINT'::public.account_type
        AND posting_row.direction = 'credit'::public.posting_direction), 0),
    coalesce(pg_catalog.sum(posting_row.amount::numeric) FILTER (
      WHERE account_row.account_type = 'SINK'::public.account_type
        AND posting_row.direction = 'debit'::public.posting_direction), 0),
    coalesce(pg_catalog.sum(posting_row.amount::numeric) FILTER (
      WHERE account_row.account_type = 'MINT'::public.account_type
        AND posting_row.direction = 'credit'::public.posting_direction
        AND transaction_row.type IN ('WORK_REWARD', 'WORK_TASK_REWARD')), 0)
  INTO v_issued, v_burned, v_work
  FROM public.ledger_postings AS posting_row
  JOIN public.accounts AS account_row ON account_row.id = posting_row.account_id
  JOIN public.ledger_transactions AS transaction_row
    ON transaction_row.id = posting_row.transaction_id
  WHERE (transaction_row.created_at AT TIME ZONE 'Asia/Seoul')::date = v_date;

  SELECT supply.m2_amount,
         CASE WHEN supply.m2_amount > 0
           THEN pg_catalog.round(100 * supply.member_bank_amount / supply.m2_amount, 2)
         END
  INTO v_m2, v_bank_share
  FROM public.economy_money_supply() AS supply;

  SELECT pg_catalog.count(*)::integer INTO v_active
  FROM public.users AS user_row WHERE user_row.status = 'active'::public.user_status;

  WITH holdings AS (
    SELECT account_row.owner_user_id AS user_id,
           pg_catalog.sum(balance_row.available_amount)::numeric AS amount
    FROM public.accounts AS account_row
    JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    JOIN public.users AS user_row ON user_row.id = account_row.owner_user_id
    WHERE account_row.account_type IN (
        'USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
      AND user_row.status = 'active'::public.user_status
    GROUP BY account_row.owner_user_id
  ), ranked AS (
    SELECT holdings.amount, ntile(10) OVER (ORDER BY holdings.amount DESC) AS decile
    FROM holdings
  )
  SELECT CASE WHEN pg_catalog.sum(ranked.amount) > 0
    THEN pg_catalog.round(
      100 * pg_catalog.sum(ranked.amount) FILTER (WHERE ranked.decile = 1)
        / pg_catalog.sum(ranked.amount), 2)
  END
  INTO v_top_decile FROM ranked;

  -- "New" is the seven days ending on the day being measured, which is the
  -- window §15.1 names.
  WITH newcomers AS (
    SELECT account_row.owner_user_id AS user_id,
           pg_catalog.sum(balance_row.available_amount)::numeric AS amount
    FROM public.users AS user_row
    JOIN public.accounts AS account_row ON account_row.owner_user_id = user_row.id
    JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    WHERE user_row.status = 'active'::public.user_status
      AND account_row.account_type IN (
        'USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
      AND (user_row.created_at AT TIME ZONE 'Asia/Seoul')::date
        BETWEEN v_date - 6 AND v_date
    GROUP BY account_row.owner_user_id
  )
  SELECT pg_catalog.count(*)::integer,
         percentile_cont(0.5) WITHIN GROUP (ORDER BY newcomers.amount)
  INTO v_new_count, v_new_median
  FROM newcomers;

  -- The weekly circulation and conversion rates §15.1 asks for, measured on
  -- the seven days ending here so that a single quiet day cannot read as a
  -- collapse. Interest accrual is excluded: it happens to a member rather
  -- than being done by one.
  SELECT pg_catalog.count(DISTINCT transaction_row.actor_user_id)::integer
  INTO v_trading
  FROM public.ledger_transactions AS transaction_row
  WHERE transaction_row.actor_user_id IS NOT NULL
    AND transaction_row.type <> 'BANK_DEPOSIT_INTEREST'
    AND (transaction_row.created_at AT TIME ZONE 'Asia/Seoul')::date
      BETWEEN v_date - 6 AND v_date;

  SELECT pg_catalog.count(DISTINCT purchase_row.user_id)::integer
  INTO v_purchasing
  FROM public.shop_purchases AS purchase_row
  WHERE (purchase_row.purchased_at AT TIME ZONE 'Asia/Seoul')::date
    BETWEEN v_date - 6 AND v_date;

  WITH first_business AS (
    SELECT ownership_row.user_id,
           pg_catalog.min(ownership_row.purchased_at) AS first_at
    FROM public.virtual_business_ownerships AS ownership_row
    GROUP BY ownership_row.user_id
  )
  SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY
    (first_business.first_at AT TIME ZONE 'Asia/Seoul')::date
    - (user_row.created_at AT TIME ZONE 'Asia/Seoul')::date)
  INTO v_first_business
  FROM first_business
  JOIN public.users AS user_row ON user_row.id = first_business.user_id
  WHERE (first_business.first_at AT TIME ZONE 'Asia/Seoul')::date
    BETWEEN v_date - 29 AND v_date;

  SELECT coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
           'jobType', job_counts.job_type, 'assignments', job_counts.taken)
         ORDER BY job_counts.taken DESC), '[]'::jsonb)
  INTO v_jobs
  FROM (
    SELECT task_row.job_type::text AS job_type, pg_catalog.count(*)::bigint AS taken
    FROM public.work_assignments AS assignment_row
    JOIN public.work_task_catalog AS task_row ON task_row.id = assignment_row.task_id
    WHERE (assignment_row.assigned_at AT TIME ZONE 'Asia/Seoul')::date
      BETWEEN v_date - 6 AND v_date
    GROUP BY task_row.job_type
  ) AS job_counts;

  SELECT coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
           'code', item_rows.code,
           'category', item_rows.category,
           'soldUnits', item_rows.sold_units,
           'quantity', item_rows.quantity,
           'baselineQuantity', item_rows.baseline_quantity,
           'soldOut', item_rows.quantity = 0)
         ORDER BY item_rows.code), '[]'::jsonb)
  INTO v_items
  FROM (
    SELECT catalog_row.code, catalog_row.category,
           inventory_row.quantity,
           inventory_row.baseline_quantity,
           coalesce((
             SELECT pg_catalog.sum(purchase_row.quantity)::bigint
             FROM public.shop_purchases AS purchase_row
             WHERE purchase_row.catalog_id = catalog_row.id
               AND (purchase_row.purchased_at AT TIME ZONE 'Asia/Seoul')::date = v_date
           ), 0) AS sold_units
    FROM public.shop_catalog AS catalog_row
    JOIN public.shop_inventory AS inventory_row ON inventory_row.catalog_id = catalog_row.id
    WHERE catalog_row.active
  ) AS item_rows;

  v_sufficient := v_active >= public.economy_minimum_active_sample();

  INSERT INTO public.economy_metric_snapshots (
    metric_date, m2_amount, issued_amount, burned_amount, burn_to_issue_percent,
    work_issued_amount, work_issue_share_percent, new_member_count,
    new_member_median_holdings, top_decile_share_percent, bank_share_percent,
    first_business_days_median, active_member_count,
    trading_member_count, purchasing_member_count, job_selection, item_demand,
    sample_sufficient
  ) VALUES (
    v_date, v_m2, v_issued, v_burned,
    CASE WHEN v_issued > 0 THEN pg_catalog.round(100 * v_burned / v_issued, 2) END,
    v_work,
    CASE WHEN v_issued > 0 THEN pg_catalog.round(100 * v_work / v_issued, 2) END,
    v_new_count, v_new_median, v_top_decile, v_bank_share, v_first_business,
    v_active, v_trading, v_purchasing, v_jobs, v_items, v_sufficient
  )
  ON CONFLICT (metric_date) DO UPDATE SET
    computed_at = pg_catalog.clock_timestamp(),
    m2_amount = EXCLUDED.m2_amount,
    issued_amount = EXCLUDED.issued_amount,
    burned_amount = EXCLUDED.burned_amount,
    burn_to_issue_percent = EXCLUDED.burn_to_issue_percent,
    work_issued_amount = EXCLUDED.work_issued_amount,
    work_issue_share_percent = EXCLUDED.work_issue_share_percent,
    new_member_count = EXCLUDED.new_member_count,
    new_member_median_holdings = EXCLUDED.new_member_median_holdings,
    top_decile_share_percent = EXCLUDED.top_decile_share_percent,
    bank_share_percent = EXCLUDED.bank_share_percent,
    first_business_days_median = EXCLUDED.first_business_days_median,
    active_member_count = EXCLUDED.active_member_count,
    trading_member_count = EXCLUDED.trading_member_count,
    purchasing_member_count = EXCLUDED.purchasing_member_count,
    job_selection = EXCLUDED.job_selection,
    item_demand = EXCLUDED.item_demand,
    sample_sufficient = EXCLUDED.sample_sufficient;

  RETURN QUERY SELECT v_date, coalesce(v_existing, false), v_sufficient;
END;
$$;

-- What the console shows and what the proposer reads.
CREATE OR REPLACE FUNCTION public.economy_recent_metrics(p_days integer DEFAULT 7)
RETURNS SETOF public.economy_metric_snapshots
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT snapshot_row.*
  FROM public.economy_metric_snapshots AS snapshot_row
  ORDER BY snapshot_row.metric_date DESC
  LIMIT least(greatest(coalesce(p_days, 7), 1), 90)
$$;

ALTER FUNCTION public.economy_minimum_active_sample() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_record_metric_snapshot(date) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_recent_metrics(integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.economy_minimum_active_sample() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_record_metric_snapshot(date) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_recent_metrics(integer) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.economy_record_metric_snapshot(date) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_recent_metrics(integer) TO moneyverse_app;

COMMIT;
