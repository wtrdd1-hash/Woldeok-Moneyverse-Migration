# Development A — Recent Public Board Period CI Repair (2026-11-02)

## Before work — 11:40 KST
- The original candidate `0b8a7b339dead8766db9e61d6404a97356691950` failed GitHub candidate runtime-check (run 41377807142): `frontend/src/app/board/board-title-search.test.ts` expected the existing scope phrase `최근 공개 게시글 50건`.
- Full local retest with `NODE_ENV=test`: Backend 2,987 PASS / 518 SKIP; Frontend 2,927 PASS / 1 FAIL. Initial direct Vitest with inherited `NODE_ENV=production` was invalid for React DOM tests; it was rerun correctly. Build with 1,024MB heap OOM; rerun with 2,048MB heap PASS. Database 62 PASS / 5 SKIP; contract 41 PASS; lint 0 errors / 1,027 warnings; production audit 0; full audit 9 findings.
- Created fresh isolated repair branch from current origin/main and cherry-picked both original commits; original Draft PR #2463 and its branch remain preserved.

## In progress
- Corrected scope copy to retain the existing accessible wording and truthfully state at most 50 rows. Target 14 frontend tests PASS before repair branch creation; full exact-SHA revalidation and CI pending.

## Finished
- PENDING. No main merge, Test/Production release or branch deletion.


## Final evidence reconciliation — 11:50+ KST
- Exact repair runtime SHA `e887c8bd39e71d8dd54f4790ff8ea0ebce6b501d`; full repair Backend 2,987 PASS/518 SKIP, Frontend 2,928 PASS, DB 62 PASS/5 SKIP, contract 41 PASS, build/typecheck/lint exit 0, production audit exit 0, full audit 9 vulnerabilities exit 1.
- DEV READ ONLY SQL verified 0 recent rows and unsafe effective app-role balance UPDATE/item DELETE; official Test and Production `/api/version` both `510dbe6bf4d5…`, so candidate Test exact SHA and authenticated E2E BLOCKED.
- Final remote audit: non-main 217, unique unmerged 203, ancestral 14; open Draft PRs 199, conflicting 29. Merge-tree conflict evidence #2457/#2448/#2463; no branch deleted.
- QA: `docs/qa/2026-11-02-hourly-a-board-recent-period.md`; Release: `docs/releases/2026-11-02-hourly-a-board-recent-period-hold.md`. Full CI and candidate build pending; must recheck after this documentation commit.
- **DRAFT/HOLD**; main/production unchanged; Test deploy, rollback, production DB writes and service restarts not performed.
