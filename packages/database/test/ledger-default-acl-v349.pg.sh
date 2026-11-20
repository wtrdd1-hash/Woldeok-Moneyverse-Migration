#!/usr/bin/env bash
# Isolated PostgreSQL ACL regression. Never connects to a shared DB.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
NAME="mv-b-ledger-acl-$$"
PASSWORD="$(openssl rand -hex 24)"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --network none --name "$NAME" -e POSTGRES_PASSWORD="$PASSWORD" postgres:17.11-alpine >/dev/null
ready=0
for _ in $(seq 1 60); do
  if docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 0.5
done
if [[ "$ready" != 1 ]]; then echo 'isolated PostgreSQL readiness timeout' >&2; exit 1; fi
sql() { docker exec -i "$NAME" psql -X -q -v ON_ERROR_STOP=1 -U postgres -d postgres "$@"; }

sql <<'SQL'
CREATE ROLE moneyverse_app NOLOGIN;
CREATE ROLE moneyverse_migrator NOLOGIN;
GRANT USAGE, CREATE ON SCHEMA public TO moneyverse_migrator;
CREATE TABLE public.ledger_transactions (id bigint PRIMARY KEY);
CREATE TABLE public.ledger_postings (id bigint PRIMARY KEY);
GRANT ALL PRIVILEGES ON TABLE public.ledger_transactions, public.ledger_postings TO moneyverse_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO moneyverse_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO moneyverse_app;
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator GRANT ALL ON TABLES TO moneyverse_app;
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public GRANT ALL ON TABLES TO moneyverse_app;
SQL
# Precondition must actually be vulnerable; otherwise the test is meaningless.
sql <<'SQL'
DO $$ BEGIN
 IF NOT has_table_privilege('moneyverse_app','public.ledger_transactions','INSERT') THEN
  RAISE EXCEPTION 'fixture missing vulnerable direct INSERT';
 END IF;
END $$;
SQL
# Creator defaults cannot be changed by a merely named, unauthorized migrator.
if refused="$( { printf '%s\n' 'SET ROLE moneyverse_migrator;'; cat "$ROOT/packages/database/migrations/349-ledger-app-default-acl-repair.sql"; } | sql 2>&1)"; then
  echo 'FAIL: unauthorized executor unexpectedly changed creator defaults' >&2
  exit 1
fi
if ! grep -Eq 'permission denied|must be (member|owner)' <<<"$refused"; then
  echo 'FAIL: unauthorized executor did not fail on the expected privilege boundary' >&2
  exit 1
fi
# This operator already owns both creator roles; no membership is granted to unblock DDL.
sql -f - < "$ROOT/packages/database/migrations/349-ledger-app-default-acl-repair.sql"
sql <<'SQL'
CREATE TABLE public.future_postgres_ledger_acl (id bigint);
SET ROLE moneyverse_migrator;
CREATE TABLE public.future_migrator_ledger_acl (id bigint);
RESET ROLE;
DO $$
DECLARE t text; p text;
BEGIN
 FOREACH t IN ARRAY ARRAY['public.ledger_transactions','public.ledger_postings'] LOOP
  IF NOT has_table_privilege('moneyverse_app',t,'SELECT') THEN
   RAISE EXCEPTION 'SELECT denied on %',t;
  END IF;
  FOREACH p IN ARRAY ARRAY['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] LOOP
   IF has_table_privilege('moneyverse_app',t,p) THEN
    RAISE EXCEPTION 'unsafe % on %',p,t;
   END IF;
  END LOOP;
 END LOOP;
 FOREACH t IN ARRAY ARRAY['public.future_postgres_ledger_acl','public.future_migrator_ledger_acl'] LOOP
  FOREACH p IN ARRAY ARRAY['INSERT','UPDATE','DELETE','TRUNCATE'] LOOP
   IF has_table_privilege('moneyverse_app',t,p) THEN
    RAISE EXCEPTION 'unsafe future grant % on %',p,t;
   END IF;
  END LOOP;
 END LOOP;
END $$;
SQL
# Re-running the forward-only DDL must preserve the same least-privilege state.
sql -f - < "$ROOT/packages/database/migrations/349-ledger-app-default-acl-repair.sql"
echo 'PASS: isolated PostgreSQL v349 ACL, future creators, and repeat execution'
