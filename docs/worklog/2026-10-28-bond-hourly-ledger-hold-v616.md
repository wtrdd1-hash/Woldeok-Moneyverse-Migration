# Backend B v616 — uncertified hourly bond coupon and maturity settlement HOLD

## Scope and root cause

The current `TreasuryBondRepository.processHourlyCouponsAndMaturities` directly credited member `account_balances` for coupon interest and principal redemption, then wrote bond-only coupon logs. Those writes had no `economy_post_transaction` double-entry postings, period-bound idempotency receipt, or certified Treasury funding. Repeated invocation could credit coupons again. Separately, the `AutoSovereignWealthFundService` tax cycle contained a second SQL `DO` block crediting coupons and matured principal with the same missing ledger boundary. The manual admin coupon POST was already held, but these internal paths were still reachable in source. This is a source-level P0 risk, **not proof of a live payout or financial loss**.

## Containment

- Repository hourly settlement fails HTTP 503 before obtaining a DB connection; the unsafe implementation is removed.
- Service hourly settlement fails HTTP 503 before invoking the repository or announcing a successful payout.
- SWF sidecar's unjournaled coupon/maturity SQL block is removed, leaving other SWF behavior unchanged.
- Existing read-only bond market, holdings, and coupon history remain available. No migrations, role grants, balances, or deployed databases changed.

## Verification and release decision

- RED: three regression assertions failed against the baseline code.
- GREEN: 17 focused tests passed; Backend 1,942 passed / 440 skipped; database package 46 passed / 4 skipped; backend TypeScript, build, API contract (180), security policy (9) and repository lint passed (0 errors, 1,099 pre-existing warnings).
- Production dependency audit fails on `qs@6.16.0` (Moderate, requires >=6.16.1). Full frontend/Next build and full real PostgreSQL/authenticated E2E/exact-SHA Test remain unverified. Shared data disk at 98%: no resource-heavy frontend build attempted.
- **Draft/HOLD**. No merge, Test deployment, Production promotion or branch cleanup. This does not complete the coupon/maturity feature: require canonical double-entry, deterministic per-holding/per-period immutable receipts, Treasury funds verification, replay/concurrency/rollback tests, UI status and authorized exact-SHA release gates.

Related issue: #1151. Independent open work: subscription #1736, repo-loan #1742, C coupon-reporting #1715. Their branches were not modified.
