# A 2026-11-02 19:00 — Bounded public board display QA (DRAFT / RELEASE HOLD)

**Authority:** `AGENTS.md`, `README.md`, English canonical `docs/planning/PROJECT_PLAN.md`, Korean secondary `docs/planning/PROJECT_PLAN.ko.md`, `docs/RELEASING.md`. Baseline main `3eb1441090cb0602e054908547dcf43bfe4299dd`, clean separate `auto/hourly-a-20261102-1900-board-page-size` worktree. Draft PR #2517. Shared checkout was dirty and untouched. Code/contract checkpoint `b4ab109bf78b0702ec553c96406f0ba326a6f3d4`.

## Feature, SQL and privacy proof
- Optional `GET /api/v1/board/public/stock-posts?limit=10|25|50` and Android equivalent; Next `/board` native labelled 44px selector. Existing `stock` and `q` combine; default no-limit API retains `{posts}`.
- SQL reads existing `public.member_board_public_list_with_stock(50)` with stock/title predicates, then orders by serialized-millisecond `created_at DESC`, `post_id DESC` and applies parameterized `LIMIT $4`. It is **not** global pagination, and not a new database function/migration.
- Explicit limit responds with `limitApplied` and `sourceWindow:50` even for empty results. Next and Android reject missing/wrong proof, duplicates, malformed post summaries, wrong order or excess rows; Android sends 503 for unverifiable HTTP 200. Repeated, unknown or invalid limit yields HTTP 400. Filtered HTTP response uses no-store/noindex/no-referrer, SSR uses noindex and uncached fetch. No auth, ledger, balance, privilege, migration or financial write.
- Rollback: omit `limit` (existing default read path); no schema rollback. No deployment or runtime change occurred.

## TDD and local gates
- RED before implementation: Backend 3 failures, Frontend 7 failures. GREEN targeted: Backend 23/23, Frontend 10/10; after millisecond sort correction, focused 10/10 and Frontend 4/4; actual Nest HTTP integration 5/5.
- Full Backend: **2,989 PASS / 2 FAIL / 518 SKIP**. Both failures are existing `profile-private-response.http.test.ts` authenticated profile 401 instead of expected 200; repair PR #2265 exists. No false full-suite PASS.
- Full Frontend first attempt inherited host `NODE_ENV=production`: **499 FAIL / 2,401 PASS**, `React.act is not a function`. Root cause is the test runtime environment; rerun exact code SHA with `NODE_ENV=test`: **2,933 PASS / 0 FAIL**. No source change was made to suppress tests.
- Database 62 PASS / 5 SKIP; contract 41 PASS; security/backup/release policy 34 PASS; typecheck PASS; ESLint 0 errors / 1,027 pre-existing warnings; Backend+Frontend build PASS, 602 Next pages. App API contract 184 endpoints; initial drift FAIL due to optional response union; generated English/Korean schema and JSON committed, rerun `pnpm api:contract:check` PASS.
- Production dependency audit 0 known vulnerabilities; full dependency audit **9 (1 low, 8 moderate) FAIL**.
- Real PostgreSQL 17.11 `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app; PREPARE ...; ROLLBACK`: function EXECUTE=true, SQL bounded query PASS, actual public rows 1, nonmatching search 0. Synthetic read-only SQL shows 2 matches after filtering (A,C). Actual multirow ordering remains unproven. DEV direct `user_items DELETE=true`, `account_balances UPDATE=true` (P0 #993); no inference about Production privileges.

## Integration, Test and Production
- Local virtual merges with existing A PRs #2499, #2494, #2486, #2480 and #2393 have content conflicts; preserve unique unmerged commits and do not force merge. GitHub open PR snapshot 244, 181 mergeability UNKNOWN, 1 reported CONFLICTING (not an exhaustive conflict count); remote heads 265 incl main, locally merged 15, locally unmerged 248. No branch deleted.
- Read-only official Test/Production preflight for code SHA `22973a3b75c40fc673973dd13f46043d4e798965` returned `ok:false`: public/backend/frontend/manifest all `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`, six candidate SHA mismatches; public Treasury HTTP 200, not required 503. This is NOT exact candidate Test validation.
- Authenticated official Test E2E, independent backup restore, full security audit and GitOps release gate are **BLOCKED/FAIL**. No merge, Test deployment, Production promotion, restart, DB mutation, rollback or branch deletion. PR remains Draft/HOLD.

**Evidence:** `/srv/moneyverse-data/tasks/mv-a-20261102-1900-board-page-size/evidence/` (RED/GREEN, exact-gates, fixed `NODE_ENV=test`, real PG, virtual merges, Test/Production preflight). Final PR head/CI status to be recorded in GitHub after final documentation commit.
