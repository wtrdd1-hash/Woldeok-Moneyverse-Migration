#!/usr/bin/env bash
set -euo pipefail

SHA="${1:?usage: write-production-release-env.sh SHA OUTPUT_DIR}"
OUTPUT_DIR="${2:?usage: write-production-release-env.sh SHA OUTPUT_DIR}"

fail() { printf "production-release-env: %s\n" "$*" >&2; exit 1; }
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || fail "SHA must be a 40-character lowercase Git commit id"
install -d -m 0755 "$OUTPUT_DIR"

backend_tmp="$(mktemp "$OUTPUT_DIR/.backend-release.XXXXXX")"
frontend_tmp="$(mktemp "$OUTPUT_DIR/.frontend-release.XXXXXX")"
cleanup() { rm -f "$backend_tmp" "$frontend_tmp"; }
trap cleanup EXIT

cat >"$backend_tmp" <<ENV
PORT=3000
HOST=127.0.0.1
BUILD_ID=$SHA
APP_BASE_URL=https://easy-scraping.com
SEO_INDEXING_ENABLED=true
ENV

cat >"$frontend_tmp" <<ENV
API_ORIGIN=http://127.0.0.1:3000
BUILD_ID=$SHA
APP_BASE_URL=https://easy-scraping.com
SEO_INDEXING_ENABLED=true
ADS_ENABLED=true
NEXT_PUBLIC_ADS_ENABLED=true
TEST_FRONTEND_ORIGIN=http://127.0.0.1:3101
ENV

chmod 0644 "$backend_tmp" "$frontend_tmp"
mv -f "$backend_tmp" "$OUTPUT_DIR/backend-release.env"
mv -f "$frontend_tmp" "$OUTPUT_DIR/frontend-release.env"
trap - EXIT
printf "production-release-env: OK sha=%s output=%s\n" "$SHA" "$OUTPUT_DIR"
