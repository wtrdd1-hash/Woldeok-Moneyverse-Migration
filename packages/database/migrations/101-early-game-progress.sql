-- 16.1's first fortnight: the unlock ladder, the weekly goals, and the two
-- collection books -- each answered from a row that some other function wrote
-- while it was paying a reward or moving money.
--
-- WHY THIS IS SEEDED TABLES AND READS, AND NOT A COUNTER.
-- `engagement_record_progress` (082) is the shape this migration deliberately
-- does not copy. It takes a member's word for a count, and grants a title and
-- a collection entry when the count reaches its target, and nothing in it
-- verifies that the activity behind the count ever happened -- which is why
-- `EngagementController` exposes no route to it and says so where a reader
-- will find it. A second progress counter would be a second version of that
-- hole. Every number below is computed from `work_reward_receipts`,
-- `shop_purchases`, `ledger_postings`, `user_job_progress` or `users`. A
-- member holds no privilege on any of them.
--
-- WHAT CHANGES FOR A MEMBER: THE THREE SMALL BUSINESSES GET A LEVEL.
-- 16.1 puts 중고 판매대 at level 5, 길거리 노점 at 7 and 소형 배달소 at 10,
-- and 096 seeded all three at prices a beginner reaches with no level at all.
-- A screen that says "레벨 5에 해금" beside a purchase that succeeds at level 1
-- states a rule the database does not keep, and this repository has been
-- careful not to ship one of those. So the rule lands with the screen: a
-- trigger on `virtual_business_ownerships` refuses a purchase of the three
-- symbols the ladder names below the level it names. A trigger and not a
-- check inside `business_purchase`, for the reason 096 gives about the casino
-- debt block -- the purchase function is long, a check would have to cover
-- every path through it, and a trigger covers a path added later as well.
--
-- It takes something away: today a level-1 member holding 3,000 WLD may buy a
-- 중고 판매대. It also makes 15.1's own headline metric -- 첫 소규모 사업
-- 도달 7~14일 -- mean something, because level 5 is about a week of work at
-- the reward caps 066 sets, which is where 16.1 puts that business anyway.
-- Ownerships that already exist are untouched; the trigger is on INSERT.
--
-- WHAT IS NOT ENFORCED, AND SAYS SO. 16.1 also gates 직업 전용 작업 and
-- 기본 은행 예금 at level 3, 사용자 거래 at 7 and 전문 장비 at 10. Nothing
-- refuses any of those today, and gating them would take a capability away
-- from every member who has one -- which 077 refused to do to borrowing, and
-- which 096 only did once the specification's own table could be quoted as
-- the decision. They are carried as rungs with `enforced = false`, and the
-- read model returns that flag so the screen shows them as what they are: the
-- plan, not a lock.
--
-- WHY THE WEEKLY 작업 종류 TARGET IS FIVE AND NOT 16.1'S TEN. 070 seeds five
-- tasks and nothing has added a sixth, so a goal of ten distinct tasks could
-- not be finished in any week by anybody. Five is the whole catalogue, which
-- is the strongest true version of 서로 다른 작업 N종. The number rises with
-- the migration that seeds more tasks, not before.
--
-- WHY ONE GOAL IS MARKED `self_reported`. 16.1's fourth weekly goal is NPC
-- 단골 단계 1, and the only number behind it is `npc_relationships.affinity`,
-- which `engagement_record_npc_order` raises by one on a button press with
-- nothing verifying that an order was delivered. It is carried, because the
-- affinity is at least a stored fact rather than an invented one, but the
-- catalogue row says so, the read model returns it, and the screen prints it
-- beside the goal. Three goals a member cannot fake and one they can,
-- labelled, is honest. Four that look alike is not.
--
-- WHY 소비 IS AN ALLOWLIST OF TRANSACTION TYPES. Every purchase in this
-- schema credits the member's USER_CASH and debits the sink -- and so does a
-- stock buy (024) and a losing coin flip (042). "Money that reached the sink"
-- would therefore count a stake as spending, and 16.1's goal is about
-- settling into the economy rather than about betting. The four types listed
-- in the function are the ones that buy something. Saving is netted against
-- withdrawals inside the same week for the same reason: depositing and
-- withdrawing one thousand WLD five times is not saving five thousand.
--
-- WHY THE 직업 체험 도감 HAS FOUR PAGES AND NOT 16.1'S FIVE. A page is
-- unlocked by a paid work receipt for a task of that job, and 070's catalogue
-- has no 상인 task -- so a fifth page would be one nobody could ever fill,
-- and the title behind the book could never be awarded. 지역 스탬프 7종 is
-- absent for the harder version of the same reason: this schema has no
-- region, and nothing that happens in it could unlock a stamp.
--
-- ORDER: this migration puts foreign keys on `bank_credit_policies` (076) and
-- `virtual_business_types` (096, for the three small businesses), and it reads
-- the shop catalogue (073) and the work catalogue (070) at deploy time in the
-- guard at the end. plpgsql resolves table names at execution; a foreign key
-- and that guard do not. It sits above all four in the stack for that reason.

