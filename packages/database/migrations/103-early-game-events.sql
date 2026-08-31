-- 16.1's 초반 랜덤 사건 and its 첫날 흐름: one event a member is dealt each
-- day, claimed once, and the seven-step flow that first day is supposed to be.
--
-- WHY THIS IS THE MIGRATION 101 SAID IT WOULD NOT WRITE.
-- 101 left the random events out and gave three reasons: each needs a
-- per-member daily draw, a scheduler to make the draw, and an abuse analysis
-- of what a member gains by refreshing until they like the event. The first
-- and third are answered below. The second turns out not to exist: a draw
-- that is a pure function of (member, Seoul date) needs nothing to run it.
--
-- THE DRAW IS A HASH, NOT A random(). `early_event_draw` orders the active
-- catalogue by `hashtextextended('moneyverse:early-event:' || member || ':'
-- || day || ':' || code)` and takes the first row -- 095's board picks its
-- three suggestions the same way, and for the same reason: two reads of the
-- same screen on the same day must agree. Refreshing recomputes the identical
-- row, so there is no reroll to hunt for, and midnight in Seoul is the only
-- thing that changes it.
--
-- NOTHING IS WRITTEN AT READ TIME. The alternative -- storing the day's draw
-- when a member first looks -- is the design this one avoids. A stored draw
-- is a row a member creates by looking, which makes "what did I draw" depend
-- on which read arrived first, and gives an operator a row to delete when a
-- member complains; a function of the member and the day has neither
-- property. The cost is real and is stated here rather than hidden: if an
-- operator deactivates a catalogue row in the middle of a day, the members
-- whose hash selected it are dealt a different event from that moment. The
-- read model closes the visible half of that -- once a claim exists, the
-- day's event IS the claimed one, read back from the receipt rather than
-- re-drawn -- and what remains is that a claim made seconds after such a
-- change can pay a different event than the card showed. Every reward here is
-- small and bounded by one claim a day, which is what makes that acceptable.
--
-- WHAT STOPS A SECOND CLAIM. `early_event_claims` is keyed on
-- (user_id, event_date). That is the rule, kept by the database and not by
-- the function: one claim per member per Seoul day, and the function's own
-- check is only there to raise 23505 with a sentence instead of a constraint
-- name. `idempotency_key` is UNIQUE beside it and is the replay path, in
-- 045's order -- validate, lock the key, look the receipt up by key, check
-- its owner, then work.
--
-- WHAT STOPS A MEMBER CLAIMING THE EVENT THEY WANTED. The claim takes no
-- event code. It re-draws for itself and pays what the draw returns, so a
-- crafted request cannot name 분실물 while the hash says 도구 고장. The only
-- thing the caller states is the date, and it must be today in Seoul --
-- copied from `economy_claim_daily` (005), where it exists so that a page
-- left open across midnight is refused rather than silently claiming a day
-- the member never saw.
--
-- WHAT THE CLAIM MAY PAY, AND WHY NOT ALWAYS WLD. Three shapes, because 16.1
-- asks for three: WLD through `economy_post_transaction` like every other
-- payout in this schema, job experience through the same upsert 068 uses, and
-- a shop item into `user_items`. The item grant deliberately does NOT write
-- `shop_purchases`: 101 hangs the 초보 도구 도감 off that table, so a gift
-- recorded as a purchase would fill a collection page nobody bought and
-- award the title behind it. A gift is not a purchase, and only one of the
-- two tables says so.
--
-- 행운 상자 pays no WLD at all, because 16.1 says 현금 대신 소모품 in as many
-- words. That line is the reason `user_items` is written here rather than the
-- easier thing of paying its price in cash.
--
-- WHY EXPERIENCE NEEDS A WORK REWARD FIRST. Experience is added to the
-- member's highest job -- 080's rule and 101's, not a new answer to "what is
-- this member's job" -- and a member who has never been paid for work has no
-- `user_job_progress` row to add it to. Inventing one would choose their job
-- for them, which 16.1 gives to the member at step 4. So the experience is
-- reported as zero for such a member and the claim is refused outright when
-- experience was the ONLY thing the event paid: a member must not spend their
-- one draw of the day on nothing. `early_event_today` returns the payable
-- figure rather than the catalogue's, which is 095's rule for `reward_preview`
-- -- a screen must never advertise a number this application will not pay.
--
-- WHAT THE EVENTS DO NOT DO YET. Four of the seven change something outside
-- this migration's reach: 비 오는 날 raises delivery rewards, 시장 할인일 cuts
-- beginner prices by a tenth, 도구 고장 assumes tool durability, 긴급 재고
-- requires several members filling one order. None of those exists, and
-- building any of them means changing the work reward or the shop price -- so
-- each row carries `pending_effect` naming what 16.1 asks for, the read model
-- returns it, and the screen prints it as the plan. That is 101's `enforced`
-- flag, in the same voice: a rule the database does not keep must not be
-- rendered as one it does.
--
-- THE MINT EXPOSURE. One claim a day, at most 40 WLD of it -- under the 100
-- the attendance reward already mints daily and a tenth of 066's 400 WLD
-- daily work cap. It is deliberately not counted against `work_reward_windows`:
-- those caps are on work, and 16.1's events are attendance-shaped.
--
-- THE 첫날 흐름 IS A READ OVER EVIDENCE. Five of its seven steps are counted
-- from `member_profiles`, `work_reward_receipts`, `user_job_progress` and
-- `shop_purchases` -- rows some other function wrote while paying a reward or
-- moving money -- which is 101's rule and the reason this file adds no second
-- `engagement_record_progress`. The other two are marked `unverified` and say
-- so: nothing records that a member read the 5분 경제 튜토리얼 or opened the
-- growth board, and a checkbox that ticks itself on a member's word is the
-- exact hole 082 left. They are rendered as links to /guide and /progression.
--
-- WHY THE 직업 체험 STEP ASKS FOR FOUR AND 16.1 SAYS FIVE. 070 seeds no
-- 상인 task, so a fifth trial could never be performed -- 101 dropped a
-- collection page for the same reason. The target is the smaller of the
-- catalogue's own count of jobs that have an active task and 16.1's five, so
-- the day a merchant task lands the step asks for five without another
-- migration.
--
-- ORDER: reads `work_task_catalog` (070) and `shop_catalog` (073) at deploy
-- time in the guard at the end, and carries foreign keys onto `shop_catalog`.
-- plpgsql resolves table names at execution; a foreign key and that guard do
-- not. It sits above 070, 071, 073, 079 and 101 in the stack for that reason.

