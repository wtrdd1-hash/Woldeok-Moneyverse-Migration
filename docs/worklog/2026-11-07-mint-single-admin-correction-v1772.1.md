# v2026.11.07.1772.1 — Mint obsolete two-person gate correction
Status: PLANNING / DOCUMENTATION ONLY / P0 FUNCTIONAL DEFECT STILL OPEN.

## START
- User challenged the v1772 plan for recreating a long-retired 2-person approval function.
- Inspected 2026-09-09 living-plan-sync: original two-person requirement already marked obsolete, single superadmin in implemented architecture. 2026-10-30 admin implementation removed repeated per-action reauthentication. Compared current central bank policy controller and approvePolicyOrder() which has no distinct-approver rejection.
- Repository main at start: 0b5b2b1385d2a75614d39458dff94f7d3098ed03; isolated docs branch docs/mint-control-recovery-v1772-20261107. Shared contributor Mint code remains untouched.

## MID
- v1772.1 corrects MINT-03 to single-superadmin policy/limits/actor audit, MINT-08 to the same operator freeze release, wizard, planned data model, API and tests to no second-operator requirement, no repeated action reauthentication.
- Updated EN/KO living PROJECT_PLAN and INTEGRATED_PLANNING_MASTER and the existing EN/KO v523 Central Bank/Mint/Treasury detailed spec that still mentioned conditional dual/quorum/step-up in outdated text.
- Updated existing EN/KO v1772 GitHub/internal updates, incident #2878, parent financial blocker #2366, and draft PR #2879. Kept ledger/idempotency/permission/CSRF/reason/transaction integrity checks.

## END
- This correction invalidates the incorrect two-person requirement in the original v1772 text. No admin login removal, no finance-hold removal, no application or DB modification, no Test/Production deployment.
- Branch and draft PR are documentation handoff only; the original user-reported mint malfunction remains unresolved pending verified implementation.