BEGIN;

-- The ladder 16.1 calls 초반 해금, as rows rather than as a paragraph on a
-- screen. A rung names one thing that opens and the standing it opens at.
CREATE TABLE public.early_unlock_ladder (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  ordinal smallint NOT NULL UNIQUE CHECK (ordinal BETWEEN 1 AND 50),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  detail text NOT NULL CHECK (char_length(detail) BETWEEN 1 AND 400),
  required_job_level integer NOT NULL CHECK (required_job_level BETWEEN 1 AND 50),
  required_account_days integer NOT NULL CHECK (required_account_days BETWEEN 0 AND 365),
  required_work_completions integer NOT NULL CHECK (required_work_completions >= 0),
  -- The business this rung opens, when it opens one. A foreign key and not a
  -- bare symbol: the trigger below reads this column to decide what to
  -- refuse, and a typo would silently refuse nothing at all.
  business_symbol text REFERENCES public.virtual_business_types(symbol),
  -- The credit grade this rung is about, when it is about one. Where it is
  -- set, the read model takes the two thresholds from `bank_credit_policies`
  -- instead of from this row. `bank_credit_grade` is what actually decides a
  -- grade, and a ladder holding its own copy of those numbers would drift
  -- from it the first time the policy moved -- 093 has already moved one.
  credit_grade text REFERENCES public.bank_credit_policies(grade),
  -- Whether the database refuses this below the standing named here. False is
  -- not a lie by omission: the read model returns it and the screen renders
  -- an unenforced rung as the plan rather than as a locked door.
  enforced boolean NOT NULL,
  active boolean NOT NULL DEFAULT true,
  CHECK (business_symbol IS NULL OR credit_grade IS NULL)
);

