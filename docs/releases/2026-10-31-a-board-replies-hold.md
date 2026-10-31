# Release HOLD — Public board reply-presence filter (2026-10-31)

**Decision: DO NOT MERGE OR PROMOTE.** Draft PR #2170; code candidate `510752cba2e798e08e6df19d93ae144d33ba5fc4`. Final documentation SHA in PR. Base main `1a3625f3c5e426c857e2b44a412d7949ac4a6257`.

## Required gates
- Full exact-SHA CI and candidate Docker build: awaiting new runs after two test-only fixes; previous code SHA CI failed two board tests.
- Isolated clean PostgreSQL full migrations + application-role authorization: NOT VERIFIED. Development DB read-only function proof is not equivalent.
- Exact-SHA official Test backend/API/DB/login/user-flow E2E: BLOCKED (Test `32c737a7...` != candidate).
- Production provenance: FAIL (backend `95485a29...`, frontend `1793422036848`, deleted v1515 process CWD). Independent backup restore, GitOps image/digest and zero-downtime rollback: BLOCKED.
- Host process capacity: FAIL/BLOCKED, MCP cgroup 1016/1027 tasks; issue #2171. No mitigation that would alter other tasks was applied.
- Financial invariant: no WLD mutation, no applied migration edits, no direct table grants, no schema change.

## Rollback and branch protection
- Before merge: leave Draft PR open and branch preserved; close only after owner review. No runtime rollback is necessary because nothing deployed.
- After any future authorized merge: reviewed code-only revert and new exact-SHA Test/Production validation; no schema rollback needed. Verify prior image availability before any promotion.
- Start branch/PR 96/87, end 97/88; non-main 89 unmerged/diverged, 6 main ancestors, 1 UNKNOWN; 8 conflicting PR. All preserved; deleted 0.
- Test deploy 0; Production deploy 0; service restart 0; production DB change 0; rollback 0; main merge 0.
