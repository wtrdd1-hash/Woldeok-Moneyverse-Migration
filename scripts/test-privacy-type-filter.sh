#!/usr/bin/env bash
set -euo pipefail
# Disposable, non-networked PostgreSQL only. No application or production DB URL.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="mv-a-privacy-type-$$"
DB="mv_a_privacy_type"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || :; }
trap cleanup EXIT
docker run -d --rm --network none --name "$NAME" -e POSTGRES_PASSWORD=isolated_test_only postgres:17-alpine >/dev/null
ready=0
for _ in $(seq 1 50); do
  if docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 0.4
done
test "$ready" = 1
docker exec "$NAME" createdb -U postgres "$DB"
docker exec -i "$NAME" psql -X -U postgres -d "$DB" -v ON_ERROR_STOP=1 < "$ROOT/packages/database/test/fixtures/privacy-request-cache-isolation-setup.sql" >/dev/null
docker exec -i "$NAME" psql -X -U postgres -d "$DB" -v ON_ERROR_STOP=1 < "$ROOT/packages/database/migrations/015-privacy-data-subject-requests.sql" >/dev/null
docker exec -i "$NAME" psql -X -U postgres -d "$DB" -v ON_ERROR_STOP=1 < "$ROOT/packages/database/migrations/286-privacy-request-returning-binding.sql" >/dev/null
docker exec -i "$NAME" psql -X -U postgres -d "$DB" -v ON_ERROR_STOP=1 <<'SQL'
SET ROLE moneyverse_app;
DO $$
DECLARE
  i integer;
BEGIN
  FOR i IN 1..105 LOOP
    PERFORM public.privacy_create_my_request(
      'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
      CASE WHEN i <= 5 THEN 'access' ELSE 'deletion' END,
      NULL,
      gen_random_uuid()
    );
  END LOOP;
  PERFORM public.privacy_create_my_request(
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','access',NULL,gen_random_uuid()
  );
END $$;
RESET ROLE;
-- Synthetic test-only timestamps guarantee the first five records fall outside
-- the latest-100 window regardless of insertion transaction timestamps.
UPDATE public.privacy_data_subject_requests
SET created_at = now() - interval '1 day'
WHERE request_type = 'access';
SET ROLE moneyverse_app;
DO $$
DECLARE
  v_count integer;
  v_denied boolean := false;
BEGIN
  SELECT count(*) INTO v_count FROM (
    SELECT r.request_id FROM public.privacy_list_my_requests(
      'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',100) AS r
    WHERE r.request_type = 'access'
    ORDER BY r.created_at DESC, r.request_id DESC LIMIT 30
  ) AS recent_access;
  IF v_count <> 0 THEN RAISE EXCEPTION 'older requests leaked past 100-row scope'; END IF;
  SELECT count(*) INTO v_count FROM (
    SELECT r.request_id FROM public.privacy_list_my_requests(
      'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',100) AS r
    WHERE r.request_type = 'deletion'
    ORDER BY r.created_at DESC, r.request_id DESC LIMIT 30
  ) AS recent_deletion;
  IF v_count <> 30 THEN RAISE EXCEPTION 'bounded deletion filter returned % rows', v_count; END IF;
  SELECT count(*) INTO v_count FROM public.privacy_list_my_requests(
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',100
  ) AS r WHERE r.request_type = 'deletion';
  IF v_count <> 0 THEN RAISE EXCEPTION 'other user records leaked'; END IF;
  BEGIN
    PERFORM 1 FROM public.privacy_data_subject_requests LIMIT 1;
  EXCEPTION WHEN insufficient_privilege THEN v_denied := true;
  END;
  IF NOT v_denied THEN RAISE EXCEPTION 'app role direct table SELECT allowed'; END IF;
END $$;
SQL
echo 'PASS: PostgreSQL 17 real function, latest-100 boundary, filtered-30, other-owner isolation and app role SELECT denied'
