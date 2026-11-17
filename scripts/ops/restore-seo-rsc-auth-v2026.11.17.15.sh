#!/usr/bin/env bash
# v2026.11.17.15.1: verify the SEO JSON authorization patch and allow graceful Nginx worker handover.
set -Eeuo pipefail
readonly CONFIG=/etc/nginx/snippets/moneyverse-seo-v3-edge-auth.conf
readonly BACKUP=/srv/moneyverse-data/ops-backups/p0-admin-seo-v2026.11.17.15/seo-v3-edge-auth.conf.before
readonly PROD=http://127.0.0.1

status() {
  local path="$1" header="$2" code
  if [[ "$header" == rsc ]]; then
    code="$(curl -sS -m 8 -H 'Host: easy-scraping.com' -H 'RSC: 1' -o /dev/null -w '%{http_code}' "$PROD$path")"
  else
    code="$(curl -sS -m 8 -H 'Host: easy-scraping.com' -o /dev/null -w '%{http_code}' "$PROD$path")"
  fi
  printf '%s %s -> %s\n' "$path" "$header" "$code"
  [[ "$code" == 401 || "$code" == 403 ]] || return 2
}

preflight() {
  grep -A3 '^upstream seo_release_frontend' /etc/nginx/sites-enabled/moneyverse | grep -q 'server 127.0.0.1:4521;'
  [[ "$(curl -sS -m 8 -o /dev/null -w '%{http_code}' "$PROD/health")" == 200 ]]
  [[ "$(curl -sS -m 8 -o /dev/null -w '%{http_code}' -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' http://127.0.0.1:4521/admin/seo)" == 200 ]]
  echo 'PASS: stable SEO Next :4521 and Spring health :4550'
}

build_candidate() {
  local target="$1"
  awk '
    /^location = \/__mv_seo_authorize_20261117 \{/ { inside=1 }
    inside && /^[[:space:]]*proxy_set_header Cookie \$http_cookie;/ {
      print
      print "    # Auth checks must not inherit component-rendering headers from the calling Next page."
      print "    proxy_set_header RSC \"\";"
      print "    proxy_set_header Next-Router-Prefetch \"\";"
      print "    proxy_set_header Next-Router-State-Tree \"\";"
      edits++
      next
    }
    {print}
    inside && /^}/ {inside=0}
    END {if (edits != 1) exit 8}
  ' "$CONFIG" > "$target"
  [[ "$(grep -c 'proxy_set_header RSC "";' "$target")" == 1 ]]
}

is_installed() {
  # Refuse partial or repeated edits; these headers only belong inside the auth subrequest.
  [[ "$(grep -c '^[[:space:]]*proxy_set_header RSC "";' "$CONFIG" || true)" == 1 ]] &&
    [[ "$(grep -c '^[[:space:]]*proxy_set_header Next-Router-Prefetch "";' "$CONFIG" || true)" == 1 ]] &&
    [[ "$(grep -c '^[[:space:]]*proxy_set_header Next-Router-State-Tree "";' "$CONFIG" || true)" == 1 ]]
}

verify_public() {
  status /admin/seo standard
  status '/admin/seo?_rsc=canary' rsc
  status '/admin/seo-audit?_rsc=canary' rsc
  status '/api/admin/seo/status' standard
  [[ "$(curl -sS -m 8 -o /dev/null -w '%{http_code}' "$PROD/health")" == 200 ]]
}

rollback() {
  if [[ -f "$BACKUP" ]]; then
    sudo -n install -o root -g root -m 0644 "$BACKUP" "$CONFIG"
    sudo -n nginx -t
    sudo -n systemctl reload nginx
    echo "ROLLBACK: restored $BACKUP"
  fi
}

case "$1" in
  --check)
    preflight
    if is_installed; then
      sudo -n nginx -t
      verify_public
      echo 'PASS: already installed once, public deny checks and backend health confirmed'
      exit 0
    fi
    temp="$(mktemp)"
    trap 'rm -f "$temp"' EXIT
    build_candidate "$temp"
    echo 'PASS: RSC auth-only header patch candidate generated'
    ;;
  --apply)
    preflight
    if is_installed; then
      sudo -n nginx -t
      verify_public
      echo 'PASS: already installed and verified; no config rewrite or reload'
      exit 0
    fi
    temp="$(mktemp)"
    trap 'rm -f "$temp"' EXIT
    build_candidate "$temp"
    sudo -n mkdir -p "$(dirname "$BACKUP")"
    if [[ -e "$BACKUP" ]]; then
      echo 'FAIL: immutable backup exists; no overwrite' >&2
      exit 2
    fi
    sudo -n cp -a "$CONFIG" "$BACKUP"
    sudo -n install -o root -g root -m 0644 "$temp" "$CONFIG"
    trap 'rollback' ERR
    sudo -n nginx -t
    sudo -n systemctl reload nginx
    # systemctl reload returns before replacement workers always serve new requests.
    sleep 2
    verify_public
    trap - ERR
    echo "PASS: RSC navigation fails closed as 401, Nginx reloaded, backup $BACKUP"
    ;;
  --rollback)
    rollback
    ;;
  *)
    echo 'Usage: restore-seo-rsc-auth-v2026.11.17.15.sh [--check|--apply|--rollback]' >&2
    exit 64
    ;;
esac
