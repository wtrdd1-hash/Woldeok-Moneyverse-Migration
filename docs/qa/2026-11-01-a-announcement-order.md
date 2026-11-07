# Development A — Public announcement snapshot order QA (2026-11-01)

Status: **DRAFT / RELEASE HOLD**. This is a candidate, not a deployment or official Test attestation.

## Scope and provenance
- Base `origin/main`: `3d5e321c3d1221febff677469fecdfcb3cf42e7d` (checked before work, during work and before proposed integration). Feature commit `f636d193bb6a3d641b2a1734fdbaa6873444e842`.
- Isolated worktree: `/srv/moneyverse-data/tasks/mv-a-20261101-2055-announcement-order/repo`.
- Branch: `auto/hourly-a-20261101-2055-announcement-order`.
- Start audit: 122 open PR (121 Draft, 27 conflicting), 136 remote-tracking refs including main, 125 non-main with unique unmerged commits, 10 without. Final GitHub snapshot after Draft PR #2377: 125 open PR (124 Draft, 27 conflicting), **138 actual remote heads** including main; 128 non-main with unique unmerged commits, 9 without. A local remote-tracking stale ref was excluded from exact remote counts. No branches deleted: unique changes and other worker ownership preserved.
- Candidate: [Draft PR #2377](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/2377) with `hold` label. Final code SHA is unchanged from the tested feature commit; later QA-only commit SHA is reported in PR comments.
- Relevant overlapping Draft PRs: #2243 title search, #2347 date filter, #2359 image filter, #2362 pinned filter; no duplicate announcement ordering PR was found.
- English `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, and Korean `PROJECT_PLAN.ko.md` read. Prior QA and developer worklogs reviewed. No change to the integrated plan, because concurrent planning workers own it.

## Feature and integrity
- Both Nest public GET `/api/v1/announcements` and app GET `/api/v1/content/announcements` accept `sort=pinned|newest|oldest` (absence preserves the existing pinned-first order); duplicate, malformed and unknown query parameters yield 400.
- The existing `SECURITY DEFINER` function still selects **up to 20 published rows, pinned first**; ordering only rearranges this fixed snapshot. It does not paginate/search all historical notices.
- Next `/announcements` has an accessible GET sort form and explains the snapshot limitation; filtered metadata is `noindex` and canonical stays `/announcements`.
- Android app-api forwards the parameter, rejects malformed/duplicate queries, verifies sorted 200 responses (including duplicate IDs and invalid dates) and fails closed with 503 on unverifiable upstream data. Filtered results are `no-store`, `noindex`, `no-referrer`.
- No new migrations, direct table queries, grants, balance/ledger writes, auth bypass or production changes.

## Evidence
- TDD RED: `evidence/red.txt`, `evidence/frontend-red.txt`.
- Backend targeted: 10 PASS (`announcement-order.test.ts` + `content.service.test.ts`). Frontend targeted: 5 PASS (order validator + Android gateway).
- Production dependency audit (`pnpm audit --prod --audit-level=high`): EXIT 0, no known vulnerabilities (Node url.parse deprecation warning). Workspace typecheck: PASS. Backend typecheck after final service/controller edits: PASS. Frontend TypeScript in successful build: PASS.
- Full lint: EXIT 0, 0 errors / 1027 warnings. Explicit changed-file lint: EXIT 0, 0 errors / 1 pre-existing `<img>` warning.
- First workspace build: FAIL, frontend Next build worker OOM under 1024 MB heap. Retried frontend Next build with 2560 MB heap: **PASS**, 602 static pages, TypeScript PASS. Backend/contract build from the first workspace command completed before the frontend OOM.
- Database unit suite: 62 PASS / 4 SKIP. First Backend full run: 2973 PASS / 2 FAIL / 518 SKIP because `NODE_ENV=test` was omitted; profile HTTP expected 200 but received 401. Re-running the exact 8 profile tests with `NODE_ENV=test` yielded **8 PASS**. The first full result is not a valid production-code failure diagnosis; corrected Backend full suite under `NODE_ENV=test`: **2976 PASS / 0 FAIL / 518 SKIP (409 passed files / 103 skipped)**. The 518 DB/integration skips are NOT passing evidence. Candidate source SHA `f636d193bb6a3d641b2a1734fdbaa6873444e842`.
- Frontend first full command: 2380 PASS / 496 FAIL (invalid harness: `NODE_ENV=test` was omitted, so React DOM tests ran under production-mode behavior). This result is **not** a valid feature-quality baseline; rerun with the repository test environment is required. Corrected Frontend full suite under `NODE_ENV=test`: **2909 PASS / 0 FAIL (557 files)**. Candidate SHA CI: policy/classify checks initially running at PR creation; full exact-head runtime CI not yet PASS.
- Development PostgreSQL 17.11, `moneyverse_app` role, `BEGIN READ ONLY ... ROLLBACK`: published function EXECUTE=true, 1 published notice; oldest snapshot count=1. No multi-row positive DB ordering evidence. `SECURITY DEFINER`=true, DEV function owner=`postgres` (not the `moneyverse_migrator` owner described in AGENTS.md), `search_path=pg_catalog, pg_temp`; this is a DEV provenance discrepancy to investigate, not proof of a Production owner. `announcements` direct SELECT=true and `account_balances` direct UPDATE=true: P0 least-privilege violation in DEV, not evidence of Production privileges. See #993.
- Official Test public `/api/version` returned `e39af10f6a876f56b40b7e5a070cdb3dcb61d699` and Production returned `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834` at 21:09 KST, neither candidate SHA. Official isolated Test exact SHA authenticated flow, security/SEO/a11y E2E, independent restore, GitOps release, Production provenance: **BLOCKED / NOT RUN**.

## Decision
**HOLD**. Never merge on partial targeted PASS. Reproduce/repair mandatory failures in isolated repair branches owned by their respective workers, rerun full gates at the exact candidate SHA, then official Test and independent restore before considering a GitOps production release. No database migration, runtime restart, Test/Production deployment, rollback or branch deletion in this task.
