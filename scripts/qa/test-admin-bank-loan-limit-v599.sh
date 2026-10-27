#!/usr/bin/env bash
# Disposable network-isolated PostgreSQL 17 check of the unchanged migration-264 SQL contract.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NAME="mv-b-v599-pg-$$"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run -d --rm --network none --name "$NAME" -e POSTGRES_PASSWORD=synthetic-only postgres:17.11 >/dev/null
ready=0
for _ in $(seq 1 40); do
  if docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 1
done
test "$ready" -eq 1
docker exec -i "$NAME" psql -U postgres -d postgres -v ON_ERROR_STOP=1 >/dev/null <<'SQL'
CREATE ROLE moneyverse_app NOLOGIN;
CREATE TYPE public.admin_role AS ENUM ('approver');
CREATE FUNCTION public.admin_role_holder(p_actor uuid, p_role public.admin_role)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT p_actor = '00000000-0000-4000-8000-000000000001'::uuid AND p_role = 'approver'::public.admin_role
$$;
CREATE TABLE public.virtual_bank_loans (
 id uuid PRIMARY KEY, user_id uuid, credit_grade text, status text,
 principal_amount numeric, interest_amount numeric, outstanding_amount numeric,
 minimum_repayment numeric, issued_at timestamptz, maturity_at timestamptz,
 overdue_at timestamptz, status_reason text
);
CREATE TABLE public.virtual_bank_loan_repayments (loan_id uuid, amount numeric);
CREATE TABLE public.identities (user_id uuid, display_name text, linked_at timestamptz);
INSERT INTO public.virtual_bank_loans VALUES
 ('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','A','active',
  9007199254740993,0,9007199254740993,1,now(),now()+interval '1 day',NULL,NULL);
SQL
awk '/^DROP FUNCTION IF EXISTS public.admin_loan_book/{flag=1} flag' "$ROOT/packages/database/migrations/264-fix-admin-bank-functions-return-types.sql" |
  docker exec -i "$NAME" psql -U postgres -d postgres -v ON_ERROR_STOP=1 >/dev/null
docker exec -i "$NAME" psql -U postgres -d postgres -v ON_ERROR_STOP=1 <<'SQL'
REVOKE ALL ON FUNCTION public.admin_loan_book(uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_loan_book(uuid,integer) TO moneyverse_app;
SET ROLE moneyverse_app;
DO $$
DECLARE n integer; amount text; rejected boolean;
BEGIN
 SELECT count(*) INTO n FROM public.admin_loan_book('00000000-0000-4000-8000-000000000001', 1);
 IF n <> 1 THEN RAISE EXCEPTION 'valid limit=1 failed'; END IF;
 SELECT count(*) INTO n FROM public.admin_loan_book('00000000-0000-4000-8000-000000000001', 200);
 IF n <> 1 THEN RAISE EXCEPTION 'valid limit=200 failed'; END IF;
 SELECT principal_amount::text INTO amount FROM public.admin_loan_book('00000000-0000-4000-8000-000000000001', 1);
 IF amount <> '9007199254740993' THEN RAISE EXCEPTION 'lost bigint precision'; END IF;
 FOREACH n IN ARRAY ARRAY[0,-1,201] LOOP
   rejected := false;
   BEGIN PERFORM * FROM public.admin_loan_book('00000000-0000-4000-8000-000000000001', n);
   EXCEPTION WHEN SQLSTATE '22023' THEN rejected := true; END;
   IF NOT rejected THEN RAISE EXCEPTION 'invalid limit % was accepted', n; END IF;
 END LOOP;
 rejected := false;
 BEGIN PERFORM * FROM public.admin_loan_book('00000000-0000-4000-8000-000000000009', 1);
 EXCEPTION WHEN SQLSTATE '42501' THEN rejected := true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'non-admin was accepted'; END IF;
 rejected := false;
 BEGIN PERFORM * FROM public.virtual_bank_loans;
 EXCEPTION WHEN SQLSTATE '42501' THEN rejected := true; END;
 IF NOT rejected THEN RAISE EXCEPTION 'app direct table read allowed'; END IF;
END $$;
SQL
echo 'PASS isolated PostgreSQL 17.11: migration-264 1..200, invalid 22023, non-admin 42501, no table read, exact numeric'