BEGIN;

-- The seven events of 16.1's 초반 랜덤 사건, one row each.
--
-- The reward columns are a ceiling in the schema and not merely a description
-- of today's seed: a later row cannot quietly become the thing a member farms,
-- because 200 WLD and 100 experience are as much as any row may ever declare.
CREATE TABLE public.early_event_catalog (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  ordinal smallint NOT NULL UNIQUE CHECK (ordinal BETWEEN 1 AND 50),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  detail text NOT NULL CHECK (char_length(detail) BETWEEN 1 AND 400),
  claim_label text NOT NULL CHECK (char_length(claim_label) BETWEEN 1 AND 20),
  reward_amount bigint NOT NULL DEFAULT 0 CHECK (reward_amount BETWEEN 0 AND 200),
  reward_experience bigint NOT NULL DEFAULT 0 CHECK (reward_experience BETWEEN 0 AND 100),
  -- A foreign key onto the shop's own code, not a bare string: the claim
  -- hands this item over, and a typo would be discovered by a member being
  -- told the shop no longer sells something nobody ever seeded.
  reward_item_code text REFERENCES public.shop_catalog(code),
  reward_item_quantity smallint NOT NULL DEFAULT 0 CHECK (reward_item_quantity BETWEEN 0 AND 5),
  -- What 16.1 asks this event to change that nothing here changes yet. NULL
  -- for an event that is honoured in full.
  pending_effect text CHECK (pending_effect IS NULL OR char_length(pending_effect) BETWEEN 1 AND 120),
  active boolean NOT NULL DEFAULT true,
  CHECK ((reward_item_code IS NULL) = (reward_item_quantity = 0)),
  -- An event that pays nothing is not an event; it is a notification, and
  -- there is no reason to spend a member's one draw of the day on one.
  CHECK (reward_amount > 0 OR reward_experience > 0 OR reward_item_code IS NOT NULL)
);

