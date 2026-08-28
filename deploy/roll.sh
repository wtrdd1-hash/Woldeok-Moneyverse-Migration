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

echo "deployment healthy on port ${port}"
docker compose ps
