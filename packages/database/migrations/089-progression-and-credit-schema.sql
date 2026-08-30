BEGIN;

CREATE TABLE public.progression_stages (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  ordinal smallint NOT NULL UNIQUE CHECK (ordinal BETWEEN 1 AND 20),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  unlock_requirements jsonb NOT NULL CHECK (jsonb_typeof(unlock_requirements) = 'object'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE public.user_progression (
  user_id uuid PRIMARY KEY REFERENCES public.users(id),
  stage_code text NOT NULL REFERENCES public.progression_stages(code),
  reached_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE public.bank_credit_policies (
  grade text PRIMARY KEY CHECK (grade IN ('new', 'C', 'B', 'A')),
  minimum_account_days integer NOT NULL CHECK (minimum_account_days >= 0),
  minimum_work_completions integer NOT NULL CHECK (minimum_work_completions >= 0),
  credit_limit bigint NOT NULL CHECK (credit_limit >= 0),
  interest_bps integer NOT NULL CHECK (interest_bps BETWEEN 0 AND 10000),
  term_days integer NOT NULL CHECK (term_days BETWEEN 1 AND 365),
  minimum_repayment bigint NOT NULL CHECK (minimum_repayment >= 0),
  active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.virtual_bank_loans
  ADD COLUMN maturity_at timestamptz,
  ADD COLUMN minimum_repayment bigint NOT NULL DEFAULT 0 CHECK (minimum_repayment >= 0),
  ADD COLUMN credit_grade text NOT NULL DEFAULT 'new' CHECK (credit_grade IN ('new', 'C', 'B', 'A')),
  ADD COLUMN overdue_at timestamptz,
  ADD COLUMN status_reason text;
ALTER TABLE public.virtual_bank_loans DROP CONSTRAINT IF EXISTS virtual_bank_loans_status_check;
ALTER TABLE public.virtual_bank_loans ADD CONSTRAINT virtual_bank_loans_status_check
  CHECK (status IN ('active', 'repaid', 'overdue'));

INSERT INTO public.progression_stages(code, ordinal, name, unlock_requirements) VALUES
  ('starter', 1, 'Starter', '{"workCompletions":0}'),
  ('early', 2, 'Early growth', '{"workCompletions":10,"jobLevel":3}'),
  ('middle', 3, 'Middle growth', '{"workCompletions":50,"jobLevel":10,"businesses":1}'),
  ('advanced', 4, 'Advanced growth', '{"workCompletions":150,"jobLevel":30,"businesses":2}')
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.bank_credit_policies(grade, minimum_account_days, minimum_work_completions, credit_limit, interest_bps, term_days, minimum_repayment) VALUES
  ('new',0,0,0,0,1,0), ('C',7,10,2000,800,30,100),
  ('B',30,50,10000,600,45,300), ('A',90,150,50000,400,60,1000)
ON CONFLICT (grade) DO NOTHING;

REVOKE ALL PRIVILEGES ON TABLE public.progression_stages, public.user_progression,
  public.bank_credit_policies, public.virtual_bank_loans FROM PUBLIC, moneyverse_app;

COMMIT;
