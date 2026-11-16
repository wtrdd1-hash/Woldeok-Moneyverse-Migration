#!/usr/bin/env bash
# Nginx auth_request smoke against isolated mock identity backend; actual Node
# role denial is checked independently by verify-seo-bridge-stage.sh.
set -euo pipefail
ROOT=$(cd -- "$(dirname -- "$0")/../.." && pwd)
TMP=$(mktemp -d /tmp/moneyverse-seo-edge.XXXXXX)
PORT=${SEO_EDGE_STAGE_PORT:-4403}
cleanup() {
  nginx -p "$TMP" -c nginx.conf -s quit >/dev/null 2>&1 || true
  if [ -n "${MOCK_PID:-}" ]; then kill "$MOCK_PID" 2>/dev/null || true; wait "$MOCK_PID" 2>/dev/null || true; fi
  rm -rf "$TMP"
}
trap cleanup EXIT
cat > "$TMP/mock.py" <<'EOF_PY'
from http.server import BaseHTTPRequestHandler, HTTPServer
class Mock(BaseHTTPRequestHandler):
    def do_GET(self): self.handle_req()
    def do_POST(self): self.handle_req()
    def log_message(self, *_): pass
    def handle_req(self):
        if self.path == '/api/admin/seo/status':
            status = 503 if 'stage_unavailable=1' in self.headers.get('cookie', '') else (200 if 'stage_operator=1' in self.headers.get('cookie', '') else 401)
        else:
            status = 200
        self.send_response(status)
        self.end_headers()
        self.wfile.write(b'{}')
HTTPServer(('127.0.0.1', 4512), Mock).serve_forever()
EOF_PY
python3 "$TMP/mock.py" & MOCK_PID=$!
cat > "$TMP/nginx.conf" <<EOF_NGINX
daemon on;
worker_processes 1;
pid $TMP/nginx.pid;
error_log $TMP/error.log warn;
events { worker_connections 128; }
http {
    access_log off;
    upstream prod_frontend { server 127.0.0.1:4512; }
    server {
        listen 127.0.0.1:$PORT;
        server_name _;
        include $ROOT/ops/nginx/seo-edge-auth.conf;
        location / { return 404; }
    }
}
EOF_NGINX
nginx -t -p "$TMP" -c nginx.conf
nginx -p "$TMP" -c nginx.conf
python3 - "$PORT" <<'PY'
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen
base='http://127.0.0.1:'+sys.argv[1]
for path in ('/admin/seo', '/admin/seo-audit', '/api/admin/seo-audit'):
    for method in ('GET', 'POST'):
        for cookie, expected in (('',401), ('stage_operator=1',200), ('stage_unavailable=1',503)):
            req=Request(base+path, method=method, headers={'Cookie':cookie, 'Host':'easy-scraping.com'})
            try:
                with urlopen(req,timeout=4) as res: status=res.status
            except HTTPError as e: status=e.code
            assert status==expected,(path,method,cookie,status,expected)
print('PASS=isolated edge auth_request denies 6 anonymous GET/POST and proxies 6 mock-authorized cases')
PY
