#!/bin/sh
# Scheduler caller: the credential must never appear in crontab, process argv or logs.
set +x
set -eu
umask 077

fail() {
  printf 'blog cron: unsafe or missing credential file (%s)\n' "$1" >&2
  exit 78
}

secret_file=${MONEYVERSE_BLOG_CRON_SECRET_FILE:-}
case "$secret_file" in
  /*) ;;
  *) fail 'absolute path required' ;;
esac

[ -f "$secret_file" ] && [ ! -L "$secret_file" ] && [ -r "$secret_file" ] || fail 'regular readable file required'

# The service user owns its own credential; no group or world access is allowed.
file_owner=$(stat -c '%u' -- "$secret_file") || fail 'owner unavailable'
[ "$file_owner" = "$(id -u)" ] || fail 'owner mismatch'
file_mode=$(stat -c '%a' -- "$secret_file") || fail 'mode unavailable'
case "$file_mode" in
  400|600) ;;
  *) fail 'permission mode must be 0400 or 0600' ;;
esac

file_bytes=$(wc -c < "$secret_file") || fail 'size unavailable'
[ "$file_bytes" -le 256 ] || fail 'oversized credential'
secret=$(cat -- "$secret_file") || fail 'read failure'
case "$secret" in
  ''|*[!A-Za-z0-9_-]*) fail 'invalid credential characters' ;;
esac
[ "${#secret}" -ge 32 ] && [ "${#secret}" -le 128 ] || fail 'invalid credential length'

# curl reads the header from a pipe; neither the shell command nor curl argv
# contains the credential. A fixed HTTPS destination prevents URL injection.
printf 'header = "x-cron-secret: %s"\n' "$secret" | \
  curl -q --config - --silent --show-error --fail --proto '=https' --connect-timeout 10 --max-time 45 \
    --request POST --url 'https://easy-scraping.com/api/blog/generate'