-- One claim, by one member, on one Seoul day.
--
-- The primary key is the whole anti-abuse rule. Everything else on the row is
-- the receipt: what was actually paid, to which job the experience went, and
-- the ledger transaction the WLD moved through -- nullable, because an event
-- that pays only an item or only experience posts no transaction at all, and
-- 068 already treats a zero payout that way.
CREATE TABLE public.early_event_claims (
  user_id uuid NOT NULL REFERENCES public.users(id),
  event_date date NOT NULL,
  event_code text NOT NULL REFERENCES public.early_event_catalog(code),
  idempotency_key uuid NOT NULL UNIQUE,
  reward_amount bigint NOT NULL CHECK (reward_amount >= 0),
  experience_amount bigint NOT NULL CHECK (experience_amount >= 0),
  job_type public.work_job_type,
  item_code text REFERENCES public.shop_catalog(code),
  item_quantity smallint NOT NULL DEFAULT 0 CHECK (item_quantity BETWEEN 0 AND 5),
  transaction_id uuid REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (user_id, event_date),
  CHECK (experience_amount = 0 OR job_type IS NOT NULL),
  CHECK ((item_code IS NULL) = (item_quantity = 0)),
  -- A paid amount and a transaction are the same fact recorded twice. If they
  -- can disagree, the ledger is no longer the source of truth for this table.
  CHECK ((reward_amount = 0) = (transaction_id IS NULL))
);

-- 16.1's 첫날 흐름, as rows. `metric` is a closed vocabulary because
-- `early_first_day_flow` switches on it: a value with no branch there would
-- report zero for ever, and the CHECK is what makes adding one a migration
-- that has to touch both.
CREATE TABLE public.early_first_day_steps (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  ordinal smallint NOT NULL UNIQUE CHECK (ordinal BETWEEN 1 AND 50),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  detail text NOT NULL CHECK (char_length(detail) BETWEEN 1 AND 400),
  -- Where the member goes to do it. A path this application serves, checked
  -- for shape here and by eye against `frontend/src/app` -- a step pointing at
  -- a screen that does not exist is worse than a step with no link at all.
  href text NOT NULL CHECK (href ~ '^/[a-z-]{1,32}$'),
  metric text NOT NULL CHECK (metric IN (
    'profile_saved', 'job_sampler', 'job_chosen', 'shop_purchase', 'work_earnings', 'unverified'
  )),
  target_amount bigint NOT NULL CHECK (target_amount >= 0),
  unit_label text NOT NULL DEFAULT '' CHECK (char_length(unit_label) <= 8),
  active boolean NOT NULL DEFAULT true,
  -- An unverified step has no number, and a counted step has one. Without
  -- this a step could be seeded as counted with a target of zero, which reads
  -- as complete the moment it is created.
  CHECK ((metric = 'unverified') = (target_amount = 0))
);

