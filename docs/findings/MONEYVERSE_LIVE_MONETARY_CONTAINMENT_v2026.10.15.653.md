# v2026.10.15.653 — Live monetary-policy containment and source remediation

**Status:** LIVE EMERGENCY CONTAINMENT VERIFIED; SOURCE CANDIDATE TESTED; FULL FINANCIAL/PRODUCTION ACCEPTANCE BLOCKED.
**Baseline Git main:** `57b37a3899964d805219f98f355c70bf1e052c05`. **Branch:** `fix/live-monetary-auction-containment-v2026.10.15.653`. Production still `prod-v600`; active Test still `test-v618-7fa3f245bbc3`.

Authority: `docs/planning/PROJECT_PLAN.md` > `INTEGRATED_PLANNING_MASTER.md` > adopted specs, economy v523 and UI v530 BLOCKED. Based on v652 source-wide investigation, earlier v639 Draft PR #844 (without merging), and checked actual running prod source before mutation.

## 1. Emergency live database changes — authorized by user's directive to correct errors

Before mutation, exact live `monetary_auto_regulation_configs(id=1)` had `is_enabled=true`, `last_evaluated_at=2026-10-15 01:47:57.608Z`, action `TAPER_CONTRACTION`. Hourly running source reads nonexistent `public.ledger_entries` and substitutes **500000/480000 WLD**; 318 event rows reflect this pair, with 169 linked APPROVED policy orders, zero recorded executed amounts and 4,225,000 WLD aggregate proposed ceiling.

1. **2026-10-15 11:06:30 KST:** one conditional statement changed **only** `monetary_auto_regulation_configs.id=1.is_enabled` from `true` to `false` (preserved all other policy configuration and historical evaluation fields). `evaluateAndExecute()` reads this flag every call, returns null without looking at ledger if false. Verified flag false by fresh SELECT, backend /health HTTP 200; no process restart and no change to release pointers.
2. **2026-10-15 approximately 11:12 KST:** reviewed policy status allowed values (including CANCELLED) and verified all 169 linked policy orders were APPROVED, had `executed_amount_wld='0'` and belonged to actual recorded auto evaluations. An atomic conditional UPDATE changed **only those 169 linked and unexecuted orders** to `CANCELLED`, preserving IDs, amounts, evaluation event histories, approval actor, reasons, and original evidence. Post-write SELECT confirmed **169 CANCELLED / 0 executed**. All policy orders in the linked set were previously APPROVED; 145 had expired, 24 had not. **No account balances, ledger postings, mint/retirement certificates, unrelated orders or feature switches were updated**.
3. The existing production `MintBureauService.executeAuthorizedMint` requires order.status APPROVED, so these cancelled orders no longer authorize minting. **Caveat:** the previous `retireAuthorizedAmount()` method did not validate the status of a supplied policy ID, although there is no exposed controller caller for that method. The source candidate below blocks policy-linked retirement too. A cancellation alone is not a substitute for full finance authorization acceptance.

**No automatic re-enable / auto-approval rollback.** The 169 cancelled orders remain forensic records; changing them back to APPROVED would re-open a false-data authority path. Re-enable only after an independently verified real canonical ledger source, reasoned re-approval and exact-SHA Test acceptance. DB rollback for the flag is technically possible but **unsafe under the deployed old source**; do not auto-run a blanket reversal.

## 2. Source fixes isolated from the running release

- Monetary auto regulator: no Test scheduling; production timer requires **explicit environment opt-in** `MONEYVERSE_MONETARY_AUTOREGULATION_ENABLED=true`. Its per-run DB `is_enabled` gate remains. Removed synthetic `500000 / 480000` fallback; missing ledger relation now fails closed, with no events/orders approved.
- Black-market: `GET market/secret-auction/active` -> `listAuctions()` now makes **a single SELECT**, excludes expired rows, never invokes money settlement. This prevents browsing-induced debit/SINK/item writes. Expired settlement remains an unaccepted finance workflow until a separately authorized idempotent canonical-ledger worker exists.
- Reused and revalidated previous v639 candidate's **single-client PostgreSQL BEGIN/COMMIT/ROLLBACK** helper for PvP and secret-market bid/auction settlement, stable row locks, conditional debit, failure rollback and cryptographic PvP RNG. This is **partial atomicity**, not canonical double-entry journaling.
- Mint bureau linked `RETIRE` certificates: one SQL statement checks a live policy is **APPROVED**, type RETIRE, not expired, within remaining amount, atomically advances its amount/status and inserts certificate. Cancelled or exhausted orders reject with 403-like ForbiddenException. Legacy **null-policy hard sink** path is retained as it is a separate previously supported flow; its eligibility and accounting evidence require separate economy review. Existing mint-issuance transaction limitations remain.

## 3. Executed tests

- Full frontend: **1,206 PASS, 220 files**.
- Backend non-database suite after safety additions: **1,196 PASS, 29 skipped, 148 files PASS**.
- Full monorepo TypeScript check and optimized production build **PASS**; **179 mobile API contract endpoints match**.
- Synthetic **isolated PostgreSQL database `wdmv_fix_v653` at 127.0.0.1:5580**, separate from production, with schema-only clone: **4/4 financial atomicity/failure-injection tests PASS**, and **1/1 real PG cancelled/approved RETIRE-order limit test PASS**, fixture tables created and rolled back in a transaction. Monetary policy safety tests, auction read-only tests and mint unit tests also PASS.
- The first database test against the shallow CI schema did not contain `monetary_policy_orders`; made transaction-local test-only fixture tables, reran and passed. No production schema migrated.

## 4. Remaining release blockers

- **P0:** 237 public tables writable by moneyverse_app, 11 public-callable SECURITY DEFINER routines; directly updating account_balances remains in eight backend files, including the transactional candidates. **No canonical ledger postings, role-negative tests or full migration/rollback acceptance.**
- **P0/P1:** on running prod-v600, unpatched source still has original GET financial side effect (until deployed), monetary policy original fake-data code (currently contained by DB flag), treasury claim/grant false-success branches. New code has not been promoted. No approved full DB-backed Test backend for this exact candidate, no 164-page ×5 authenticated browser gate, no zero-downtime release acceptance.
- **P1:** DAO repeat voting, backup role/IndexNow auth and broken CTA/candle errors are addressed in other unmerged candidates #844/v651, not silently claimed solved here. Android and database schema migration lineage pending.
- Operator should keep the live switch disabled and linked policies cancelled while source changes are reviewed. Do not allow the revised atomic auction flows into production without canonical postings and account-role validation.

**GitHub/change boundaries:** this branch is separate; shared main, other agents' worktrees and active server Test/Production aliases were not touched by the code edit. The only live data writes are the two tightly scoped emergency policy controls listed above; no funds or ledger entries were written.
