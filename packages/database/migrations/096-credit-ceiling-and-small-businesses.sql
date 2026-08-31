-- The credit table doing what it says, and the three businesses a beginner
-- can actually afford.
--
-- 077 wrote down what it was deferring and why: "What is NOT applied yet:
-- `bank_credit_policies.credit_limit` and `interest_bps`. [...] Tightening
-- the ceiling is a product decision and belongs in a change that says so out
-- loud." This is that change, and the product decision is section 14.4 of the
-- specification, which gives the table in full:
--
--   신규  가입 7일 미만 또는 작업 10회 미만  대출 불가
--   C     가입 7일·출석 5회·작업 10회        2,000 WLD   8%
--   B     누적 정상 수입 10,000·연체 없음    10,000 WLD  6%
--   A     사업 보유·상환 정상                50,000 WLD  5%
--
-- WHAT CHANGES FOR A MEMBER. Today `bank_borrow` reads the grade, records it
-- on the loan, and then ignores both of the numbers that make a grade mean
-- anything: it lends up to 500,000 WLD to anybody and charges everybody a
-- flat 5%. After this a member under seven days old, or with fewer than ten
-- paid tasks, cannot borrow at all -- which is the point of 14.4, and is why
-- it ships alongside the work screen that lets them reach ten. Existing loans
-- are untouched: `interest_amount` was fixed when the loan was written, and
-- section 15.4 requires exactly that -- "대출 원금과 기존 계약 이율은
-- 변경하지 않고 신규 계약 정책에만 적용".
--
-- THE A GRADE'S RATE IS CORRECTED, NOT CHOSEN. 076 seeded it at 400 bps; the
-- specification says 5%. Left at 400 it would have been the one grade that
-- got cheaper than the flat rate it replaces, which is not a policy anybody
-- decided.
--
-- WHAT IS NOT DONE HERE. 14.4 also asks that borrowed money be barred from
-- stock purchases and transfers. Cash is fungible and the ledger does not
-- colour it, so that needs a rule about the whole balance rather than about
-- the loan -- a separate decision, and one this migration would be the wrong
-- place to invent. The casino half of that clause IS done, because it is
-- expressible without colouring money: a member holding an unpaid loan does
-- not gamble.

BEGIN;

-- 14.4's rate for the A grade. 076 seeded 400.
UPDATE public.bank_credit_policies SET interest_bps = 500 WHERE grade = 'A' AND interest_bps = 400;

-- What this member may borrow, and at what rate, as a screen may say it.
--
-- The whole table rather than the caller's own row: the point of a grade
-- ladder is that a member can see the rung above the one they are on, and
-- what reaching it is worth. `held` marks theirs. Until now `/progression`
-- said "등급별 한도와 이자율은 아직 화면에 표시하지 않아요" and then quoted a
-- flat 5% -- true only by accident of the hardcode this migration removes.
CREATE OR REPLACE FUNCTION public.bank_credit_ladder(p_actor uuid)
RETURNS TABLE(
  grade text,
  minimum_account_days integer,
  minimum_work_completions integer,
  credit_limit bigint,
  interest_bps integer,
  term_days integer,
  minimum_repayment bigint,
  held boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT policy_row.grade, policy_row.minimum_account_days, policy_row.minimum_work_completions,
         policy_row.credit_limit, policy_row.interest_bps, policy_row.term_days,
         policy_row.minimum_repayment,
         policy_row.grade IS NOT DISTINCT FROM public.bank_credit_grade(p_actor)
  FROM public.bank_credit_policies AS policy_row
  WHERE policy_row.active
  ORDER BY policy_row.credit_limit, policy_row.grade
$$;

-- 083's body, with the grade's ceiling and the grade's rate applied.
--
-- Everything else is unchanged, including the shape of the replay branch and
-- the order the accounts are locked in. The two new refusals are 22023, which
-- the API already answers as a conflict, because they are the rules refusing
-- a request rather than a fault.
CREATE OR REPLACE FUNCTION public.bank_borrow(
  p_key uuid,
  p_actor uuid,
  p_principal bigint
)
RETURNS TABLE(
  loan_id uuid,
  principal_amount bigint,
  interest_amount bigint,
  outstanding_amount bigint,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_cash uuid;
  v_mint uuid;
  v_loan uuid;
  v_interest bigint;
  v_transaction uuid;
  v_existing_user_id uuid;
  v_grade text;
  v_term integer;
  v_minimum bigint;
  v_limit bigint;
  v_rate integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_principal < 100 OR p_principal > 500000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid loan amount';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:bank-borrow:' || p_key::text, 0)
  );

  SELECT loan_row.id, loan_row.user_id, loan_row.principal_amount,
         loan_row.interest_amount, loan_row.outstanding_amount
  INTO v_loan, v_existing_user_id, principal_amount, interest_amount, outstanding_amount
  FROM public.virtual_bank_loans AS loan_row
  WHERE loan_row.borrow_idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'loan receipt belongs to another user';
    END IF;
    SELECT transaction_row.id INTO transaction_id
    FROM public.ledger_transactions AS transaction_row
    WHERE transaction_row.idempotency_key = p_key;
    loan_id := v_loan;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  PERFORM loan_row.id FROM public.virtual_bank_loans AS loan_row
  WHERE loan_row.user_id = p_actor AND loan_row.status IN ('active', 'overdue')
  FOR UPDATE;
  IF FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'an outstanding loan already exists';
  END IF;

  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_mint FROM public.accounts AS account_row
  WHERE account_row.system_key = 'mint'
    AND account_row.account_type = 'MINT'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active loan accounts required';
  END IF;

  v_grade := coalesce(public.bank_credit_grade(p_actor), 'new');
  SELECT policy_row.term_days, policy_row.minimum_repayment,
         policy_row.credit_limit, policy_row.interest_bps
  INTO v_term, v_minimum, v_limit, v_rate
  FROM public.bank_credit_policies AS policy_row
  WHERE policy_row.grade = v_grade;

  -- The ceiling. A grade with no policy row at all is treated as lending
  -- nothing rather than as lending without limit: a missing row is a
  -- deployment that has not finished, and the safe reading of it is no.
  IF coalesce(v_limit, 0) <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'this credit grade may not borrow yet';
  END IF;

  IF p_principal > v_limit THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'the amount is above this credit grade''s limit';
  END IF;

  -- The grade's rate. 500 bps is the fallback, which is the flat rate every
  -- loan carried before this migration -- so a policy row missing a rate
  -- cannot make borrowing free.
  v_interest := ceil(p_principal * coalesce(v_rate, 500)::numeric / 10000)::bigint;

  SELECT public.economy_post_transaction(
    p_key, 'BANK_LOAN_ISSUED', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', p_principal, 'direction', 'debit'),
      pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', p_principal, 'direction', 'credit')
    ),
    'bank.loan.issued',
    pg_catalog.jsonb_build_object(
      'principal', p_principal, 'interest', v_interest,
      'grade', v_grade, 'interestBps', coalesce(v_rate, 500)
    )
  ) INTO v_transaction;

  INSERT INTO public.virtual_bank_loans (
    borrow_idempotency_key, user_id, principal_amount, interest_amount,
    outstanding_amount, status, credit_grade, maturity_at, minimum_repayment,
    transaction_id
  ) VALUES (
    p_key, p_actor, p_principal, v_interest, p_principal + v_interest, 'active',
    v_grade,
    pg_catalog.clock_timestamp() + pg_catalog.make_interval(days => coalesce(v_term, 30)),
    coalesce(v_minimum, 0),
    v_transaction
  )
  RETURNING virtual_bank_loans.id INTO v_loan;

  loan_id := v_loan;
  principal_amount := p_principal;
  interest_amount := v_interest;
  outstanding_amount := p_principal + v_interest;
  transaction_id := v_transaction;
  replayed := false;
  RETURN NEXT;
