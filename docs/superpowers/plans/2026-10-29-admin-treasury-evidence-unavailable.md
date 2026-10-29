# Admin Treasury Evidence Unavailable — C v1159 implementation plan

## Scope and design
The admin treasury view must distinguish a successful empty ledger (HTTP 200, genuine zero totals) from a failed/unverifiable ledger (B #1852 returns HTTP 503 and `apiOrNull` resolves null). No numeric fallback. Each revenue and expenditure section must remain visible independently and announce the failure to assistive technology. Keep current authenticated API no-store, force-dynamic page and admin guard. Do not change finance/DB or B's API contract. The frontend can be reviewed independently but release depends on B #1852.

## Task 1 — RED test
- Extend `frontend/src/app/admin/treasury/treasury-view.test.tsx` with independent null cases, 200-empty zero cases, accessible section status, and narrow/mobile layout classes.
- Run focused vitest and capture failure.

## Task 2 — GREEN implementation
- Modify only `frontend/src/app/admin/treasury/treasury-view.tsx`: replace conditional omission with distinct warning Card fallbacks, accessible status and no WLD totals on failure. Preserve successful existing tables.
- Run focused test and typecheck.

## Task 3 — Integration and release gate
- Add server-page integration regression for API-null/200 if feasible; verify no-store behavior via existing `api` contract and `force-dynamic`.
- Run exact HEAD lint, typecheck, build, test, API contract, security, isolated PostgreSQL and CI; capture skips and failures.
- Re-fetch main and plans, record B #1852 dependency, create draft PR; only merge and deploy after all release gates pass.
