#!/usr/bin/env bash
# Negative public-edge checks; output contains status and flags, never private values.
set -euo pipefail
BASE="${MV39_BASE_URL:-https://easy-scraping.com}"
for route in /api/wallet/overview /api/wallet/balance /api/v1/wallet/overview /api/v1/wallet/balance /api/pension/funded/position; do
  code=$(curl -ksSL --max-time 8 -o /dev/null -w '%{http_code}' "${BASE}${route}")
  test "$code" = 401 || { echo "FAIL ${route} code=${code}"; exit 21; }
  printf 'PASS %s anonymous=401\n' "$route"
done
fake_actor="$(cat /proc/sys/kernel/random/uuid)"
for route in /api/wallet/summary /api/v1/wallet/summary; do
  tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
  code=$(curl -ksSL --max-time 8 -H "X-User-Id: ${fake_actor}" -H "x-actor-user-id: ${fake_actor}" -o "$tmp" -w '%{http_code}' "${BASE}${route}")
  test "$code" = 200 || { echo "FAIL ${route} code=${code}"; exit 22; }
  python3 - "$tmp" <<'PY'
import json,sys
x=json.load(open(sys.argv[1]))
if x.get('signedIn') is not False or x.get('totalAvailableAmount') is not None:
    raise SystemExit('FAIL forged member ID produced personal balance')
PY
  printf 'PASS %s forged-id rejected, no financial amount\n' "$route"
  rm -f "$tmp"
done
for route in / /api/v1/auth/session /api/v1/stocks; do
  code=$(curl -ksSL --max-time 8 -o /dev/null -w '%{http_code}' "${BASE}${route}")
  test "$code" = 200 || { echo "FAIL unaffected ${route} code=${code}"; exit 23; }
  printf 'PASS %s still HTTP200\n' "$route"
done
