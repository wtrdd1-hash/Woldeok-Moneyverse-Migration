#!/usr/bin/env bash
# Rolls the deployment on the host. Run there, not on the CI runner.
#
# A file rather than a here-doc inside the workflow: an unquoted here-doc is
# expanded by the runner's shell before it reaches the host, which silently
# rewrote this script and produced errors describing neither machine.
#
# Pulls images built and tagged by Actions. The tag is the commit, and the
# resolved reference is recorded in .env — which is what makes a rollback an
# edited line and `docker compose up -d` rather than a rebuild.
set -euo pipefail

# The deployment directory is named, not inferred from the script's own
# location: a copy run from anywhere else would otherwise operate on whatever
# happened to be beside it.
cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"

: "${BACKEND_IMAGE:?BACKEND_IMAGE is required}"
: "${FRONTEND_IMAGE:?FRONTEND_IMAGE is required}"
: "${GHCR_USER:?GHCR_USER is required}"
: "${GHCR_TOKEN:?GHCR_TOKEN is required — the host cannot use the workflow token}"

bash ./bootstrap-env.sh

# An explicitly empty workflow input remains exported in this parent shell
# and takes precedence over the non-empty value bootstrap-env just persisted
# in .env. Drop only empty bot inputs so Compose can read the adopted values.
[ -n "${DISCORD_APPLICATION_ID:-}" ] || unset DISCORD_APPLICATION_ID
[ -n "${DISCORD_BOT_TOKEN:-}" ] || unset DISCORD_BOT_TOKEN

# Recorded rather than exported for one command, so a later `docker compose
# ps`, `logs` or `up` resolves the same images an operator is looking at.
record() {
  sed -i "/^$1=/d" .env
  printf '%s=%s\n' "$1" "$2" >> .env
}
record BACKEND_IMAGE "$BACKEND_IMAGE"
record FRONTEND_IMAGE "$FRONTEND_IMAGE"
# The stack name prefixes every container, names the compose project its
# volumes belong to, and is the alias the Cloudflare tunnel resolves.
# Recorded so a later `docker compose ps` or `logs` run in this directory
# addresses the same stack the deploy did.
record STACK "${STACK:-wdmv}"

# The host is outside GitHub, so it logs in with its own read:packages token.
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

export STACK="${STACK:-wdmv}"

# A persisted PostgreSQL volume does not change role passwords when the
# container's environment changes. If .env was replaced or repaired, the db
# container can therefore be healthy while every TCP login used by migrate,
# seed and backup is refused. Detect that exact drift before the mandatory
# backup and reconcile only the two bootstrap roles through PostgreSQL's local
# Unix socket. That socket is reachable only inside the db container and the
# official image initialises local connections as trusted for its postgres OS
# user; no old database password or network bypass is involved.
reconcile_bootstrap_credentials() {
  local migrator_password app_password
  migrator_password="$(grep -E '^POSTGRES_PASSWORD=' .env | tail -1 | cut -d= -f2-)"
  app_password="$(grep -E '^APP_DB_PASSWORD=' .env | tail -1 | cut -d= -f2-)"
  [ -n "$migrator_password" ] && [ -n "$app_password" ] || {
    echo "cannot reconcile database credentials: .env is missing a bootstrap password" >&2
    return 1
  }

  # Passwords travel on stdin, not in argv or output. The shell consumes the
  # first two lines; psql receives only the fixed program below and imports the
  # values from its private process environment.
  {
    printf '%s\n%s\n' "$migrator_password" "$app_password"
    cat <<'SQL'
\getenv migrator_password MONEYVERSE_MIGRATOR_PASSWORD
\getenv app_password MONEYVERSE_APP_PASSWORD
ALTER ROLE moneyverse_migrator LOGIN PASSWORD :'migrator_password';
ALTER ROLE moneyverse_app LOGIN PASSWORD :'app_password';
SQL
  } | docker compose exec -T --user postgres db sh -eu -c '
    IFS= read -r MONEYVERSE_MIGRATOR_PASSWORD
    IFS= read -r MONEYVERSE_APP_PASSWORD
    export MONEYVERSE_MIGRATOR_PASSWORD MONEYVERSE_APP_PASSWORD
    exec psql -X -v ON_ERROR_STOP=1 -U moneyverse_migrator -d "$POSTGRES_DB"
  ' >/dev/null
  echo "database bootstrap credentials reconciled"
}

