#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
sql=app-existing-acl-drift.readonly.sql
for token in pg_class pg_namespace aclexplode relacl moneyverse_app PUBLIC TRUNCATE REFERENCES TRIGGER MAINTAIN; do
  grep -Fq "$token" "$sql"
done
! grep -Eiq '^[[:space:]]*(GRANT|REVOKE|ALTER|INSERT|UPDATE|DELETE|DROP|CREATE|TRUNCATE)[[:space:]]' "$sql"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cat > "$work/psql" <<'MOCK'
#!/usr/bin/env bash
case "$MOCK_CASE" in
  clean) echo EXISTING_ACL_GATE_COMPLETE_v1 ;;
  drift) printf 'user_items|moneyverse_app|MAINTAIN|f\nEXISTING_ACL_GATE_COMPLETE_v1\n' ;;
  public) printf 'user_items|PUBLIC|TRUNCATE|f\nEXISTING_ACL_GATE_COMPLETE_v1\n' ;;
  silent) : ;;
  duplicate) printf 'EXISTING_ACL_GATE_COMPLETE_v1\nEXISTING_ACL_GATE_COMPLETE_v1\n' ;;
  error) echo 'ERROR: connection failed' >&2; exit 2 ;;
esac
MOCK
chmod +x "$work/psql"
export PATH="$work:$PATH" DATABASE_URL='postgresql://invalid.invalid/never-connect'
for scenario in clean drift public silent duplicate error; do
  export MOCK_CASE="$scenario"
  if bash ./app-existing-acl-drift.pg.sh >"$work/out" 2>"$work/err"; then status=0; else status=$?; fi
  case "$scenario" in
    clean) [[ "$status" -eq 0 ]] && grep -q '^PASS:' "$work/out" ;;
    drift) [[ "$status" -eq 1 ]] && grep -q 'MAINTAIN' "$work/err" ;;
    public) [[ "$status" -eq 1 ]] && grep -q 'PUBLIC|TRUNCATE' "$work/err" ;;
    silent|duplicate) [[ "$status" -eq 2 ]] && grep -q 'completion proof' "$work/err" ;;
    error) [[ "$status" -ne 0 ]] && grep -q 'connection failed' "$work/err" ;;
  esac || { echo "FAIL: $scenario status=$status"; exit 1; }
done
echo 'PASS: existing ACL fail-closed shell regressions 6/6'
