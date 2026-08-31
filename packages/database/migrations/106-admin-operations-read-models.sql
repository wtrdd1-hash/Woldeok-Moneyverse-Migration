-- The three console menus 14.9 names that this build has never had:
-- 작업·직업, 은행·대출 and Discord.
--
-- 14.9 lists thirteen menus. Ten of them have a screen and the reads behind
-- it. Three do not, and each is missing for its own reason:
--
--   WORK AND JOBS. 066-070 and 095 built the whole loop, and every read
--   model they left behind takes `p_actor` and answers a question about that
--   member -- `work_task_board`, `work_my_dashboard`, `work_my_receipts`.
--   There is no function an operator can call to see the catalogue itself,
--   what it is actually paying, or how far members have got in a job. 095
--   opened the loop for members; this opens it for the person answerable
--   for it.
--
--   BANK AND LOANS. The same shape. `bank_my_loans` (035) and
--   `bank_credit_ladder` (096) are a member's view of their own debt; the
--   loan book -- who is holding what, what is overdue, what the ceilings are
--   doing -- has never been readable at all. 096 tightened those ceilings on
--   the strength of 14.4, and nothing could report whether that was right.
--
--   DISCORD. Nearly built already: 039 and 061 expose the last thirty outbox
--   rows and the audit screen prints them. What is missing is
--   `discord_outbox_routes` (061), the table that decides which event types
--   are announced and to which channel key. It is revoked from
--   `moneyverse_app` like every other table and no function has ever read it
--   back, so the first question an operator asks when a message did not
--   arrive -- is that type even routed? -- has no answer, and an event type
--   nobody wrote a route for is invisible rather than visibly unrouted. That
--   is the 047 and 095 miss again, one table further along.
--
-- READS ONLY, DELIBERATELY. 14.9's 실행 방식 demands a preview, a reason and
-- re-authentication on every change, and every change it asks for in these
-- three areas already exists behind exactly those guards: the reward caps
-- are an economy policy version (059), any of the three can be paused or put
-- into safe mode through `admin_set_feature_switch` (059), and a wrong
-- payment is a compensating transaction (083). A second set of write
-- commands here would duplicate those with a weaker gate.
--
-- THE GATE IS THE ONE THE CONSOLE ALREADY USES. `admin_role_holder(...,
-- 'approver')` -- which admits the superadmin -- is what
-- `admin_economy_dashboard` (087) and `admin_list_users` (026) require of a
-- console read. None of these functions appends its own audit row, and that
-- is not an omission: `adminAuditTrail` writes one through
-- `admin_record_console_access` (063) for every request under
-- `/api/v1/admin`, refused requests included, carrying actor, path, outcome
-- and status. A second row written inside the read would record the same
-- view twice and, being inside the read, would turn a SELECT into a chain
-- write. `admin_reveal_audit_event` (064) pays that cost because it
-- discloses a value that is otherwise masked; nothing here does.
--
-- The loan book is the one read that names members beside their debts. It
-- takes 026's gate, a bounded limit, and `identities.display_name` rather
-- than the name a member chose -- 097's reason exactly: an operator looking
-- at an account needs the account, not the alias.

BEGIN;

-- ---------------------------------------------------------------------------
-- 작업·직업
-- ---------------------------------------------------------------------------