INSERT INTO public.early_event_catalog (
  code, ordinal, label, detail, claim_label,
  reward_amount, reward_experience, reward_item_code, reward_item_quantity, pending_effect
) VALUES
  ('bulk_order', 1, '갑작스러운 단체 주문',
   '오늘 큰 주문이 한 번에 들어왔어요. 손을 보탠 몫으로 작업 경험치를 받습니다. 경험치는 지금 가장 많이 쌓은 직업으로 들어가요.',
   '거들기', 0, 20, NULL, 0, '제한시간 안에 납품하는 주문'),
  ('tool_breakdown', 2, '도구 고장',
   '쓰던 도구가 고장 났어요. 직접 고치면 수리 키트가 하나 남고, 고치는 동안 작업 경험치도 조금 쌓여요.',
   '직접 고치기', 0, 6, 'repair_kit', 1, '도구 내구도'),
  ('rainy_day', 3, '비 오는 날',
   '비가 와서 배달이 밀렸어요. 오늘 몫으로 배달 수당을 받습니다.',
   '수당 받기', 30, 0, NULL, 0, '배달 보상 상승과 농업 작업 교체'),
  ('market_sale', 4, '시장 할인일',
   '시장이 할인하는 날이에요. 아낀 만큼을 장보기 몫으로 받습니다.',
   '장보기 몫 받기', 30, 0, NULL, 0, '초보 필수품 10% 할인'),
  ('lost_and_found', 5, '분실물 발견',
   '길에서 잃어버린 물건을 주웠어요. 주인에게 돌려주고 사례를 받습니다.',
   '돌려주기', 40, 0, NULL, 0, '평판과 칭호 진행도'),
  ('urgent_restock', 6, '긴급 재고 요청',
   '가게 재고가 급하게 필요해요. 채워 준 몫으로 WLD와 작업 경험치를 함께 받습니다.',
   '재고 채우기', 25, 10, NULL, 0, '여러 사람이 함께 채우는 공동 납품'),
  ('lucky_box', 7, '초보 행운 상자',
   '초보자에게 주는 상자예요. 안에는 현금 대신 소모품이 들어 있습니다.',
   '상자 열기', 0, 0, 'energy_drink', 2, '장식과 재료')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.early_first_day_steps (
  code, ordinal, label, detail, href, metric, target_amount, unit_label
) VALUES
  ('profile_setup', 1, '프로필과 대표 색상 정하기',
   '프로필 화면에서 보여 줄 이름과 공개 범위를 한 번 저장하면 이 단계가 끝나요.',
   '/profile', 'profile_saved', 1, ''),
  ('economy_tutorial', 2, '5분 경제 튜토리얼 보기',
   '지갑·원장·상점이 어떻게 이어지는지 이용 방법 화면에서 5분이면 볼 수 있어요. 읽었는지는 기록하지 않으니 직접 확인해 주세요.',
   '/guide', 'unverified', 0, ''),
  ('job_sampler', 3, '직업 체험 작업 해 보기',
   '보상을 받은 작업의 직업 종류를 셉니다. 아직 상인 작업이 없어서 지금 해 볼 수 있는 직업까지만 셉니다.',
   '/work', 'job_sampler', 5, '종'),
  ('first_job', 4, '첫 직업 정하기',
   '작업을 마치면 그 직업의 경험치가 쌓이고, 가장 많이 쌓인 직업이 내 직업이 돼요. 따로 고르는 화면은 없습니다.',
   '/work', 'job_chosen', 1, ''),
  ('first_tool', 5, '기본 장비 사기',
   '상점에서 초보 장비를 하나 사면 이 단계가 끝나요.',
   '/shop', 'shop_purchase', 1, '개'),
  ('first_earnings', 6, '작업으로 300 WLD 벌기',
   '작업 보상으로 받은 금액만 셉니다. 출석 보상과 대출은 세지 않아요.',
   '/work', 'work_earnings', 300, 'WLD'),
  ('growth_board', 7, '7일 성장판에서 다음 해금 확인하기',
   '성장 단계 화면에서 다음에 열리는 것과 조건을 볼 수 있어요. 확인했는지는 기록하지 않습니다.',
   '/progression', 'unverified', 0, '')
ON CONFLICT (code) DO NOTHING;

-- One member action, once a day, carrying no amount into Discord -- 061's own
-- test for whether an event type is announced. Without a row here the event
-- is parked as `suppressed` on the first tick, which is a decision made by
-- omission; this one is made in writing.
INSERT INTO public.discord_outbox_routes (event_type, channel_key, enabled, note) VALUES
  ('game.early_event.claimed', 'default', true, 'one member action, once a day')
ON CONFLICT (event_type) DO NOTHING;

-- Which event this member is dealt on this day.
--
-- Pure: the same member and the same date give the same row for as long as
-- the catalogue holds still, which is what makes refreshing pointless and a
-- scheduler unnecessary. The seed string carries the event's own code so that
-- every row hashes differently, exactly as 095 hashes the task id.
--
-- Not granted to moneyverse_app. The two callers below are SECURITY DEFINER
-- and call it as the owner; handing the application a function that takes a
-- date would let it ask what a member draws tomorrow, which is a question the
-- product has no reason to answer.
CREATE OR REPLACE FUNCTION public.early_event_draw(p_actor uuid, p_day date)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT event_row.code
  FROM public.early_event_catalog AS event_row
  WHERE event_row.active
  ORDER BY pg_catalog.hashtextextended(
    'moneyverse:early-event:' || p_actor::text || ':' || p_day::text || ':' || event_row.code, 0
  ), event_row.code
  LIMIT 1
$$;

