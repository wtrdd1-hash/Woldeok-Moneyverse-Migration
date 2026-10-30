#!/usr/bin/env bash
set -euo pipefail
repo="$(cd "$(dirname "$0")/../.." && pwd -P)"
name="mv-b-v658-nps-pg-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
# No published ports, network, or production credentials; the container is ephemeral.
docker run -d --name "$name" --network none -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17.11-alpine >/dev/null
for i in $(seq 1 40); do
  if docker exec "$name" pg_isready -U postgres >/dev/null 2>&1; then
    sleep 2
    if docker exec "$name" psql -v ON_ERROR_STOP=1 -U postgres -Atc 'SELECT 1' >/dev/null 2>&1; then break; fi
  fi
  sleep 1
done
docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres <<'SQL'
CREATE ROLE moneyverse_migrator NOLOGIN;
CREATE ROLE moneyverse_app NOLOGIN NOINHERIT;
CREATE TABLE public.national_pension_accounts (
  id uuid PRIMARY KEY, user_id uuid NOT NULL UNIQUE,
  tier varchar(32) NOT NULL DEFAULT 'TIER_1_YOUTH',
  status varchar(32) NOT NULL DEFAULT 'ACCUMULATING',
  accumulated_contribution_wld numeric NOT NULL DEFAULT 0,
  total_contributions_count integer NOT NULL DEFAULT 0,
  hourly_payout_rate_bps integer NOT NULL DEFAULT 8,
  total_payout_received_wld numeric NOT NULL DEFAULT 0,
  last_payout_at timestamptz, retired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.national_pension_contributions (
  id uuid PRIMARY KEY, account_id uuid NOT NULL REFERENCES public.national_pension_accounts(id),
  user_id uuid NOT NULL, amount_wld numeric NOT NULL, note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.national_pension_payout_logs (
  id uuid PRIMARY KEY, account_id uuid NOT NULL REFERENCES public.national_pension_accounts(id),
  user_id uuid NOT NULL, payout_amount_wld numeric NOT NULL,
  snapshot_accumulated_wld numeric NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.national_pension_accounts OWNER TO moneyverse_migrator;
ALTER TABLE public.national_pension_contributions OWNER TO moneyverse_migrator;
ALTER TABLE public.national_pension_payout_logs OWNER TO moneyverse_migrator;
INSERT INTO public.national_pension_accounts (id,user_id) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222');
INSERT INTO public.national_pension_contributions (id,account_id,user_id,amount_wld) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',9007199254740993),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222',77);
INSERT INTO public.national_pension_payout_logs (id,account_id,user_id,payout_amount_wld,snapshot_accumulated_wld) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',9007199254740993,9007199254740993),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222',9,77);
-- Reproduce a broad prototype grant before applying the forward-only ACL fix.
GRANT SELECT, UPDATE, DELETE ON public.national_pension_contributions, public.national_pension_payout_logs TO moneyverse_app;
SQL
docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres < "$repo/packages/database/migrations/309-pension-owner-receipts-scoped-read.sql" >/dev/null
docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres <<'SQL'
SET ROLE moneyverse_app;
DO $test$
DECLARE
  owner uuid := '11111111-1111-4111-8111-111111111111';
  other uuid := '22222222-2222-4222-8222-222222222222';
  n integer;
  amount text;
BEGIN
  IF has_table_privilege(current_user, 'public.national_pension_contributions', 'SELECT') OR
     has_table_privilege(current_user, 'public.national_pension_contributions', 'UPDATE') OR
     has_table_privilege(current_user, 'public.national_pension_payout_logs', 'DELETE') THEN
    RAISE EXCEPTION 'direct pension table access was not revoked';
  END IF;
  IF NOT has_function_privilege(current_user, 'public.pension_owner_contributions(uuid,integer)', 'EXECUTE') OR
     NOT has_function_privilege(current_user, 'public.pension_owner_payout_logs(uuid,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'scoped pension function not executable';
  END IF;
  SELECT count(*), max(amount_wld::text) INTO n, amount
    FROM public.pension_owner_contributions(owner, 20);
  IF n <> 1 OR amount <> '9007199254740993' THEN
    RAISE EXCEPTION 'owner contribution amount/count mismatch';
  END IF;
  SELECT count(*) INTO n FROM public.pension_owner_contributions(other, 20);
  IF n <> 1 THEN RAISE EXCEPTION 'other owner receipt unavailable'; END IF;
  SELECT count(*) INTO n FROM public.pension_owner_payout_logs(owner, 20);
  IF n <> 1 THEN RAISE EXCEPTION 'owner payout unavailable'; END IF;
  BEGIN
    PERFORM * FROM public.pension_owner_contributions(owner, 51);
    RAISE EXCEPTION 'limit 51 unexpectedly accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.pension_owner_payout_logs(NULL, 20);
    RAISE EXCEPTION 'null owner unexpectedly accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  BEGIN
    EXECUTE 'SELECT count(*) FROM public.national_pension_contributions';
    RAISE EXCEPTION 'direct SELECT unexpectedly allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$test$;
RESET ROLE;
DO $test$
BEGIN
  IF (SELECT count(*) FROM public.national_pension_contributions) <> 2 OR
     (SELECT count(*) FROM public.national_pension_payout_logs) <> 2 THEN
    RAISE EXCEPTION 'historical receipts mutated';
  END IF;
  IF has_function_privilege('public', 'public.pension_owner_contributions(uuid,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'PUBLIC execute unexpectedly allowed';
  END IF;
END;
$test$;
SQL
printf 'PASS: isolated PostgreSQL 17.11 owner receipts, ACL, precision, invalid inputs, unchanged rows\n'
