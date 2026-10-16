# P0 Financial Integrity, Treasury and Database Privilege Remediation Design — v2026.10.16.713

**PLANNING ONLY — reviewed design before any monetary code or privilege change.** [한국어](P0_FINANCIAL_AND_DATABASE_REMEDIATION_DESIGN_v2026.10.16.713.ko.md) · [Master proposal](PLATFORM_REMEDIATION_MASTER_BLUEPRINT_v2026.10.16.713.md).

## 1. Exact evidence and boundaries

- Isolated planning GitHub source starts at `be0335f3`. Live Production code version remains `a5a1e9da` (v697). Do not infer current production PostgreSQL grants from development tables.
- Read-only development schema inspection, 2026-10-16: `account_balances.available_amount NUMERIC`, `ledger_postings.amount NUMERIC`, `ledger_transactions` has `idempotency_key UUID`, `request_hash BYTEA`, `request_hash_version SMALLINT`, `reverses_transaction_id UUID`. Some historical SQL in 001 has `BIGINT` and older posting details; old migration signatures are not live-schema authority.
- `moneyverse_app` can directly SELECT/INSERT/UPDATE/DELETE `account_balances`, `ledger_postings`, `ledger_transactions`, `system_treasury_vaults`, `pvp_wager_rooms`, `stock_league_participants` in DEV. Separate v701 emergency operation removed PUBLIC EXECUTE of 11 definer functions; do not reintroduce it. Direct app DML is unresolved.
- `packages/database/migrations/269-fix-qa-treasury-ledger-and-app-grants.sql` and `271-reconcile-post-233-security-boundaries.sql` exist in source. 269 includes a treasury donation function writing balances and postings; 271 revokes specific table DML but does not comprehensively clean grants. Compare actual migration filename/checksum/owner state in each DB; never apply all filenames without parity.
- Source direct-update inventory: PvP, stock league, bonds, pension, FX, SWF, marketplace and black-market. Migration-defined SECURITY DEFINER routines may also contain direct updates; the audit inventory must include `pg_get_functiondef` by function identity and owner, plus job/trigger entrypoints.

## 2. Three independent ledgers / zero-variance equations

**A: Member and system accounts.** For a fixed high-water mark H, define an independently derived posting net for each account and compare against materialized account balance **with opening balance or snapshot adjustments defined explicitly**. Posting semantics (signed amount vs direction) must be read from current schema; avoid double-signing negative entries. Flag account_id with mismatch, but never expose another user account to the public.

**B: Treasury fiscal reconciliation.** Fiscal balance at H = independently certified opening fiscal balance + audited fiscal inflows − audited fiscal outflows. Compare to fiscal vault balance/cash treasury account **after excluding internal vault reallocations, locked commitments, pledge liabilities and mirror-account double counts**. A fiscal sub-vault redistribution is not a new receipt; an unfunded SWF coupon is not revenue. Supply certificate refs required for Mint/retirement legs, not for same-supply treasury transfers.

**C: Monetary supply.** Supply at H = certified opening supply + approved minted WLD − retired WLD. Independently enumerate valid user, business, treasury, bank, locked and other accounts without counting a mirrored treasury vault twice. Define rounding/overflow and any mint/sink negative-balance accounting. Ensure previous and current snapshots can be compared at a stable H.

**Reconciliation evidence record (proposed fields):** `run_id UUID`, `source_db_identity`, `source_release_sha`, `schema_migration_checksum`, `ledger_high_watermark`, `snapshot_started_at`, `completed_at`, `policy_version`, `scope`, `opening_balance_basis`, `left_total_wld TEXT`, `right_total_wld TEXT`, `variance_wld TEXT`, `unmatched_count`, `status`, `error_code`, `manual_hold_reason`. Result states: `PENDING`, `RECONCILED`, `DISCREPANCY`, `INCOMPLETE`, `UNAVAILABLE`. Never render successful `last_reconciled_at` from `new Date()` without a persisted completed run.

**Critical negative fixture:** Deposit or alter exactly +1 WLD on a disposable restored Test ledger projection without corresponding posting; reconciliation must show +1 difference and hold risky disbursement. Then restore the fixture in the *isolated Test copy*, never live data.

