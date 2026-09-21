#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin" "$TMP/remote"
printf 'test-key\n' > "$TMP/key"
printf 'ciphertext-under-test\n' > "$TMP/remote/moneyverse-test.tar.zst.enc"

cat > "$TMP/bin/rclone" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
[[ "$1" == copyto && "$2" == --no-traverse ]]
src="$3"; dst="$4"; cp "${src#mock:}" "$dst"
MOCK
cat > "$TMP/bin/docker" <<'MOCK'
#!/usr/bin/env bash
echo 'docker must not run before off-host checksum verification' >&2
exit 97
MOCK
chmod +x "$TMP/bin/rclone" "$TMP/bin/docker"

# Regression: off-host sidecars may contain the source host's absolute path.
# Restore must verify the downloaded archive bytes, not that stale pathname.
digest="$(sha256sum "$TMP/remote/moneyverse-test.tar.zst.enc" | awk '{print $1}')"
printf '%s  /var/backups/moneyverse/moneyverse-test.tar.zst.enc\n' "$digest" > "$TMP/remote/moneyverse-test.tar.zst.enc.sha256"

# Stop immediately after the checksum gate so this unit regression test does not
# need a valid encrypted backup. openssl exit 96 proves verification reached it.
cat > "$TMP/bin/openssl" <<'MOCK'
#!/usr/bin/env bash
if [[ "${1:-}" == rand ]]; then exec /usr/bin/openssl "$@"; fi
[[ "${1:-}" == enc ]] && exit 96
exit 95
MOCK
chmod +x "$TMP/bin/openssl"
set +e
PATH="$TMP/bin:$PATH" BACKUP_KEY_FILE="$TMP/key" "$ROOT/ops/backup/moneyverse-restore-drill.sh" "mock:$TMP/remote/moneyverse-test.tar.zst.enc" >/dev/null 2>"$TMP/err"
rc=$?
set -e
[[ "$rc" == 2 ]] || { cat "$TMP/err" >&2; echo "expected checksum pass then invalid-payload sentinel rc=2, got $rc" >&2; exit 1; }

# A forged/mismatched digest must fail closed before decryption or Docker.
printf '%064d  /var/backups/moneyverse/moneyverse-test.tar.zst.enc\n' 0 > "$TMP/remote/moneyverse-test.tar.zst.enc.sha256"
set +e
PATH="$TMP/bin:$PATH" BACKUP_KEY_FILE="$TMP/key" "$ROOT/ops/backup/moneyverse-restore-drill.sh" "mock:$TMP/remote/moneyverse-test.tar.zst.enc" >/dev/null 2>"$TMP/err"
rc=$?
set -e
[[ "$rc" == 1 ]] || { cat "$TMP/err" >&2; echo "expected checksum mismatch rc=1, got $rc" >&2; exit 1; }
grep -q 'off-host archive checksum mismatch' "$TMP/err"
echo 'moneyverse-restore-drill.test: OK'
