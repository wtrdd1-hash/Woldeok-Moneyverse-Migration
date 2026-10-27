# B v599 — Admin bank loan-book query boundary (2026-10-28)
Status: IN PROGRESS / RELEASE HOLD.
- [x] Read latest main AGENTS/README/EN+KO plans, QA v1332, current open PRs/CI; isolated worktree from main.
- [x] Select P1 strict admin bank loan-book limit: GET /api/v1/admin/bank currently accepts scientific notation and whitespace after Number coercion; DB-bound calls on malformed input.
- [ ] RED tests: malformed query must return HTTP 400 with no DB access; direct repository calls must reject unsafe types and range.
- [ ] GREEN minimal fix, focused regression and real isolated PostgreSQL check.
- [ ] Full gates, latest main recheck, CI/PR, exact-SHA Test, release HOLD assessment.
No migration or ledger changes planned; other agent branches and reservations protected.

## RED checkpoint
- HTTP malformed/duplicate limit and canonical boundary tests added before implementation.
- Baseline vitest exit: 1; see /tmp/mv-b-v599-red.log (expected failing cases).

## GREEN checkpoint
- Controller rejects malformed or out-of-range wire values before all bank reads; canonical 1..200 remains accepted.
- No API response shape, database schema, authorization, ledger or WLD mutation.
- Focused HTTP and authoritative evidence tests passed. See /tmp/mv-b-v599-green.log.

## Verification and release gate — 2026-10-28 KST
- RED HTTP test: 9 failures, 12 passed before implementation. GREEN focused bank HTTP + evidence: 29/29 PASS.
- Isolated PostgreSQL 17.11 (scripts/qa/test-admin-bank-loan-limit-v599.sh) PASS against unmodified migration 264 function, with synthetic loan/identity/repayment schema: 1 and 200 accepted; 0/-1/201 SQLSTATE 22023; unauthorized SQLSTATE 42501; app direct SELECT denied; WLD numeric > 2^53 exact. Synthetic fixture, not complete production schema.
- Backend unit 1,705 PASS / 430 SKIPPED; Frontend 1,681 PASS; Typecheck PASS; Build PASS; API contract 180 endpoints PASS; changed-file ESLint PASS; control-bytes and Prisma checks PASS.
- Required full lint FAIL: inherited frontend/src/app/blog/blog-data.ts line 1213, two no-useless-escape errors (QA #1600 / QA PR #1606). Required full test FAIL: inherited duplicate migration 283 and missing 285 (QA PR #1610). No applied migration edited.
- Full root audit FAIL (2 Low / 9 Moderate); bot audit FAIL (1 Critical / 5 High). pnpm audit --audit-level high and --prod --audit-level high return 0 but do not satisfy full audit.
- No official authenticated Test exact-SHA API/DB/user E2E, complete applied migration chain, restore, GitOps release evidence. Merge and Production are prohibited. No live database, WLD, ledger or production writes.
- Other workers' branches and all A/B/C/planning/QA reservations preserved; no branch cleanup.