# The photo store's directory on the second disk, made and given away before
# anything mounts it.
#
# Docker creates a bind-mount path that does not exist, as root, and the
# backend runs as uid 100 -- so without this the first upload fails with
# EACCES on a directory nobody can see is wrong. It is done by a container
# because the deploy user cannot write under /data and has no reason to be
# able to. Idempotent: chown and chmod on a directory that is already right
# change nothing.
photo_dir="$(grep -E '^PHOTO_STORAGE_HOST_DIR=' .env | tail -1 | cut -d= -f2-)"
if [ -n "$photo_dir" ]; then
  docker run --rm -v "$photo_dir:/store" alpine:3.20 \
    sh -c 'chown 100:101 /store && chmod 700 /store'
  echo "photo store: $photo_dir on $(df -P "$photo_dir" 2>/dev/null | awk 'NR==2 {print $1, $4" free"}')"
fi

# A backup BEFORE the roll, not after it. `docker compose up` runs the
# migrations, and a migration does not roll back -- so a dump taken at the end
# of this script is a dump of the state the migration produced, which is not
# the state anybody would want to return to. The check that used to be at the
# bottom said a true thing at a useless moment.
#
# A host with no database has nothing to dump, and a first deploy must not
# fail for the absence of a backup that could not have existed.
if [ -n "$(docker compose ps -q db 2>/dev/null || true)" ]; then
  # Probe over the same TCP path migrate uses. A local-socket repair is only
  # attempted when that credential is actually stale.
  if ! docker compose run --rm -T --entrypoint psql migrate \
    -X -qAt -v ON_ERROR_STOP=1 -c 'SELECT 1' >/dev/null 2>&1; then
    echo "database migrator credential drift detected"
    reconcile_bootstrap_credentials
  fi

  # The dump runs as `moneyverse_backup`, whose login `seed` grants -- and
  # `seed` runs after `migrate`, which is the thing this dump has to precede.
  # So that one grant is done first, on its own. It is idempotent, and a
  # failure here is left to speak through the dump rather than raised twice.
  docker compose run --rm -T backup-credential || true

  if bash ./backup.sh run; then
    echo "backed up before the roll"
  elif [ "${REQUIRE_BACKUP:-0}" = "1" ]; then
    echo "refusing to roll: this carries migrations and there is nothing to return to" >&2
    echo "take a backup by hand, or run ./backup.sh init-key if this host has no key" >&2
    exit 1
  else
    echo "warning: rolling without a backup, and migrations do not roll back" >&2
  fi
else
  echo "no database container yet, so there is nothing to back up"
fi

docker compose pull backend frontend
# --wait is the gate: a rollout that never becomes healthy fails here rather
# than being reported as a success.
docker compose up -d --wait --wait-timeout 300

# A deploy is the one reliable moment at which this host is known to have the
# current backup script. Keep the periodic schedule in step with it; the two
# stacks use different minute offsets so their full dumps never compete.
bash ./install-backup-cron.sh

# OAuth display names are public labels. Repair ciphertext left by historical
# releases from Discord without exposing the bot token or names in CI output.
bash ./recover-display-names.sh
bash ./recover-display-names-from-backup.sh

# The edge's configuration is a bind mount, so compose does not recreate the
# container when the file changes and a release that edits it would otherwise
# take effect at the next unrelated restart. A reload is also what re-reads
# the upstream addresses, which is the belt to the config's braces.
docker compose exec -T edge nginx -t \
  && docker compose exec -T edge nginx -s reload \
  || docker compose restart edge

port="$(grep -E '^EDGE_PORT=' .env | cut -d= -f2)"
port="${port:-3021}"
app_base_url="${APP_BASE_URL:-$(grep -E '^APP_BASE_URL=' .env | tail -1 | cut -d= -f2-)}"
[ -n "$app_base_url" ] || { echo 'APP_BASE_URL is required for the edge smoke test' >&2; exit 1; }
smoke_host="${app_base_url#http://}"
smoke_host="${smoke_host#https://}"
smoke_host="${smoke_host%%/*}"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 -H "Host: ${smoke_host}" "http://127.0.0.1:${port}/" || true)"
if [ "$code" != "200" ]; then
  echo "the site answered ${code:-nothing} through the edge for Host ${smoke_host}" >&2
  docker compose logs --tail 50 edge frontend backend >&2
  exit 1
fi

echo "deployment healthy on port ${port}"

# Reads the backup back after the roll. Taking one and never opening it is how
# a host ends up holding a fortnight of files that do not decrypt; this is the
# cheap half of the rehearsal in docs/BACKUP.md, and it never fails the deploy
# because by now the roll has already happened.
if ! bash ./backup.sh verify; then
  echo "warning: this host holds no backup that reads back" >&2
fi

docker compose ps
