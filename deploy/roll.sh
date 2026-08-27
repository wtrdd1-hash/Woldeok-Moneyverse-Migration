#!/usr/bin/env bash
# Rolls the deployment on the host. Run there, not on the CI runner.
#
# A file rather than a here-doc inside the workflow: an unquoted here-doc is
# expanded by the runner's shell before it reaches the host, which silently
# rewrote this script and produced errors describing neither machine.
#
# Reads BACKEND_IMAGE, GHCR_USER and GHCR_TOKEN from the environment.
set -euo pipefail

# The deployment directory is named, not inferred from the script's own
# location: a copy run from anywhere else would otherwise operate on whatever
# happened to be beside it.
cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"

: "${BACKEND_IMAGE:?BACKEND_IMAGE is required}"
: "${GHCR_USER:?GHCR_USER is required}"
: "${GHCR_TOKEN:?GHCR_TOKEN is required — the host cannot use the workflow token}"

# The host is outside GitHub, so it logs in with its own read:packages token.
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

# Recorded rather than exported for one command, so a later `docker compose
# ps` or `logs` resolves the same image an operator is looking at.
sed -i '/^BACKEND_IMAGE=/d' .env
printf 'BACKEND_IMAGE=%s\n' "$BACKEND_IMAGE" >> .env

docker compose pull backend
# --wait is the gate: a rollout that never becomes healthy fails here rather
# than being reported as a success.
docker compose up -d --wait --wait-timeout 180

port="$(grep -E '^BACKEND_PORT=' .env | cut -d= -f2)"
port="${port:-3020}"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://127.0.0.1:${port}/health" || true)"
if [ "$code" != "200" ]; then
  echo "health check answered ${code:-nothing}" >&2
  docker compose logs --tail 50 backend >&2
  exit 1
fi

echo "deployment healthy on port ${port}"
docker compose ps
