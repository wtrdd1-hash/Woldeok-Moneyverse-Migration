#!/usr/bin/env bash
# SEO-only production frontend promotion, with exact-source and Nginx rollback.
set -euo pipefail
[[ ${1:-} == --promote ]] || { echo 'Usage: sudo bash ... --promote' >&2; exit 2; }
[[ $EUID == 0 ]] || { echo 'sudo required' >&2; exit 2; }
REPO=$(cd "$(dirname "$0")/../.." && pwd)
SITE=/etc/nginx/sites-enabled/moneyverse
SOURCE_EDGE=$REPO/ops/nginx/seo-edge-auth.conf
SOURCE_STATIC=$REPO/ops/nginx/seo-v3-static-override.conf
EDGE=/etc/nginx/snippets/moneyverse-seo-v3-edge-auth.conf
STATIC=/etc/nginx/snippets/moneyverse-seo-v3-static-override.conf
REPORT=/srv/moneyverse-data/reports/seo-completion-v2026.11.17.3
REL=/srv/moneyverse-data/releases/seo-v2026.11.17.3-20daef3f6f
EXPECTED_SHA=20daef3f6f254f6a0e5b085756a08d4d0d874c9c
mkdir -p "$REPORT"
exec 9>/run/lock/moneyverse-seo-frontend-v3-promotion.lock
flock -n 9 || { echo 'Concurrent SEO frontend promotion lock: refusing' >&2; exit 3; }
[[ ! -e $EDGE && ! -e $STATIC ]] || { echo 'Versioned promotion snippets already exist: refusing' >&2; exit 4; }
[[ $(cat "$REL/frontend/.next/BUILD_ID") == $EXPECTED_SHA ]] || { echo 'Next build identity mismatch' >&2; exit 5; }
[[ $(cat "$REL/RELEASE_SOURCE_SHA") == $EXPECTED_SHA ]] || { echo 'Release source identity mismatch' >&2; exit 5; }
[[ $(curl --max-time 6 -s -o /dev/null -w '%{http_code}' -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:4521/api/seo/status) == 200 ]] || exit 6
[[ $(curl --max-time 6 -s -o /dev/null -w '%{http_code}' -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:4521/api/admin/seo/status) == 401 ]] || exit 6
[[ $(curl --max-time 6 -s -o /dev/null -w '%{http_code}' -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:4521/_next/static/chunks/1479-e7fff652a81712e1.js) == 200 ]] || exit 6
if grep -q 'seo_release_frontend' "$SITE" || ! grep -q 'moneyverse-seo-edge-auth-v2026.11.17.2.conf' "$SITE"; then
  echo 'Existing route or unexpected edge site configuration; refusing' >&2; exit 7
fi
before=$(sha256sum "$SITE" | awk '{print $1}')
BACKUP="$REPORT/nginx-before-seo-v3-$(date +%Y%m%dT%H%M%S).conf"
cp -a "$SITE" "$BACKUP"
chmod 600 "$BACKUP"
printf '%s\n' "$BACKUP" > "$REPORT/nginx-rollback-file.txt"
install -m 644 -o root -g root "$SOURCE_EDGE" "$EDGE"
install -m 644 -o root -g root "$SOURCE_STATIC" "$STATIC"
[[ $(sha256sum "$SITE" | awk '{print $1}') == $before ]] || { echo 'Concurrent Nginx file change; refusing'; exit 8; }
python3 - "$SITE" <<'PY'
import pathlib,os,sys,tempfile
p=pathlib.Path(sys.argv[1]);s=p.read_text()
upstream='upstream prod_frontend {'
assert s.count(upstream)==1
s=s.replace(upstream,'''upstream seo_release_frontend {
    server 127.0.0.1:4521;
    keepalive 16;
}

'''+upstream,1)
old='include /etc/nginx/snippets/moneyverse-seo-edge-auth-v2026.11.17.2.conf;'
new='include /etc/nginx/snippets/moneyverse-seo-v3-edge-auth.conf;'
assert s.count(old)==1
s=s.replace(old,new,1)
old_static='''    location ^~ /_next/static/ {
        proxy_pass http://prod_frontend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        proxy_intercept_errors on;
        error_page 404 = @mv_blog_v1417_static;
    }
'''
assert s.count(old_static)==1, 'Public Next static location changed or collides with Test'
s=s.replace(old_static,'    include /etc/nginx/snippets/moneyverse-seo-v3-static-override.conf;\n',1)
assert s.count('include /etc/nginx/snippets/moneyverse-seo-v3-static-override.conf;')==1
fd,tmp=tempfile.mkstemp(prefix='.mv-seo-v3-',suffix='.conf',dir=p.parent)
try:
 with os.fdopen(fd,'w') as f:f.write(s)
 os.chmod(tmp,0o644)
 os.replace(tmp,p)
finally:
 if os.path.exists(tmp):os.unlink(tmp)
PY
rollback() {
  echo 'SEO frontend promotion QA failed. Restoring Nginx source snapshot.' >&2
  cp -a "$BACKUP" "$SITE"
  chmod 644 "$SITE"
  nginx -t && systemctl reload nginx
}
if ! nginx -t; then rollback; exit 9; fi
if ! systemctl reload nginx; then rollback; exit 10; fi
sleep 2
bad=0
for path in /admin/seo /admin/seo-audit /api/admin/seo-audit /api/admin/seo/indexing-submit /api/admin/seo/status /api/indexnow; do
 code=$(curl --max-time 8 -s -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' -o /dev/null -w '%{http_code}' "http://127.0.0.1$path")
 echo "SEO edge denied $path $code"
 [[ $code == 401 || $code == 403 ]] || bad=1
done
code=$(curl --max-time 8 -s -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' -o /dev/null -w '%{http_code}' http://127.0.0.1/_next/static/chunks/1479-e7fff652a81712e1.js)
echo "Candidate static file $code"
[[ $code == 200 ]] || bad=1
python3 "$REPO/scripts/qa/verify-seo-production.py" || bad=1
[[ $bad == 0 ]] || { rollback; exit 11; }
echo "SEO_PRODUCTION_PROMOTION_PASS frontend_sha=$EXPECTED_SHA rollback=$BACKUP"
