BEGIN;

-- Keep the casino a recreational sink rather than a path that can consume a
-- typical member wallet in a few clicks. The probability engine and 95% RTP
-- remain unchanged; only exposure is bounded at the platform layer. Members
-- may still choose stricter self-limits.
UPDATE public.casino_policy
SET min_stake = 10,
    max_stake = 200,
    daily_stake_limit = 2000,
    daily_loss_limit = 1000,
    updated_at = pg_catalog.clock_timestamp()
WHERE singleton;

COMMIT;