-- Today's event for this member, and whether it is still theirs to take.
--
-- Returns no row at all when the catalogue has nothing active, which is how
-- this feature is switched off: deactivate the rows. It is not a
-- `feature_switches` entry because that table fails closed on an unregistered
-- feature, and adding one would turn the events off for everybody until a row
-- was seeded -- correct for a risky feature, noise for seven rows of copy.
CREATE OR REPLACE FUNCTION public.early_event_today(p_actor uuid)
RETURNS TABLE(
  event_date date,
  event_code text,
  event_label text,
  event_detail text,
  claim_label text,
  -- What claiming right now would actually pay this member, not what the
  -- catalogue declares: 095's rule for `reward_preview`, and the difference
  -- shows for a member with no work behind them.
  reward_amount bigint,
  reward_experience bigint,
  -- True when the catalogue pays experience and this member has no job to
  -- put it in. The screen has a sentence to print; a silent zero would read
  -- as a broken reward.
  experience_blocked boolean,
  reward_item_name text,
  reward_item_quantity integer,
  pending_effect text,
  claimed boolean,
  claimed_at timestamptz,
  claim_transaction_id uuid,
  -- NULL, 'claimed' or 'needs_work'. The screen turns it into a sentence;
  -- this side of the wire keeps the reason rather than a bare boolean,
  -- because "already taken" and "work first" are two different days.
  claim_block text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_code text;
  v_has_job boolean;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  -- The receipt wins over the draw. A member who has claimed today must go on
  -- seeing the event they were paid for, even if the catalogue moved under
  -- them afterwards -- otherwise the card would name one event and the wallet
  -- would show another.
  SELECT claim_row.event_code INTO v_code
  FROM public.early_event_claims AS claim_row
  WHERE claim_row.user_id = p_actor AND claim_row.event_date = v_day;

  IF v_code IS NULL THEN
    v_code := public.early_event_draw(p_actor, v_day);
  END IF;

  IF v_code IS NULL THEN
    RETURN;
  END IF;

  v_has_job := EXISTS (
    SELECT 1 FROM public.user_job_progress AS progress_row
    WHERE progress_row.user_id = p_actor
  );

  -- Every column reference below is qualified. Six of the OUT parameters
  -- share a name with a column of a table read here, and plpgsql defaults to
  -- variable_conflict = error -- 067, 080, 095 and 101 all raised 42702 on
  -- their first version for exactly this.
  RETURN QUERY
  SELECT
    v_day,
    event_row.code,
    event_row.label,
    event_row.detail,
    event_row.claim_label,
    event_row.reward_amount,
    CASE WHEN v_has_job THEN event_row.reward_experience ELSE 0::bigint END,
    event_row.reward_experience > 0 AND NOT v_has_job,
    item_row.name,
    event_row.reward_item_quantity::integer,
    event_row.pending_effect,
    claim_row.user_id IS NOT NULL,
    claim_row.created_at,
    claim_row.transaction_id,
    CASE
      WHEN claim_row.user_id IS NOT NULL THEN 'claimed'
      -- Refused rather than paid as nothing: an event whose only reward is
      -- experience pays a member with no job absolutely nothing, and spending
      -- the day's one draw on nothing is the outcome this reports instead.
      WHEN event_row.reward_amount = 0
        AND event_row.reward_item_code IS NULL
        AND NOT v_has_job THEN 'needs_work'
      ELSE NULL
    END
  FROM public.early_event_catalog AS event_row
  LEFT JOIN public.shop_catalog AS item_row ON item_row.code = event_row.reward_item_code
  LEFT JOIN public.early_event_claims AS claim_row
    ON claim_row.user_id = p_actor AND claim_row.event_date = v_day
  WHERE event_row.code = v_code;
END;
$$;

-- Taking today's event.
--
-- 045's order, with no step moved: validate, lock the KEY, look the receipt up
-- by key, check its owner, then do the work. Locking the actor instead of the
-- key lets two requests carrying the same key both miss the replay branch.
--
-- There is no event argument. The function draws for itself, which is what
-- makes the draw's stability an anti-abuse property rather than a display
-- detail: a member can refresh, read the page source, or post the request by
-- hand, and still be paid the one event their hash names today.
CREATE OR REPLACE FUNCTION public.early_event_claim(
  p_key uuid,
  p_actor uuid,
  p_event_date date
)
RETURNS TABLE(
  event_code text,
  event_label text,
  reward_amount bigint,
  experience_amount bigint,
  item_name text,
  item_quantity integer,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_today date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_owner uuid;
  v_code text;
  v_label text;
  v_cash bigint;
  v_xp bigint;
  v_item_code text;
  v_item_quantity smallint;
  v_item_name text;
  v_item_catalog uuid;
  v_job public.work_job_type;
  v_cash_account uuid;
  v_mint_account uuid;
  v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_event_date IS NULL OR p_event_date <> v_today THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'the daily event is only claimable on its own Asia/Seoul date';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:early-event-claim:' || p_key::text, 0)
  );

  SELECT claim_row.user_id, claim_row.event_code, claim_row.reward_amount,
         claim_row.experience_amount, claim_row.item_code, claim_row.item_quantity,
         claim_row.transaction_id
  INTO v_owner, v_code, v_cash, v_xp, v_item_code, v_item_quantity, v_transaction
  FROM public.early_event_claims AS claim_row
  WHERE claim_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000',
        MESSAGE = 'this event receipt belongs to another user';
    END IF;

    SELECT event_row.label INTO v_label
    FROM public.early_event_catalog AS event_row
    WHERE event_row.code = v_code;

    SELECT item_row.name INTO v_item_name
    FROM public.shop_catalog AS item_row
    WHERE item_row.code = v_item_code;

    RETURN QUERY SELECT v_code, v_label, v_cash, v_xp, v_item_name,
                        v_item_quantity::integer, v_transaction, true;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  -- The primary key would refuse this anyway. Checking first is what turns a
  -- constraint name into a sentence, and 23505 is what this schema answers a
  -- second claim with everywhere else.
  IF EXISTS (
    SELECT 1 FROM public.early_event_claims AS claim_row
    WHERE claim_row.user_id = p_actor AND claim_row.event_date = p_event_date
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'today''s event has already been claimed';
  END IF;

  v_code := public.early_event_draw(p_actor, p_event_date);

  IF v_code IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'early game events are disabled';
  END IF;

  SELECT event_row.label, event_row.reward_amount, event_row.reward_experience,
         event_row.reward_item_code, event_row.reward_item_quantity
  INTO v_label, v_cash, v_xp, v_item_code, v_item_quantity
  FROM public.early_event_catalog AS event_row
  WHERE event_row.code = v_code
  FOR KEY SHARE;

  -- 080's rule, and 101's: the member's job is the one they have the most
  -- levels in, tie broken by the enum's own name. There is no job-selection
  -- function in this schema to ask instead.
  SELECT progress_row.job_type INTO v_job
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor
  ORDER BY progress_row.level DESC, progress_row.job_type
  LIMIT 1;

  IF v_job IS NULL THEN
    v_xp := 0;
  END IF;

  IF v_cash = 0 AND v_xp = 0 AND v_item_code IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'this event pays experience, and this member has not been paid for work yet';
  END IF;

  IF v_cash > 0 THEN
    -- No FOR UPDATE here. `economy_post_transaction` locks the accounts it
    -- touches in id order itself, and taking them in a different order first
    -- is how two payout functions deadlock; 005's daily claim reads them the
    -- same way, for the same reason.
    SELECT account_row.id INTO v_cash_account
    FROM public.accounts AS account_row
    WHERE account_row.owner_user_id = p_actor
      AND account_row.account_type = 'USER_CASH'::public.account_type
      AND account_row.status = 'active'::public.account_status;

    SELECT account_row.id INTO v_mint_account
    FROM public.accounts AS account_row
    WHERE account_row.system_key = 'mint'
      AND account_row.account_type = 'MINT'::public.account_type
      AND account_row.status = 'active'::public.account_status;

    IF v_cash_account IS NULL OR v_mint_account IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash wallet required';
    END IF;

    SELECT public.economy_post_transaction(
      p_key,
      'EARLY_EVENT_REWARD',
      p_actor,
      NULL,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'accountId', v_mint_account, 'amount', v_cash, 'direction', 'credit'),
        pg_catalog.jsonb_build_object(
          'accountId', v_cash_account, 'amount', v_cash, 'direction', 'debit')
      ),
      'game.early_event.claimed',
      pg_catalog.jsonb_build_object(
        'userId', p_actor, 'eventCode', v_code, 'eventDate', p_event_date,
        'amount', v_cash, 'experience', v_xp)
    ) INTO v_transaction;
  END IF;

  IF v_xp > 0 THEN
    -- 068's level formula, repeated deliberately. It is the only place a
    -- level is computed from experience, and a second formula here would be a
    -- second ladder -- visible only as two screens disagreeing about a level.
    UPDATE public.user_job_progress AS progress_row
    SET experience = progress_row.experience + v_xp,
        level = least(50, 1 + ((progress_row.experience + v_xp) / 100)::integer),
        changed_at = pg_catalog.clock_timestamp()
    WHERE progress_row.user_id = p_actor AND progress_row.job_type = v_job;
  END IF;

  IF v_item_code IS NOT NULL THEN
    SELECT item_row.id, item_row.name INTO v_item_catalog, v_item_name
    FROM public.shop_catalog AS item_row
    WHERE item_row.code = v_item_code AND item_row.active;

    IF v_item_catalog IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = '22023',
        MESSAGE = 'this event gives an item the shop no longer sells';
    END IF;

    -- Into `user_items` and never into `shop_purchases`. 101 fills the 초보
    -- 도구 도감 from purchases and awards a title when the last page lands, so
    -- recording a gift as a purchase would hand out a collection nobody
    -- bought. `shop_inventory` is untouched for the same reason: nothing was
    -- sold.
    INSERT INTO public.user_items AS holding_row (user_id, catalog_id, quantity)
    VALUES (p_actor, v_item_catalog, v_item_quantity)
    ON CONFLICT (user_id, catalog_id) DO UPDATE
    SET quantity = holding_row.quantity + excluded.quantity,
        acquired_at = pg_catalog.clock_timestamp();
  END IF;

  INSERT INTO public.early_event_claims (
    user_id, event_date, event_code, idempotency_key, reward_amount,
    experience_amount, job_type, item_code, item_quantity, transaction_id
  ) VALUES (
    p_actor, p_event_date, v_code, p_key, v_cash,
    v_xp, v_job, v_item_code, v_item_quantity, v_transaction
  );

  RETURN QUERY SELECT v_code, v_label, v_cash, v_xp, v_item_name,
                      v_item_quantity::integer, v_transaction, false;
