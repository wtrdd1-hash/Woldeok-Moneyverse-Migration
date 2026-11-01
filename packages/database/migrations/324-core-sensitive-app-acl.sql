-- Forward-only P0 privilege repair for the canonical cash, identity and inventory boundary.
-- The development app role unexpectedly holds direct table privileges.
-- Preserve immutable historical migrations and intentional economy read access.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE
  public.account_balances,
  public.accounts,
  public.daily_rewards,
  public.outbox_events,
  public.users,
  public.identities,
  public.user_items
FROM PUBLIC, moneyverse_app;

-- Server-authoritative read models retain their historical SELECT contract.
-- Identity and inventory access remains restricted to SECURITY DEFINER routines.
GRANT SELECT ON TABLE public.account_balances,
  public.accounts,
  public.daily_rewards,
  public.outbox_events
TO moneyverse_app;

COMMIT;
