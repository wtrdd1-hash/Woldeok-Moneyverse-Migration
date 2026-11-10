# v2026.11.10.2032 — P0 salary canonical ledger + SQL bindings: implementation/QA

## Before work — 2026-11-10 17:41 KST

Owner authorized Production promotion, but authentic independent Production PG17 clone showed a one-WLD admin salary fails under `moneyverse_app` because migration 346 uses unsupported `OUTFLOW` for `system_treasury_ledger` and omits `ledger_transaction_id` despite epoch provenance trigger. Both new TypeScript repository financial SQL calls use invalid bare `::type` instead of `$n::type` bind parameters. Never deploy the broken paths.

Source branch `fix/p0-otp-salary-ledger-sql-v2026.11.10.2032` created isolated from `release/p0-admin-otp-production-v2026.11.10.2031` SHA `f176aeefdc9deafd3b92c5f42a28d10a84bfde83`; refreshed remote main `3a7c34507a`, Gemini integration `a2db091644`. Master integrated planning, security priority, AGENTS, release guide reviewed. GitHub issue #3025. Never change Gemini worktree/main, 346 or 347 bytes; only forward 348. Production currently still public SHA 72788142 and DB at migration345, Test exact SHA9abb and DB347.

**Plan:** TDD RED for SQL named bind placeholders and salary ledger canonical linking; add forward-only 348 to correct salary transaction ordering, allow specific `ADMIN_SALARY` journal entry, include canonical journal transaction id and idempotency key bound into OTP intent; revoke legacy 4-argument app execute if replacing with 5-arg; prove positive and negatives inside network-none restored Production snapshot with ROLLBACK; run lint, TypeScript, tests, full GitHub CI, exact Test public QA, then only if gates green consider fresh main and zero-downtime Production. Preserve backups: immutable 165,062,177-byte Production dump SHA256 `8ce7ef423e2b5040e298a4466947b19df3f48e8b58a6aa9cf12138a11549dcc1` on both /dev/sda1 and /dev/sdb1, and finance restored clean with 908 canonical transactions.

**Release hold:** no real Production schema writes/traffic changes until positive salary DB evidence and real admin OTP signed-in full-path proven. Never invent successful deployment.
