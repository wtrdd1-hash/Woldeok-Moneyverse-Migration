# v2026.10.15.683 — Treasury read authority, donation safety, public truth

**IMPLEMENTED SOURCE CANDIDATE; FINANCIAL RELEASE BLOCKED.** [Korean](TREASURY_VERIFIED_READ_AND_PAUSED_PAYOUT_SPEC_v2026.10.15.683.ko.md)

## Precedence, verified defects, scope
PROJECT_PLAN → INTEGRATED_PLANNING_MASTER → v523/v542 Economy Core and Treasury fiscal conservation. Earlier v676 audit, v678 read-model PR #862 and v682 safety-gate PR #865 remain separate from Production.
- Deployed Production prod-v600 at 2026-10-15: scheduled SWF still stopped (`is_enabled=false`, last execution 14:47 KST) through 16:34 KST; no later FEE_RECIRCULATION entry. Encrypted backup verified before 14:51 emergency stop.
- Isolated cloned financial database `wdmv_treasury_v680`: 269–271 migrations applied **there only**. 269 wrongly inserts nonexistent `ledger_transactions.tx_type` and `ledger_postings.balance_after`, creating false success/failure risk. 271 correctly removes raw app-role SELECT from vault/journal, breaking v678 direct reconciliation SELECT.
- Public `/treasury` and `/api/treasury/overview` pretended that 25M WLD, 1420 recipients, five transactions and instantaneous eligibility were verified public finances. Those values were hard-coded.

## Implementation decisions
1. Forward-only migration 272 creates `public.treasury_admin_reconciliation(p_actor uuid)`: SQL SECURITY DEFINER, secured `search_path`, internal `admin_role_holder(operator)` check, PUBLIC EXECUTE revoked and moneyverse_app granted only this purpose-scoped function. The function independently calculates five vault balances, fiscal net flows, sum of absolute per-vault discrepancies, journal row breaks and amount mismatches, returning string NUMERIC aggregates. It does **not** claim a Core monetary bridge.
2. Backend reconciliation endpoint derives the UUID from authenticated server session, passes to service/repository parameterized `SELECT * FROM public.treasury_admin_reconciliation($1::uuid)`. Existing auth/Admin guards remain in place. `UNVERIFIED` is never promoted to `RECONCILED` absent evidence; discrepancy stays `DISCREPANCY`.
3. Donation paths: forward-only 272 replaces historical three-argument `treasury_user_donate` and four-argument `treasury_deposit_donation` with explicit SQLSTATE 55000 fail-closed functions. Backend route now returns 503 before invoking unsafe repository writes. No idempotent receipt is falsely asserted. **This is pause, not a completed donation feature**.
4. Public `/api/treasury/overview` now returns 503 and no-store, no fake recipient/ledger/wallet/eligibility data. `/treasury` explicitly displays accounting-review status without pretending vault money=0 or enabling claims. Reintroduce genuine public read-only financial statistics only once cross-ledger evidence, privacy and policy checks pass.

## Regression evidence and limits
- RED→GREEN: new scoped backend repository queries (previous raw SQL), Next public API (previously 200 synthetic data), migration 272 new function absent in older clone, operator and nonoperator privileges, both donation routes paused and no vault/donation/ledger mutation.
- Isolated restored Test DB migrations 269–271 plus 272: role-gated read, nonoperator denial and explicit donation hold; transaction rolled back. Backend 1191 PASS and 391 DB tests SKIPPED; frontend 1211 PASS; backend/frontend typechecks and production builds passed.
- Still BLOCKED: the **other** admin Treasury overview/revenue/transactions and legacy payouts use raw table access or direct balance updates under 271; SWF manual functions, bonds/NPS, 15,139,295 WLD subsidiary discrepancy, Economy Core provenance, exact-SHA authenticated Test and zero-downtime canary are not resolved by v683. Do not widen raw database grants to bypass the gate.

## Remaining ordered development
G2: full privileged read-model inventory and narrowly scoped role-checked read SQL, restore DAOs and reports. G3: idempotent Economy Core account-to-account conserved settlement for all tax/donation/dividend/grant/bond/NPS/SWF paths with receipt-key and reversible audit; negative tests for replay, actor spoof, source funding, reserve, concurrency, overflow and rollback. G4: verified public finance read model with EN canonical, KO secondary, mobile and accessibility. G5: restored exact-SHA Test frontend/backend/DB, migration checksums, role tests, no fake money, rollback rehearsal, session continuity, then reversible zero-downtime Production promotion only on full pass.

**No Production code, schema or balances modified in this v683 source task.**
