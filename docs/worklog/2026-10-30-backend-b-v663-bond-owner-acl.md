# Backend B v663 — owner-scoped treasury bond reads (RELEASE HOLD)

## Before work — 2026-10-30 18:34 KST
- Latest origin/main: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; parent stacked B v660 Draft #2011: `a902f415212c1713292808ad1a5bea92eb403c3f` (migrations 307–311). Independent worktree/branch `auto/hourly-b-v663-bond-owner-read-acl-20261030-1835`.
- Read `AGENTS.md`, `README.md`, English/Korean living project plans, open PRs, current CI, and Dev C v1197 / issue #2022. English canonical; Korean supporting.
- P1 reproduced by Dev C: clean PostgreSQL app role cannot SELECT `treasury_bond_holdings`, breaking authenticated holdings and repo-loan reads. Never grant direct table SELECT. Preserve all existing finance-write holds and other agents' work.
- Plan: add forward-only migration 312 with owner-scoped SECURITY DEFINER reads; replace direct repository SQL; RED/GREEN tests and isolated real PostgreSQL validation; then full required gates. Do not merge/deploy while any gate is incomplete.

## In progress
- [x] Add failing repository/DB source tests (RED: backend 2; DB missing migration).
- [x] Add migration 312, update repository, validate full-schema isolated PostgreSQL 17.11 (PASS).
- [x] Re-fetched origin/main (unchanged), checked latest planning #2025, Dev A #2026, Dev C #2023 and P0 #1984; ran local gates. Exact SHA/official Test remains BLOCKED.

## In-progress checkpoint — 18:38 KST
- New `bond_owner_holdings(uuid)` and `bond_owner_repo_loans(uuid)` return actor-only rows; no raw holdings/repo SELECT grants. Public `bond_public_catalog()` and `bond_public_read_totals()` restore member market display without private row exposure.
- RED tests reproduced two repository failures and missing migration; GREEN targeted 5 backend + 2 DB source tests; disposable PostgreSQL 17.11 applied all 002..312 and verified app-role grants, cross-owner scope, 64-bit money string precision, coupon-only aggregate, no member table writes. Test container removed.
- Existing unrelated subscription ledger containment tests on parent stack fail (6 tests) because Dev C v1197 safety fix is on a separate unmerged branch. Do not relax tests or claim finance-write certification. Exact Test/Production prohibited.

## Finished — 18:49 KST (PARTIAL / RELEASE HOLD)
- Changed repository reads for owner holdings, owner repo loans, public catalogue and public aggregate totals. Added migration 312, DB/static/HTTP regression tests and full-schema disposable PostgreSQL 17.11 script. No existing applied migration altered, no financial mutation, no shared DB changes.
- RED: repository 2 failures; migration file missing. GREEN: targeted Backend 9/9, DB source 2/2, isolated full-schema PostgreSQL 002..312 PASS including cross-owner and malformed actor, direct app-role SELECT/DML revoked, exact large integer string, public catalogue, coupon-only total and mismatched collateral owner. Synthetic Nest HTTP 3/3 included in targeted 9.
- PASS: full lint (0 errors, 1043 pre-existing warnings; new HTTP lint rechecked after fix), workspace typecheck, backend/frontend build, app API contract 183 endpoints, contract 41, database 62 PASS / 4 SKIP, security 31, production dependency audit zero known vulnerabilities.
- FAIL: Backend full 2,578 PASS / 118 FAIL / 496 SKIP; Frontend full 2,607 PASS / 53 FAIL. Six unrelated subscription containment tests are red because Dev C v1197 safety fixes remain local/unmerged; do not relax. Other finance and Test release gates remain unverified.
- Parent migration stack 307..311 Draft/HOLD; new 312 cannot merge independently. P0 #1984 production runtime identity remains OPEN. No official Test exact-SHA/auth/core-flow or Production smoke; release blocked. No main merge, Test/Production promotion, branch cleanup or scheduler changes.
- Final branch SHA, PR, and CI status are recorded in the GitHub PR and miniPC final task log, not assumed before commit.
