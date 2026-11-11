#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
sql=app-default-acl-drift.readonly.sql
[[ -f "$sql" ]]
for token in pg_default_acl aclexplode defaclrole defaclnamespace defaclobjtype 'defaclnamespace = 0' '<global>' moneyverse_app 'DELETE' 'INSERT' 'UPDATE' 'TRUNCATE' 'REFERENCES' 'TRIGGER' 'MAINTAIN'; do
  grep -Fq "$token" "$sql"
done
! grep -Eiq '^[[:space:]]*(GRANT|REVOKE|ALTER|INSERT|UPDATE|DELETE|DROP|CREATE|TRUNCATE)[[:space:]]' "$sql"
echo 'PASS: default ACL drift SQL read-only coverage'
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
cat > "$work/psql" <<'MOCK'
#!/usr/bin/env bash
case "$MOCK_CASE" in
  clean) printf 'DEFAULT_ACL_GATE_COMPLETE_v1\n' ;;
  drift) printf 'moneyverse_migrator|public|moneyverse_migrator|MAINTAIN|f\nDEFAULT_ACL_GATE_COMPLETE_v1\n' ;;
  silent) : ;;
  duplicate) printf 'DEFAULT_ACL_GATE_COMPLETE_v1\nDEFAULT_ACL_GATE_COMPLETE_v1\n' ;;
  error) echo 'ERROR: connection failed' >&2; exit 2 ;;
esac
MOCK
chmod +x "$work/psql"
export PATH="$work:$PATH" DATABASE_URL='postgresql://invalid.invalid/never-connect'
for scenario in clean drift silent duplicate error; do
  export MOCK_CASE="$scenario"
  if bash ./app-default-acl-drift.pg.sh >"$work/out" 2>"$work/err"; then status=0; else status=$?; fi
  case "$scenario" in
    clean) [[ "$status" -eq 0 ]] && grep -q '^PASS:' "$work/out" ;;
    drift) [[ "$status" -eq 1 ]] && grep -q 'MAINTAIN' "$work/err" ;;
    silent|duplicate) [[ "$status" -eq 2 ]] && grep -q 'completion proof' "$work/err" ;;
    error) [[ "$status" -ne 0 ]] && grep -q 'connection failed' "$work/err" ;;
  esac || { echo "FAIL: $scenario status=$status"; exit 1; }
done
echo 'PASS: default ACL fail-closed shell regressions 5/5'
