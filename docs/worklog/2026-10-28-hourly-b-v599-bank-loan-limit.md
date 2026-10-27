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
