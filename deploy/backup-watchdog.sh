#!/usr/bin/env bash
# Verifies the newest encrypted backup and alerts only on state transitions.
# The webhook is read from the deployment environment; it is never committed.
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$PWD}"
cd "$DEPLOY_DIR"

env_value() {
  [ -f .env ] || return 0
  grep -E "^$1=" .env | tail -1 | cut -d= -f2-
}

STACK="${STACK:-$(env_value STACK)}"
[ -n "$STACK" ] || { echo 'STACK is required' >&2; exit 2; }

MAX_AGE_HOURS="${BACKUP_WATCHDOG_MAX_AGE_HOURS:-1}"
WEBHOOK_URL="${BACKUP_ALERT_WEBHOOK_URL:-$(env_value BACKUP_ALERT_WEBHOOK_URL)}"
STATE_DIR="${BACKUP_WATCHDOG_STATE_DIR:-$HOME/.local/state}"
STATE_FILE="$STATE_DIR/moneyverse-backup-watchdog-$STACK.state"
mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"

previous='unknown'
[ -f "$STATE_FILE" ] && previous="$(cat "$STATE_FILE" 2>/dev/null || true)"

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

notify() {
  local message="$1"
  if [ -z "$WEBHOOK_URL" ]; then
    echo "backup watchdog notification not sent: BACKUP_ALERT_WEBHOOK_URL is unset" >&2
    return 0
  fi

  local escaped
  escaped="$(json_escape "$message")"
  curl --fail --silent --show-error \
    -H 'Content-Type: application/json' \
    --data "{\"content\":\"$escaped\"}" \
    "$WEBHOOK_URL" >/dev/null
}

set_state() {
  printf '%s\n' "$1" > "$STATE_FILE"
  chmod 600 "$STATE_FILE"
}

output=''
if output="$(BACKUP_MAX_AGE_HOURS="$MAX_AGE_HOURS" DEPLOY_DIR="$DEPLOY_DIR" STACK="$STACK" /bin/bash "$DEPLOY_DIR/backup.sh" verify 2>&1)"; then
  echo "$output"
  if [ "$previous" = 'failed' ]; then
    notify "✅ [$STACK] backup verification recovered; newest backup is valid and within ${MAX_AGE_HOURS}h."
  fi
  set_state healthy
  exit 0
fi

rc=$?
echo "$output" >&2
if [ "$previous" != 'failed' ]; then
  summary="$(printf '%s' "$output" | tail -1 | tr '\n\r' '  ')"
  notify "🚨 [$STACK] backup verification failed (rc=$rc): $summary"
fi
set_state failed
exit "$rc"
