#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:?usage: host-blue-green-promote.sh test|production RELEASE_DIR SHA}"
RELEASE_DIR="${2:?usage: host-blue-green-promote.sh test|production RELEASE_DIR SHA}"
SHA="${3:?usage: host-blue-green-promote.sh test|production RELEASE_DIR SHA}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_CONFIG="${MONEYVERSE_NGINX_CONFIG:-/etc/nginx/sites-enabled/moneyverse}"
RELEASES_ROOT="${MONEYVERSE_RELEASES_ROOT:-/srv/moneyverse-data/releases}"

fail() { printf 'blue-green: %s\n' "$*" >&2; exit 1; }
log() { printf 'blue-green: %s\n' "$*"; }
[[ "$(id -u)" -eq 0 ]] || fail 'must run as root'
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || fail 'SHA must be a 40-character lowercase Git commit id'
command -v nginx >/dev/null || fail 'nginx is required'
command -v systemctl >/dev/null || fail 'systemctl is required'
command -v curl >/dev/null || fail 'curl is required'

ROOT_REAL="$(realpath -e "$RELEASES_ROOT")"
RELEASE_REAL="$(realpath -e "$RELEASE_DIR")"
case "$RELEASE_REAL/" in "$ROOT_REAL/"*) ;; *) fail "release must be below $ROOT_REAL" ;; esac
[[ -f "$RELEASE_REAL/backend/dist/main.js" ]] || fail 'backend build is missing'
[[ -d "$RELEASE_REAL/frontend/.next" ]] || fail 'frontend build is missing'

case "$ENVIRONMENT" in
  test)
    SERVER_NAME='test.easy-scraping.com'
    PRIMARY_BACKEND=3100
    PRIMARY_FRONTEND=3101
    CANARY_BACKEND=3102
    CANARY_FRONTEND=3103
    CURRENT_LINK="$RELEASES_ROOT/test-current"
    BACKEND_UNIT='test-main-backend.service'
    FRONTEND_UNIT='test-main-frontend.service'
    STABLE_BACKEND_ENV='/etc/moneyverse/test-backend.env'
    STABLE_FRONTEND_ENV='/etc/moneyverse/test-frontend.env'
    RELEASE_BACKEND_ENV='/etc/moneyverse/test-backend-release.env'
    RELEASE_FRONTEND_ENV='/etc/moneyverse/test-frontend-release.env'
    RELEASE_WRITER="$SCRIPT_DIR/write-test-release-env.sh"
    ;;
  production)
    SERVER_NAME='easy-scraping.com'
    PRIMARY_BACKEND=3000
    PRIMARY_FRONTEND=3001
    CANARY_BACKEND=3002
    CANARY_FRONTEND=3003
    CURRENT_LINK="$RELEASES_ROOT/production-current"
    BACKEND_UNIT='moneyverse-backend.service'
    FRONTEND_UNIT='moneyverse-frontend.service'
    STABLE_BACKEND_ENV='/etc/moneyverse/backend-production.env'
    STABLE_FRONTEND_ENV='/etc/moneyverse/frontend-production.env'
    RELEASE_BACKEND_ENV='/etc/moneyverse/backend-release.env'
    RELEASE_FRONTEND_ENV='/etc/moneyverse/frontend-release.env'
    RELEASE_WRITER="$SCRIPT_DIR/write-production-release-env.sh"
    ;;
  *) fail 'environment must be test or production' ;;
esac

for file in "$STABLE_BACKEND_ENV" "$STABLE_FRONTEND_ENV" "$RELEASE_BACKEND_ENV" "$RELEASE_FRONTEND_ENV" "$NGINX_CONFIG"; do
  [[ -f "$file" ]] || fail "required file is missing: $file"
done

"$SCRIPT_DIR/prepare-frontend-runtime-cache.sh" "$RELEASE_REAL" debian debian

