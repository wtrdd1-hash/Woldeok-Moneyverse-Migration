#!/usr/bin/env bash
set -euo pipefail
# Pin the audited frontend artifact: do not follow production-current during another agent's promotion.
RELEASE_FRONTEND=/srv/moneyverse-data/releases/prod-v2026.11.14.1217-43ab5a5110/frontend
STANDALONE="$RELEASE_FRONTEND/.next/standalone"
NEXT_DIR=$(find "$STANDALONE/node_modules/.pnpm" -maxdepth 1 -type d -name 'next@*' -print -quit)
if [[ -z "$NEXT_DIR" || ! -s "$NEXT_DIR/node_modules/next/package.json" || ! -s "$STANDALONE/frontend/server.js" ]]; then
  echo 'P0 frontend recovery artifact validation failed' >&2
  exit 1
fi
export NODE_PATH="$NEXT_DIR/node_modules"
export HOSTNAME=127.0.0.1
export PORT=4524
export NODE_ENV=production
cd "$STANDALONE/frontend"
exec /usr/bin/node "$STANDALONE/frontend/server.js"
