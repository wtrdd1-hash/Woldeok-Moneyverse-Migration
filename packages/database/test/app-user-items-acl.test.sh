#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for token in has_table_privilege moneyverse_app public.user_items SELECT INSERT UPDATE DELETE TRUNCATE REFERENCES TRIGGER MAINTAIN; do
  grep -Fq "$token" app-user-items-acl.readonly.sql
done
! grep -Eiq '^[[:space:]]*(GRANT|REVOKE|ALTER|INSERT|UPDATE|DELETE|DROP|CREATE|TRUNCATE)[[:space:]]' app-user-items-acl.readonly.sql
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
cat > "$work/psql" <<'MOCK'
#!/usr/bin/env bash
case "$MOCK_CASE" in
 clean) echo USER_ITEMS_ACL_GATE_COMPLETE_v1 ;;
 select) printf 'SELECT\nUSER_ITEMS_ACL_GATE_COMPLETE_v1\n' ;;
 delete) printf 'DELETE\nUSER_ITEMS_ACL_GATE_COMPLETE_v1\n' ;;
 silent) : ;;
 duplicate) printf 'USER_ITEMS_ACL_GATE_COMPLETE_v1\nUSER_ITEMS_ACL_GATE_COMPLETE_v1\n' ;;
 error) echo 'connection failed' >&2; exit 2 ;;
esac
MOCK
chmod +x "$work/psql"
export PATH="$work:$PATH" DATABASE_URL='postgresql://invalid.invalid/no-connect'
for scenario in clean select delete silent duplicate error; do
 export MOCK_CASE="$scenario"
 if bash ./app-user-items-acl.pg.sh >"$work/out" 2>"$work/err"; then status=0; else status=$?; fi
 case "$scenario" in
 clean) [[ "$status" -eq 0 ]] && grep -q '^PASS:' "$work/out" ;;
 select|delete) [[ "$status" -eq 1 ]] && grep -q "$scenario" -i "$work/err" ;;
 silent|duplicate) [[ "$status" -eq 2 ]] && grep -q 'completion proof' "$work/err" ;;
 error) [[ "$status" -ne 0 ]] && grep -q 'connection failed' "$work/err" ;;
 esac || { echo "FAIL: $scenario status=$status"; exit 1; }
done
echo 'PASS: user_items ACL fail-closed shell regressions 6/6'