END;
$$;

-- 14.4: 대출 잔액이 있으면 카지노 이용 제한.
--
-- A trigger on the play, not a check inside `casino_play_coin`, for the
-- reason 080 gives about the self-limit: the play function is long and every
-- path through it would have to be covered, and a trigger covers a path added
-- later as well.
--
-- 55000 rather than 42501: the casino is switched off for this member, which
-- is what that code says everywhere else in this schema, and it is what the
-- API already turns into a sentence about the rules rather than about
-- permissions.
CREATE OR REPLACE FUNCTION public.casino_refuse_while_in_debt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.virtual_bank_loans AS loan_row
    WHERE loan_row.user_id = NEW.user_id
      AND loan_row.status IN ('active', 'overdue')
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '55000',
      MESSAGE = 'repay your loan before playing';
  END IF;
  RETURN NEW;
END;
$$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.virtual_casino_coin_plays'::pg_catalog.regclass
      AND trigger_row.tgname = 'virtual_casino_coin_plays_debt_block'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER virtual_casino_coin_plays_debt_block
      BEFORE INSERT ON public.virtual_casino_coin_plays
      FOR EACH ROW
      EXECUTE FUNCTION public.casino_refuse_while_in_debt();
  END IF;
END;
$do$;

-- 14.8: the three businesses a member can reach in their first fortnight.
--
-- 036 seeded 카페 25,000, 농장 60,000 and 스튜디오 125,000, which are the
-- middle and late businesses of section 16.2 and 16.3. Nothing sold for less,
-- so the specification's own headline metric -- 첫 소규모 사업 도달 7~14일
-- (15.1) -- was unreachable: at the 400 WLD daily reward cap, 25,000 WLD is
-- sixty-three days of perfect attendance. The shop has sold 초보 사업 허가증
-- since 073 with the description "중고 판매대 구매 조건", for a business that
-- did not exist.
--
-- The figures are 14.8's exactly: purchase, daily revenue, operating cost,
-- and therefore the 120 / 200 / 300 net the table states.
INSERT INTO public.virtual_business_types (
  symbol, name, description, purchase_cost, daily_revenue, daily_operating_cost
) VALUES
  ('STALL', '중고 판매대', '커뮤니티 장터에 중고 물건을 내놓는 게임 내 판매대입니다.', 3000, 170, 50),
  ('CART', '길거리 노점', '거리에서 간단한 물건을 파는 게임 내 노점입니다.', 5000, 280, 80),
  ('DEPOT', '소형 배달소', '동네 배달을 받아 처리하는 게임 내 배달소입니다.', 8000, 430, 130)
ON CONFLICT (symbol) DO NOTHING;

ALTER FUNCTION public.bank_credit_ladder(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_borrow(uuid, uuid, bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.casino_refuse_while_in_debt() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.bank_credit_ladder(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_credit_ladder(uuid) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.bank_borrow(uuid, uuid, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bank_borrow(uuid, uuid, bigint) TO moneyverse_app;

-- The trigger function is called by the trigger, never by the application.
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_refuse_while_in_debt() FROM PUBLIC, moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.bank_credit_policies, public.virtual_bank_loans,
  public.virtual_business_types FROM PUBLIC, moneyverse_app;

COMMIT;
