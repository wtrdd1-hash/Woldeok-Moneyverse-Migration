# B v696 — FX public read boundary

## Before work
- Baseline: 5bccda44d6db56aff05fa5623ef7f72b2ec0263c, branch auto/hourly-b-v696-fx-public-acl-20261031-2035; QA v1420 confirms official Test HTTP 500 on public FX due denied direct SELECT. Production seeded quote lacks fresh provenance.
- Independent worktree; no live DB mutations. Related Draft #2193 handles missing spot fallback, not ACL.
- Plan: RED regression for least-privilege public FX read functions and stale quote; forward-only migration; GREEN repository/controller; isolated PostgreSQL app-role tests; full gates and PR HOLD.

## In progress
- [x] RED tests for scoped read and source absence (5 failures).
- [x] Implement SQL read boundary without raw grants; absent/invalid spot fails closed; stale/seeded publication remains held by #2114.
- [x] Isolated DB and full code verification (release gates still BLOCKED).

## Finished
- Code: four public aggregate read functions in forward-only migration 314; backend FX repository uses scoped calls, never raw SELECT for these public data paths. No financial mutation or user-level FX exposure.
- TDD: 5 RED repository tests, missing migration RED; 5 repository and 5 SQL policy GREEN.
- Real PostgreSQL 17.11: 313 migrations applied twice in isolated ephemeral no-network containers; 4 raw table SELECTs denied; 3/3 Node app-role DB integration PASS; all test containers removed.
- Fresh root `pnpm test` PASS (contract 41, DB 67 PASS/4 SKIP, backend 2,791 PASS/504 SKIP, frontend 2,776 PASS). Mobile API contract 184 PASS; security 22 PASS; storage 5 PASS.
- Lint PASS 0 errors/1,049 warnings; Typecheck PASS; full Build PASS with 3,072 MB heap/one Next worker. Initial 1,024 MB build cap OOM; corrected without code change.
- Production dependency audit PASS 0 known; full dependency audit FAIL 13 (10 moderate, 3 low).
- Public Test FX remains HTTP 500 and Production HTTP 200 on deployed `bc8cd8a6...`; no candidate exact-SHA Test/authenticated E2E or independent restore proof.
- Release: DRAFT/HOLD. Do not merge or deploy. Related #2114 (source attestation/public hold), #2193 (same repository), and admin FX private reads remain unresolved.
- No shared DB, financial data, service, other branch, or reservation changed; no Test/Production deployment.


### Midpoint (RED → GREEN)
- RED: 5 repository tests failed against raw table reads; migration static test failed because migration was absent.
- GREEN: 5 repository tests and 5 migration policy tests pass.
- Implemented four public aggregate-only SECURITY DEFINER projections with fixed search_path and app EXECUTE grants; no member wallets, transactions, or raw table SELECT grants.
- Added actual app-role PostgreSQL regression tests (pending isolated execution).
- Note: publication of seeded/stale rates remains BLOCKED by existing Draft #2114; this PR is ACL only, not market-source attestation.

### Verification checkpoint
- Fresh isolated PostgreSQL 17.11: all 313 migrations applied including 314; all four scoped read functions callable as `moneyverse_app`; four raw FX source table SELECT attempts denied; no DML grant on reserve source.
- Backend full: 2,791 PASS / 504 SKIP (including 3 new DB tests without DATABASE_URL). Frontend full: 2,776 PASS. Database static: 67 PASS / 4 SKIP. Typecheck, contract build, lint, and mobile API contract PASS.
- First full Next build failed due an artificially low 1,024 MB Node heap (`JavaScript heap out of memory`), not a code assertion. Retrying with 3,072 MB heap and one Next build worker; release remains HOLD until confirmed.
- Read-only public smoke at 20:48 KST: official Test FX portal HTTP 500, Production HTTP 200; both public version endpoints report `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not candidate SHA.
