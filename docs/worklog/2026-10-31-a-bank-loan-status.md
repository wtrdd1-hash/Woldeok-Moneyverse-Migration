# Development A — Owner bank loan status filter (2026-10-31 11:25 KST)

## Before work
- [x] Debian 13 miniPC and service preflight; origin/main and English/Korean integrated plans checked; current PR/branch/QA/CI inventory saved in private report.
- [x] Independent worktree created from origin/main; existing worker branches and releases untouched.
- [x] Scope: add a member-only read filter for bank loans by verified status (active/overdue/repaid), using the existing owner-scoped SQL function. Keep all loans default, source limit latest 20, no new DDL/financial mutation/permission grant.

## Plan
1. RED: tests for strict HTTP query, SQL owner binding, normalized loan response, Next member page and forged Android upstream data.
2. GREEN: Backend query/repository/service, read-only member UI and app-api strict response validation.
3. Validate targeted and complete build/lint/typecheck/unit/contract/security/isolated PostgreSQL, review exact SHA CI and official Test provenance.
4. Draft PR only; HOLD main merge and Production unless every release gate is proved.

## In progress
- [x] RED confirmed: Backend 3 failures; Frontend 3 missing modules and Android forged-payload failures; corrected contract build before asserting Backend RED.
- [x] Backend owner SQL-function filter, service/controller strict status, Next member page and Android fail-closed validation implemented; targeted 3 Backend + 8 Frontend PASS.
- [ ] Exact full gates and CI pending; first full test blocked by generated API contract drift (regenerated), first lint error in test numeric literal fixed; build and typecheck PASS. Independent PostgreSQL 17.11: 311/311 migrations and owner filter PASS; ROLLBACK 0/0/0. PostgreSQL 17.11 clean migrations 311 PASS; synthetic 21 owner/1 foreign loan rollback proof PASS (0 users/loans/ledger afterwards). Initial fixture oversized principal failed existing DB constraint; corrected to 500000; large-number precision covered by unit tests.

## Finished
- Pending final exact SHA verification and CI.
