# v2026.10.31.1532 — Admin bond coupon history permission repair

Status: SOURCE_VERIFIED / OFFICIAL TEST AND PRODUCTION HOLD. Draft PR #2131.

## START
- Work continued on isolated `fix/admin-finance-incident-v20261031-1530`, without touching other agents' worktrees. Origin/main `761a55a094fb9dd383d213e817305e68c79fa23c` rechecked before/after implementation.
- Read authoritative AGENTS, DOCS_INDEX, DOCUMENTATION_POLICY, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER and RELEASING, plus bond repository, controller, SQL/ACL and tests.
- Actual Debian13 / PostgreSQL 17.11 / `moneyverse_app` reproduction, read-only: `bond_public_catalog()` returned 3 active bonds, `bond_public_read_totals()` returned valid zero aggregates. Original coupon history query JOIN `public.treasury_bonds` failed SQLSTATE **42501 permission denied**. Replacement JOIN `public.bond_public_catalog()` succeeded and returned the genuine empty coupon log result. This proves a backend read privilege error, not absent bonds.
- All unverified finance mutation HTTP 503 safety guards remain in place; no DB, role, migration or WLD mutation.

## MID — TDD / code
- RED: added SQL boundary regression to `backend/src/admin/bonds/treasury-bond-coupon-limit.test.ts`; expected 1 FAIL, 21 PASS. Replaces direct protected-table JOIN with already-authorized SECURITY DEFINER public catalog, retains bound 1–100 limit, exact WLD strings and fail-closed semantics.
- GREEN: 32/32 focused bond tests; 66/66 expanded bond tests across 12 files; workspace `pnpm typecheck` PASS; targeted ESLint PASS; backend Nest build PASS. Actual app-role SQL ran successfully with the new JOIN. Tests and build ran on the isolated miniPC worktree.

## FINISH — observed limitations
- Public Production continues to run a different, prior source release and remains unaffected by branch source changes. No authenticated official Test, full CI, live Production switch, or signed-in admin browser acceptance has been verified.
- DB evidence: 552 historical Treasury ledger rows (all missing canonical ledger_transaction_id), of which 502 fee recirculation, 26 market stimulus and 9 absorption; other types include injection and dividend. Historical vault total 220,923,528 WLD, canonical Treasury account 0 WLD; 0 persisted certified reconciliation runs. Do not fabricate matching journal links or mint a balancing deposit.
- Next: establish authoritative per-record provenance, restore-clone canonical Treasury/monetary reconciliation, funded idempotent NPS/KDIC/Treasury settlement, exact SHA Test+Production readiness/session+rollback gates. Bond read source fix is not payout authorization.
