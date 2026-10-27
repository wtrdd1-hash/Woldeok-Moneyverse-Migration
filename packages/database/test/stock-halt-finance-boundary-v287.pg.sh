#!/usr/bin/env bash
# Disposable PostgreSQL integration for P0 #1553; NEVER use a shared DB.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="mv-b-stock-halt-v287-$$"
cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --network none --name "$CONTAINER" \
  -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17.11 >/dev/null
for _ in {1..30}; do
  if docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec "$CONTAINER" pg_isready -U postgres >/dev/null

# Legacy stubs model the two independent mutation paths and inherited grants.
docker exec -i "$CONTAINER" psql -X -U postgres -v ON_ERROR_STOP=1 <<'SQL'
CREATE ROLE moneyverse_app LOGIN;
CREATE ROLE untrusted_user LOGIN;
CREATE TABLE public.system_treasury_vaults (id integer PRIMARY KEY, balance_wld bigint NOT NULL);
CREATE TABLE public.system_treasury_ledger (id integer PRIMARY KEY);
CREATE TABLE public.virtual_stock_halt_settlements (id integer PRIMARY KEY);
INSERT INTO public.system_treasury_vaults VALUES (1, 100000);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.virtual_stock_halt_settlements TO moneyverse_app;
CREATE OR REPLACE FUNCTION public.stock_halt_and_settle(p_actor uuid, p_stock uuid, p_halt_event_id uuid DEFAULT gen_random_uuid())
RETURNS TABLE(settled_count bigint, total_refund_amount bigint, quarantined_count bigint, halt_status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  UPDATE public.system_treasury_vaults SET balance_wld = balance_wld - 1 WHERE id = 1;
  RETURN QUERY SELECT 1::bigint, 1::bigint, 0::bigint, 'HALTED_SETTLED'::text;
END $$;
CREATE OR REPLACE FUNCTION public.treasury_fund_stock_halt(p_stock_id uuid, p_required_amount_wld text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  UPDATE public.system_treasury_vaults SET balance_wld = balance_wld - 1 WHERE id = 1;
  RETURN '{}'::jsonb;
END $$;
GRANT EXECUTE ON FUNCTION public.stock_halt_and_settle(uuid,uuid,uuid) TO PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_fund_stock_halt(uuid,text) TO PUBLIC, moneyverse_app;
DO $$ BEGIN
  IF NOT has_function_privilege('moneyverse_app', 'public.stock_halt_and_settle(uuid,uuid,uuid)', 'EXECUTE')
     OR NOT has_function_privilege('moneyverse_app', 'public.treasury_fund_stock_halt(uuid,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'RED baseline did not expose unsafe functions';
  END IF;
END $$;
SQL

docker exec -i "$CONTAINER" psql -X -U postgres -v ON_ERROR_STOP=1 < "$ROOT/migrations/287-stock-halt-finance-boundary-hold.sql"
# Migration must be safe to re-run in a disposable synthetic fixture.
docker exec -i "$CONTAINER" psql -X -U postgres -v ON_ERROR_STOP=1 < "$ROOT/migrations/287-stock-halt-finance-boundary-hold.sql" >/dev/null

docker exec -i "$CONTAINER" psql -X -U postgres -v ON_ERROR_STOP=1 <<'SQL'
DO $$ BEGIN
  IF has_function_privilege('moneyverse_app', 'public.stock_halt_and_settle(uuid,uuid,uuid)', 'EXECUTE')
    OR has_function_privilege('moneyverse_app', 'public.treasury_fund_stock_halt(uuid,text)', 'EXECUTE')
    OR has_function_privilege('untrusted_user', 'public.stock_halt_and_settle(uuid,uuid,uuid)', 'EXECUTE')
    OR has_function_privilege('untrusted_user', 'public.treasury_fund_stock_halt(uuid,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Unsafe function still executable by app or PUBLIC';
  END IF;
  IF has_table_privilege('moneyverse_app','public.virtual_stock_halt_settlements','INSERT')
    OR has_table_privilege('moneyverse_app','public.virtual_stock_halt_settlements','UPDATE')
    OR has_table_privilege('moneyverse_app','public.virtual_stock_halt_settlements','DELETE')
    OR NOT has_table_privilege('moneyverse_app','public.virtual_stock_halt_settlements','SELECT') THEN
    RAISE EXCEPTION 'Settlement receipt ACL is not read-only';
  END IF;
  BEGIN
    PERFORM public.stock_halt_and_settle('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'Stock halt unexpectedly settled';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  BEGIN
    PERFORM public.treasury_fund_stock_halt('22222222-2222-4222-8222-222222222222','100');
    RAISE EXCEPTION 'Treasury funding unexpectedly settled';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
END $$;
SET ROLE moneyverse_app;
DO $$ BEGIN
  BEGIN
    PERFORM public.stock_halt_and_settle('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
    RAISE EXCEPTION 'App unexpectedly executed halt';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    PERFORM public.treasury_fund_stock_halt('22222222-2222-4222-8222-222222222222','100');
    RAISE EXCEPTION 'App unexpectedly executed funding';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;
RESET ROLE;
SQL

# One hundred concurrent independent owner attempts must all fail closed.
pids=()
for i in $(seq 1 100); do
  if (( i % 2 == 0 )); then
    stmt="PERFORM public.treasury_fund_stock_halt('22222222-2222-4222-8222-222222222222','100');"
  else
    stmt="PERFORM public.stock_halt_and_settle('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');"
  fi
  (docker exec "$CONTAINER" psql -X -U postgres -v ON_ERROR_STOP=1 -q -c \
    "DO \$\$ BEGIN BEGIN $stmt RAISE EXCEPTION 'unexpected success'; EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END; END \$\$;" >/dev/null) &
  pids+=("$!")
  if (( ${#pids[@]} == 20 )); then
    for pid in "${pids[@]}"; do wait "$pid"; done
    pids=()
  fi
done
for pid in "${pids[@]}"; do wait "$pid"; done

docker exec -i "$CONTAINER" psql -X -U postgres -v ON_ERROR_STOP=1 <<'SQL'
DO $$ BEGIN
  IF (SELECT balance_wld FROM public.system_treasury_vaults WHERE id = 1) <> 100000 THEN
    RAISE EXCEPTION 'Balance changed during blocked halt/funding';
  END IF;
  IF (SELECT count(*) FROM public.system_treasury_ledger) <> 0
    OR (SELECT count(*) FROM public.virtual_stock_halt_settlements) <> 0 THEN
    RAISE EXCEPTION 'Ledger or receipts mutated during blocked attempts';
  END IF;
END $$;
SQL
printf 'PASS: isolated PostgreSQL 17.11, 100 concurrent blocked attempts, unchanged synthetic vault/ledger/receipts, reapply and ACL\n'
