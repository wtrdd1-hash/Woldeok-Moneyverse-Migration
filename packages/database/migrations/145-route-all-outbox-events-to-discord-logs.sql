-- Operations requested one Discord destination for every application event.
-- The worker still receives no payload, so enabling high-volume routes does
-- not disclose members, balances, IP addresses or request details. Leasing,
-- rate-limit backoff and dead-letter handling keep Discord availability out
-- of the transaction path.
BEGIN;

UPDATE public.discord_outbox_routes
SET channel_key = 'logs',
    enabled = true,
    note = 'all event types routed to the sanitised operations log channel';

COMMIT;
