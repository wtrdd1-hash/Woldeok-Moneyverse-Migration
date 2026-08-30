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
# `have` is satisfied by a key written with an empty value, which is exactly
# what the OAuth loop below does when adoption produced nothing. Anything that
# must distinguish "present" from "present and usable" asks this instead.
has_value() { grep -qE "^$1=.+" .env; }
# Writes a value once and never again: a generated secret must survive every
# later deploy, or the database would be unreachable with the password the
# volume was initialised with.
put() { have "$1" || printf '%s=%s\n' "$1" "$2" >> .env; }
# Replaces a value the caller named. For the handful of settings that are a
# deliberate operator decision rather than a generated constant -- the public
# origin above all, since renaming the site is exactly the case `put` would
# silently ignore.
set_to() { sed -i "/^$1=/d" .env; printf '%s=%s\n' "$1" "$2" >> .env; }
# For the values the workflow supplies from the GitHub environment it was run
# against. An empty one means "this deployment did not configure it", not
# "erase what somebody set on the host by hand", so an empty value writes a
# placeholder and leaves an existing entry alone.
supplied() { if [ -n "${2:-}" ]; then set_to "$1" "$2"; else put "$1" ''; fi; }

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
put RECONCILER_PASSWORD "$(secret)"
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
# The backup role's own credential. It may read every table and write nothing,
# which is what a logical backup needs and why it is not a second copy of the
# application's access -- see deploy/seed.sh.
#
# BACKUP_ENCRYPTION_KEY is deliberately NOT here. A key kept in the file that
# sits beside the ciphertext, and that Docker loads into containers, protects
# nothing; backup.sh reads it from a file outside this directory and refuses to
# run if it finds the key in .env. docs/BACKUP.md has the procedure.
put BACKUP_DB_PASSWORD "$(secret)"
# Where backup.sh writes. A host directory, not a Docker volume: a backup that
# lives in the same volume as the database it is a backup of is not a backup.
# It is outside this directory as well, which the deploy workflow overwrites on
# every roll. Written once, so an operator who moves it keeps it moved.
put BACKUP_DIR "${BACKUP_DIR:-$HOME/moneyverse-backups/${STACK:-wdmv}}"

# Where the photo object store lives on the host.
#
# A directory rather than a docker volume, because a volume goes wherever
# /var/lib/docker is, and that is the disk the operating system is on. Images
# are the one thing here that grows without bound and the one thing no
# migration can regenerate.
#
# The path is the specification's: 운영 데이터는 별도 SSD `/data/wtrdd/moneyverse/`,
# 사진은 `/data/wtrdd/moneyverse/photos/`. It has never been honoured -- until
# now the bytes were in a named volume on the root disk, which the spec-v2
# audit flagged and nothing acted on.
#
# One deviation: the stack is appended, because two deployments share this
# host and a shared directory would mean the test server serving production's
# photos the first time a storage key collided. A host that wants the path
# exactly as written can set PHOTO_STORAGE_HOST_DIR before deploying; roll.sh
# reports which filesystem it resolved to either way.
put PHOTO_STORAGE_HOST_DIR "${PHOTO_STORAGE_HOST_DIR:-/data/wtrdd/moneyverse/photos/${STACK:-wdmv}}"
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
oauth_names="DISCORD_CLIENT_ID DISCORD_CLIENT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET"

adopted_already=true
for name in $oauth_names; do
  has_value "$name" || adopted_already=false
done

if [ -n "$adopt_from" ] && [ "$adopted_already" = true ]; then
  # Adoption is a once-per-host act: the credentials are in .env and every
  # later run skips them anyway. Refusing to roll because the container they
  # came from has since been removed would make a deployment depend forever on
  # a container nobody needs -- and that is not hypothetical, it is what
  # stopped both stacks from rolling until this was written.
  echo "OAuth client credentials already present; ADOPT_FROM not needed"
  adopt_from=""
fi

if [ -n "$adopt_from" ]; then
  if ! docker inspect "$adopt_from" >/dev/null 2>&1; then
    # Still fatal, and deliberately so. The loop below writes these keys empty
    # when it cannot fill them, and the API answers by disabling both login
    # providers without saying why. A deployment that cannot log anybody in
    # must fail loudly here rather than come up looking healthy.
    echo "ADOPT_FROM names no container on this host: $adopt_from" >&2
    echo "and .env is missing at least one OAuth client credential." >&2
    echo "Put DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, GOOGLE_CLIENT_ID and" >&2
    echo "GOOGLE_CLIENT_SECRET into $PWD/.env, or point ADOPT_FROM at a" >&2
    echo "container that has them, then roll again." >&2
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

# The Discord bot.
#
# Deliberately NOT part of the ADOPT_FROM loop above. The OAuth client
# credentials are shared by both deployments because both log a member in to
# the same Discord application; a bot token is the opposite -- test and
# production must run different bots, or the test stack announces into the
# production guild. Adopting one from a container on this host is precisely
# the accident to avoid, so the token arrives from the GitHub environment this
# deploy was run against and the API refuses it if its application id is not
# DISCORD_APPLICATION_ID.
supplied DISCORD_APPLICATION_ID "${DISCORD_APPLICATION_ID:-}"
supplied DISCORD_BOT_TOKEN "${DISCORD_BOT_TOKEN:-}"
supplied DISCORD_INTERACTIONS_ENABLED "${DISCORD_INTERACTIONS_ENABLED:-}"
supplied DISCORD_INTERACTIONS_PUBLIC_KEY "${DISCORD_INTERACTIONS_PUBLIC_KEY:-}"
supplied DISCORD_INTERACTIONS_GUILD_ID "${DISCORD_INTERACTIONS_GUILD_ID:-}"
supplied DISCORD_INTERACTIONS_ROLE_IDS "${DISCORD_INTERACTIONS_ROLE_IDS:-}"
supplied DISCORD_OUTBOX_ENABLED "${DISCORD_OUTBOX_ENABLED:-}"
supplied DISCORD_OUTBOX_CHANNEL_ID "${DISCORD_OUTBOX_CHANNEL_ID:-}"

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
