#!/usr/bin/env bash
# Contract verification against an isolated read-only Spring Java candidate.
# Do not send real credentials, member IDs, or financial writes. Exit nonzero on mismatch.
set -euo pipefail
BASE="${MV39_SPRING_TEST_URL:-http://127.0.0.1:4674}"
request_code() { curl --silent --show-error --max-time 7 -o /dev/null -w '%{http_code}' "$BASE$1"; }
for route in /actuator/health / /api/v1/auth/session /api/v1/stocks /api/v1/shop/public-catalog; do
 code="$(request_code "$route")";test "$code" = 200 || { echo "FAIL $route $code";exit 50; }; echo "PASS $route HTTP200"
done
fake_actor="$(cat /proc/sys/kernel/random/uuid)"
for route in /api/wallet/overview /api/v1/wallet/overview /api/wallet/balance /api/v1/wallet/balance /api/pension/funded/position /api/v1/engagement/dopamine/status; do
 code=$(curl -sS --max-time 7 -H "X-User-Id: $fake_actor" -o /dev/null -w '%{http_code}' "$BASE$route")
 test "$code" = 401 || { echo "FAIL $route $code";exit 51; };echo "PASS $route guest+forged-header HTTP401"
done
for route in /api/v1/quant/strategies /api/v1/businesses/ventures/pitches /api/v1/newspaper/weekly-brief /api/v1/stocks/derivatives/markets /api/v1/shop/crafting/recipes;do
 code="$(request_code "$route")";test "$code" = 503 || { echo "FAIL $route $code";exit 52; };echo "PASS $route unverified-source HTTP503"
done
for route in /api/wallet/summary /api/v1/wallet/summary;do
 temp="$(mktemp)";trap 'rm -f "$temp"' EXIT
 code=$(curl -sS --max-time 7 -H "X-User-Id: $fake_actor" -o "$temp" -w '%{http_code}' "$BASE$route")
 test "$code" = 200 || { echo "FAIL $route $code";exit 53; }
 python3 - "$temp" <<'PY'
import json,sys
response=json.load(open(sys.argv[1]))
assert response.get('signedIn') is False and response.get('totalAvailableAmount') is None,'unauthorized amount leaked'
PY
 echo "PASS $route forged ID not treated as session"
 rm -f "$temp"
done
# Only unauthenticated negative tests; never run member financial writes.
for route in /api/wallet/transfer /api/v1/wallet/transfer /api/v1/engagement/dopamine/spin;do
 code=$(curl -sS --max-time 7 -X POST -H 'Content-Type: application/json' --data '{}' -o /dev/null -w '%{http_code}' "$BASE$route")
 test "$code" = 401 || { echo "FAIL POST $route $code";exit 54; };echo "PASS unauthenticated POST $route HTTP401"
done