-- Every task on offer, with what it has actually been doing.
--
-- `base_reward` is the catalogue price, not the paid one -- 068 decays it per
-- repeat and clamps it to the caps, which is why `paid_24h` is read from the
-- receipts rather than multiplied out of the catalogue. The two disagreeing
-- is the thing an operator is looking for.
CREATE OR REPLACE FUNCTION public.admin_work_catalogue(p_actor uuid)
RETURNS TABLE(
  task_id uuid,
  code text,
  name text,
  job_type text,
  difficulty smallint,
  base_reward bigint,
  base_experience bigint,
  minimum_duration_seconds integer,
  daily_limit integer,
  active boolean,
  open_assignment_count bigint,
  awaiting_verification_count bigint,
  approved_24h bigint,
  rejected_24h bigint,
  paid_24h numeric,
  last_assigned_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day_ago timestamptz := pg_catalog.clock_timestamp() - interval '24 hours';
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the work console requires an administrator';
  END IF;

  -- Every column reference is qualified. The RETURNS TABLE names collide with
  -- `work_task_catalog`'s own columns -- code, name, active, difficulty -- and
  -- plpgsql resolves an unqualified one to the OUT parameter, which is 42702
  -- at run time rather than at deploy.
  RETURN QUERY
  SELECT task_row.id,
         task_row.code,
         task_row.name,
         task_row.job_type::text,
         task_row.difficulty,
         task_row.base_reward,
         task_row.base_experience,
         task_row.minimum_duration_seconds,
         task_row.daily_limit,
         task_row.active,
         pg_catalog.count(assignment_row.id) FILTER (
           WHERE assignment_row.status = 'assigned'::public.work_assignment_status),
         pg_catalog.count(assignment_row.id) FILTER (
           WHERE assignment_row.status = 'submitted'::public.work_assignment_status),
         pg_catalog.count(assignment_row.id) FILTER (
           WHERE assignment_row.status = 'approved'::public.work_assignment_status
             AND assignment_row.verified_at > v_day_ago),
         pg_catalog.count(assignment_row.id) FILTER (
           WHERE assignment_row.status = 'rejected'::public.work_assignment_status
             AND assignment_row.verified_at > v_day_ago),
         coalesce(pg_catalog.sum(receipt_row.reward_amount::numeric) FILTER (
           WHERE receipt_row.created_at > v_day_ago), 0),
         pg_catalog.max(assignment_row.assigned_at)
  FROM public.work_task_catalog AS task_row
  LEFT JOIN public.work_assignments AS assignment_row
    ON assignment_row.task_id = task_row.id
  -- One receipt per assignment (066 makes assignment_id UNIQUE), so this
  -- join adds no rows and the counts above stay counts of assignments.
  LEFT JOIN public.work_reward_receipts AS receipt_row
    ON receipt_row.assignment_id = assignment_row.id
  GROUP BY task_row.id
  ORDER BY task_row.job_type, task_row.difficulty, task_row.code;
END;
$$;

-- How far the five jobs have actually got.
--
-- Driven from `enum_range` rather than from `user_job_progress`, so a job
-- nobody has taken is a row reading zero instead of a missing line. "Nobody
-- is a technician" is the answer 14.7 makes worth reading.
CREATE OR REPLACE FUNCTION public.admin_work_job_levels(p_actor uuid)
RETURNS TABLE(
  job_type text,
  member_count bigint,
  average_level numeric,
  top_level integer,
  total_experience numeric,
  active_7d_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_week_ago timestamptz := pg_catalog.clock_timestamp() - interval '7 days';
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the work console requires an administrator';
  END IF;

  -- The set-returning alias is `kind`, not `job_type`: the OUT parameter
  -- already owns that name inside this body.
  --
  -- `changed_at` is bumped by every reward (068:199), so counting rows it
  -- touched in the last seven days counts members who worked that job, not
  -- members who levelled up.
  RETURN QUERY
  SELECT job.kind::text,
         pg_catalog.count(progress_row.user_id),
         pg_catalog.round(coalesce(pg_catalog.avg(progress_row.level), 0), 2),
         coalesce(pg_catalog.max(progress_row.level), 0),
         coalesce(pg_catalog.sum(progress_row.experience::numeric), 0),
         pg_catalog.count(progress_row.user_id) FILTER (
           WHERE progress_row.changed_at > v_week_ago)
  FROM pg_catalog.unnest(pg_catalog.enum_range(NULL::public.work_job_type)) AS job(kind)
  LEFT JOIN public.user_job_progress AS progress_row ON progress_row.job_type = job.kind
  GROUP BY job.kind
  ORDER BY job.kind;
END;
$$;

-- The reward policy in force, and whether its caps are biting.
--
-- Scalar subqueries against one CTE rather than a join, so a deployment with
-- no enabled policy still answers one row with the counts filled in. "No
-- policy is in force" is a state an operator has to be able to see, and an
-- inner join would render it as an empty screen.
CREATE OR REPLACE FUNCTION public.admin_work_reward_policy(p_actor uuid)
RETURNS TABLE(
  policy_id integer,
  effective_at timestamptz,
  daily_cap bigint,
  weekly_cap bigint,
  repeat_decay_percent smallint,
  enabled boolean,
  reason text,
  active_task_count bigint,
  open_assignment_count bigint,
  awaiting_verification_count bigint,
  paid_24h numeric,
  members_paid_24h bigint,
  experience_24h numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day_ago timestamptz := pg_catalog.clock_timestamp() - interval '24 hours';
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the work console requires an administrator';
  END IF;

  -- The CTE's columns are renamed away from the OUT parameters on purpose:
  -- `enabled` and `reason` are both an output name and a column of
  -- `work_reward_policy_versions`.
  --
  -- The predicate picking the version is 095's, spelled the same way, so the
  -- caps this screen reports are the caps `work_reward_preview` quotes to a
  -- member.
  RETURN QUERY
  WITH in_force AS (
    SELECT policy_row.id AS policy_ident,
           policy_row.effective_at AS effective_from,
           policy_row.daily_cap AS cap_day,
           policy_row.weekly_cap AS cap_week,
           policy_row.repeat_decay_percent AS decay,
           policy_row.enabled AS is_enabled,
           policy_row.reason AS policy_reason
    FROM public.work_reward_policy_versions AS policy_row
    WHERE policy_row.enabled
      AND policy_row.effective_at <= pg_catalog.clock_timestamp()
    ORDER BY policy_row.effective_at DESC, policy_row.id DESC
    LIMIT 1
  )
  SELECT
    (SELECT in_force.policy_ident FROM in_force),
    (SELECT in_force.effective_from FROM in_force),
    (SELECT in_force.cap_day FROM in_force),
    (SELECT in_force.cap_week FROM in_force),
    (SELECT in_force.decay FROM in_force),
    (SELECT in_force.is_enabled FROM in_force),
    (SELECT in_force.policy_reason FROM in_force),
    (SELECT pg_catalog.count(*) FROM public.work_task_catalog AS task_row
     WHERE task_row.active),
    (SELECT pg_catalog.count(*) FROM public.work_assignments AS assignment_row
     WHERE assignment_row.status = 'assigned'::public.work_assignment_status),
    (SELECT pg_catalog.count(*) FROM public.work_assignments AS assignment_row
     WHERE assignment_row.status = 'submitted'::public.work_assignment_status),
    (SELECT coalesce(pg_catalog.sum(receipt_row.reward_amount::numeric), 0)
     FROM public.work_reward_receipts AS receipt_row
     WHERE receipt_row.created_at > v_day_ago),
    (SELECT pg_catalog.count(DISTINCT receipt_row.user_id)
     FROM public.work_reward_receipts AS receipt_row
     WHERE receipt_row.created_at > v_day_ago),
    (SELECT coalesce(pg_catalog.sum(receipt_row.experience_amount::numeric), 0)
     FROM public.work_reward_receipts AS receipt_row
     WHERE receipt_row.created_at > v_day_ago);
END;
$$;

-- ---------------------------------------------------------------------------
-- 은행·대출
-- ---------------------------------------------------------------------------

-- The bank in one row.
--
-- It exists because the loan book below is bounded: totals computed from a
-- limited list would be a subtotal presented as a total, which is exactly the
-- kind of number an operator acts on.
CREATE OR REPLACE FUNCTION public.admin_bank_overview(p_actor uuid)
RETURNS TABLE(
  deposit_amount numeric,
  depositor_count bigint,
  open_loan_count bigint,
  outstanding_amount numeric,
  overdue_loan_count bigint,
  overdue_amount numeric,
  maturing_7d_count bigint,
  issued_24h_count bigint,
  issued_24h_amount numeric,
  repaid_24h_amount numeric,
  borrower_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day_ago timestamptz := pg_catalog.clock_timestamp() - interval '24 hours';
  v_week_ahead timestamptz := pg_catalog.clock_timestamp() + interval '7 days';
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the bank console requires an administrator';
  END IF;

  RETURN QUERY
  WITH deposits AS (
    SELECT coalesce(pg_catalog.sum(balance_row.available_amount::numeric), 0) AS held,
           pg_catalog.count(*) FILTER (WHERE balance_row.available_amount > 0) AS holders
    FROM public.accounts AS account_row
    JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    WHERE account_row.owner_user_id IS NOT NULL
      AND account_row.account_type = 'USER_BANK'::public.account_type
  ),
  loans AS (
    SELECT
      pg_catalog.count(*) FILTER (WHERE loan_row.status IN ('active', 'overdue')) AS open_rows,
      coalesce(pg_catalog.sum(loan_row.outstanding_amount::numeric) FILTER (
        WHERE loan_row.status IN ('active', 'overdue')), 0) AS open_owed,
      pg_catalog.count(*) FILTER (WHERE loan_row.status = 'overdue') AS late_rows,
      coalesce(pg_catalog.sum(loan_row.outstanding_amount::numeric) FILTER (
        WHERE loan_row.status = 'overdue'), 0) AS late_owed,
      pg_catalog.count(*) FILTER (
        WHERE loan_row.status = 'active'
          AND loan_row.maturity_at IS NOT NULL
          AND loan_row.maturity_at <= v_week_ahead) AS due_soon,
      pg_catalog.count(*) FILTER (WHERE loan_row.issued_at > v_day_ago) AS fresh_rows,
      coalesce(pg_catalog.sum(loan_row.principal_amount::numeric) FILTER (
        WHERE loan_row.issued_at > v_day_ago), 0) AS fresh_principal,
      pg_catalog.count(DISTINCT loan_row.user_id) FILTER (
        WHERE loan_row.status IN ('active', 'overdue')) AS borrowers
    FROM public.virtual_bank_loans AS loan_row
  ),
  repaid AS (
    SELECT coalesce(pg_catalog.sum(repayment_row.amount::numeric), 0) AS paid
    FROM public.virtual_bank_loan_repayments AS repayment_row
    WHERE repayment_row.created_at > v_day_ago
  )
  SELECT deposits.held, deposits.holders,
         loans.open_rows, loans.open_owed,
         loans.late_rows, loans.late_owed,
         loans.due_soon,
         loans.fresh_rows, loans.fresh_principal,
         repaid.paid, loans.borrowers
  FROM deposits, loans, repaid;
END;
$$;

-- The credit ladder as an operator reads it: 14.4's four rungs with what has
-- actually been lent against each.
--
-- `bank_credit_ladder` (096) answers the same table for a member and marks
-- the rung they are on. This one carries no member and adds the book, which
-- is the half that says whether the ceilings 096 applied are the right ones.
CREATE OR REPLACE FUNCTION public.admin_credit_grades(p_actor uuid)
RETURNS TABLE(
  grade text,
  minimum_account_days integer,
  minimum_work_completions integer,
  credit_limit bigint,
  interest_bps integer,
  term_days integer,
  minimum_repayment bigint,
  active boolean,
  open_loan_count bigint,
  outstanding_amount numeric,
  overdue_loan_count bigint,
  issued_loan_count bigint,
  issued_principal numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the bank console requires an administrator';
  END IF;

  -- Counted from `virtual_bank_loans.credit_grade`, the grade recorded on the
  -- loan when it was written, not from what the borrower's grade is today: a
  -- loan is a contract at the rate it was made on, which is the same reason
  -- 096 left `interest_amount` alone on existing loans.
  RETURN QUERY
  SELECT policy_row.grade,
         policy_row.minimum_account_days,
         policy_row.minimum_work_completions,
         policy_row.credit_limit,
         policy_row.interest_bps,
         policy_row.term_days,
         policy_row.minimum_repayment,
         policy_row.active,
         pg_catalog.count(loan_row.id) FILTER (
           WHERE loan_row.status IN ('active', 'overdue')),
         coalesce(pg_catalog.sum(loan_row.outstanding_amount::numeric) FILTER (
           WHERE loan_row.status IN ('active', 'overdue')), 0),
         pg_catalog.count(loan_row.id) FILTER (WHERE loan_row.status = 'overdue'),
         pg_catalog.count(loan_row.id),
         coalesce(pg_catalog.sum(loan_row.principal_amount::numeric), 0)
  FROM public.bank_credit_policies AS policy_row
  LEFT JOIN public.virtual_bank_loans AS loan_row
    ON loan_row.credit_grade = policy_row.grade
  GROUP BY policy_row.grade
  ORDER BY policy_row.credit_limit, policy_row.grade;
END;
$$;

-- The loans still owed, worst first.
--
-- This is the one read here that names members beside their debts, so it
-- takes the gate 026 gives the member list and nothing weaker, and it is
-- bounded -- an unbounded member read is a page nobody reads and a copy
-- nobody meant to make. `identities.display_name` rather than the chosen
-- name, for 097's reason: an operator needs the account, not the alias.
CREATE OR REPLACE FUNCTION public.admin_loan_book(
  p_actor uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  loan_id uuid,
  user_id uuid,
  display_name text,
  credit_grade text,
  status text,
  principal_amount bigint,
  interest_amount bigint,
  outstanding_amount bigint,
  repaid_amount numeric,
  minimum_repayment bigint,
  issued_at timestamptz,
  maturity_at timestamptz,
  overdue_at timestamptz,
  status_reason text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  -- The bound is checked before the role, as 039 does: a malformed request is
  -- a malformed request whoever sent it, and neither answer discloses the
  -- other.
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'limit must be between 1 and 200';
  END IF;

  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the loan book requires an administrator';
  END IF;

  RETURN QUERY
  SELECT loan_row.id,
         loan_row.user_id,
         coalesce(identity.display_name, '사용자'),
         loan_row.credit_grade,
         loan_row.status,
         loan_row.principal_amount,
         loan_row.interest_amount,
         loan_row.outstanding_amount,
         coalesce((
           SELECT pg_catalog.sum(repayment_row.amount::numeric)
           FROM public.virtual_bank_loan_repayments AS repayment_row
           WHERE repayment_row.loan_id = loan_row.id
         ), 0),
         loan_row.minimum_repayment,
         loan_row.issued_at,
         loan_row.maturity_at,
         loan_row.overdue_at,
         loan_row.status_reason
  FROM public.virtual_bank_loans AS loan_row
  LEFT JOIN LATERAL (
    SELECT identity_row.display_name
    FROM public.identities AS identity_row
    WHERE identity_row.user_id = loan_row.user_id
    ORDER BY identity_row.linked_at
    LIMIT 1
  ) AS identity ON true
  WHERE loan_row.status IN ('active', 'overdue')
  ORDER BY (loan_row.status = 'overdue') DESC,
           loan_row.maturity_at NULLS LAST,
           loan_row.issued_at
  LIMIT p_limit;
END;
$$;

-- ---------------------------------------------------------------------------
-- Discord
-- ---------------------------------------------------------------------------

-- The outbox, counted rather than listed.
--
-- 039 lists the last thirty rows, which answers "what happened recently" and
-- not "is anything stuck" -- thirty delivered rows look identical whether or
-- not four hundred are parked behind them. The status expression is 061's,
-- copied rather than referenced so the two screens cannot report different
-- states for the same row; `work.db.test.ts` keeps the same kind of promise
-- between 068 and 095.
--
-- `stuck_count` is deliberately 087's `failed_outbox_count` predicate,
-- undelivered and older than an hour, so the console overview and this screen
-- never disagree about how many are late.
CREATE OR REPLACE FUNCTION public.admin_discord_outbox_health(p_actor uuid)
RETURNS TABLE(
  pending_count bigint,
  retry_pending_count bigint,
  delivering_count bigint,
  delivered_count bigint,
  dead_letter_count bigint,
  suppressed_count bigint,
  delivered_24h_count bigint,
  stuck_count bigint,
  oldest_undelivered_at timestamptz,
  last_delivered_at timestamptz,
  last_failure_at timestamptz,
  unrouted_type_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day_ago timestamptz := pg_catalog.clock_timestamp() - interval '24 hours';
  v_hour_ago timestamptz := pg_catalog.clock_timestamp() - interval '1 hour';
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the delivery console requires an administrator';
  END IF;

  RETURN QUERY
  WITH outbox_state AS (
    SELECT event.type AS type_key,
           event.created_at AS created_at,
           event.delivered_at AS delivered_at,
           event.delivery_failed_at AS failed_at,
           CASE
             WHEN event.delivered_at IS NOT NULL THEN 'delivered'
             WHEN event.delivery_outcome IS NOT NULL THEN event.delivery_outcome
             WHEN event.delivery_locked_until IS NOT NULL
                  AND event.delivery_locked_until >= pg_catalog.clock_timestamp() THEN 'delivering'
             WHEN event.delivery_attempts > 0 THEN 'retry_pending'
             ELSE 'pending'
           END AS status_text
    FROM public.outbox_events AS event
  )
  SELECT
    pg_catalog.count(*) FILTER (WHERE outbox_state.status_text = 'pending'),
    pg_catalog.count(*) FILTER (WHERE outbox_state.status_text = 'retry_pending'),
    pg_catalog.count(*) FILTER (WHERE outbox_state.status_text = 'delivering'),
    pg_catalog.count(*) FILTER (WHERE outbox_state.status_text = 'delivered'),
    pg_catalog.count(*) FILTER (WHERE outbox_state.status_text = 'dead_letter'),
    pg_catalog.count(*) FILTER (WHERE outbox_state.status_text = 'suppressed'),
    pg_catalog.count(*) FILTER (WHERE outbox_state.delivered_at > v_day_ago),
    pg_catalog.count(*) FILTER (
      WHERE outbox_state.delivered_at IS NULL AND outbox_state.created_at < v_hour_ago),
    pg_catalog.min(outbox_state.created_at) FILTER (
      WHERE outbox_state.delivered_at IS NULL AND outbox_state.failed_at IS NULL),
    pg_catalog.max(outbox_state.delivered_at),
    pg_catalog.max(outbox_state.failed_at),
    (SELECT pg_catalog.count(DISTINCT other.type)
     FROM public.outbox_events AS other
     WHERE NOT EXISTS (
       SELECT 1 FROM public.discord_outbox_routes AS route_row
       WHERE route_row.event_type = other.type))
  FROM outbox_state;
END;
$$;

-- Which event types are announced, where, and what each has done.
--
-- This is the read `discord_outbox_routes` never had. A FULL JOIN rather than
-- a left one, and `routed` rather than an inner join, because the row worth
-- seeing most is the one with no route: `outbox_claim_pending` (061) will
-- never claim it, so the events pile up silently and the type is missing from
-- every list built from the route table alone. Unrouted types sort first for
-- the same reason.
CREATE OR REPLACE FUNCTION public.admin_discord_routes(p_actor uuid)
RETURNS TABLE(
  event_type text,
  channel_key text,
  enabled boolean,
  note text,
  routed boolean,
  total_count bigint,
  pending_count bigint,
  dead_letter_count bigint,
  suppressed_count bigint,
  delivered_24h_count bigint,
  last_delivered_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day_ago timestamptz := pg_catalog.clock_timestamp() - interval '24 hours';
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the delivery console requires an administrator';
  END IF;

  -- The CTE's columns are named away from the OUT parameters: event_type,
  -- enabled and note are all output names here.
  RETURN QUERY
  WITH by_type AS (
    SELECT event.type AS type_key,
           pg_catalog.count(*) AS total_rows,
           pg_catalog.count(*) FILTER (
             WHERE event.delivered_at IS NULL
               AND event.delivery_outcome IS NULL) AS pending_rows,
           pg_catalog.count(*) FILTER (WHERE event.delivery_outcome = 'dead_letter') AS dead_rows,
           pg_catalog.count(*) FILTER (WHERE event.delivery_outcome = 'suppressed') AS held_rows,
           pg_catalog.count(*) FILTER (WHERE event.delivered_at > v_day_ago) AS fresh_rows,
           pg_catalog.max(event.delivered_at) AS last_sent_at
    FROM public.outbox_events AS event
    GROUP BY event.type
  )
  SELECT coalesce(route_row.event_type, by_type.type_key),
         route_row.channel_key,
         route_row.enabled,
         route_row.note,
         route_row.event_type IS NOT NULL,
         coalesce(by_type.total_rows, 0),
         coalesce(by_type.pending_rows, 0),
         coalesce(by_type.dead_rows, 0),
         coalesce(by_type.held_rows, 0),
         coalesce(by_type.fresh_rows, 0),
         by_type.last_sent_at
  FROM public.discord_outbox_routes AS route_row
  FULL JOIN by_type ON by_type.type_key = route_row.event_type
  ORDER BY (route_row.event_type IS NOT NULL),
           coalesce(route_row.event_type, by_type.type_key);
END;
$$;

-- ---------------------------------------------------------------------------
-- Ownership and privileges
-- ---------------------------------------------------------------------------

ALTER FUNCTION public.admin_work_catalogue(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_work_job_levels(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_work_reward_policy(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_bank_overview(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_credit_grades(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_loan_book(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_discord_outbox_health(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_discord_routes(uuid) OWNER TO moneyverse_migrator;

-- PostgreSQL grants EXECUTE to PUBLIC by default, so this is the half that
-- makes the GRANT below mean something.
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_work_catalogue(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_work_job_levels(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_work_reward_policy(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_bank_overview(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_credit_grades(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_loan_book(uuid, integer)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_discord_outbox_health(uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_discord_routes(uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.admin_work_catalogue(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_work_job_levels(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_work_reward_policy(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_bank_overview(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_credit_grades(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_loan_book(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_discord_outbox_health(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_discord_routes(uuid) TO moneyverse_app;

-- Restated, so this file cannot later be misread as the relaxation that let
-- an operations screen read a table directly. Every read above goes through a
-- function; none of these tables became readable.
--
-- `outbox_events`, `accounts` and `account_balances` are NOT in this list and
-- must not be added to it: 005 grants the application SELECT on all three,
-- and revoking here would take the wallet and the delivery worker down with
-- this migration.
REVOKE ALL PRIVILEGES ON TABLE public.work_task_catalog,
  public.work_assignments,
  public.work_reward_receipts,
  public.user_job_progress,
  public.work_reward_policy_versions,
  public.virtual_bank_loans,
  public.virtual_bank_loan_repayments,
  public.bank_credit_policies,
  public.discord_outbox_routes,
  public.identities
  FROM PUBLIC, moneyverse_app;

COMMIT;