RUN_DIR="/run/moneyverse-blue-green-$ENVIRONMENT"
install -d -m 0700 "$RUN_DIR"
TMP_BACKEND_ENV="$RUN_DIR/backend-release.env"
TMP_FRONTEND_ENV="$RUN_DIR/frontend-release.env"
cp "$RELEASE_BACKEND_ENV" "$TMP_BACKEND_ENV"
cp "$RELEASE_FRONTEND_ENV" "$TMP_FRONTEND_ENV"
sed -i -E "s/^PORT=.*/PORT=$CANARY_BACKEND/; s/^BUILD_ID=.*/BUILD_ID=$SHA/; s#^API_ORIGIN=.*#API_ORIGIN=http://127.0.0.1:$CANARY_BACKEND#" "$TMP_BACKEND_ENV"
sed -i -E "s/^BUILD_ID=.*/BUILD_ID=$SHA/; s#^API_ORIGIN=.*#API_ORIGIN=http://127.0.0.1:$CANARY_BACKEND#" "$TMP_FRONTEND_ENV"
if ! grep -q '^BUILD_ID=' "$TMP_BACKEND_ENV"; then echo "BUILD_ID=$SHA" >>"$TMP_BACKEND_ENV"; fi
if ! grep -q '^BUILD_ID=' "$TMP_FRONTEND_ENV"; then echo "BUILD_ID=$SHA" >>"$TMP_FRONTEND_ENV"; fi
if ! grep -q '^API_ORIGIN=' "$TMP_FRONTEND_ENV"; then echo "API_ORIGIN=http://127.0.0.1:$CANARY_BACKEND" >>"$TMP_FRONTEND_ENV"; fi
chmod 0600 "$TMP_BACKEND_ENV" "$TMP_FRONTEND_ENV"

CANARY_BACKEND_UNIT="moneyverse-${ENVIRONMENT}-canary-backend.service"
CANARY_FRONTEND_UNIT="moneyverse-${ENVIRONMENT}-canary-frontend.service"
BACKEND_UNIT_FILE="/run/systemd/system/$CANARY_BACKEND_UNIT"
FRONTEND_UNIT_FILE="/run/systemd/system/$CANARY_FRONTEND_UNIT"

cat >"$BACKEND_UNIT_FILE" <<UNIT
[Unit]
Description=Moneyverse $ENVIRONMENT backend canary
After=network.target
[Service]
Type=simple
User=debian
WorkingDirectory=$RELEASE_REAL/backend
EnvironmentFile=$STABLE_BACKEND_ENV
EnvironmentFile=$TMP_BACKEND_ENV
Environment=PORT=$CANARY_BACKEND
Environment=HOST=127.0.0.1
Environment=BUILD_ID=$SHA
ExecStart=/usr/bin/node dist/main.js
Restart=no
UNIT

cat >"$FRONTEND_UNIT_FILE" <<UNIT
[Unit]
Description=Moneyverse $ENVIRONMENT frontend canary
After=$CANARY_BACKEND_UNIT
[Service]
Type=simple
User=debian
WorkingDirectory=$RELEASE_REAL/frontend
EnvironmentFile=$STABLE_FRONTEND_ENV
EnvironmentFile=$TMP_FRONTEND_ENV
Environment=API_ORIGIN=http://127.0.0.1:$CANARY_BACKEND
Environment=BUILD_ID=$SHA
ExecStart=/usr/bin/pnpm start -p $CANARY_FRONTEND
Restart=no
UNIT

