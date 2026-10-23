#!/usr/bin/env bash
# Disposable, network-isolated PostgreSQL. NEVER use shared development,
# Test, Production or any host-published database port for this fixture.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAME="mv-privacy-receipt-$$"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --name "$NAME" --network none --memory 512m --cpus 2 \
  -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_USER=moneyverse_migrator \
  -e POSTGRES_DB=mv_privacy_isolated postgres:17.11-alpine >/dev/null
READY=0
for _ in $(seq 1 25); do
  if docker exec "$NAME" pg_isready -U moneyverse_migrator -d mv_privacy_isolated >/dev/null 2>&1; then
    READY=1; break
  fi
  sleep 1
done
if [[ "$READY" -ne 1 ]]; then echo 'FAIL: isolated PostgreSQL unavailable' >&2; exit 1; fi

docker cp "$ROOT/packages/database/init/001-economy-core.sql" "$NAME:/tmp/core.sql"
docker cp "$ROOT/packages/database/migrations" "$NAME:/tmp/migrations"
docker cp "$ROOT/packages/database/test/fixtures/280-privacy-request-receipt-e2e.sql" "$NAME:/tmp/privacy-e2e.sql"
docker exec "$NAME" psql -U moneyverse_migrator -d mv_privacy_isolated -v ON_ERROR_STOP=1 \
  -c 'CREATE ROLE moneyverse_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;' >/dev/null
docker exec "$NAME" psql -U moneyverse_migrator -d mv_privacy_isolated -v ON_ERROR_STOP=1 \
  -f /tmp/core.sql >/dev/null
docker exec "$NAME" sh -c 'set -eu; for f in /tmp/migrations/[0-9][0-9][0-9]-*.sql; do
  psql -U moneyverse_migrator -d mv_privacy_isolated -v ON_ERROR_STOP=1 -f "$f" >/dev/null
done'
docker exec "$NAME" psql -U moneyverse_migrator -d mv_privacy_isolated -v ON_ERROR_STOP=1 \
  -f /tmp/privacy-e2e.sql
echo 'PASS: clean isolated PostgreSQL 17.11 migrations, owner/replay and negative privileges'
