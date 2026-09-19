#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cat > "$TMP/good.conf" <<'CONF'
server {
 listen 80;
 server_name test.easy-scraping.com;
 location = /health { proxy_pass http://127.0.0.1:3100/health; }
 location = /api/version { proxy_pass http://127.0.0.1:3100/api/version; }
 location / { proxy_pass http://127.0.0.1:3101; }
}
server {
 listen 80 default_server;
 server_name _;
 location = /health { proxy_pass http://127.0.0.1:3000/health; }
 location = /api/version { proxy_pass http://127.0.0.1:3000/api/version; }
 location / { proxy_pass http://127.0.0.1:3001; }
}
CONF
"$DIR/check-moneyverse-host-routing.sh" "$TMP/good.conf"
sed "s/127.0.0.1:3101/127.0.0.1:3119/" "$TMP/good.conf" > "$TMP/bad.conf"
if "$DIR/check-moneyverse-host-routing.sh" "$TMP/bad.conf" >/dev/null 2>&1; then echo "expected transient Test UI port rejection" >&2; exit 1; fi
printf "check-moneyverse-host-routing: tests passed\n"
