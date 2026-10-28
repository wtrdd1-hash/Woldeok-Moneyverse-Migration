# C v1121 — Admin bank evidence and portfolio-wide risk

Status: STARTED / RELEASE HOLD. Base: a28bed9aa40ff74d492824ae12892a7d52132fdd. Branch: auto/hourly-c-bank-risk-evidence-v1121-20261028-1145.

## Scope and evidence

The `/admin/bank` page currently trusts a typed but unvalidated `/api/v1/admin/bank` response and `BankRiskDashboard` labels its default limited 50-loan sample as the whole portfolio. The NestJS endpoint returns authoritative `overview`, `grades`, `loans` through three PostgreSQL read functions, but frontend must validate the wire payload and compute portfolio-wide NPL from `overview`, not the loan-book sample. This is distinct from open A/B/QA/C work and does not modify ledger/DB schema.

## Plan

1. Write red tests for malformed money, UUID, status, dates, duplicate loans and overview-based portfolio risk.
2. Implement fail-closed response validation, retry UX and portfolio-wide figures, preserve mobile/keyboard/screen-reader/noindex.
3. Run exact-HEAD tests, lint, typecheck, builds, security audits, contract, real-PG isolated verification, CI. Hold merge/release unless every gate passes.

## Mid-run (2026-10-28 11:53 KST)

Main re-fetched unchanged `a28bed9aa40ff74d492824ae12892a7d52132fdd`; English/Korean project plan hashes `0dd578b2...` / `ab4fca03...` unchanged. TDD RED confirmed absent validator; GREEN focused 10/10. The NestJS GET `/api/v1/admin/bank` already reads authoritative PostgreSQL `admin_bank_overview`, `admin_credit_grades`, `admin_loan_book` (default loan limit 50), so no fake backend was introduced. Risk dashboard now derives counts and overdue/outstanding ratio from whole-portfolio SQL overview, not sample. Malformed wire evidence fails closed and exposes accessible retry; mobile layout and noindex retained. No SQL migrations or financial mutations.
