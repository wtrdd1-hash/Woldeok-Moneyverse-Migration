#!/usr/bin/env bash
set -euo pipefail
CONFIG="${1:?usage: check-moneyverse-host-routing.sh NGINX_CONFIG}"
fail(){ printf "moneyverse-routing: %s\n" "$*" >&2; exit 1; }
[[ -f "$CONFIG" ]] || fail "config not found: $CONFIG"
block(){ awk -v host="$1" '$1=="server" && $2=="{" {inside=1; depth=1; buf=$0 ORS; next} inside {buf=buf $0 ORS; depth+=gsub(/\{/,"{"); depth-=gsub(/\}/,"}"); if(depth==0){if(buf ~ ("server_name[[:space:]]+" host "[[:space:]]*;")){printf "%s",buf; exit} inside=0; buf=""}}' "$CONFIG"; }
TEST_BLOCK="$(block "test.easy-scraping.com")"
[[ -n "$TEST_BLOCK" ]] || fail "test.easy-scraping.com server block missing"
grep -q "proxy_pass http://127.0.0.1:3100/health;" <<<"$TEST_BLOCK" || fail "Test /health must use 3100"
grep -q "proxy_pass http://127.0.0.1:3100/api/version;" <<<"$TEST_BLOCK" || fail "Test /api/version must use 3100"
grep -q "proxy_pass http://127.0.0.1:3101;" <<<"$TEST_BLOCK" || fail "Test frontend must use stable 3101"
if grep -Eq "127\\.0\\.0\\.1:31(1[2-9]|2[0-9])" <<<"$TEST_BLOCK"; then fail "Test server references transient UI/candidate port"; fi
grep -q "proxy_pass http://127.0.0.1:3000/health;" "$CONFIG" || fail "Production /health must use 3000"
grep -q "proxy_pass http://127.0.0.1:3000/api/version;" "$CONFIG" || fail "Production /api/version must use 3000"
grep -q "proxy_pass http://127.0.0.1:3001;" "$CONFIG" || fail "Production frontend must use stable 3001"
printf "moneyverse-routing: OK config=%s\n" "$CONFIG"