## 3. Canonical domain command envelope and idempotency

Proposed common domain contract (logical interface, not approved SQL name):

`executeEconomicCommand({ actorId, commandType, commandId, requestHash, policyVersion, approvedRoleContext, amountWld, domainArgs }) → { state, operationId, transactionId, postings, balances, domainReceipt, committedAt }`.

- Authentication and actor resolution occur server-side; clients do not choose effective operator or allowed treasury account.
- `commandId UUID` is unique per intended economic outcome. Retries with identical actor, commandType and canonical payload hash return the same committed outcome. Reuse with a different hash returns `IDEMPOTENCY_CONFLICT` and creates no postings.
- A domain command takes required rows/leases with consistent ordering; validates status/switch/amount/role/limits/reserves **inside the same DB transaction** before any financial state change.
- A debit and credit posting and balance projection, relevant domain state and outbox/audit must commit or rollback together. If the existing general ledger command has application EXECUTE revoked, the domain SECURITY DEFINER owner can use it internally if its schema/owner authority is proven, but the app cannot call the raw primitive.
- Expose `GET operation status` (actor-scoped), including `UNKNOWN_RECONCILING` when request timed out but commit state is uncertain. API emits RFC 9457-style stable error codes, request id and safe remediation hints, not internal SQL/secret data.
- Amounts use canonical integer strings at JSON boundary; SQL `NUMERIC` and explicit integer checks in trusted commands, never floating `parseFloat`/JS `Number` for ledger math. Establish explicit policy for fractional FX rates so resulting WLD settlement rounds once at the journal boundary, not at each display calculation.

## 4. PvP end-to-end settlement decision

Current `backend/src/casino/pvp-arena.repository.ts` uses one `withPgTransaction`, ordered balance locks and Node crypto `randomInt`. Preserve these protections. However direct `UPDATE public.account_balances` at 347/358/368 has no corresponding canonical `ledger_postings` for the transaction.

Choose a **single** funding model before implementation:
- **Model A (recommended minimum-change):** hold no funds at room creation. On second player join, under a single locked transaction verify both balances, debit exactly stake from losing player, credit winning player's net profit `stake - fee`, credit treasury fee `round(2 × stake × feeRate)`. Creator stake was never held. In example stake=10,000, fee=600: loser −10,000, winner +9,400, treasury +600, net 0. Postings reference exact three account deltas. Do not announce gross winner payout as an additional wallet credit.
- **Model B (escrow-first optional):** debit both participants at joining/acceptance, credit 2×stake into escrow, then from escrow pay winner 2×stake−fee and treasury fee. This needs escrow reservation, cancellation refund and expiry semantics and therefore a separate approved design.
- **Do not mix Model A and B.** In both, payout/event amount text must say profit vs total return unambiguously, maintain outcome audit, enforce room transition idempotency and prevent parallel joiners.

Negative tests: same room joined concurrently by 2 opponents; same user replays request and commandId; room owner cannot self-join; loser balance changes between create and join; insufficient funds, frozen/closed account; no treasury account; too-large numeric; canceled room; transaction crash before outbox; missing winning notification; random tie draw recorded; upper-limit rounding; legal/feature-switch deny; customer times out after DB commit and status GET returns receipt.

## 5. Every source path to sweep (not an assertion of current exploit)

| Domain | Source to inspect | Required command and rollback evidence |
| --- | --- | --- |
| PvP | `backend/src/casino/pvp-arena.repository.ts` and `pvp-arena.controller.ts` | room lock → 3-legged journal → receipt, double-join denial |
| Stock league | `backend/src/stock/stock-league.repository.ts` | entry fee debit/treasury or pool credit; one participant per season; payouts/reversals |
| Auction/marketplace | `backend/src/marketplace/black-market.repository.ts`, `marketplace.service.ts` | reserve/escrow, release after losing bid, seller transfer and fee; winner claim once |
| Bonds | `backend/src/admin/bonds/treasury-bond.repository.ts` | principal source, minted vs treasury-funded coupon, maturity/time unit, partial redemption |
| Pension | `backend/src/admin/pension/national-pension.repository.ts` | member payment / match source / 95:5 allocation, refund and lifecycle proof |
| FX | `backend/src/admin/fx/fx.repository.ts` | rate snapshot, spread, currency reserve counterparty, WLD exact amounts |
| SWF | `backend/src/admin/treasury/auto-swf.service.ts` | source-backed realized income only; no accrual as spendable WLD, scheduler hold |
| Treasury | `backend/src/admin/treasury/treasury.repository.ts`, `269*.sql`, `240*.sql` | audited journal-vault delta and grants/lottery/disbursement eligibility |
| Central bank | `backend/src/economy`, `packages/database/migrations/244*.sql`, `245*.sql`, `267*.sql` | minted/retired certificates; independent policy role; no AI direct Mint |
| API/Admin | `backend/src/admin/treasury/treasury.controller.ts`, `frontend/src/app/admin/treasury` | actor-bound status, step-up, receipt or explicit unavailable |

