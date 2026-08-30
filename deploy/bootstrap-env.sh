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
# Writes a value once and never again: a generated secret must survive every
# later deploy, or the database would be unreachable with the password the
# volume was initialised with.
put() { have "$1" || printf '%s=%s\n' "$1" "$2" >> .env; }
# Replaces a value the caller named. For the handful of settings that are a
# deliberate operator decision rather than a generated constant -- the public
# origin above all, since renaming the site is exactly the case `put` would
# silently ignore.
set_to() { sed -i "/^$1=/d" .env; printf '%s=%s\n' "$1" "$2" >> .env; }

# 32 bytes of urandom, hex encoded. The API requires at least 32 characters
# for the internal token and rejects anything shorter at startup.
secret() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }

put DB_NAME "${DB_NAME:-moneyverse_migration}"
put POSTGRES_PASSWORD "$(secret)"
put APP_DB_PASSWORD "$(secret)"
put INTERNAL_API_TOKEN "$(secret)"
# The status collector's own credential. Its role may execute exactly one
# function and nothing else, so this is not a second copy of the application's
# access — see 050-status-collector.sql.
put STATUS_COLLECTOR_PASSWORD "$(secret)"
# The key that seals TOTP secrets before they reach the database, so a database
# read alone yields no usable second factor. `put`, not `set_to`: rotating it
# would strand every enrolled administrator's sealed secret, and a rotation is
# a deliberate act with a re-enrolment behind it, not something a redeploy does
# by accident. Without it the API still boots and reports the second factor
# unavailable, which would quietly leave every high-risk command unreachable --
# so it is generated here rather than left to be remembered.
put ADMIN_TOTP_ENCRYPTION_KEY "$(secret)"
# Peppers the device hash in the administrator login policy. Separate from the
# sealing key because it protects a different thing and neither should be
# recoverable from the other.
put ADMIN_DEVICE_HASH_PEPPER "$(secret)"
set_to APP_BASE_URL "${APP_BASE_URL:?APP_BASE_URL is required — it decides the OAuth redirect URIs}"
put COOKIE_SECURE 'true'
put TRUST_PROXY_X_FORWARDED_FOR 'true'
# Only the production deployment may be indexed, and only when it is told to.
# A second host serving the same Korean copy under a different name is a
# duplicate in search results, so this defaults off and production turns it on.
set_to SEO_INDEXING_ENABLED "${SEO_INDEXING_ENABLED:-false}"
put ADS_ENABLED "${ADS_ENABLED:-false}"
set_to EDGE_PORT "${EDGE_PORT:-3021}"
# Administrators this deployment grants on top of the two every database has.
# Empty on production by design: an operator who should hold roles there is
# granted them through the console, not by a deployment variable.
set_to BOOTSTRAP_DISCORD_ADMIN_IDS "${BOOTSTRAP_DISCORD_ADMIN_IDS:-}"

base_url="$(grep -E '^APP_BASE_URL=' .env | cut -d= -f2-)"

# The redirect URI is derived, not configured: the API refuses to enable a
# provider whose redirect URI does not match APP_BASE_URL's origin and the
# exact callback path, so a hand-written one is a silent disable.
# Derived from the origin above, and rewritten with it: after a rename these
# must follow, or the API silently disables both providers because their
# redirect URI no longer matches APP_BASE_URL.
set_to DISCORD_REDIRECT_URI "${base_url%/}/auth/discord/callback"
set_to GOOGLE_REDIRECT_URI "${base_url%/}/auth/google/callback"

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
