# Backend B v681 — patched fast-uri advisory floor

## Before work
- Started 2026-10-31 09:34 KST. Main 761a55a094fb9dd383d213e817305e68c79fa23c.
- Fresh full audit before patch: 13 advisories (10 moderate, 3 low), including 4 fast-uri entries. Scope one P1 backend toolchain dependency vulnerability.
- QA v1409 and current main/EN+KO planning reviewed; A PR #2115 also touches pnpm-lock.yaml.
- Initial task worktree unexpectedly disappeared during lint, so isolated worktree was recreated outside the affected tasks directory. No other worktrees touched by this task.

## In progress
- RED: existing advisory test raised to >=3.1.9, 1 failing assertion.
- GREEN: fast-uri 3.1.9 locked; security regression 3/3 PASS; fast-uri audit advisories 0. Remaining full audit nonzero.

## Finished
- Awaiting final gates and CI. No main merge, Test/Production deployment, DB/finance mutation or scheduled task changes.

## Final verification (2026-10-31 09:49 KST)
- Code SHA `fc788840a71a986937efd9541abdd5d333b73d93` committed and pushed to isolated branch. The main SHA stayed `761a55a094fb9dd383d213e817305e68c79fa23c` at start, middle and final checks.
- TDD RED 1 failure (lockfile fast-uri floor), GREEN 3/3 PASS.
- `pnpm install --frozen-lockfile --ignore-scripts` PASS; lockfile contains only `fast-uri@3.1.9`.
- Full audit before: 13 advisories (10 moderate, 3 low), including four `fast-uri` (2 moderate, 2 low). After: 9 advisories (8 moderate, 1 low), zero fast-uri. **Full audit FAIL**, production-only audit 0 findings/PASS.
- `pnpm lint` PASS (0 errors; warnings remain); `pnpm typecheck` PASS; `pnpm build` PASS with 2048MB heap.
- Backend Vitest 2,778 PASS / 501 SKIP; Frontend Vitest 2,770 PASS with 4 workers (first 110-second run timed out; clean rerun exit 0 after 130 seconds); database package 62 PASS / 4 SKIP; API contract 184 endpoints PASS.
- Security/release focused node tests 22/22 PASS.
- GitHub PR #2120 Draft/HOLD. CI runtime-check FAIL at known Next.js `next/font` loader null-match TypeError in `frontend/src/app/layout.tsx`; A Draft #2115 addresses fonts and also edits lockfile. Build Test Candidate verify/runtime-check PASS, build check pending at last inspection. No rebase/merge before resolving this overlap.
- No new API or SQL contract; no DB schema/finance changes. Fresh isolated PostgreSQL, authenticated E2E, official Test exact-SHA and independent off-host restore were not run on this candidate; release remains BLOCKED.
- First task worktree under `/srv/moneyverse-data/tasks` disappeared during lint amid broader concurrent task-directory removal; restored independently under `/home/debian/moneyverse-task-records/dev-b-v681-fast-uri/repo`. Cause not established. This task did not remove other worktrees or alter shared checkout.
- Main merge NO; Test deploy NO; Production deploy NO; branch cleanup NO; A/C/Planning/QA/B schedules unchanged.
