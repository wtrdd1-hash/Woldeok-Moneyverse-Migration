#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
SHA=0123456789abcdef0123456789abcdef01234567
cat > "$TMP/curl" <<'CURL'
#!/usr/bin/env bash
url="${*: -1}"
case "$url" in
  */api/version) printf '{"id":"%s"}\n' "${BACKEND_SHA}" ;;
  */frontend-version) printf '{"sha":"%s"}\n' "${FRONTEND_SHA}" ;;
  *) exit 22 ;;
esac
CURL
chmod +x "$TMP/curl"
BACKEND_SHA="$SHA" FRONTEND_SHA="$SHA" CURL_BIN="$TMP/curl" "$ROOT/ops/release/verify-runtime-identity.sh" https://example.invalid "$SHA" >/dev/null
if BACKEND_SHA="$SHA" FRONTEND_SHA=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa CURL_BIN="$TMP/curl" "$ROOT/ops/release/verify-runtime-identity.sh" https://example.invalid "$SHA" >/dev/null 2>&1; then
  echo 'expected frontend split-release mismatch to fail' >&2; exit 1
fi
if BACKEND_SHA=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb FRONTEND_SHA="$SHA" CURL_BIN="$TMP/curl" "$ROOT/ops/release/verify-runtime-identity.sh" https://example.invalid "$SHA" >/dev/null 2>&1; then
  echo 'expected backend split-release mismatch to fail' >&2; exit 1
fi
echo 'runtime identity regression tests passed'