END;
$$;

-- 16.1's 첫날 흐름, counted from what happened.
--
-- Every count is taken once, into a variable, and the catalogue row then
-- selects which of them it is about -- 101's shape, which keeps the
-- arithmetic in one place and makes a step added later a row plus a branch
-- rather than a new function.
CREATE OR REPLACE FUNCTION public.early_first_day_flow(p_actor uuid)
RETURNS TABLE(
  step_code text,
  step_label text,
  step_detail text,
  step_href text,
  step_metric text,
  -- False for a step nothing records. The screen renders it as a link to go
  -- and look, never as a box that ticks itself.
  step_verified boolean,
  step_target bigint,
  step_progress bigint,
  step_unit text,
  step_done boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_profile bigint;
  v_sampled bigint;
  v_sampler_target bigint;
  v_job bigint;
  v_purchases bigint;
  v_earned bigint;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  -- A row here exists only because `member_profile_update` (080) wrote one;
  -- nothing creates a default profile.
  SELECT count(*) INTO v_profile
  FROM public.member_profiles AS profile_row
  WHERE profile_row.user_id = p_actor;

  SELECT count(DISTINCT task_row.job_type) INTO v_sampled
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = receipt_row.assignment_id
  JOIN public.work_task_catalog AS task_row ON task_row.id = assignment_row.task_id
  WHERE receipt_row.user_id = p_actor;

  -- The catalogue's own count, so the step asks for what can be done today
  -- and grows to 16.1's five the day a 상인 task is seeded.
  SELECT count(DISTINCT task_row.job_type) INTO v_sampler_target
  FROM public.work_task_catalog AS task_row
  WHERE task_row.active;

  SELECT count(*) INTO v_job
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor;

  SELECT count(*) INTO v_purchases
  FROM public.shop_purchases AS purchase_row
  WHERE purchase_row.user_id = p_actor;

  -- Work receipts only. 16.1 says 직접 벌고, and an attendance reward, a loan
  -- and an administrator's grant are none of them earned.
  SELECT coalesce(sum(receipt_row.reward_amount), 0) INTO v_earned
  FROM public.work_reward_receipts AS receipt_row
  WHERE receipt_row.user_id = p_actor;

  RETURN QUERY
  SELECT
    step_row.code,
    step_row.label,
    step_row.detail,
    step_row.href,
    step_row.metric,
    step_row.metric <> 'unverified',
    measured.target,
    measured.amount,
    step_row.unit_label,
    step_row.metric <> 'unverified' AND measured.amount >= measured.target
  FROM public.early_first_day_steps AS step_row
  CROSS JOIN LATERAL (
    SELECT
      CASE step_row.metric
        WHEN 'job_sampler' THEN least(step_row.target_amount, v_sampler_target)
        ELSE step_row.target_amount
      END AS target,
      CASE step_row.metric
        -- Clamped, because these steps are done once and the screen shows a
        -- fraction: a member with three purchases has not finished 1 / 1
        -- three times over.
        WHEN 'profile_saved' THEN least(v_profile, 1)
        WHEN 'job_chosen' THEN least(v_job, 1)
        WHEN 'job_sampler' THEN v_sampled
        WHEN 'shop_purchase' THEN least(v_purchases, 1)
        WHEN 'work_earnings' THEN v_earned
        -- A metric with no branch reports nothing rather than guessing. The
        -- CHECK on the column is what keeps this unreachable.
        ELSE 0::bigint
      END AS amount
  ) AS measured
  WHERE step_row.active
  ORDER BY step_row.ordinal;
END;
$$;

-- A reward nobody could receive is the failure this migration is most able to
-- ship: `reward_item_code` carries a foreign key onto the shop's code, and a
-- foreign key says the item exists, not that it is still sold. So the check
-- runs here, at deploy, where CI is the one that reads it.
DO $do$
DECLARE
  v_unpayable text;
BEGIN
  SELECT string_agg(event_row.code, ', ') INTO v_unpayable
  FROM public.early_event_catalog AS event_row
  WHERE event_row.reward_item_code IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.shop_catalog AS item_row
      WHERE item_row.code = event_row.reward_item_code AND item_row.active
    );

  IF v_unpayable IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'a seeded event gives an item the shop does not sell: ' || v_unpayable;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.early_event_catalog AS event_row WHERE event_row.active) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'the early event catalogue has no active row, so no member could be dealt one';
  END IF;
