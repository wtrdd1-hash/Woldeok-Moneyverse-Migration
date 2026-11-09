# v2026.11.09.1944 — Owner-approved Treasury reset assessment and unbacked SWF correction

## BEFORE WORK — 2026-11-09 KST
- Owner expressly authorized Treasury reset if needed to resolve the financial release blockers and proceed with the v1941 monetary proposal UI promotion. This is not authorization to alter user wallets, canonical postings or audit evidence without a proof-backed, reversible accounting plan.
- Source read: AGENTS.md; docs/planning/INTEGRATED_PLANNING_MASTER.md; docs/DOCUMENTATION_POLICY.md; docs/RELEASING.md; earlier Treasury reset incident v1611; migrations 249, 314, 325–328, 337, 339–342; backend treasury repository, public proof and public release guard. Branch based on current origin/main SHA `433cbb0ff67640a1e72a7704d4584c4992f05023`. Existing other-agent worktrees left untouched.
- Authoritative live DB `woldeok_moneyverse_dev`: Treasury vault total, canonical Treasury balance and journal net all exactly 191,055,911 WLD; five vaults, current epoch source proof invalid_new_sources=0, old archive 552 Treasury/744 dividends with pinned pre-reset SHA. This is real canonical state, not an isolated UI cache error.
- 2026-11-05 01:24 UTC: one SWF_PORTFOLIO_LIQUIDATION created 181,056,161 WLD via MINT→TREASURY two-posting journal and VAULT_MAIN increase. Source migration 339 uses the SWF portfolio's marked-to-model valuation, not independently settled third-party stock-sale cash. Migration 249 inserted illustrative portfolio holdings without settlement receipts. Legitimate 10,000,000 WLD policy seed and two small prior payouts (180 + 70 WLD) also exist. A blind full Treasury reset would destroy their state, invalidate current proof and repeat the previously documented reset failure.
- Release guard `safeTreasuryEdgeResponse` accepts current-period certified Treasury positive balances only if the amounts are literal zero. Production returns 191,055,911 WLD and fails this gate, but the backend's fiscal snapshot equality proof does NOT by itself certify economic provenance of model-priced SWF liquidation. Production runtime also lacks current immutable manifest and frontend source SHA; signed-in session continuity unverified. A reset alone cannot repair those independent release blockers.
- Preliminary decision: preserve all canonical transactions, user balances and payment receipts; **do not execute live destructive reset** before a signed full backup, isolated PG17 restore, strict one-time adjustment design, non-regression of treasury_fiscal_proof_read, owner-visible audit receipt and exact Test/Production release gates. Prior migration 325 explicitly refuses resetting nonzero or linked current fiscal rows, so reusing it here is invalid.

## IN PROGRESS
- Verify source-created synthetic SWF issue and safe rollback possibilities; inspect source-defined guard and evidence before implementing correction.
- Check latest origin/main at midpoint and record any drift. If a safe, tested correction is possible, use an additive migration and an isolated Test/clone; never modify applied migration 339.

## FINISHED
- Pending evidence and release disposition. No assertion that Production has been reset or promoted.