File names and function SQL signatures must be refreshed on current main before creating each implementation PR; domain-specific adjacent tests and contract descriptions are part of each slice.

## 6. SQL authority migration staging

1. **Discover:** in restored **Test**, inventory `schema_migrations(filename,checksum)`, function signatures and owners, role memberships, inherited grants/default privileges, DB versions, all direct DML call sites and dependency graph. Freeze a signed pre-state.
2. **Expand:** add new restricted functions, narrow views and idempotency records **only in a fresh contiguous migration from the actual main floor**. Include `SET search_path` excluding untrusted schemas and `pg_temp` last; revoke PUBLIC in same transaction; explicitly GRANT EXECUTE only needed app/service role. v701 emergency change must be reconciled to prevent PUBLIC rights recurring after deployments.
3. **Shadow verify:** run migrated legacy data copy with old and new transaction engines side by side in read-only dry-run, compare intended effects; no duplicate actual ledger write.
4. **Cutover by domain:** enable a named backend path on isolated Test; run real role denied and allowed test matrices; only then consider reviewed Production feature release with staged monitor, no auto-positive UI.
5. **Contract/revoke:** verify zero runtime callers of raw protected DML in release candidates, then remove protected INSERT/UPDATE/DELETE privileges from app on named core tables. Keep intentionally scoped session writes. Verify actual privileges after role membership and PUBLIC expansion. An abrupt global `REVOKE ALL` is not acceptable.
6. **Recovery:** if new code fails, stop affected writes; roll back code only if schema remains backward-compatible and does not restore forbidden privileges. If a forward migration changed schemas incompatibly, apply separately reviewed corrective forward migration; do not edit already applied files or reset the DB.

**Migration numbering risk:** source includes 269/270/271; Production v697 report says 266 recorded migrations and max applied 268, with a noncontiguous history. Do not declare migration `272` available until exact GitHub current main and both DB `schema_migrations` are compared. Never backfill/falsify applied checksum rows.

## 7. Acceptance checks for finance-specific release

- [ ] No known financial write path directly updates account balances except within formally approved narrow definer ledger commands; negative app-role tests reject direct protected DML.
- [ ] Each posted operation balances exactly and links to user-visible receipt, domain state and outbox.
- [ ] One economic result per idempotency key even under concurrent 50-way retry; conflicting payload rejected.
- [ ] Treasury, account projections and monetary supply independently reconcile to zero variance at same snapshot. No hardcoded `RECONCILED` or stale green.
- [ ] Arbitrary historical gap cannot be disguised with Mint or SWF projected returns.
- [ ] Scope includes duplicates, reverse/chargeback, account freeze, session expiry, malicious/other-actor requests, >2^53, boundary amount, 401/403/409/429/5xx and crash/restart.
- [ ] Restored-production-equivalent Test DB migrated using checksummed forward-only chain, with app/migrator role differentiation and backup-restore.
- [ ] Exact SHA Test front/back/DB + user/admin authenticated E2E + pre-existing session cutover + zero-downtime release and rollback evidence.
- [ ] No Production money writes performed by this proposal. Each later migration and release requires its own authorization and audit.

**Primary references:** PostgreSQL 17 [CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html), [default privileges](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html), [REVOKE](https://www.postgresql.org/docs/17/sql-revoke.html), [row locks](https://www.postgresql.org/docs/17/explicit-locking.html). Existing adopted v523 and v542 specifications prevail where this proposal is undecided.
