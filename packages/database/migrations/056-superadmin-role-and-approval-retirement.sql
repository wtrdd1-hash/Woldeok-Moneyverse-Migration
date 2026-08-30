-- The single-superadmin model, part one: the enum value, and the DDL that
-- takes two-person approval out of the schema.
--
-- Two-person approval was the compensating control over money and treasury
-- actions. The revised specification (§10 단일 최고관리자 원칙) replaces it
-- with one account that acts alone, backed by a second authentication factor
-- (059) rather than by a second person. Removing the control and adding the
-- factor land in the same stack on purpose; neither half is safe alone.
--
-- This file adds the enum value and nothing that uses it. PostgreSQL refuses
-- to read a value added by the transaction that adds it, so the authority
-- functions that compare against 'superadmin' live in 058. Splitting them is
-- not tidiness — a single file would fail on a fresh database.
--
-- No BEGIN/COMMIT: migrate.sh runs each file through `psql -f`, which
-- autocommits statement by statement. Every statement below is written to be
-- safe on a re-run after a partial failure, which is what that costs.

ALTER TYPE public.admin_role ADD VALUE IF NOT EXISTS 'superadmin';

-- 003 wrote `CHECK (requester_id IS DISTINCT FROM approver_id)` inline, so
-- PostgreSQL named it. The name is derived from the table and is stable
-- (`admin_approval_requests_check`), but a database restored through a tool
-- that renamed it would silently keep the rule, so the constraint is found by
-- its definition rather than by a name spelled here.
DO $do$
DECLARE
  v_constraint text;
BEGIN
  FOR v_constraint IN
    SELECT constraint_row.conname
    FROM pg_catalog.pg_constraint AS constraint_row
    WHERE constraint_row.conrelid = 'public.admin_approval_requests'::pg_catalog.regclass
      AND constraint_row.contype = 'c'
      AND pg_catalog.pg_get_constraintdef(constraint_row.oid)
          ILIKE '%requester_id IS DISTINCT FROM approver_id%'
  LOOP
    EXECUTE pg_catalog.format(
      'ALTER TABLE public.admin_approval_requests DROP CONSTRAINT %I', v_constraint
    );
  END LOOP;
END;
$do$;

-- 014's Minecraft control plane was removed from the application in 6695cd2
-- and stays removed; the specification is what is being corrected there, not
-- the code. Its trigger fires on every status transition of an approval
-- request and raises 42501 unless a *different* approver decided it, so
-- leaving it in place would keep enforcing the rule this migration removes —
-- for actions whose executor no longer exists.
--
-- The trigger and its function go; `minecraft_approved_operations` and its
-- event stream stay. They are history, and the ledger rule applies to them
-- too: records are not deleted because the feature that wrote them left.
DROP TRIGGER IF EXISTS minecraft_approved_operation_approval_sync
  ON public.admin_approval_requests;
DROP FUNCTION IF EXISTS public.minecraft_sync_approved_operation_from_approval();

-- The five policy rows the trigger existed for. Deleted rather than
-- deactivated: `admin_action_policies` is an allow-list of what may enter the
-- approval workflow, and 058 retires that workflow entirely, so an inactive
-- row would only be a name with nothing behind it.
DELETE FROM public.admin_action_policies
WHERE action IN (
  'minecraft.operation.start',
  'minecraft.operation.stop',
  'minecraft.operation.restart',
  'minecraft.operation.status',
  'minecraft.operation.logs'
);
