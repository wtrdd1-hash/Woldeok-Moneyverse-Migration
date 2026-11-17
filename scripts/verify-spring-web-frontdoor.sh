#!/usr/bin/env bash
# Read-only ingress smoke. Not a substitute for full authenticated frontend QA.
set -euo pipefail
base="${BASE_URL:-http://127.0.0.1}"
host="${HTTP_HOST:-easy-scraping.com}"
base="${base%/}"

if [[ "$base" != http://* && "$base" != https://* ]]; then
  printf 'FAIL: BASE_URL must be an absolute HTTP(S) origin\n' >&2; exit 2
fi
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
failed=0
for route in / /guide /admin/blog; do
  target="$base$route"
  code="$(curl -sS --max-time 8 --retry 0 -H "Host: $host" -o "$work/body" -w '%{http_code}' "$target")" || code=000
  bytes="$(wc -c < "$work/body" 2>/dev/null || echo 0)"
  if [[ "$code" == "000" ]]; then
    printf 'FAIL %-14s connection error\n' "$route"; failed=1
  elif grep -qE '페이지를 불러오는 중입니다|Spring Boot 3[.]3 단일 엔진' "$work/body"; then
    printf 'FAIL %-14s dummy/fallback HTTP %s (%s bytes)\n' "$route" "$code" "$bytes"; failed=1
  elif [[ "$code" != 200 && "$code" != 301 && "$code" != 302 && "$code" != 303 && "$code" != 307 && "$code" != 308 && "$code" != 401 && "$code" != 403 ]]; then
    printf 'FAIL %-14s HTTP %s (%s bytes)\n' "$route" "$code" "$bytes"; failed=1
  elif [[ "$code" == 200 && "$bytes" -lt 1024 ]]; then
    printf 'FAIL %-14s implausibly small HTTP 200 HTML (%s bytes)\n' "$route" "$bytes"; failed=1
  else
    printf 'PASS %-14s HTTP %s (%s bytes); auth, SEO and finance still need independent QA\n' "$route" "$code" "$bytes"
  fi
done
exit "$failed"
