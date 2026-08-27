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

# roll.sh records the exact commit it deployed. Removing those two lines lets
# compose.yml's own defaults apply again, and those name `:latest`.
sed -i '/^BACKEND_IMAGE=/d;/^FRONTEND_IMAGE=/d' .env

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

echo "running on :latest, healthy on port ${port}"
echo "newest migration on this host: $(ls migrations/*.sql | tail -1)"
docker compose ps