-- 16.1's 초반 주간 목표. `metric` is a closed vocabulary because
-- `early_game_weekly_goals` switches on it: a value with no branch there
-- would report zero for ever, and the CHECK is what makes adding one a
-- migration that has to touch both.
CREATE TABLE public.early_weekly_goal_catalog (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  ordinal smallint NOT NULL UNIQUE CHECK (ordinal BETWEEN 1 AND 50),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  detail text NOT NULL CHECK (char_length(detail) BETWEEN 1 AND 400),
  metric text NOT NULL CHECK (metric IN (
    'distinct_work_tasks', 'job_work_completions', 'spend_or_save', 'npc_affinity'
  )),
  -- 'week' resets on Monday in Seoul, like `engagement_period_key`. 'lifetime'
  -- is for a number that has no timestamp to window by -- `npc_relationships`
  -- records an affinity and not when it moved -- and the screen has to say so
  -- rather than let a standing total read as this week's work.
  window_kind text NOT NULL CHECK (window_kind IN ('week', 'lifetime')),
  target_amount bigint NOT NULL CHECK (target_amount > 0),
  unit_label text NOT NULL CHECK (char_length(unit_label) BETWEEN 1 AND 8),
  -- True for a goal whose only source is a button the member presses. One row
  -- carries it today and the screen prints it; a goal computed from receipts
  -- and a goal a member can award themselves must not look alike.
  self_reported boolean NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.early_collection_books (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  ordinal smallint NOT NULL UNIQUE CHECK (ordinal BETWEEN 1 AND 50),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  detail text NOT NULL CHECK (char_length(detail) BETWEEN 1 AND 400),
  -- 16.1: 수집 완성 보상은 소액 WLD보다 칭호·장식 중심. A completed book pays
  -- a title and nothing else, so no reward here can reach the ledger.
  reward_title text REFERENCES public.member_titles(code),
  reward_note text NOT NULL CHECK (char_length(reward_note) BETWEEN 1 AND 80),
  active boolean NOT NULL DEFAULT true
);

-- One page of one book, and the thing that has to have happened to fill it.
-- `evidence_code` cannot carry a foreign key because it points at two
-- different tables depending on `evidence_kind`; the DO block at the end of
-- this migration is what stops a page naming evidence that cannot exist.
CREATE TABLE public.early_collection_book_entries (
  book_code text NOT NULL REFERENCES public.early_collection_books(code),
  entry_code text NOT NULL CHECK (entry_code ~ '^[a-z0-9_]{3,64}$'),
  ordinal smallint NOT NULL CHECK (ordinal BETWEEN 1 AND 50),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  evidence_kind text NOT NULL CHECK (evidence_kind IN ('work_job', 'shop_item')),
  evidence_code text NOT NULL CHECK (char_length(evidence_code) BETWEEN 1 AND 64),
  PRIMARY KEY (book_code, entry_code),
  UNIQUE (book_code, ordinal)
);

INSERT INTO public.early_unlock_ladder (
  code, ordinal, label, detail, required_job_level, required_account_days,
  required_work_completions, business_symbol, credit_grade, enforced
) VALUES
  ('basic_start', 1, '기본 작업 · 일반 상점 · 송금',
   '가입하면 바로 열려 있어요. 작업 화면에서 기본 작업을 받고, 상점에서 물건을 사고, 다른 사람에게 송금할 수 있어요.',
   1, 0, 0, NULL, NULL, true),
  ('job_focus', 2, '직업 전용 작업 · 기본 은행 예금',
   '레벨 3에 열릴 예정이에요. 지금은 두 가지 모두 레벨 제한 없이 이용할 수 있어요.',
   3, 0, 0, NULL, NULL, false),
  -- The thresholds on this row repeat 14.4's numbers so that the row reads
  -- correctly on its own; the read model prefers the policy's, which is what
  -- `bank_credit_grade` actually tests.
  ('credit_c_loan', 3, 'C등급 대출 심사',
   '가입한 기간과 보상을 받은 작업 수가 조건을 채우면 C등급이 되어 대출을 신청할 수 있어요. 조건은 은행 정책에서 그대로 가져옵니다.',
   1, 7, 10, NULL, 'C', true),
  ('stall_business', 4, '중고 판매대',
   '레벨 5부터 사업 화면에서 중고 판매대를 살 수 있어요. 레벨이 모자라면 구매가 거절됩니다.',
   5, 0, 0, 'STALL', NULL, true),
  ('street_cart', 5, '길거리 노점',
   '레벨 7부터 사업 화면에서 길거리 노점을 살 수 있어요. 레벨이 모자라면 구매가 거절됩니다.',
   7, 0, 0, 'CART', NULL, true),
  ('member_trade', 6, '사용자 거래',
   '레벨 7에 열릴 예정이에요. 지금은 레벨 제한 없이 다른 사람과 거래할 수 있어요.',
   7, 0, 0, NULL, NULL, false),
  ('delivery_depot', 7, '소형 배달소',
   '레벨 10부터 사업 화면에서 소형 배달소를 살 수 있어요. 레벨이 모자라면 구매가 거절됩니다.',
   10, 0, 0, 'DEPOT', NULL, true),
  ('pro_equipment', 8, '전문 장비',
   '레벨 10에 열릴 예정이에요. 아직 전문 장비를 파는 곳이 없어서 잠금도 걸려 있지 않아요.',
   10, 0, 0, NULL, NULL, false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.early_weekly_goal_catalog (
  code, ordinal, label, detail, metric, window_kind, target_amount, unit_label, self_reported
) VALUES
  ('weekly_distinct_tasks', 1, '서로 다른 작업 해보기',
   '이번 주에 보상을 받은 작업의 종류를 셉니다. 같은 작업을 여러 번 해도 한 종류로 셉니다.',
   'distinct_work_tasks', 'week', 5, '종', false),
  ('weekly_job_tasks', 2, '내 직업 작업 7회',
   '레벨이 가장 높은 직업의 작업을 이번 주에 몇 번 마쳤는지 셉니다. 보상을 받은 작업만 셉니다.',
   'job_work_completions', 'week', 7, '회', false),
  ('weekly_spend_or_save', 3, '1,000 WLD 소비 또는 저축',
   '이번 주에 상점과 사업 구매로 쓴 금액에, 은행에 넣어 둔 금액을 더해서 셉니다. 이번 주에 다시 꺼낸 금액은 빼고 셉니다.',
   'spend_or_save', 'week', 1000, 'WLD', false),
  ('weekly_npc_regular', 4, 'NPC 단골 단계 1',
   'NPC와 쌓은 친밀도 중 가장 높은 값입니다. 이 목표만 이번 주가 아니라 지금까지의 기록으로 셉니다.',
   'npc_affinity', 'lifetime', 1, '단계', true)
ON CONFLICT (code) DO NOTHING;

-- Two titles, in the English `member_titles` is seeded in (079). What a member
-- reads is `reward_note` on the book.
INSERT INTO public.member_titles (code, name) VALUES
  ('job_explorer', 'Job explorer'),
  ('tool_collector', 'Tool collector')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.early_collection_books (code, ordinal, label, detail, reward_title, reward_note)
VALUES
  ('job_sampler', 1, '직업 체험 도감',
   '작업 보상을 받은 직업이 도감에 기록돼요. 상인은 아직 작업이 없어서 도감에도 없어요.',
   'job_explorer', '칭호 · 직업 체험가'),
  ('starter_tools', 2, '초보 도구 도감',
   '일반 상점에서 산 초보 물건이 도감에 기록돼요. 한 번만 사면 계속 남아요.',
   'tool_collector', '칭호 · 도구 수집가')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.early_collection_book_entries (
  book_code, entry_code, ordinal, label, evidence_kind, evidence_code
) VALUES
  ('job_sampler', 'farmer', 1, '농부 체험', 'work_job', 'farmer'),
  ('job_sampler', 'miner', 2, '광부 체험', 'work_job', 'miner'),
  ('job_sampler', 'carrier', 3, '운반원 체험', 'work_job', 'carrier'),
  ('job_sampler', 'technician', 4, '기술자 체험', 'work_job', 'technician'),
  ('starter_tools', 'work_gloves', 1, '초보 작업 장갑', 'shop_item', 'work_gloves'),
  ('starter_tools', 'toolbox', 2, '기본 공구함', 'shop_item', 'toolbox'),
  ('starter_tools', 'work_bag', 3, '작은 작업 가방', 'shop_item', 'work_bag'),
  ('starter_tools', 'energy_drink', 4, '작업 에너지 음료', 'shop_item', 'energy_drink'),
  ('starter_tools', 'bus_ticket', 5, '버스 이용권', 'shop_item', 'bus_ticket'),
  ('starter_tools', 'repair_kit', 6, '도구 수리 키트', 'shop_item', 'repair_kit'),
  ('starter_tools', 'work_insurance', 7, '작업 실패 보험', 'shop_item', 'work_insurance'),
  ('starter_tools', 'profile_tag', 8, '프로필 이름표', 'shop_item', 'profile_tag'),
  ('starter_tools', 'business_license', 9, '초보 사업 허가증', 'shop_item', 'business_license'),
  ('starter_tools', 'stall_crate', 10, '노점 재고 상자', 'shop_item', 'stall_crate')
ON CONFLICT (book_code, entry_code) DO NOTHING;

-- When this member first earned one page of one book, or NULL for a page they
-- have not filled.
--
-- The evidence is the event itself rather than a flag somebody set: the
-- earliest paid work receipt for a task of that job, or the earliest purchase
-- of that shop item. Both tables are written only by functions that were
-- moving money at the time, which is what makes a filled page impossible to
-- award oneself. `collection_entries` is honoured as a third source because
-- 082 grants a page there when a quest completes, and a page granted that way
-- is still a page.
--
-- `least` skips NULLs, so this answers the earliest of whichever sources
-- exist. It is not granted to moneyverse_app: the two readers below are
-- SECURITY DEFINER and call it as the owner, and nothing else has a reason to
-- ask about one page in isolation.
CREATE OR REPLACE FUNCTION public.early_collection_entry_unlocked_at(
  p_actor uuid,
  p_book text,
  p_entry text,
  p_kind text,
  p_evidence text
)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT least(
    (SELECT min(receipt_row.created_at)
     FROM public.work_reward_receipts AS receipt_row
     JOIN public.work_assignments AS assignment_row
       ON assignment_row.id = receipt_row.assignment_id
     JOIN public.work_task_catalog AS task_row
       ON task_row.id = assignment_row.task_id
     WHERE p_kind = 'work_job'
       AND receipt_row.user_id = p_actor
       -- Compared as text rather than cast to `work_job_type`: a seeded value
       -- that is not an enum label would raise 22P02 from the cast and take
       -- the whole read with it, where this simply matches nothing.
       AND task_row.job_type::text = p_evidence),
    (SELECT min(purchase_row.purchased_at)
     FROM public.shop_purchases AS purchase_row
     JOIN public.shop_catalog AS item_row ON item_row.id = purchase_row.catalog_id
     WHERE p_kind = 'shop_item'
       AND purchase_row.user_id = p_actor
       AND item_row.code = p_evidence),
    (SELECT stored_row.unlocked_at
     FROM public.collection_entries AS stored_row
     WHERE stored_row.user_id = p_actor
       AND stored_row.collection_code = p_book
       AND stored_row.entry_code = p_entry)
  )
$$;

-- What this member has unlocked, what is next, and what the next one asks for.
--
-- The three standings are read once and applied to every rung, and each is
-- spelled the way the function that enforces it spells it: the account's age
-- in Seoul days and the count of `work_reward_receipts` are `bank_credit_grade`'s
-- own two tests (077), so the credit rung cannot claim a grade the bank would
-- refuse. The job level is `coalesce(max(level), 1)` and not 077's
-- `coalesce(..., 0)`: 066 gives every `user_job_progress` row a level of at
-- least one, a member with no row yet can still take basic work, and calling
-- that level zero would report the first rung as locked to everybody who has
-- not worked.
CREATE OR REPLACE FUNCTION public.early_game_unlocks(p_actor uuid)
RETURNS TABLE(
  unlock_code text,
  unlock_label text,
  unlock_detail text,
  -- The business a rung gates, when it gates one. Reported rather than left
  -- for a caller to map, because the businesses screen has to disable the
  -- purchase this ladder refuses, and a symbol table written in TypeScript
  -- would be the rule kept in two places -- the second of which nothing
  -- refuses to be wrong.
  unlock_business_symbol text,
  needs_job_level integer,
  needs_account_days integer,
  needs_work_completions integer,
  is_enforced boolean,
  unlocked boolean,
  next_up boolean,
  member_job_level integer,
  member_account_days integer,
  member_work_completions integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_level integer;
  v_days integer;
  v_completions integer;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  SELECT coalesce(max(progress_row.level), 1) INTO v_level
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor;

  -- 077's expression, character for character. Subtracting two dates cast in
  -- the session's timezone put the answer up to a day out depending on who
  -- was connected, and this number decides whether a member may borrow.
  SELECT (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date
         - (user_row.created_at AT TIME ZONE 'Asia/Seoul')::date
  INTO v_days
  FROM public.users AS user_row
  WHERE user_row.id = p_actor;

  SELECT count(*) INTO v_completions
  FROM public.work_reward_receipts AS receipt_row
  WHERE receipt_row.user_id = p_actor;

  -- Every column reference below is qualified. Nine of the OUT parameters
  -- share a name with a column of some table read here, and plpgsql defaults
  -- to variable_conflict = error -- 067, 080 and 095 all raised 42702 on their
  -- first version for exactly this.
  RETURN QUERY
  WITH standing AS (
    SELECT
      rung_row.code AS code,
      rung_row.ordinal AS ordinal,
      rung_row.label AS label,
      rung_row.detail AS detail,
      rung_row.business_symbol AS business_symbol,
      rung_row.required_job_level AS job_level,
      coalesce(policy_row.minimum_account_days, rung_row.required_account_days) AS account_days,
      coalesce(policy_row.minimum_work_completions, rung_row.required_work_completions)
        AS completions,
      rung_row.enforced AS rung_enforced,
      (
        v_level >= rung_row.required_job_level
        AND v_days >= coalesce(policy_row.minimum_account_days, rung_row.required_account_days)
        AND v_completions
          >= coalesce(policy_row.minimum_work_completions, rung_row.required_work_completions)
        -- A credit rung is only open while its grade is one the bank still
        -- lends against. A deactivated policy is never chosen by
        -- `bank_credit_grade`, so a rung that ignored `active` would report a
        -- grade the borrower cannot get.
        AND (rung_row.credit_grade IS NULL OR coalesce(policy_row.active, false))
      ) AS unlocked
    FROM public.early_unlock_ladder AS rung_row
    LEFT JOIN public.bank_credit_policies AS policy_row
      ON policy_row.grade = rung_row.credit_grade
    WHERE rung_row.active
  )
  SELECT
    standing_row.code,
    standing_row.label,
    standing_row.detail,
    standing_row.business_symbol,
    standing_row.job_level,
    standing_row.account_days,
    standing_row.completions,
    standing_row.rung_enforced,
    standing_row.unlocked,
    -- The next *lock*, not merely the next row. A rung nothing enforces is
    -- already available, and pointing a member at it as their next unlock
    -- would send them to work for something they can do today. NULL from the
    -- subquery means everything enforced is open, which IS NOT DISTINCT FROM
    -- reports as false rather than as NULL.
    standing_row.ordinal IS NOT DISTINCT FROM (
      SELECT min(open_row.ordinal) FROM standing AS open_row
      WHERE NOT open_row.unlocked AND open_row.rung_enforced
    ),
    v_level,
    v_days,
    v_completions
  FROM standing AS standing_row
  ORDER BY standing_row.ordinal;
END;
$$;

-- 16.1's weekly goals, counted from what happened.
--
-- The week is the one `engagement_period_key` already uses, so a member
-- reading /quests sees one week and not two. Every count is taken once, into a
-- variable, and the catalogue row then selects which of them it is about --
-- which keeps the arithmetic in one place and makes a goal added later a row
-- plus a branch rather than a new function.
CREATE OR REPLACE FUNCTION public.early_game_weekly_goals(p_actor uuid)
RETURNS TABLE(
  goal_code text,
  goal_label text,
  goal_detail text,
  goal_metric text,
  goal_window text,
  goal_target bigint,
  goal_progress bigint,
  goal_unit text,
  goal_self_reported boolean,
  goal_completed boolean,
  week_start date
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_week date := date_trunc('week', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_from timestamptz := (v_week::timestamp AT TIME ZONE 'Asia/Seoul');
  v_job public.work_job_type;
  v_distinct bigint;
  v_job_tasks bigint;
  v_spend bigint;
  v_saved bigint;
  v_affinity bigint;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  -- The member's job is the one they have the most levels in, tie broken by
  -- the enum's own name. That is 080's rule, and this repeats it rather than
  -- inventing a second answer to "what is this member's job" -- there is no
  -- job-selection function in this schema, only 068 accruing experience into
  -- the job of whatever task was verified.
  SELECT progress_row.job_type INTO v_job
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor
  ORDER BY progress_row.level DESC, progress_row.job_type
  LIMIT 1;

  SELECT count(DISTINCT assignment_row.task_id) INTO v_distinct
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row
    ON assignment_row.id = receipt_row.assignment_id
  WHERE receipt_row.user_id = p_actor
    AND receipt_row.created_at >= v_from;

  SELECT count(*) INTO v_job_tasks
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row
    ON assignment_row.id = receipt_row.assignment_id
  JOIN public.work_task_catalog AS task_row ON task_row.id = assignment_row.task_id
  WHERE receipt_row.user_id = p_actor
    AND receipt_row.created_at >= v_from
    AND v_job IS NOT NULL
    AND task_row.job_type = v_job;

  -- Spending, by transaction type and not by counterparty. A stock buy (024)
  -- and a losing coin flip (042) also credit this account and debit the sink;
  -- neither is 소비, and counting them would let a member finish this goal at
  -- the coin table.
  SELECT coalesce(sum(posting_row.amount), 0) INTO v_spend
  FROM public.ledger_postings AS posting_row
  JOIN public.ledger_transactions AS transaction_row
    ON transaction_row.id = posting_row.transaction_id
  JOIN public.accounts AS account_row ON account_row.id = posting_row.account_id
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND posting_row.direction = 'credit'::public.posting_direction
    AND transaction_row.created_at >= v_from
    AND transaction_row.type IN (
      'SHOP_CATALOG_PURCHASE', 'SHOP_PURCHASE', 'BUSINESS_PURCHASE', 'CONSUMPTION_EVENT'
    );

  -- Saving, netted against withdrawing inside the same week. Gross deposits
  -- would make the goal a matter of pressing 입금 and 출금 alternately, which
  -- is not saving. Clamped at zero so that a member who withdrew more than
  -- they put in this week does not carry a negative into the sum with their
  -- spending.
  SELECT coalesce(sum(
    CASE WHEN posting_row.direction = 'debit'::public.posting_direction
      THEN posting_row.amount ELSE -posting_row.amount END
  ), 0) INTO v_saved
  FROM public.ledger_postings AS posting_row
  JOIN public.ledger_transactions AS transaction_row
    ON transaction_row.id = posting_row.transaction_id
  JOIN public.accounts AS account_row ON account_row.id = posting_row.account_id
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_BANK'::public.account_type
    AND transaction_row.created_at >= v_from
    AND transaction_row.type IN ('BANK_DEPOSIT', 'BANK_WITHDRAW');

  v_saved := greatest(v_saved, 0);

  SELECT coalesce(max(relationship_row.affinity), 0) INTO v_affinity
  FROM public.npc_relationships AS relationship_row
  WHERE relationship_row.user_id = p_actor;

  RETURN QUERY
  SELECT
    goal_row.code,
    goal_row.label,
    goal_row.detail,
    goal_row.metric,
    goal_row.window_kind,
    goal_row.target_amount,
    measured.amount,
    goal_row.unit_label,
    goal_row.self_reported,
    measured.amount >= goal_row.target_amount,
    v_week
  FROM public.early_weekly_goal_catalog AS goal_row
  CROSS JOIN LATERAL (
    SELECT CASE goal_row.metric
      WHEN 'distinct_work_tasks' THEN v_distinct
      WHEN 'job_work_completions' THEN v_job_tasks
      WHEN 'spend_or_save' THEN v_spend + v_saved
      WHEN 'npc_affinity' THEN v_affinity
      -- A metric with no branch reports nothing rather than guessing. The
      -- CHECK on the column is what keeps this unreachable.
      ELSE 0::bigint
    END AS amount
  ) AS measured
  WHERE goal_row.active
  ORDER BY goal_row.ordinal;
END;
$$;

-- The two books, page by page, with the title each pays.
--
-- `entry_unlocked` counts the pages whose evidence exists, which is why it is
-- `count()` over a nullable timestamp rather than a stored counter: there is
-- no number here that could fall out of step with the events behind it.
CREATE OR REPLACE FUNCTION public.early_game_collections(p_actor uuid)
RETURNS TABLE(
  book_code text,
  book_label text,
  book_detail text,
  reward_title text,
  reward_note text,
  reward_held boolean,
  entry_total integer,
  entry_unlocked integer,
  entries jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  RETURN QUERY
  WITH standing AS (
    SELECT
      entry_row.book_code AS book,
      entry_row.entry_code AS entry,
      entry_row.label AS label,
      entry_row.ordinal AS ordinal,
      public.early_collection_entry_unlocked_at(
        p_actor, entry_row.book_code, entry_row.entry_code,
        entry_row.evidence_kind, entry_row.evidence_code
      ) AS unlocked_at
    FROM public.early_collection_book_entries AS entry_row
  )
  SELECT
    book_row.code,
    book_row.label,
    book_row.detail,
    book_row.reward_title,
    book_row.reward_note,
    EXISTS (
      SELECT 1
      FROM public.user_titles AS holding_row
      JOIN public.member_titles AS title_row ON title_row.id = holding_row.title_id
      WHERE holding_row.user_id = p_actor AND title_row.code = book_row.reward_title
    ),
    count(standing_row.entry)::integer,
    count(standing_row.unlocked_at)::integer,
    coalesce(pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'code', standing_row.entry,
        'label', standing_row.label,
        'unlocked', standing_row.unlocked_at IS NOT NULL,
        'unlocked_at', standing_row.unlocked_at
      ) ORDER BY standing_row.ordinal
    ), '[]'::jsonb)
  FROM public.early_collection_books AS book_row
  JOIN standing AS standing_row ON standing_row.book = book_row.code
  WHERE book_row.active
  GROUP BY book_row.code, book_row.label, book_row.detail,
           book_row.reward_title, book_row.reward_note, book_row.ordinal
  ORDER BY book_row.ordinal;
END;
$$;

-- 16.1's 초반 해금, refusing rather than describing.
--
-- Only rungs that name a business and say `enforced` refuse anything, so the
-- three businesses 036 seeded -- which belong to 16.2 and 16.3 -- are
-- untouched, and a rung the ladder carries as the plan refuses nothing.
--
-- 22023 and not 55000: this is the rules declining a request the member can
-- come back and make later, which is what that code means everywhere else
-- here, and `BusinessController` already answers it as a conflict.
CREATE OR REPLACE FUNCTION public.early_game_refuse_locked_business()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_required integer;
  v_level integer;
BEGIN
  SELECT rung_row.required_job_level INTO v_required
  FROM public.early_unlock_ladder AS rung_row
  JOIN public.virtual_business_types AS business_row
    ON business_row.symbol = rung_row.business_symbol
  WHERE business_row.id = NEW.business_type_id
    AND rung_row.enforced
    AND rung_row.active;

  IF v_required IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(max(progress_row.level), 1) INTO v_level
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = NEW.user_id;

  IF v_level < v_required THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'this business needs a higher job level';
  END IF;

  RETURN NEW;
END;
$$;

-- Observed, not reported -- 082's phrase, and its reason. A member who has
-- just filled the last page of a book has done so by finishing work or by
-- buying something, and both of those write a row here. Asking a future caller
-- to remember to check is how a title quietly stops being awarded.
--
-- Nothing in this body can refuse the insert it hangs off: the SELECT finds no
-- complete book and inserts nothing, or finds one and inserts a row that
-- ON CONFLICT already covers. That matters, because one of the two tables it
-- watches is on the path that pays a work reward.
CREATE OR REPLACE FUNCTION public.early_game_note_collection_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_titles (user_id, title_id)
  SELECT NEW.user_id, title_row.id
  FROM public.early_collection_books AS book_row
  JOIN public.member_titles AS title_row ON title_row.code = book_row.reward_title
  WHERE book_row.active
    AND NOT EXISTS (
      SELECT 1
      FROM public.early_collection_book_entries AS entry_row
      WHERE entry_row.book_code = book_row.code
        AND public.early_collection_entry_unlocked_at(
              NEW.user_id, entry_row.book_code, entry_row.entry_code,
              entry_row.evidence_kind, entry_row.evidence_code
            ) IS NULL
    )
  ON CONFLICT (user_id, title_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.virtual_business_ownerships'::pg_catalog.regclass
      AND trigger_row.tgname = 'virtual_business_ownerships_unlock_gate'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER virtual_business_ownerships_unlock_gate
      BEFORE INSERT ON public.virtual_business_ownerships
      FOR EACH ROW
      EXECUTE FUNCTION public.early_game_refuse_locked_business();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.work_reward_receipts'::pg_catalog.regclass
      AND trigger_row.tgname = 'work_reward_receipts_collection_titles'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER work_reward_receipts_collection_titles
      AFTER INSERT ON public.work_reward_receipts
      FOR EACH ROW
      EXECUTE FUNCTION public.early_game_note_collection_completion();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.shop_purchases'::pg_catalog.regclass
      AND trigger_row.tgname = 'shop_purchases_collection_titles'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER shop_purchases_collection_titles
      AFTER INSERT ON public.shop_purchases
      FOR EACH ROW
      EXECUTE FUNCTION public.early_game_note_collection_completion();
  END IF;
END;
$do$;

-- A page nobody could ever fill is the failure this whole migration exists to
-- avoid, and the seeds above are the one place it could still happen: an
-- `evidence_code` cannot carry a foreign key because it points at two tables.
-- So the check runs here, at deploy, where CI is the one that reads it -- and
-- it asks for an active row rather than merely a matching name, because a job
-- with no task and an item nobody sells are both pages that cannot be filled.
DO $do$
DECLARE
  v_unfillable text;
BEGIN
  SELECT string_agg(entry_row.book_code || '/' || entry_row.entry_code, ', ')
  INTO v_unfillable
  FROM public.early_collection_book_entries AS entry_row
  WHERE (
      entry_row.evidence_kind = 'shop_item'
      AND NOT EXISTS (
        SELECT 1 FROM public.shop_catalog AS item_row
        WHERE item_row.code = entry_row.evidence_code AND item_row.active
      )
    )
    OR (
      entry_row.evidence_kind = 'work_job'
      AND NOT EXISTS (
        SELECT 1 FROM public.work_task_catalog AS task_row
        WHERE task_row.job_type::text = entry_row.evidence_code AND task_row.active
      )
    );

  IF v_unfillable IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'a seeded collection page names evidence nothing can produce: ' || v_unfillable;
  END IF;
END;
$do$;

ALTER FUNCTION public.early_collection_entry_unlocked_at(uuid, text, text, text, text)
  OWNER TO moneyverse_migrator;
ALTER FUNCTION public.early_game_unlocks(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.early_game_weekly_goals(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.early_game_collections(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.early_game_refuse_locked_business() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.early_game_note_collection_completion() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION
  public.early_collection_entry_unlocked_at(uuid, text, text, text, text),
  public.early_game_unlocks(uuid),
  public.early_game_weekly_goals(uuid),
  public.early_game_collections(uuid),
  public.early_game_refuse_locked_business(),
  public.early_game_note_collection_completion()
  FROM PUBLIC, moneyverse_app;

-- The three reads, and only those three. The per-page helper stays unreachable
-- from the application -- the readers above are SECURITY DEFINER and call it
-- as their owner -- and the two trigger functions are called by their
-- triggers, never by a caller.
GRANT EXECUTE ON FUNCTION
  public.early_game_unlocks(uuid),
  public.early_game_weekly_goals(uuid),
  public.early_game_collections(uuid)
  TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.early_unlock_ladder,
  public.early_weekly_goal_catalog, public.early_collection_books,
  public.early_collection_book_entries FROM PUBLIC, moneyverse_app;

-- Restated, so this migration cannot be read later as having relaxed the
-- boundary it works around. Every table the three functions read is still
-- unreadable as a table; the only new access is EXECUTE.
REVOKE ALL PRIVILEGES ON TABLE public.work_task_catalog, public.work_assignments,
  public.work_reward_receipts, public.user_job_progress, public.shop_catalog,
  public.shop_purchases, public.collection_entries, public.npc_relationships,
  public.member_titles, public.user_titles, public.bank_credit_policies,
  public.virtual_business_types, public.virtual_business_ownerships
  FROM PUBLIC, moneyverse_app;

COMMIT;
