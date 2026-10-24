# New Loan Origination Quote — implementation plan

## Scope
Member-only read-only pre-borrow quote. Existing bank_get_my_standing SECURITY DEFINER is the sole DB read. No new migration, DML, ledger or idempotency key. Server policy credit limit/rate, active loan, and requested principal drive result. Formula matches bank_borrow_policy_v210: ceil(principal * interest_bps / 10000). The quote is not a transaction, rate lock or guarantee.

## Tasks
1. TDD: write failing backend tests for exact large numbers, invalid/over-limit amount, no policy/standing, active debt and no mutation; implement pure quote and controller GET using signed-in actor. Verify RED then GREEN.
2. Add web /bank/borrow-quote page with authenticated standing and a bounded amount input; truthful pending/error/disabled states; noindex and no-store. Add focused component tests.
3. Verify app-api route mapping and add gateway contract test. Run lint, typecheck, unit, integration, real isolated PostgreSQL, build, security, accessibility, SEO and exact SHA CI. Record blockers without bypass.
4. Recheck main and plans mid/end; push independent Draft PR and EN/KO release notes; no merge or Production promotion unless all gates pass.
