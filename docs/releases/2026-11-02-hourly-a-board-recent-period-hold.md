# Release Gate — Public Board Recent Period (2026-11-02)

**Decision: HOLD; no Production promotion.** Runtime code candidate `e887c8bd39e71d8dd54f4790ff8ea0ebce6b501d`, based on main `a8541927c3a351d980454c66e95a3356c47e0722`. Any later documentation commit needs its own exact-SHA CI evidence.

| Gate | Status |
| --- | --- |
| Local backend/frontend/database/contract/build/typecheck/lint | PASS with 518 backend and 5 database skips, 1,027 existing lint warnings |
| Production-only dependency audit | PASS |
| Full dependency security audit | FAIL — 9 findings |
| DEV PostgreSQL least-privilege ACL | FAIL — balance UPDATE and item DELETE allowed to app role |
| Official Test exact candidate SHA | BLOCKED — public Test version is `510dbe6bf4d5…` |
| Authenticated Test user-flow E2E and independent restore | BLOCKED — not run for candidate |
| CI and image build | PENDING at report creation; verify latest exact SHA |
| GitOps release/rollback verification | BLOCKED |

**Rollback:** No release, migration, data or production change was performed, so no rollback executed. If future deployment is approved, follow GitOps release and immutable-image rollback runbook, verify smoke/login/version/DB on exact main SHA. Preserve all unique branches; delete only verified fully integrated refs.

See `docs/qa/2026-11-02-hourly-a-board-recent-period.md` and `docs/worklog/2026-11-02-hourly-a-public-board-recent-period-repair.md`.
