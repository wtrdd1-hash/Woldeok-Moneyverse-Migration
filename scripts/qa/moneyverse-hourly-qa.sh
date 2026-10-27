#!/usr/bin/env bash
# v2026.10.27.1317 — hourly HTTP smoke + QA-owned disk scratch cleanup
# This is NOT the five-pass authenticated/full-route functional QA certification.
set -Eeuo pipefail

BASE_URL="${MONEYVERSE_QA_URL:-https://easy-scraping.com}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
CLEANER="$SCRIPT_DIR/../../ops/storage/qa-disk-cleanup.mjs"
LOG_FILE="/var/log/moneyverse-hourly-qa.log"
STAMP="$(date '+%Y-%m-%d %H:%M:%S %Z')"

log() {
  printf '%s\n' "$*" | sudo -n tee -a "$LOG_FILE" || printf '%s\n' "$*" >&2
}

# Exactly one runner at a time, including manual invocations.
exec 9>/tmp/moneyverse-hourly-qa.lock
if ! flock -n 9; then
  log "[QA_SMOKE] another scheduled QA run is active; overlap skipped"
  exit 0
fi

finalize() {
  local rc=$?
  trap - EXIT
  local cleanup_rc=0
  /usr/bin/node "$CLEANER" || cleanup_rc=$?
  if ((cleanup_rc != 0)); then
    log "[QA_DISK_FAIL] QA-owned cleanup failed, code=$cleanup_rc"
    ((rc != 0)) || rc=2
  fi
  exit "$rc"
}
trap finalize EXIT

log "=== [$STAMP] Starting Moneyverse scheduled HTTP SMOKE (not full functional QA) ==="

ROUTES=(
  "/" "/guide" "/guide/stock-trading" "/guide/virtual-banking"
  "/guide/career-mastery" "/guide/glossary" "/tools"
  "/tools/compound-calculator" "/tools/stock-calculator"
  "/tools/farming-calculator" "/stocks" "/stocks/WDG" "/stocks/WDT"
  "/stocks/portfolio" "/wallet" "/wallet/activity" "/bank" "/work"
  "/quests" "/board" "/marketplace" "/newspaper" "/account"
  "/sitemap.xml" "/robots.txt" "/api/viewer"
)

passed=0
auth_gated=0
failed=0
for route in "${ROUTES[@]}"; do
  response="$(curl --silent --show-error --max-time 12 --connect-timeout 5 \
    -o /dev/null -w '%{http_code}|%{redirect_url}' "${BASE_URL}${route}" || true)"
  status="${response%%|*}"
  redirect="${response#*|}"
  if [[ "$status" == '200' ]]; then
    ((passed+=1))
  elif [[ ( "$status" == '307' || "$status" == '308' ) \
      && ( "$route" == '/bank' || "$route" == '/marketplace' ) \
      && "$redirect" == "${BASE_URL}/login?error=login_required" ]]; then
    ((auth_gated+=1))
    log "[QA_AUTH_GATED] route=$route requires login; feature flow NOT TESTED"
  else
    ((failed+=1))
    log "[QA_SMOKE_FAIL] route=$route status=${status:-NO_RESPONSE}; redirect=${redirect:-NONE}"
  fi
done

sessions="$(docker exec woldeok-moneyverse-dev-db-1 psql -U moneyverse_migrator \
  -d woldeok_moneyverse_dev -t -A -c \
  'SELECT count(*) FROM auth_sessions WHERE expires_at > NOW();' 2>/dev/null || true)"
if [[ ! "$sessions" =~ ^[0-9]+$ ]]; then
  ((failed+=1))
  log "[QA_SMOKE_FAIL] session-count query unavailable"
  sessions="UNAVAILABLE"
fi

log "=== [$STAMP] HTTP SMOKE: http_pass=$passed auth_gated_not_tested=$auth_gated failed=$failed session_count=$sessions; full_functional_QA=NOT_TESTED ==="
if ((failed > 0)); then
  exit 1
fi