wait_http() {
  local url="$1" attempts="${2:-60}"
  local i
  for ((i=1; i<=attempts; i++)); do
    if curl -fsS --max-time 2 "$url" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

assert_version() {
  local url="$1"
  curl -fsS --max-time 4 "$url" | grep -Fq "$SHA" || fail "wrong release identity at $url"
}

edge_mode='primary'
success=0
cleanup() {
  local rc=$?
  if [[ "$success" -eq 1 ]]; then
    systemctl stop "$CANARY_FRONTEND_UNIT" "$CANARY_BACKEND_UNIT" >/dev/null 2>&1 || true
    rm -f "$FRONTEND_UNIT_FILE" "$BACKEND_UNIT_FILE"
    systemctl daemon-reload >/dev/null 2>&1 || true
    rm -rf "$RUN_DIR"
    return "$rc"
  fi
  log "promotion failed; preserving availability before cleanup"
  if [[ "$edge_mode" == 'canary' ]]; then
    if wait_http "http://127.0.0.1:$PRIMARY_BACKEND/health" 3 && wait_http "http://127.0.0.1:$PRIMARY_FRONTEND/frontend-version" 3; then
      "$SCRIPT_DIR/switch-nginx-server-ports.py" "$NGINX_CONFIG" "$SERVER_NAME" "$CANARY_BACKEND" "$PRIMARY_BACKEND" "$CANARY_FRONTEND" "$PRIMARY_FRONTEND" || true
      nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
      systemctl stop "$CANARY_FRONTEND_UNIT" "$CANARY_BACKEND_UNIT" >/dev/null 2>&1 || true
    else
      log 'primary is not healthy; leaving canary and edge routing in place for availability'
      return "$rc"
    fi
  else
    systemctl stop "$CANARY_FRONTEND_UNIT" "$CANARY_BACKEND_UNIT" >/dev/null 2>&1 || true
  fi
  rm -f "$FRONTEND_UNIT_FILE" "$BACKEND_UNIT_FILE"
  systemctl daemon-reload >/dev/null 2>&1 || true
  rm -rf "$RUN_DIR"
  return "$rc"
}
trap cleanup EXIT

systemctl stop "$CANARY_FRONTEND_UNIT" "$CANARY_BACKEND_UNIT" >/dev/null 2>&1 || true
systemctl daemon-reload
systemctl start "$CANARY_BACKEND_UNIT"
wait_http "http://127.0.0.1:$CANARY_BACKEND/health" || fail 'canary backend did not become healthy'
assert_version "http://127.0.0.1:$CANARY_BACKEND/api/version"
systemctl start "$CANARY_FRONTEND_UNIT"
wait_http "http://127.0.0.1:$CANARY_FRONTEND/frontend-version" || fail 'canary frontend did not become healthy'
assert_version "http://127.0.0.1:$CANARY_FRONTEND/frontend-version"
log "canary healthy backend=$CANARY_BACKEND frontend=$CANARY_FRONTEND"

NGINX_BACKUP="$NGINX_CONFIG.before-blue-green-$ENVIRONMENT-$(date +%Y%m%d%H%M%S)"
cp -a "$NGINX_CONFIG" "$NGINX_BACKUP"
"$SCRIPT_DIR/switch-nginx-server-ports.py" "$NGINX_CONFIG" "$SERVER_NAME" "$PRIMARY_BACKEND" "$CANARY_BACKEND" "$PRIMARY_FRONTEND" "$CANARY_FRONTEND"
nginx -t
systemctl reload nginx
edge_mode='canary'
assert_version "http://127.0.0.1:$CANARY_BACKEND/api/version"
curl -fsS --max-time 5 -H "Host: $SERVER_NAME" http://127.0.0.1/ >/dev/null
log 'edge switched to canary without stopping primary'

ln -sfn "$RELEASE_REAL" "$CURRENT_LINK.next"
mv -Tf "$CURRENT_LINK.next" "$CURRENT_LINK"
"$RELEASE_WRITER" "$SHA" /etc/moneyverse
systemctl daemon-reload
systemctl restart "$BACKEND_UNIT"
wait_http "http://127.0.0.1:$PRIMARY_BACKEND/health" || fail 'primary backend did not recover'
assert_version "http://127.0.0.1:$PRIMARY_BACKEND/api/version"
systemctl restart "$FRONTEND_UNIT"
wait_http "http://127.0.0.1:$PRIMARY_FRONTEND/frontend-version" || fail 'primary frontend did not recover'
assert_version "http://127.0.0.1:$PRIMARY_FRONTEND/frontend-version"
log 'primary services restarted behind canary and are healthy'

"$SCRIPT_DIR/switch-nginx-server-ports.py" "$NGINX_CONFIG" "$SERVER_NAME" "$CANARY_BACKEND" "$PRIMARY_BACKEND" "$CANARY_FRONTEND" "$PRIMARY_FRONTEND"
nginx -t
systemctl reload nginx
edge_mode='primary'
curl -fsS --max-time 5 -H "Host: $SERVER_NAME" http://127.0.0.1/ >/dev/null
curl -fsS --max-time 5 -H "Host: $SERVER_NAME" http://127.0.0.1/api/version | grep -Fq "$SHA" || fail 'edge version does not match promoted SHA'

success=1
log "OK environment=$ENVIRONMENT sha=$SHA release=$RELEASE_REAL backup=$NGINX_BACKUP"
