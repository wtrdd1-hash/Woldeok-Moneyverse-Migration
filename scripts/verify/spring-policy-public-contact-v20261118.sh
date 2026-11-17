#!/usr/bin/env bash
# Verify Cloudflare edge keeps operator contact usable under strict no-JS CSP.
# Usage: ./scripts/verify/spring-policy-public-contact-v20261118.sh test|prod
set -euo pipefail
ENVIRONMENT="${1:-}"
case "$ENVIRONMENT" in
  test) BASE="https://test.easy-scraping.com" ; MARKER="v2026.11.18.8-test" ;;
  prod) BASE="https://easy-scraping.com" ; MARKER="v2026.11.18.8-prod" ;;
  *) printf '%s\n' 'usage: check test|prod' >&2; exit 64 ;;
esac
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
CONTACT='jungchwimisaenghwal63@gmail.com'
TOTAL=0
for PAGE in terms privacy account-deletion; do
  for LANG in en ko; do
    URL="$BASE/$PAGE?lang=$LANG"
    STATUS=$(curl --fail-with-body -sS --max-time 12 -D "$TMP/headers" -o "$TMP/body" -w '%{http_code}' "$URL")
    test "$STATUS" = '200'
    grep -Fq "X-Moneyverse-Spring-Canonical: $MARKER" "$TMP/headers" || grep -Fiq "x-moneyverse-spring-canonical: $MARKER" "$TMP/headers"
    grep -Fq "href=\"mailto:$CONTACT\"" "$TMP/body" || { printf 'missing real mailto for %s\n' "$URL" >&2;exit 3; }
    if grep -Eiq '/cdn-cgi/l/email-protection|email-decode\.min\.js|<script[[:space:]>]' "$TMP/body"; then
      printf 'CF email rewrite or script injection still present at %s\n' "$URL" >&2;exit 4
    fi
    grep -Fiq "default-src 'none'" "$TMP/headers" || { printf 'missing strict CSP %s\n' "$URL" >&2; exit 5; }
    grep -Fq '<!--email_off-->' "$TMP/body" || { printf 'email scope comment absent %s\n' "$URL" >&2;exit 6; }
    case "$LANG" in
      ko) grep -Fq '<html lang="ko"' "$TMP/body" ;;
      en) grep -Fq '<html lang="en"' "$TMP/body" ;;
    esac
    printf 'CONTACT_EDGE_PASS %s %s %s\n' "$ENVIRONMENT" "$PAGE" "$LANG"
    TOTAL=$((TOTAL+1))
  done
done
printf 'CONTACT_EDGE_ALL_PASS env=%s routes=%s marker=%s\n' "$ENVIRONMENT" "$TOTAL" "$MARKER"
