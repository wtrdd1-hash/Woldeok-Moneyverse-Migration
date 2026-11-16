#!/usr/bin/env bash
# Emergency zero-downtime SEO gateway/edge recovery. Run via sudo after stage QA.
# No secrets, site-wide replacements, service restarts or DB writes.
set -euo pipefail
[[ ${1:-} == --promote ]] || { echo 'Usage: sudo bash <script> --promote' >&2; exit 2; }
[[ $EUID -eq 0 ]] || { echo 'This script needs sudo.' >&2; exit 2; }
ROOT=$(cd -- "$(dirname -- "$0")/../.." && pwd)
SITE=/etc/nginx/sites-enabled/moneyverse
GW=/etc/nginx/snippets/moneyverse-seo-node-bridge-v2026.11.17.2.conf
EDGE=/etc/nginx/snippets/moneyverse-seo-edge-auth-v2026.11.17.2.conf
BACKUP_DIR=/srv/moneyverse-data/reports/seo-recovery-v2026.11.17.2
mkdir -p "$BACKUP_DIR" /etc/nginx/snippets
exec 9>/run/lock/moneyverse-seo-routing-v2026.11.17.2.lock
flock -n 9 || { echo 'Concurrent SEO Nginx change detected; refusing.' >&2; exit 3; }
if grep -qF 'moneyverse-seo-node-bridge-v2026.11.17.2.conf' "$SITE"; then
  echo 'Already installed; verify without overwriting.'
  exit 0
fi
# No production change until both upstreams are healthy and negative guard works.
[[ $(curl --max-time 4 -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4500/api/v1/seo/status) == 200 ]]
[[ $(curl --max-time 4 -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4500/api/v1/seo/status/admin) == 401 ]]
[[ $(curl --max-time 4 -s -o /dev/null -w '%{http_code}' -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:4501/api/seo/status) == 200 ]]
sha_before=$(sha256sum "$SITE" | cut -d ' ' -f 1)
BACKUP="$BACKUP_DIR/moneyverse-nginx-before-$(date +%Y%m%dT%H%M%S).conf"
cp -a "$SITE" "$BACKUP"
chmod 600 "$BACKUP"
printf '%s\n' "$BACKUP" > "$BACKUP_DIR/rollback-file.txt"
install -o root -g root -m 644 "$ROOT/ops/nginx/seo-node-bridge.conf" "$GW"
install -o root -g root -m 644 "$ROOT/ops/nginx/seo-edge-auth.conf" "$EDGE"
# Revalidate against other concurrently operating agents before any live mutation.
[[ "$(sha256sum "$SITE" | cut -d ' ' -f 1)" == "$sha_before" ]] || {
  echo 'Nginx config changed concurrently; aborting without modification' >&2; exit 4;
}
python3 - "$SITE" "$GW" "$EDGE" <<'PY'
import os, sys, pathlib, stat
site=pathlib.Path(sys.argv[1]); gw,edge=sys.argv[2:]
s=site.read_text()
check1='server {\n    listen 127.0.0.1:4400;'
check2='server {\n    listen 80 default_server;'
assert s.count(check1)==1 and s.count(check2)==1, 'Gateway/public server blocks not unique'
a, b=s.split(check1, 1)
needle='    server_name 127.0.0.1;\n'
assert b.count(needle)>=1
b=b.replace(needle, needle+'\n    include '+gw+';\n',1)
s=a+check1+b
ix=s.find(check2)
pre,rest=s[:ix],s[ix:]
needle='    server_name _;\n'
assert needle in rest
rest=rest.replace(needle,needle+'\n    include '+edge+';\n',1)
s=pre+rest
assert s.count('include '+gw+';')==1 and s.count('include '+edge+';')==1
import tempfile
fd,tmp=tempfile.mkstemp(prefix='.moneyverse-seo-',suffix='.tmp',dir=site.parent)
try:
    os.fchmod(fd,0o644)
    with os.fdopen(fd,'w') as f: f.write(s)
    os.replace(tmp,site)
finally:
    if os.path.exists(tmp): os.unlink(tmp)
PY
rollback() {
  echo 'QA failed: restoring original config and reloading nginx' >&2
  cp -a "$BACKUP" "$SITE"
  chmod 644 "$SITE"
  nginx -t && systemctl reload nginx
}
if ! nginx -t; then rollback; exit 10; fi
if ! systemctl reload nginx; then rollback; exit 11; fi
# systemctl confirms the reload signal, not that all old worker sockets drained.
# A one-time grace period avoids sampling the previous config during migration.
sleep 2
set +e
python3 "$ROOT/scripts/qa/verify-seo-gateway.py"
qa=$?
# Production HTTP edge auth must deny without cookies; do not send IndexNow POST body.
for uri in /api/admin/seo-audit /admin/seo /admin/seo-audit; do
  status=$(curl --max-time 6 -s -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' -o /dev/null -w '%{http_code}' "http://127.0.0.1$uri")
  echo "EDGE anonymous $uri -> $status"
  [[ "$status" == 401 || "$status" == 403 ]] || qa=1
done
code=$(curl --max-time 5 -s -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' -o /dev/null -w '%{http_code}' http://127.0.0.1/api/seo/status)
echo "PUBLIC Next API /api/seo/status -> $code"
[[ "$code" == 200 ]] || qa=1
set -e
if [[ "$qa" != 0 ]]; then rollback; exit 12; fi
printf 'PROMOTION_PASS backup=%s\n' "$BACKUP"
