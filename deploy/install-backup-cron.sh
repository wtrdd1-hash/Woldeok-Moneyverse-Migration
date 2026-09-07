#!/usr/bin/env bash
# Installs one deployment's non-overlapping ten-minute backup schedule.
# backup.sh already encrypts, verifies and expires each complete database and
# photo-store snapshot. This wrapper makes that guarantee periodic and records
# start/end timestamps plus the exit status outside the backup directory.
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$PWD}"
cd "$DEPLOY_DIR"
env_value() { grep -E "^$1=" .env | tail -1 | cut -d= -f2-; }
STACK="${STACK:-$(env_value STACK)}"
[ -n "$STACK" ] || { echo 'STACK is required' >&2; exit 2; }

case "$STACK" in
  wdmvp) schedule='*/10 * * * *' ;;
  wdmv) schedule='5-59/10 * * * *' ;;
  *) echo "refusing to install a backup schedule for unknown stack $STACK" >&2; exit 2 ;;
esac

marker="moneyverse-backup-$STACK"
lock="/tmp/$STACK-backup.lock"
log="$HOME/$STACK-backup.log"
tmp="$(mktemp)"
trap 'rm -f -- "$tmp"' EXIT

crontab -l 2>/dev/null | awk -v begin="# $marker begin" -v end="# $marker end" -v script="$DEPLOY_DIR/backup.sh run" '
  $0 == begin { skip=1; next }
  $0 == end { skip=0; next }
  index($0, script) { next }
  !skip { print }
' > "$tmp" || true

{
  printf '%s\n' "# $marker begin"
  printf '%s /usr/bin/flock -n %q /bin/bash -lc %q >> %q 2>&1\n' \
    "$schedule" "$lock" \
    "date --iso-8601=seconds; DEPLOY_DIR=$DEPLOY_DIR STACK=$STACK BACKUP_RETAIN_DAYS=1 BACKUP_RETAIN_WEEKS=8 BACKUP_MAX_AGE_HOURS=1 /bin/bash $DEPLOY_DIR/backup.sh run; rc=\$?; date --iso-8601=seconds; echo result=\$rc; exit \$rc" \
    "$log"
  printf '%s\n' "# $marker end"
} >> "$tmp"

crontab "$tmp"
echo "$STACK backup schedule installed: $schedule"
echo "log: $log"
