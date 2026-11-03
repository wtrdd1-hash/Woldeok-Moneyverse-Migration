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


## v1652.2 release closeout — verified merged-main Production
- PR #2626 final GitHub CI 41579739572 SUCCESS and merged main ea8a238d19725e07c9f9f22c2a4066fbeb4f52bf. Rebuilt exact merged source (shared contract, backend, Next BUILD_ID) and published immutable Test and Production releases.
- Exact-main official Test/Production strict runtime identity checks both ok:true, failures:[]; admin Treasury/KDIC/NPS/SOE/FX/economy and blog four languages HTTP200. Guest Mint source endpoint 401; Treasury donation and funded NPS write guest 401, forged Origin 403 on Prod canary.
- Zero downtime: existing Production 4254/4255 kept alive, new backend 4264/frontend 4265 promoted by atomic Nginx switch (6 backend + 15 frontend paths) with backup /srv/moneyverse-data/ops/finance-diagnostics/v1652-nginx-before-live.conf. production-current points prod-v2026.11.03.1652-ea8a238d1972; old release retained for rollback.
- 2026-11-03 14:00 KST post-release read-only financial audit: 891 transactions, 1829 postings, 42 accounts, 0 unbalanced, 0 mismatch, 0 unlinked Treasury; member 4,841,510 WLD unchanged, Treasury and pension escrow 0; KDIC fund 0/2 institutions with numericBalanced true and settlementReady false; Mint policy orders approved0/mints0/retirements0, frozen false, global verified invariant false. **No money transfer or minting.**
- Hourly QA 14:00–14:01 KST exited 0, 24 HTTP PASS/0 fail/2 login-gated NOT TESTED, both disks strict OK root52% used/data48% used, no eligible cache removed. Full functional QA and authenticated financial payout E2E not proven.
- [Final operational report](../releases/v2026.11.03.1652-finance-admin-evidence-prod.md). Legacy direct account/vault DML (P0 #993), unfunded pension/KDIC/SOE/Mint/CB settlement (#2366), stale FX source remain unresolved.
