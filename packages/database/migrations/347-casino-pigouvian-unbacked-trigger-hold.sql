-- v2026.11.10.2028: P0 forward-only guard for casino welfare tax.
-- The v346 trigger inflated VAULT_WELFARE from stake_amount without debit
-- against a canonical funded account or balanced economy_post_transaction.
-- No monetary balance adjustment or historical evidence rewrite occurs here.
-- The levy stays on hold until a fully funded, audited tax transaction and
-- historical fiscal provenance have been independently certified.
BEGIN;

DROP TRIGGER IF EXISTS trg_casino_dice_pigouvian_tax ON public.virtual_casino_dice_plays;

-- SECURITY DEFINER routines must never inherit default PUBLIC EXECUTE.
REVOKE ALL PRIVILEGES ON FUNCTION public.trigger_casino_pigouvian_welfare_tax()
  FROM PUBLIC, moneyverse_app;

COMMIT;
