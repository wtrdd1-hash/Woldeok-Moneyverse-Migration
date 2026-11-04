# v2026.11.04.1742 — Actual finance service recovery / NPS funded access

## BEFORE — 2026-11-04 KST
Owner instructs all Treasury, NPS, SOE, KDIC, Mint, CB, SWF functions to truly work with real canonical settlement; no more canary-only or read-only reports. Baseline current main ff9839bdea923157b5903e21afb63a82a54bfdc1, live Production/Test same exact main release (v1740), SQL329–333 on Production. Read master DOCS_INDEX, AGENTS, Treasury Core, release gate, issue #2366, latest PR list including concurrent Mint repair #2683 and dynamic-tax branch #2682. Dedicated isolated worktree fix/finance-fund-backed-services-v1742-20261104; will not edit Mint/tax work.

## ROOT CAUSE & SCOPE
- Live account types only ESCROW (3), MINT, SINK, TREASURY, USER_BANK, USER_CASH; no separately funded SOE issuer account in current canonical ledger. Treasury public overview reports 0 spendable WLD, so SOE/KDIC/unfunded periodic pension payouts cannot lawfully settle by bypassing the ledger.
- New funded Treasury Core NPS contribute/withdraw actually works under authenticated, CSRF, idempotent API and isolated real PG tests. But public /pension primary portal always describes every operation as paused and disables legacy contribution/liquidation/toggle. New functional funded panel appears **below** that full legacy historical section, confusing users into believing NPS fully offline.
- Legacy backend direct account/vault writes are still fail-closed. We must never enable those by removing holds. Instead make funded canonical NPS the primary public transaction surface while labeling historical-only read screens accurately and retaining old monetary holds.

## PLAN
1. Add frontend regression tests that fail while funded authenticated canonical panel is hidden below legacy portal, and assert legacy actions remain held.
2. Move the funded panel to primary placement and update semantically accurate NPS portal explanatory copy without misrepresenting unfunded hourly pension payout.
3. Run targeted frontend tests, typecheck, lint, full CI, official exact-main Test and Production release gates if safe.
4. Record bilingual internal/GitHub changelog, start/mid/end worklog, master docs; check latest main mid-change to avoid conflict with Gemini.
5. Separately inventory SOE/KDIC/SWF/Mint blockers; do not claim full operations if no verified funding/approvals.

## MID — pending
## END — pending

## MID — first actual correction
- Reproduced NPS public UI defect: working funded deposit/refund panel was below massive paused legacy portal; older historic transfers rightly fail closed.
- TDD created new SSR tests and observed 2 RED before change; moved canonical funded panel to first section for logged-in users, clear guest login explanation, existing legacy protected historical records below; targeted 7 GREEN after change.
- Validated actual funded path remains session/CSRF and strict replay-safe DB receipts. Legacy hourly pension and unverified liquidation remain held, never unconditionally unpaused.
- Shared contract build then frontend TypeScript PASS, focused ESLint 0 errors (7 pre-existing legacy warnings); diff check clean.
- Live accounts have no funded SOE issuer account type and Treasury holds 0 WLD: these payments need approved real sources, not synthetic WLD. Independent Mint #2683 and tax #2682 work untouched.

## ADDENDUM — 2026-11-04 explicit Production approval and actual promotion v1742.1
Operator approved Production promotion. After exact-SHA official Test, immutable v1742 frontend/backend Production built and started on independent localhost4494/4495, prior v1740 on 4484/4485 retained. Pre-cutover Production financial readiness PASS and full DB/Nginx rollback backup captured. Nginx was atomically rerouted/reloaded without stopping workers, then production-current switched; official Production identity ok:true/failures:[], actual public HTTPS main routes HTTP200. Existing canonical 891 tx, 1829 postings, 42 balances, 1902 sessions and 0 new receipts unchanged. Full start/mid/end and release SHA evidence in docs/worklog/2026-11-04-finance-v1742-production-promotion.md and docs/releases/v2026.11.04.1742.1-nps-funded-prod.md. **Scope NPS funded entry UI only; all other unsupported monetary payments #2366 NOT resolved.**
