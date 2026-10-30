#!/usr/bin/env bash
set -euo pipefail
repo="$(cd "$(dirname "$0")/../.." && pwd -P)"
name="mv-b-v659-nps-pg-$$"
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
# Isolated database: no published ports, network, production secrets or shared volumes.
docker run -d --name "$name" --network none -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17.11-alpine >/dev/null
for i in $(seq 1 40); do
  if docker exec "$name" pg_isready -U postgres >/dev/null 2>&1 &&
     docker exec "$name" psql -v ON_ERROR_STOP=1 -U postgres -Atc 'SELECT 1' >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres <<'SQL'
CREATE ROLE moneyverse_migrator NOLOGIN;
CREATE ROLE moneyverse_app NOLOGIN NOINHERIT;
CREATE TYPE public.user_status AS ENUM ('active', 'restricted');
CREATE TYPE public.admin_role AS ENUM ('operator', 'approver', 'superadmin');
CREATE TABLE public.users (id uuid PRIMARY KEY, status public.user_status NOT NULL);
CREATE TABLE public.user_roles (user_id uuid NOT NULL REFERENCES public.users(id), role public.admin_role NOT NULL);
CREATE TABLE public.national_pension_payout_logs (
  id uuid PRIMARY KEY, account_id uuid NOT NULL, user_id uuid NOT NULL,
  payout_amount_wld numeric NOT NULL, snapshot_accumulated_wld numeric NOT NULL,
  created_at timestamptz NOT NULL
);
ALTER TABLE public.users OWNER TO moneyverse_migrator;
ALTER TABLE public.user_roles OWNER TO moneyverse_migrator;
ALTER TABLE public.national_pension_payout_logs OWNER TO moneyverse_migrator;
INSERT INTO public.users VALUES
 ('11111111-1111-4111-8111-111111111111','active'),
 ('22222222-2222-4222-8222-222222222222','restricted'),
 ('33333333-3333-4333-8333-333333333333','active');
INSERT INTO public.user_roles VALUES
 ('11111111-1111-4111-8111-111111111111','operator'),
 ('22222222-2222-4222-8222-222222222222','superadmin');
INSERT INTO public.national_pension_payout_logs VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01','44444444-4444-4444-8444-444444444444',9007199254740993,9007199254740993,'2026-10-30T09:00:00Z'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','55555555-5555-4555-8555-555555555555',17,17,'2026-10-30T09:00:00Z');
GRANT SELECT, UPDATE, DELETE ON public.national_pension_payout_logs TO moneyverse_app;
SQL
docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres < "$repo/packages/database/migrations/310-pension-admin-recent-payouts-scoped-read.sql" >/dev/null
docker exec -i "$name" psql -v ON_ERROR_STOP=1 -U postgres <<'SQL'
SET ROLE moneyverse_app;
DO $test$
DECLARE
  admin uuid := '11111111-1111-4111-8111-111111111111';
  inactive uuid := '22222222-2222-4222-8222-222222222222';
  roleless uuid := '33333333-3333-4333-8333-333333333333';
  n integer;
  amount text;
  first_id uuid;
BEGIN
  IF has_table_privilege(current_user, 'public.national_pension_payout_logs', 'SELECT') OR
     has_table_privilege(current_user, 'public.national_pension_payout_logs', 'UPDATE') OR
     has_table_privilege(current_user, 'public.national_pension_payout_logs', 'DELETE') THEN
    RAISE EXCEPTION 'direct payout table privilege remains';
  END IF;
  IF NOT has_function_privilege(current_user, 'public.pension_admin_recent_payouts(uuid,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'scoped payout function is not executable';
  END IF;
  SELECT count(*), max(payout_amount_wld::text) INTO n, amount
    FROM public.pension_admin_recent_payouts(admin, 100);
  IF n <> 2 OR amount <> '9007199254740993' THEN
    RAISE EXCEPTION 'authorized payout rows or large amount mismatch';
  END IF;
  SELECT id INTO first_id FROM public.pension_admin_recent_payouts(admin, 1);
  IF first_id <> 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid THEN
    RAISE EXCEPTION 'equal-timestamp payout ordering is unstable';
  END IF;
  BEGIN
    PERFORM * FROM public.pension_admin_recent_payouts(inactive, 20);
    RAISE EXCEPTION 'inactive admin unexpectedly authorized';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.pension_admin_recent_payouts(roleless, 20);
    RAISE EXCEPTION 'roleless user unexpectedly authorized';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.pension_admin_recent_payouts(NULL, 20);
    RAISE EXCEPTION 'missing admin unexpectedly authorized';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  BEGIN
    PERFORM * FROM public.pension_admin_recent_payouts(admin, 101);
    RAISE EXCEPTION 'invalid limit unexpectedly authorized';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  BEGIN
    EXECUTE 'SELECT count(*) FROM public.national_pension_payout_logs';
    RAISE EXCEPTION 'raw payout SELECT unexpectedly authorized';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$test$;
RESET ROLE;
DO $test$
BEGIN
  IF (SELECT count(*) FROM public.national_pension_payout_logs) <> 2 THEN
    RAISE EXCEPTION 'historical payout receipts changed';
  END IF;
  IF has_function_privilege('public', 'public.pension_admin_recent_payouts(uuid,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'PUBLIC function execution unexpectedly allowed';
  END IF;
END;
$test$;
SQL
printf 'PASS: isolated PostgreSQL 17.11 admin payout ACL, active role, bounded reads, precision, ordering and unchanged rows\n'
