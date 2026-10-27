-- P0 #993: old text-key bank pocket overloads are present in the live-linked
-- database, but absent from this repository's fresh migration history.
-- They retained default PUBLIC EXECUTE despite SECURITY DEFINER ownership.
-- The canonical application routes explicitly call the UUID-key overloads.
-- Conditional revocation is required for fresh installs where legacy overloads
-- do not exist; never create or rewrite the legacy functions.
-- Migration ordering: requires independent resolution of 280/282 and 283.
BEGIN;

DO $$
BEGIN
  IF to_regprocedure('public.bank_archive_pocket(text,uuid,uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.bank_archive_pocket(text,uuid,uuid) FROM PUBLIC, moneyverse_app';
  END IF;
  IF to_regprocedure('public.bank_customize_pocket(text,uuid,uuid,text,text)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.bank_customize_pocket(text,uuid,uuid,text,text) FROM PUBLIC, moneyverse_app';
  END IF;
  IF to_regprocedure('public.bank_transfer_pocket(text,uuid,uuid,bigint,text)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.bank_transfer_pocket(text,uuid,uuid,bigint,text) FROM PUBLIC, moneyverse_app';
  END IF;
END
$$;

COMMIT;
