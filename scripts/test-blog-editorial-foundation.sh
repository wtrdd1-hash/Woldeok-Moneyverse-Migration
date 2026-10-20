#!/usr/bin/env bash
# Isolated disposable PostgreSQL 17. This script never connects to production,
# the existing Test database, or any externally accessible port.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAME="mv-blog-editorial-$$"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --name "$NAME" --network none \
  --memory 384m --cpus 1 -e POSTGRES_HOST_AUTH_METHOD=trust \
  postgres:17.11-alpine >/dev/null
READY=0
for _ in $(seq 1 15); do
  if docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; then READY=1; break; fi
  sleep 1
done
if [ "$READY" -ne 1 ]; then echo 'FAIL: isolated PostgreSQL was not ready' >&2; exit 1; fi

docker cp "$ROOT/packages/database/test/fixtures/278-blog-editorial-bootstrap.sql" "$NAME:/tmp/bootstrap.sql"
docker cp "$ROOT/packages/database/migrations/278-blog-editorial-foundation.sql" "$NAME:/tmp/migration.sql"
docker cp "$ROOT/packages/database/test/fixtures/278-blog-editorial-e2e.sql" "$NAME:/tmp/e2e.sql"
for FILE in bootstrap migration e2e; do
  docker exec "$NAME" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f "/tmp/${FILE}.sql"
done
printf 'PASS: isolated PostgreSQL 17 migration and negative privilege/approval/idempotency/immutability checks\n'
