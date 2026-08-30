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

# A backup BEFORE the roll, not after it. `docker compose up` runs the
# migrations, and a migration does not roll back -- so a dump taken at the end
# of this script is a dump of the state the migration produced, which is not
# the state anybody would want to return to. The check that used to be at the
# bottom said a true thing at a useless moment.
#
# A host with no database has nothing to dump, and a first deploy must not
# fail for the absence of a backup that could not have existed.
if [ -n "$(docker compose ps -q db 2>/dev/null || true)" ]; then
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

# The edge's configuration is a bind mount, so compose does not recreate the
# container when the file changes and a release that edits it would otherwise
# take effect at the next unrelated restart. A reload is also what re-reads
# the upstream addresses, which is the belt to the config's braces.
docker compose exec -T edge nginx -t \
  && docker compose exec -T edge nginx -s reload \
  || docker compose restart edge

port="$(grep -E '^EDGE_PORT=' .env | cut -d= -f2)"
port="${port:-3021}"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "http://127.0.0.1:${port}/" || true)"
if [ "$code" != "200" ]; then
  echo "the site answered ${code:-nothing} through the edge" >&2
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
