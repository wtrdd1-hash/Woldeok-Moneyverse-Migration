-- v2026.09.15.127: keep casino negative-balance play reachable.
--
-- Migration 195 intentionally allowed casino ledger settlements to take the
-- member USER_CASH account below zero, but migration 171's small platform-wide
-- daily stake/loss caps still stopped play at 2,000/1,000 WLD.  That made the
-- negative-balance rule unreachable after a modest loss streak and surfaced as
-- HTTP 409 from otherwise valid coin/dice requests.
--
-- Preserve the per-play min/max bounds and member-owned self limits.  Only the
-- platform-wide daily exposure ceilings are moved to practically unreachable
-- bigint headroom.  The values remain within signed bigint and preserve the
-- schema invariant daily_loss_limit < daily_stake_limit.

UPDATE public.casino_policy
SET daily_stake_limit = 9000000000000000000,
    daily_loss_limit = 8999999999999999999,
    updated_at = pg_catalog.clock_timestamp()
WHERE singleton;
