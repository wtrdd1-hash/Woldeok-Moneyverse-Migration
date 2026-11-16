#!/bin/sh
# Independent Nginx static compatibility test: new SEO chunks AND old app chunks.
set -eu
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
DIR=$(mktemp -d /tmp/mv-seo-v3-static.XXXXXX)
cleanup() { nginx -p "$DIR" -c nginx.conf -s quit >/dev/null 2>&1 || true; rm -rf "$DIR"; }
trap cleanup EXIT
cat > "$DIR/nginx.conf" <<EOF_CONF
daemon on;
worker_processes 1;
pid $DIR/nginx.pid;
error_log $DIR/error.log warn;
events { worker_connections 128; }
http {
 access_log off;
 upstream prod_frontend { server 127.0.0.1:4501; }
 server {
  listen 127.0.0.1:4405;
  server_name 127.0.0.1;
  include $ROOT/ops/nginx/seo-v3-static-override.conf;
  location @mv_blog_v1417_static { return 404; }
  location / { return 404; }
 }
}
EOF_CONF
nginx -t -p "$DIR" -c nginx.conf
nginx -p "$DIR" -c nginx.conf
python3 - <<'PY'
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
candidate=Path('/srv/moneyverse-data/releases/seo-v2026.11.17.3-20daef3f6f/frontend/.next/static')
legacy=Path('/srv/moneyverse-data/releases/production-current/frontend/.next/static')

def get(port,uri):
 req=Request(f'http://127.0.0.1:{port}{uri}',headers={'Host':'easy-scraping.com'})
 try:
  with urlopen(req,timeout=5) as r:return r.status,r.read(),dict(r.headers)
 except HTTPError as e:return e.code,b'',dict(e.headers)

new='/_next/static/chunks/1479-e7fff652a81712e1.js'
code,new_content,new_headers=get(4405,new)
assert code==200,(new,code)
assert new_content==(candidate/'chunks/1479-e7fff652a81712e1.js').read_bytes(),'candidate static mismatch'
assert new_headers.get('X-Moneyverse-Static-Source')=='seo-v3'
print('PASS candidate static chunk 200, byte-identical SHA artifact')
old_file=next((p for p in legacy.rglob('*.js') if p.is_file() and not (candidate/p.relative_to(legacy)).exists()),None)
assert old_file,'no legacy-only JS static found'
old='/_next/static/'+str(old_file.relative_to(legacy))
code,old_content,_=get(4405,old)
assert code==200 and old_content==old_file.read_bytes(),(old,code)
print('PASS legacy-only Next JS asset fallback 200, byte-identical to previous release')
code,_,_=get(4405,'/_next/static/chunks/does-not-exist-seo-v3.js')
assert code==404,code
print('PASS unknown asset 404, no fabricated success')
PY
