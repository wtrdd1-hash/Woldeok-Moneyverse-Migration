#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:?usage: verify-runtime-identity.sh BASE_URL EXPECTED_SHA}"
EXPECTED_SHA="${2:?usage: verify-runtime-identity.sh BASE_URL EXPECTED_SHA}"
CURL_BIN="${CURL_BIN:-curl}"
JQ_BIN="${JQ_BIN:-jq}"

[[ "$EXPECTED_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'invalid expected SHA' >&2; exit 2; }
BASE_URL="${BASE_URL%/}"

backend_payload="$($CURL_BIN -fsS --max-time 10 "$BASE_URL/api/version")"
backend_sha="$(printf '%s' "$backend_payload" | "$JQ_BIN" -r '.id // empty')"
[[ "$backend_sha" == "$EXPECTED_SHA" ]] || {
  echo "backend runtime identity mismatch: expected=$EXPECTED_SHA observed=${backend_sha:-missing}" >&2
  exit 1
}

frontend_payload="$($CURL_BIN -fsS --max-time 10 "$BASE_URL/frontend-version")"
frontend_sha="$(printf '%s' "$frontend_payload" | "$JQ_BIN" -r 'if type == "object" then (.id // .sha // .version // empty) else . end' 2>/dev/null || printf '%s' "$frontend_payload")"
[[ "$frontend_sha" == "$EXPECTED_SHA" || "$frontend_payload" == *"$EXPECTED_SHA"* ]] || {
  echo "frontend runtime identity mismatch: expected=$EXPECTED_SHA observed=${frontend_sha:-missing}" >&2
  exit 1
}

printf 'runtime identity coherent: %s backend=%s frontend=%s\n' "$BASE_URL" "$EXPECTED_SHA" "$EXPECTED_SHA"
