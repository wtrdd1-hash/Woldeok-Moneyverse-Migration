#!/usr/bin/env bash
# Fills in .env on the host, once, and never overwrites what is already there.
#
# Two kinds of value live in this file and they are obtained differently.
#
# The stack's own secrets — the two database passwords and the token the front
# end presents to the API — belong to this deployment alone and are generated
# here. Nothing outside this host ever needs to know them, so nothing outside
# this host ever sees them.
#
# The OAuth client credentials are not ours to invent: Discord and Google
# issued them to an application that already exists. They are copied from the
# environment of a container already running on this host, which is why they
# are never typed into a workflow, a repository, or a terminal that keeps
# history. Set ADOPT_FROM to that container's name.
set -euo pipefail

cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"
umask 077
touch .env

have() { grep -qE "^$1=" .env; }
put() { have "$1" || printf '%s=%s\n' "$1" "$2" >> .env; }

# 32 bytes of urandom, hex encoded. The API requires at least 32 characters
# for the internal token and rejects anything shorter at startup.
secret() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }

put DB_NAME 'moneyverse_migration'
put POSTGRES_PASSWORD "$(secret)"
put APP_DB_PASSWORD "$(secret)"
put INTERNAL_API_TOKEN "$(secret)"
put APP_BASE_URL "${APP_BASE_URL:-https://migration.easy-scraping.com}"
put COOKIE_SECURE 'true'
put TRUST_PROXY_X_FORWARDED_FOR 'true'
# A test deployment must never be indexed. Turning this on would put a second
# copy of the product's Korean copy into search results under a hostname that
# is not the canonical one.
put SEO_INDEXING_ENABLED 'false'
put ADS_ENABLED 'false'
put EDGE_PORT '3021'

base_url="$(grep -E '^APP_BASE_URL=' .env | cut -d= -f2-)"

# The redirect URI is derived, not configured: the API refuses to enable a
# provider whose redirect URI does not match APP_BASE_URL's origin and the
# exact callback path, so a hand-written one is a silent disable.
put DISCORD_REDIRECT_URI "${base_url%/}/auth/discord/callback"
put GOOGLE_REDIRECT_URI "${base_url%/}/auth/google/callback"

adopt_from="${ADOPT_FROM:-}"
if [ -n "$adopt_from" ]; then
  if ! docker inspect "$adopt_from" >/dev/null 2>&1; then
    echo "ADOPT_FROM names no container on this host: $adopt_from" >&2
    exit 1
  fi
  for name in DISCORD_CLIENT_ID DISCORD_CLIENT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET; do
    have "$name" && continue
    # Read one variable at a time and pipe it straight into the file. The
    # value is never echoed, never becomes a shell argument, and never
    # reaches this script's own output.
    value="$(docker inspect "$adopt_from" \
      --format "{{range .Config.Env}}{{println .}}{{end}}" \
      | grep -E "^${name}=" | head -1 | cut -d= -f2- || true)"
    if [ -n "$value" ]; then
      printf '%s=%s\n' "$name" "$value" >> .env
      echo "adopted $name"
    else
      echo "warning: $adopt_from does not set $name" >&2
    fi
  done
fi

for name in DISCORD_CLIENT_ID DISCORD_CLIENT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET; do
  put "$name" ''
done

# Report presence, never contents.
echo "--- .env ---"
while IFS='=' read -r key value; do
  case "$key" in
    ''|\#*) continue ;;
    *SECRET*|*PASSWORD*|*TOKEN*|*CLIENT_ID*)
      if [ -n "$value" ]; then echo "$key=<set>"; else echo "$key=<empty>"; fi ;;
    *) echo "$key=$value" ;;
  esac
done < .env