END;
$do$;

ALTER FUNCTION public.early_event_draw(uuid, date) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.early_event_today(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.early_event_claim(uuid, uuid, date) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.early_first_day_flow(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION
  public.early_event_draw(uuid, date),
  public.early_event_today(uuid),
  public.early_event_claim(uuid, uuid, date),
  public.early_first_day_flow(uuid)
  FROM PUBLIC, moneyverse_app;

-- Three of the four. The draw stays unreachable from the application: its two
-- callers are SECURITY DEFINER and run as the owner, and a granted draw would
-- be a way to ask what somebody draws on a day that is not today.
GRANT EXECUTE ON FUNCTION
  public.early_event_today(uuid),
  public.early_event_claim(uuid, uuid, date),
  public.early_first_day_flow(uuid)
  TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.early_event_catalog, public.early_event_claims,
  public.early_first_day_steps FROM PUBLIC, moneyverse_app;

-- Restated, so this migration cannot be read later as having relaxed the
-- boundary it works around. Every table the three granted functions read is
-- still unreadable as a table; the only new access is EXECUTE.
--
-- `accounts`, `account_balances` and `ledger_transactions` are deliberately
-- absent from this list even though the claim reads all three. They carry a
-- SELECT that 005 granted on purpose and the wallet depends on, and a revoke
-- restated out of symmetry here would take that away and break every balance
-- on the site.
REVOKE ALL PRIVILEGES ON TABLE public.work_task_catalog, public.work_assignments,
  public.work_reward_receipts, public.user_job_progress, public.shop_catalog,
  public.shop_purchases, public.user_items, public.member_profiles
  FROM PUBLIC, moneyverse_app;

COMMIT;
