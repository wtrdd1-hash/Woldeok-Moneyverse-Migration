# v2026.11.10.2028 — P0 CI PostgreSQL security and casino ledger integrity

## Preflight 2026-11-10 KST
- Priority: urgent P0. Owner GPT via @미니pc홍, new isolated branch `fix/p0-casino-trigger-ledger-acl-v2026.11.10.2028` from SHA `a87c15156cdf87b5aacdcae293eeb556baa4be41`. Other workers' integration branch untouched.
- Authoritative docs reread: `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md`, `docs/RELEASING.md`, `packages/database/migrations/346-...` and runtime security test.
- GitHub Actions run `42757727717`, job `129636095891`, after classifier fix PASSED classification/release-input but PostgreSQL full suite FAIL: `backend/src/security/database-boundary.db.test.ts:44`, exactly one remaining SECURITY DEFINER function executable by PUBLIC: `public.trigger_casino_pigouvian_welfare_tax()`.
- Root source migration 346 creates this trigger function and attaches it to dice play INSERT, but omits revoke from PUBLIC. Also credits `VAULT_WELFARE` and writes only a reporting `system_treasury_ledger` row without provably matching balanced canonical postings/source debit. Tax cannot be certified as funded.
- Policy: never modify already-applied migration 346 or financial ledger directly; create minimal forward-only 347 to remove unsafe trigger and revoke PUBLIC + app execution. No retroactive correction. Follow-up requires provable fiscal/ledger reconciliation and an atomic funded tax design before enabling.
- Mandatory gates: TDD negative/positive, clean PG17 migration apply and DB security negatives, no unauthenticated public entry, exact-SHA Test authenticated/ledger/backup gates, PR before merging, zero-downtime Prod only if all pass.

## Midpoint and safety verification (2026-11-10 KST)
- TDD: two new static regressions RED with absent migration 347; GREEN 27/27 with new forward-only 347 and existing release classifier tests.
- Migration 347 does **only** `DROP TRIGGER IF EXISTS` and `REVOKE ALL ... FROM PUBLIC, moneyverse_app` inside a transaction. Never modifies old 346, tables, balances, journals or history.
- Added read-only `casino-pigouvian-fiscal-hold-v2028.db.test.ts` to prove both trigger absence and no PUBLIC/app execution in real PostgreSQL with `MIGRATOR_DATABASE_URL`. Tests skipped on hosts without DB; CI PostgreSQL required and skips are not a release pass.
- Root-cause risk: migration 346 updates `VAULT_WELFARE` without a corresponding canonical debit and double-entry settlement; inherited data **not** corrected. Separate financial source-of-truth / transaction proof remains blocking.
