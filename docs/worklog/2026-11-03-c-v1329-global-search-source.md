# Development C v1329 — Global Search Query and Viewer Evidence

## BEFORE WORK — 2026-11-03 09:45 KST
- [x] Connected to Debian 13.6 miniPC; backend/frontend/bot/MCP/desktop/Nginx/Docker active; DEV PostgreSQL connected.
- [x] Fetched `origin/main` = `e83ad8a6d1b8d477bfbe661ea3cffd46f270509c`; created isolated `auto/hourly-c-v1329-global-search-truth-20261103-0945` worktree. Shared security audit worktree untouched.
- [x] Read AGENTS.md, README.md, README/README.ko.md, canonical PROJECT_PLAN.md and Korean companion; inspected active PRs, CI, planning, QA and A/B work. No open PR targets this exact global navigation search input/viewer source defect.
- [x] Confirmed defect: `/search` declares `q?: string`, but Next.js may supply repeated `q` as `string[]`; `.slice(0,80)` then `.trim()` can throw. `currentViewer()` also silently converts auth API outage to signed-out, misreporting member search access.
- [x] RED: add query/viewer source tests and observe failures.
- [x] GREEN: normalize untrusted query and preserve unknown viewer state; accessible error/retry, no member/admin data leakage.
- [ ] Verify exact SHA with lint/typecheck/build/unit/contract/integration/security/real PostgreSQL/E2E and CI; document each PASS/FAIL/BLOCKED.
- [x] Re-fetch main during work and before any merge. Do not merge/promote until all required gates pass.

## IN PROGRESS — 2026-11-03 09:47 KST
- [x] RED: 4 new tests failed because untrusted query/audience parsers did not exist (5 baseline tests passed).
- [x] GREEN: strict NFC/80-codepoint single-value query parser; malformed/duplicate queries display accessible error rather than 500.
- [x] Viewer evidence: `viewerOrUnknown` uses existing Nest `/api/v1/auth/viewer`; an unreachable/malformed response stays UNKNOWN and only public navigation is exposed. No fabricated auth state or new DB grants.
- [x] Search-specific noindex, private no-store, no-referrer HTTP headers for default and locale routes.
- [x] Focused search tests 9/9 PASS; pending final regression and HTTP evidence.


## FINISHED — 2026-11-03 10:03 KST (DRAFT / RELEASE HOLD)
- [x] Fixed source-backed P1: repeated or malformed search query no longer throws; an auth viewer outage is no longer represented as signed-out. Existing Nest `GET /api/v1/auth/viewer` contract remains the only authority; no UI-only fake server state, new DB grant or financial write.
- [x] E2E RED/GREEN: initial HTTP regression revealed `/zh-CN` and `/zh-TW` are not valid app locales (404). Corrected route/header patterns to supported `ko,en,ja,zh,vi`; repeatable `scripts/qa/global-search-http.test.mjs` now **8/8 PASS** against isolated Next server. `/search` and 5 locale routes returned 200 with `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`. Duplicate query shows accessible invalid-input notice; viewer outage shows UNKNOWN/public-only notice.
- [x] Source production `/search?q=wallet` still returned `X-Robots-Tag: index, follow` (2026-11-03 10:01 KST), proving the undeployed issue; official Test/Production `/frontend-version` both `109c0322699ce4b8588498ad765d56d09c9dce8e`, not candidate.
- [x] Lint PASS (0 errors, 1027 warnings); Typecheck PASS; Build PASS; Frontend 2955 PASS; Database 72 PASS/5 SKIP; mobile app-api 184 endpoints PASS; security 17 PASS.
- [x] Isolated PostgreSQL 17.11 applied 327 numbered migrations (002–328), auth/session DB 21 PASS, `moneyverse_app` direct `users SELECT=false`. Ephemeral container removed; no shared DEV/Production DB mutations. First attempts hit an occupied port, missing host `psql`, and a wrong migrator role; corrected via random host port, container psql wrapper, and `moneyverse_migrator` role before final PASS.
- [ ] Backend full suite: 2983 PASS, **2 FAIL**, 518 SKIP. Pre-existing `profile-private-response.http.test.ts` expects HTTP 200 but receives 401 for two owner-only routes; not caused by search change. No false PASS.
- [ ] Dependency audit: **9 vulnerabilities (8 moderate, 1 low)**. Full-route QA: **FAIL**, missing `artifacts/qa/full-route-ledger.json`. Official authenticated browser/Android E2E, exact-SHA Test release and independent restore: **BLOCKED**.
- [x] GitHub candidate CI and Test-candidate build at implementation SHA `919d2d8ed055ff336753d3eac7fefec50aa50770` completed SUCCESS; final HEAD after worklog update must be checked again. PR #2606 stays DRAFT. No merge, GitOps change, Production promotion or rollback.
- [x] Initial worktree under `/srv/moneyverse-data/tasks` was removed by concurrent host cleanup after Build; committed work was recovered intact into `/home/debian/auto/c-v1329-global-search-20261103/repo` without touching other worktrees. Original logs lost with removed directory; final validation logs preserved in `/home/debian/auto/c-v1329-global-search-20261103/gates`.
- [x] `origin/main` re-fetched at start/mid/end and remained `e83ad8a6d1b8d477bfbe661ea3cffd46f270509c`. No branch deletion: unique unmerged code preserved. No existing automation modified.
- [ ] **RELEASE HOLD:** all mandatory gates must pass on final exact SHA and merged SHA before Test/Production promotion; keep PR and worktree.

