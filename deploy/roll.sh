#!/usr/bin/env bash
# Rolls the deployment on the host. Run there, not on the CI runner.
#
# A file rather than a here-doc inside the workflow: an unquoted here-doc is
# expanded by the runner's shell before it reaches the host, which silently
# rewrote this script and produced errors describing neither machine.
#
# Builds on this host. The alternative was publishing to a registry, which
# buys a SHA-tagged image and a one-line rollback at the cost of a pull
# credential the host would have to hold. There is no deployment history to
# roll back to yet, and a warm rebuild here takes about a second.
set -euo pipefail

# The deployment directory is named, not inferred from the script's own
# location: a copy run from anywhere else would otherwise operate on whatever
# happened to be beside it.
cd "${DEPLOY_DIR:-$HOME/moneyverse-migration}"

if [ -f src.tar.gz ]; then
  # Replaced wholesale rather than merged: a file deleted upstream must not
  # survive here and end up in the image.
  rm -rf src
  mkdir -p src
  tar xzf src.tar.gz -C src
  rm -f src.tar.gz
fi

[ -d src ] || { echo 'no source tree to build from' >&2; exit 1; }

bash ./bootstrap-env.sh

docker compose build backend frontend
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
