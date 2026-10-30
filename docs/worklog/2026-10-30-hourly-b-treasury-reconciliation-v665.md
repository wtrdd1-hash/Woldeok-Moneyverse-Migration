# Backend B v665 — Treasury reconciliation evidence integrity

## Before work — 2026-10-30 20:37–20:39 KST
- Starting main: `bf8d0d48f810932b43783d8605dce53954c60cff`; remote `main` verified before and during work.
- Read AGENTS.md, README, English and Korean plans, open PRs, latest A/C/planning work, CI, and QA v1396. Avoided concurrent account privacy and inventory lifecycle tasks.
- QA v1396 found 126 Backend failures, including two treasury reconciliation assertions. Current main constructed `RECONCILED`, ledger net flow equal to vault balance, discrepancy `0`, and a new verification timestamp without an independent journal or receipt.
- Related issue #1976 and local-only v654 candidate were inspected; the earlier candidate was not pushed or merged.
- Scope: treasury read-only repository and tests; preserve existing API response shape, PostgreSQL tables, WLD balances, ledger and other agents' work.

## In progress — root cause and TDD
- Root cause: `verifiedTreasuryReconciliation()` inferred journal reconciliation from a vault sum and used wall-clock time as evidence.
- RED: six treasury assertions failed on main, including missing/malformed vault aggregates and the two pre-existing false-reconciliation assertions.
- GREEN: changed read-only reconciliation to `UNVERIFIED`, with unknown journal total/discrepancy/time represented as `null`. Missing, negative, fractional, or non-canonical vault aggregate now returns 503 rather than synthetic zero. Preserved canonical decimal WLD strings, including values beyond JavaScript safe integer.
- No new endpoint, SQL migration, DML, finance transaction, or grant.
- Real isolated PostgreSQL 17.11: two read-only tests passed using a temporary SELECT-only role; UPDATE was denied. Container removed immediately.

## Verification — 2026-10-30 20:39–20:48 KST
- Focused Backend treasury tests: 35 PASS, 0 FAIL; isolated PostgreSQL: 8 PASS (six tests plus two DB tests before the final additional precision test).
- Typecheck PASS; Backend build PASS; Frontend build PASS with 1536 MiB heap (1024 MiB attempt OOM).
- API contract check PASS (184 endpoints); Database static tests 62 PASS / 4 SKIP; selected security tests PASS; changed-file ESLint 0 errors / 8 existing warnings.
- Full lint FAIL: existing `frontend/src/app/api/shop/purchases/route.search.test.ts:99` parser error (1 error / 1043 warnings).
- Full Backend FAIL: 2,659 PASS / 124 FAIL / 501 SKIP (QA v1396 baseline 2,653 PASS / 126 FAIL / 501 SKIP).
- Full Frontend FAIL: 2,701 PASS / 55 FAIL. Release blockers remain; no official exact-SHA Test, authenticated E2E, full DB migration chain, independent restore or GitOps release certification.

## Finished / release control
- Draft/HOLD PR is required; do not merge while full suites, official Test and release gates are failing.
- No main merge, Test deployment, Production promotion, service restart, shared DB change, branch cleanup or automation mutation.
- Exact candidate commit SHA and PR reference are recorded in the miniPC task-end log and GitHub PR.
