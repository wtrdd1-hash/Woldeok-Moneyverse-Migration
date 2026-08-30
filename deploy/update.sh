#!/usr/bin/env bash
# Moves the host onto whatever is currently tagged `latest` in the registry.
#
# This is the short path, for when a deploy has already published new images
# and nothing outside them changed. It pulls and restarts; it does not ship
# files. `compose.yml`, `edge/default.conf` and the SQL under `migrations/`
# are whatever the last workflow run left on this host.
#
# So: if the release adds a database migration, run the workflow instead.
# This script would start a backend that expects a column the database does
# not have. The script prints which migration the host currently has so the
# difference is visible rather than assumed.
set -euo pipefail

cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"

# The image tag carries the environment, because the frontend has the public
# origin compiled into it and one tag cannot mean both sites. Which one this
# directory is was recorded by roll.sh.
stack="$(grep -E '^STACK=' .env | cut -d= -f2)"
stack="${stack:-wdmv}"
case "${CHANNEL:-${stack}}" in
  wdmvp | production) channel=production ;;
  *) channel=test ;;
esac

prefix=ghcr.io/wtrdd1-hash/wdmv
record() {
  sed -i "/^$1=/d" .env
  printf '%s=%s\n' "$1" "$2" >> .env
}
record BACKEND_IMAGE "${prefix}/backend:latest-${channel}"
record FRONTEND_IMAGE "${prefix}/frontend:latest-${channel}"
export STACK="$stack"

# Optional: `docker login` already stores a credential for anyone who has run
# it once. Pass GHCR_USER and GHCR_TOKEN to log in for this run only.
if [ -n "${GHCR_TOKEN:-}" ]; then
  : "${GHCR_USER:?GHCR_USER is required alongside GHCR_TOKEN}"
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
  trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT
fi

docker compose pull backend frontend
# --wait is the gate: a rollout that never becomes healthy fails here rather
# than being reported as a success.
docker compose up -d --wait --wait-timeout 300

port="$(grep -E '^EDGE_PORT=' .env | cut -d= -f2)"
port="${port:-3021}"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "http://127.0.0.1:${port}/" || true)"
if [ "$code" != "200" ]; then
  echo "the site answered ${code:-nothing} through the edge" >&2
  docker compose logs --tail 50 edge frontend backend >&2
  exit 1
fi

echo "running ${channel} on :latest-${channel}, healthy on port ${port}"
echo "newest migration on this host: $(ls migrations/*.sql | tail -1)"
docker compose ps
