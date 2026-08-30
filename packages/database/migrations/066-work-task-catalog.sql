BEGIN;

CREATE TYPE public.work_assignment_status AS ENUM ('assigned', 'submitted', 'approved', 'rejected', 'expired');
CREATE TYPE public.work_job_type AS ENUM ('farmer', 'miner', 'carrier', 'technician', 'merchant');

CREATE TABLE public.work_task_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 1000),
  job_type public.work_job_type NOT NULL,
  difficulty smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  base_reward bigint NOT NULL CHECK (base_reward BETWEEN 1 AND 400),
  base_experience bigint NOT NULL CHECK (base_experience BETWEEN 1 AND 1000),
  minimum_duration_seconds integer NOT NULL CHECK (minimum_duration_seconds BETWEEN 60 AND 86400),
  daily_limit integer NOT NULL CHECK (daily_limit BETWEEN 1 AND 100),
  active boolean NOT NULL DEFAULT true,
  policy_version integer NOT NULL DEFAULT 1 CHECK (policy_version > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE public.work_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  task_id uuid NOT NULL REFERENCES public.work_task_catalog(id),
  assigned_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL,
  status public.work_assignment_status NOT NULL DEFAULT 'assigned',
  completed_at timestamptz,
  verified_at timestamptz,
  verified_by uuid REFERENCES public.users(id),
  verification_reason text,
  CHECK (expires_at > assigned_at),
  CHECK ((status IN ('approved', 'rejected')) = (verified_at IS NOT NULL)),
  CHECK ((status IN ('approved', 'rejected')) = (verified_by IS NOT NULL))
);
CREATE INDEX work_assignments_active_user_idx ON public.work_assignments(user_id, status, expires_at);

CREATE TABLE public.work_completion_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES public.work_assignments(id),
  submitted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  quality_score smallint NOT NULL CHECK (quality_score BETWEEN 0 AND 100),
  evidence_reference text,
  verifier_result public.work_assignment_status NOT NULL CHECK (verifier_result IN ('submitted', 'approved', 'rejected')),
  verifier_detail text
);

CREATE TABLE public.work_reward_windows (
  user_id uuid NOT NULL REFERENCES public.users(id),
  window_start date NOT NULL,
  window_kind text NOT NULL CHECK (window_kind IN ('day', 'week')),
  paid_amount bigint NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  PRIMARY KEY(user_id, window_start, window_kind)
);

CREATE TABLE public.work_reward_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  assignment_id uuid NOT NULL UNIQUE REFERENCES public.work_assignments(id),
  reward_amount bigint NOT NULL CHECK (reward_amount >= 0),
  experience_amount bigint NOT NULL CHECK (experience_amount > 0),
  transaction_id uuid REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE public.user_job_progress (
  user_id uuid NOT NULL REFERENCES public.users(id),
  job_type public.work_job_type NOT NULL,
  experience bigint NOT NULL DEFAULT 0 CHECK (experience >= 0),
  level integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 50),
  selected_at timestamptz,
  changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(user_id, job_type)
);

CREATE TABLE public.work_reward_policy_versions (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  effective_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  daily_cap bigint NOT NULL DEFAULT 400 CHECK (daily_cap BETWEEN 0 AND 1000000),
  weekly_cap bigint NOT NULL DEFAULT 2200 CHECK (weekly_cap BETWEEN 0 AND 10000000),
  repeat_decay_percent smallint NOT NULL DEFAULT 20 CHECK (repeat_decay_percent BETWEEN 0 AND 100),
  enabled boolean NOT NULL DEFAULT true,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 1000)
);
INSERT INTO public.work_reward_policy_versions(reason) VALUES ('Initial task reward policy');

REVOKE ALL PRIVILEGES ON TABLE public.work_task_catalog, public.work_assignments,
  public.work_completion_records, public.work_reward_windows, public.work_reward_receipts,
  public.user_job_progress, public.work_reward_policy_versions FROM PUBLIC, moneyverse_app;

COMMIT;
