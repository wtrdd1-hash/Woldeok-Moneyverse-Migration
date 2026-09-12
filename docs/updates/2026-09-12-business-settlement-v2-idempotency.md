# Business Settlement V2 Idempotency Hardening

Update version: **2026.09.12-01**  
Status: **Candidate / staging verification required**  
Branch: `fix/business-settlement-v2-idempotency`

## Summary

`business_settle_daily_v2` did not follow the repository idempotency template introduced by migration 045 and already applied to the V1 business settlement function in migration 085.

The defect had two parts:

1. the function performed the idempotency receipt lookup before taking a key-scoped advisory transaction lock, allowing concurrent requests with the same key to race;
2. replaying an existing receipt did not verify that the receipt's business ownership belongs to `p_actor`, allowing a caller who knew another member's idempotency key to read that settlement receipt.

## Change

Migration `126-business-settlement-v2-idempotency.sql` replaces only the V2 settlement function and restores the required mutation order:

1. validate `p_actor`, `p_ownership_id`, and `p_idempotency_key`;
2. acquire `pg_advisory_xact_lock(hashtextextended('moneyverse:business_settle_daily_v2:' || key, 0))`;
3. read the existing receipt;
4. join the receipt to `virtual_business_ownerships` and raise SQLSTATE `28000` when it belongs to another user;
5. continue with the existing ownership lock, daily-settlement check, boost calculation, ledger transaction, and receipt insert.

The migration also re-states function ownership and the `PUBLIC`/`moneyverse_app` EXECUTE boundary.

## Verification

Added `backend/src/business/business-settlement-v2.db.test.ts` to verify:

- the advisory lock is present before the replay lookup in the installed function definition;
- replaying another member's settlement key is refused with SQLSTATE `28000`.

Database-backed verification requires CI or a connected scratch/staging PostgreSQL instance. The development mini-PC remote connection was unavailable during this change, so no staging deployment or production promotion is claimed here.

## Release gate

Do not merge/promote this update to production until all of the following are true:

- CI migration parity and database-backed tests pass;
- migration 126 is applied to the staging/test database;
- the staging backend starts successfully against that schema;
- same-key replay returns the original receipt with `replayed = true`;
- cross-user replay returns SQLSTATE `28000`;
- only after those checks should the normal production release procedure be followed.
