#!/usr/bin/env bash
# Dependency-free behavioral regression for the fail-closed ACL gate.
set -euo pipefail
cd "$(dirname "$0")"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cat > "$work/psql" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$@" > "$ARG_LOG"
printf '%s\n' "${PGCONNECT_TIMEOUT:-}" > "${ARG_LOG}.timeout"
printf '%s\n' "${PGOPTIONS:-}" > "${ARG_LOG}.pgoptions"
case "$MOCK_CASE" in
  clean) printf 'ACL_GATE_COMPLETE_v1\n'; exit 0 ;;
  silent) exit 0 ;;
  duplicate) printf 'ACL_GATE_COMPLETE_v1\nACL_GATE_COMPLETE_v1\n'; exit 0 ;;
  drift) printf 'DELETE|t|t\nACL_GATE_COMPLETE_v1\n'; exit 0 ;;
  missing) printf 'ERROR: ACL CHECK BLOCKED: table missing\n' >&2; exit 3 ;;
  connection) printf 'psql: error: connection refused\n' >&2; exit 2 ;;
  sqlerror) printf 'ERROR: permission denied for relation user_items\n' >&2; exit 3 ;;
  *) exit 99 ;;
esac
MOCK
chmod +x "$work/psql"
export PATH="$work:$PATH" DATABASE_URL='postgresql://invalid.invalid/never-connect' ARG_LOG="$work/args"
for scenario in clean drift silent duplicate missing connection sqlerror; do
  export MOCK_CASE="$scenario"
  if ./user-items-acl-drift.pg.sh > "$work/out" 2> "$work/err"; then status=0; else status=$?; fi
  case "$scenario" in
    clean) [[ $status -eq 0 ]] && grep -q '^PASS:' "$work/out" ;;
    silent|duplicate) [[ $status -ne 0 ]] && grep -q 'completion proof' "$work/err" ;;
    drift) [[ $status -ne 0 ]] && grep -q 'DELETE|t|t' "$work/err" ;;
    missing) [[ $status -ne 0 ]] && grep -q 'table missing' "$work/err" ;;
    connection) [[ $status -ne 0 ]] && grep -q 'connection refused' "$work/err" ;;
    sqlerror) [[ $status -ne 0 ]] && grep -q 'permission denied' "$work/err" ;;
  esac || { echo "FAIL: $scenario status=$status"; exit 1; }
  grep -Fxq 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' "$work/args"
  grep -Fxq 'ROLLBACK' "$work/args"
  grep -Fxq '10' "$work/args.timeout"
  grep -Fq -- '-c statement_timeout=15000' "$work/args.pgoptions"
  grep -Fq -- '-c lock_timeout=5000' "$work/args.pgoptions"
  grep -Fq 'user-items-acl-schema-presence.verify.sql' "$work/args"
  grep -Fq 'user-items-acl-drift.readonly.sql' "$work/args"
  echo "PASS: $scenario"
done
