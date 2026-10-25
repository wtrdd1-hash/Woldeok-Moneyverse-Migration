# Development B v536 — Collection GET provenance and read-only semantics

**Status: PARTIAL / RELEASE HOLD.** October 25, 2026, KST. This is a code change, not a release.

## Source, isolation, coordination

- Starting and mid-run `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- Branch: `auto/hourly-b-collection-readonly-v536-20261025-1835`; independent miniPC Debian 13.6 worktree.
- Read `AGENTS.md`, `README.md`, canonical `docs/planning/PROJECT_PLAN.md` and Korean companion, open PRs, QA v1272 (#1306), recent CI and Developer A/C branches before selecting scope.
- Coordination: Developer C #1145 owns the collection browser truth/verified holdings UI; this PR changes backend only, does not supersede or edit C's branch. Other development, Gemini, QA and planning branches were not touched.

## Reproduced P1 defect and code change

`PostgresCollectionRepository.listCollections(actor)` previously called `ensureSeedPieces(actor)` before reading. For a member with no holdings, an ordinary GET silently inserted four rare/legendary collectibles with invented provenance and dates, bypassing any authoritative entitlement/award event. `getCurationStatus(actor)` also inserted or updated progress during GET. Both were read side effects, not earned source-of-truth records.

- Remove automatic seed INSERT/COUNT and return only persisted, actor-filtered collection rows.
- Make curation GET return `null` if no stored progress; no INSERT or UPDATE from a read.
- Preserve explicit POST advance: first advance from no existing row starts at step 1, D7.
- Existing records are not deleted, rewritten, or retroactively certified; legacy provenance remains unverified.
- No financial/ledger mutation, no new migration, no DB role grant, no API route change.
- Contract: `GET /api/v1/collections` may return `{pieces: []}`; `GET /api/v1/collections/curation/status` may return `{status: null}`. Both GETs are read-only. Explicit curation advance remains a write and is **not** certified for Production.
- Frontend truth is **not** complete on main: browser placeholder/fallback and BFF reachability require C #1145 integration and authenticated E2E. Do not report an end-to-end feature completion.

## RED/GREEN and verification

- RED: new unit tests failed twice: synthetic INSERT on empty owner, redundant COUNT on held owner; curation GET attempted INSERT.
- GREEN: focused repository/controller tests 7/7 PASS; isolated PostgreSQL 17.11 real SQL tests 2/2 PASS using a disposable localhost-only port 56536, explicit database `mv_b_v536_isolated`, reader SELECT-only ACL. No Production/dev/Test DB was touched. Disposable container stopped and removed.
- `pnpm test`: FAIL on existing main frontend 6 cases (SEO x3, registration link, login touch target, M2 telemetry). Backend 1317 PASS / 400 SKIP; contract 38 PASS; DB package 15 PASS / 3 SKIP; frontend 1397 PASS / 6 FAIL.
- `pnpm typecheck`: PASS. `pnpm lint`: PASS, 0 errors / 1128 warnings. `NODE_OPTIONS=--max-old-space-size=2048 pnpm build`: PASS.
- Repository security floor 4/4 PASS. `pnpm audit --prod`: FAIL, 2 High. `pnpm audit`: FAIL, 2 Critical / 10 High / 11 Moderate / 3 Low.
- Official Test exact-SHA authenticated backend/API/DB/auth/core-flow E2E, release attestation, and independent restore: NOT RUN / BLOCKED. This branch has not been merged or deployed.

## Release safety

Never merge or promote on partial success. Outstanding blockers: main frontend test regressions, dependency audit, broad app-role DML and PUBLIC EXECUTE reported by QA, migration parity/Production checksum investigation, missing isolated full-schema app-role verification, authenticated Test exact-SHA and authorized GitOps release gate. Production HOLD.

## Internal / GitHub record

MiniPC logs: `/srv/moneyverse-data/build-workspaces/mv-b-v536-logs/` (start, RED/GREEN, PostgreSQL, full test, lint, typecheck, build, audit). Branch remains for review. No cleanup of another contributor's worktree or branch.
