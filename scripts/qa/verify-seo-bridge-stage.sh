#!/usr/bin/env bash
# Create isolated Nginx route test without touching live gateway or external search engines.
set -euo pipefail
ROOT=$(cd -- "$(dirname -- "$0")/../.." && pwd)
TMP=$(mktemp -d /tmp/moneyverse-seo-stage.XXXXXX)
PORT=${SEO_STAGE_PORT:-4401}
cleanup() { nginx -p "$TMP" -c nginx.conf -s quit >/dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT
mkdir -p "$TMP/logs"
cat > "$TMP/nginx.conf" <<EOF_NGINX
daemon on;
worker_processes 1;
pid $TMP/nginx.pid;
error_log $TMP/logs/error.log warn;
events { worker_connections 128; }
http {
    access_log off;
    upstream prod_node { server 127.0.0.1:4500; }
    upstream prod_frontend { server 127.0.0.1:4501; }
    server {
        listen 127.0.0.1:$PORT;
        server_name 127.0.0.1;
        include $ROOT/ops/nginx/seo-node-bridge.conf;
        # Simulates the production broad regex that must NOT win SEO requests.
        location ~ ^/(api/v1/seo|api/seo|seo) { return 418; }
        location / { return 404; }
    }
}
EOF_NGINX
nginx -t -p "$TMP" -c nginx.conf
nginx -p "$TMP" -c nginx.conf
SEO_GATEWAY_BASE="http://127.0.0.1:$PORT" python3 "$ROOT/scripts/qa/verify-seo-gateway.py"
python3 - "$PORT" <<'PY'
import hashlib
import sys
from urllib.request import Request, urlopen
port = int(sys.argv[1])
for path in ('/api/seo/status', '/seo/status'):
    with urlopen(f'http://127.0.0.1:{port}{path}', timeout=5) as r:
        assert r.status == 200 and b'totalHits24h' in r.read(), path
with urlopen(f'http://127.0.0.1:{port}/.well-known/indexnow.key', timeout=5) as r:
    observed = r.read()
with urlopen(Request('http://127.0.0.1:4501/.well-known/indexnow.key', headers={'Host':'easy-scraping.com','X-Forwarded-Proto':'https'}), timeout=5) as r:
    expected = r.read()
assert observed and observed == expected, 'IndexNow key mismatch'
print('PASS=legacy aliases, canonical public IndexNow key parity')
PY
