#!/usr/bin/env bash
# v2026.11.17.14: repair only the SEO Next.js upstream, without changing admin authorization.
set -Eeuo pipefail

readonly CONFIG=/etc/nginx/sites-enabled/moneyverse
readonly BACKUP=/srv/moneyverse-data/ops-backups/p0-admin-seo-v2026.11.17.14/moneyverse.nginx.before
readonly STAGE_URL=http://127.0.0.1:4521
readonly SPRING_URL=http://127.0.0.1:4550
readonly AUTH_URL=http://127.0.0.1:4501

probe() {
  local path="$1" url="$2" expected="$3" file code
  file="$(mktemp)"
  code="$(curl -fsS -m 10 -o "$file" -w '%{http_code}' -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' "$url$path" || true)"
  if [[ "$code" != "$expected" ]]; then
    rm -f "$file"
    echo "FAIL: $url$path expected $expected, got $code" >&2
    exit 2
  fi
  if [[ "$path" == /admin/seo || "$path" == /admin/seo-audit ]]; then
    if grep -q '단일 엔진 구동 중' "$file"; then
      rm -f "$file"
      echo "FAIL: Spring placeholder found in SEO frontend" >&2
      exit 2
    fi
    if ! grep -q '<title>' "$file"; then
      rm -f "$file"
      echo "FAIL: SEO frontend missing HTML title" >&2
      exit 2
    fi
  fi
  rm -f "$file"
}

check_stage() {
  probe /admin/seo "$STAGE_URL" 200
  probe /admin/seo-audit "$STAGE_URL" 200
  probe /health "$SPRING_URL" 200
  local code
  code="$(curl -sS -m 8 -o /dev/null -w '%{http_code}' -H 'Host: easy-scraping.com' -H 'X-Forwarded-Proto: https' "$AUTH_URL/api/admin/seo/status")"
  [[ "$code" == 401 || "$code" == 403 ]] || {
    echo "FAIL: anonymous SEO identity check did not fail closed ($code)" >&2
    exit 2
  }
  echo "PASS: SEO stage HTML 200, Spring health 200, anonymous auth denied $code"
}

build_candidate() {
  local output="$1"
  awk '
    /^upstream seo_release_frontend \{/ { in_seo=1 }
    in_seo && /server 127\.0\.0\.1:4550;/ {
      sub(/127\.0\.0\.1:4550/, "127.0.0.1:4521")
      edits++
    }
    {print}
    in_seo && /^}/ {in_seo=0}
    END {if (edits != 1) exit 8}
  ' "$CONFIG" > "$output"
  if ! grep -A3 '^upstream seo_release_frontend' "$output" | grep -q 'server 127.0.0.1:4521;'; then
    echo 'FAIL: candidate upstream not changed exactly once' >&2
    exit 8
  fi
}

rollback() {
  if [[ -f "$BACKUP" ]]; then
    sudo -n install -o root -g root -m 0644 "$BACKUP" "$CONFIG"
    sudo -n nginx -t
    sudo -n systemctl reload nginx
    echo "ROLLBACK: restored $BACKUP"
  fi
}

mode="${1:---check}"
case "$mode" in
  --check)
    check_stage
    tmp="$(mktemp)"
    trap 'rm -f "$tmp"' EXIT
    build_candidate "$tmp"
    echo 'PASS: exact one-line candidate created without touching the active Nginx file'
    ;;
  --apply)
    check_stage
    tmp="$(mktemp)"
    trap 'rm -f "$tmp"' EXIT
    build_candidate "$tmp"
    sudo -n mkdir -p "$(dirname "$BACKUP")"
    if [[ -e "$BACKUP" ]]; then
      echo 'FAIL: immutable rollback backup already exists; refusing to overwrite' >&2
      exit 2
    fi
    sudo -n cp -a "$CONFIG" "$BACKUP"
    sudo -n install -o root -g root -m 0644 "$tmp" "$CONFIG"
    trap 'rollback' ERR
    sudo -n nginx -t
    sudo -n systemctl reload nginx
    status="$(curl -sS -m 8 -o /dev/null -w '%{http_code}' -H 'Host: easy-scraping.com' http://127.0.0.1/admin/seo)"
    [[ "$status" == 401 || "$status" == 403 ]] || {
      echo "FAIL: anonymous public SEO route returned $status instead of deny" >&2
      false
    }
    grep -A3 '^upstream seo_release_frontend' "$CONFIG" | grep -q 'server 127.0.0.1:4521;'
    trap - ERR
    echo "PASS: Nginx reloaded without restart, /admin/seo anonymous $status, rollback $BACKUP"
    ;;
  --rollback)
    rollback
    ;;
  *)
    echo 'Usage: restore-seo-upstream-v2026.11.17.14.sh [--check|--apply|--rollback]' >&2
    exit 64
    ;;
esac
