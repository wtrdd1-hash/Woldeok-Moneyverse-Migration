# v2026.11.03.1652 Treasury core and finance admin evidence
Started 2026-11-03 13:20 KST. Source main 45599a6a49668c646dd70f36cbd1a3e7bfe08f92; development only, Test/Prod not yet changed. Separate worktree from another agent's dirty security-audit checkout.

Read AGENTS, integrated master, Treasury Core and Monetary/Mint specifications. Actual production DB read-only: 891 transactions/1829 postings, 0 Treasury unlinked, 0 Treasury funds, 0 pension escrow. App can execute treasury_core_post but not economy_post_transaction and cannot directly read/write protected funded receipts/positions. Legacy accounts/balances app DML grants still exist: do not claim full least privilege.

Actual KDIC service fund and two institution records plus ledger data succeed, both real data JSON validations pass. UI refresh discards both if either response fails and shows a false whole-system unavailable alert. Fix independent results, preserving true per-source error and finance settlement hold.

FX reserve is dated 2026-10-07 (about 27 days stale), fails intentional 24h freshness check. Do not claim live FX data. Mint legacy in-memory batches are not real WLD; approved policy orders and durable Mint/retirement certificates are currently zero. Display real data source state, no uncertified Mint operation.

Targets: KDIC independently refreshed safe evidence, database-backed Mint read-only status, Treasury Core ACL and ledger integrity verification, tests/CI/Test/Production validation.

## Midpoint
Midpoint: KDIC regression initially 2 RED, fixed per-source Promise.allSettled (14 KDIC tests PASS). Mint status evidence/UI tests 3 RED followed by 11 PASS, and BFF auth/invalid-input tests. Central Bank normal partial state no longer rendered as alarming header; frozen policy alert remains. Real Production app-role monetary telemetry returned approved 0, minted 0, retired 0, frozen false and verified_invariant false. Backend Treasury Core/KDIC/monetary 23 tests PASS, frontend related 32 PASS, scoped TypeScript and ESLint PASS. No DB writes. Current run has not deployed.

## v1652.1 transient refresh state
- Also fixed temporary false KDIC red outage while both requests are legitimately in flight: during refresh both previous observations are hidden (avoid old cross-epoch values), but loading is now an explicit neutral state and a red alert appears only after an actual failed response.
- Regression for pending Promise and no premature red alert: KDIC suite 8/8 PASS. On completion, each independent read controls its own visible data. This amendment requires new final commit CI and release identity.
