#!/usr/bin/env bash
set -euo pipefail

# This runs only against an ephemeral, network-isolated container; never a shared DB.
root="$(cd "$(dirname "$0")/../../.." && pwd)"
name="mv-b-v657-nps-pg"
if docker container inspect "$name" >/dev/null 2>&1; then
  echo "Refusing to touch existing container $name" >&2
  exit 2
fi
cleanup() { docker rm -f "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run --rm -d --network none --name "$name" \
  -e POSTGRES_PASSWORD=isolated-test-only \
  -v "$root/packages/database/migrations/308-pension-public-overview-scoped-read.sql:/tmp/308.sql:ro" \
  postgres:17.11-alpine >/dev/null
ready=0
for _ in $(seq 1 20); do
  if docker exec "$name" pg_isready -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 1
done
if [[ "$ready" != 1 ]]; then echo 'isolated PostgreSQL did not start' >&2; exit 1; fi
# pg_isready can briefly see initdb's temporary server before final startup.
sleep 2

psql_test() { docker exec -i "$name" psql -U postgres -v ON_ERROR_STOP=1 -X -qAt "$@"; }
psql_test <<'SQL'
CREATE ROLE moneyverse_migrator NOLOGIN;
CREATE ROLE moneyverse_app NOLOGIN;
CREATE ROLE nps_unprivileged NOLOGIN;
GRANT CREATE ON SCHEMA public TO moneyverse_migrator;
SET ROLE moneyverse_migrator;
CREATE TABLE public.national_pension_accounts (
 id uuid PRIMARY KEY, status text NOT NULL,
 accumulated_contribution_wld numeric NOT NULL,
 total_payout_received_wld numeric NOT NULL
);
CREATE TABLE public.system_treasury_vaults (code text PRIMARY KEY, balance_wld text NOT NULL);
INSERT INTO public.national_pension_accounts VALUES
 ('00000000-0000-0000-0000-000000000001','ACCUMULATING',9007199254740993123456789,0),
 ('00000000-0000-0000-0000-000000000002','RETIRED_RECEIVING',100,9007199254740993),
 ('00000000-0000-0000-0000-000000000003','LIQUIDATED',5000,200);
INSERT INTO public.system_treasury_vaults VALUES ('VAULT_MAIN','12345');
RESET ROLE;
SQL

docker exec "$name" psql -U postgres -v ON_ERROR_STOP=1 -X -q -f /tmp/308.sql

acl="$(psql_test -c "SELECT has_table_privilege('moneyverse_app','public.national_pension_accounts','SELECT'),has_table_privilege('moneyverse_app','public.system_treasury_vaults','SELECT'),has_function_privilege('moneyverse_app','public.pension_public_overview()','EXECUTE'),has_function_privilege('nps_unprivileged','public.pension_public_overview()','EXECUTE');")"
[[ "$acl" == 'f|f|t|f' ]] || { echo "Unexpected ACL: $acl" >&2; exit 1; }

result="$(psql_test -c "SET ROLE moneyverse_app; SELECT * FROM public.pension_public_overview();")"
[[ "$result" == '9007199254740993123456889|2|1|9007199254740993|12345' ]] || { echo "Unexpected aggregate: $result" >&2; exit 1; }

if psql_test -c 'SET ROLE moneyverse_app; SELECT * FROM public.national_pension_accounts;' >/dev/null 2>&1; then
  echo 'Direct pension table read unexpectedly allowed' >&2; exit 1
fi
if psql_test -c 'SET ROLE nps_unprivileged; SELECT * FROM public.pension_public_overview();' >/dev/null 2>&1; then
  echo 'Public function execute unexpectedly allowed' >&2; exit 1
fi

psql_test -c "SET ROLE moneyverse_migrator; DELETE FROM public.system_treasury_vaults WHERE code='VAULT_MAIN';" >/dev/null
missing="$(psql_test -c 'SET ROLE moneyverse_app; SELECT vault_main_balance_wld IS NULL FROM public.pension_public_overview();')"
[[ "$missing" == 't' ]] || { echo 'Missing vault must not be fabricated as zero' >&2; exit 1; }
rows="$(psql_test -c 'SELECT count(*) FROM public.national_pension_accounts;')"
[[ "$rows" == '3' ]] || { echo 'Unexpected pension account mutation' >&2; exit 1; }

echo 'PASS: isolated PostgreSQL 17.11 scoped aggregate, precision, role ACL, missing vault, no account mutation'
