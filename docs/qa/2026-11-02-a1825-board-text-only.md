# A 2026-11-02 18:25 — Public board text-only discovery QA (RELEASE HOLD)

**Authority:** AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md (English canonical), PROJECT_PLAN.ko.md (Korean), docs/RELEASING.md. Started from main `a8541927c3a351d980454c66e95a3356c47e0722`; rebased to `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e` after SOE v1621 merge. Isolated branch `auto/hourly-a-20261102-1825-board-text-only`; Draft PR #2499.

## Feature and source proof
- GET `/api/v1/board/public/stock-posts?media=text` and Android `/app-api/v1/board/public/stock-posts?media=text`; existing stock and title filters combine with optional media. Bound is latest 50 public rows, not full history.
- Backend SQL is parameterized against existing `public.member_board_public_list_with_stock(50)` SECURITY DEFINER function; rejects unknown/duplicate filters and image rows, returns explicit `filterApplied:'text'` even for verified empty.
- Next web has accessible native select, 44px minimum control, noindex and no-cache filtered fetch, distinct unavailable/verified-empty states. Android verifies marker, bounded UUID-unique summaries, no-image proof; redirects/304 and missing evidence fail closed to 503; HEAD returns bodyless 405; filtered responses no-store/noindex/no-referrer.
- No migration, privilege grant, financial ledger, balance, item, or auth write. Rollback is removal of the optional `media` parameter; no database rollback.

## TDD and exact-source evidence
- RED: Backend 3 failures / 19 pre-existing pass; Frontend 8 failures. Later image-row proof RED 1, GREEN.
- GREEN targeted: Backend 26 PASS (including real HTTP E2E 3); Frontend 22 PASS (Android 9, proof 3, UI 1, title regression 9). Workspace typecheck PASS; changed-file ESLint PASS.
- DEV PostgreSQL 17.11: `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app; ... ROLLBACK` function EXECUTE and SQL PREPARE PASS. Actual recent public rows 1; text-only rows 0. Synthetic read-only 3 rows yields 2 text-only, no image row. This is NOT an authenticated official Test candidate flow.
- DEV ACL P0: `moneyverse_app` has `account_balances UPDATE=true`, `user_items DELETE=true`, `member_board_posts SELECT=true`. Production ACL unverified. Issue #993 updated.
- Full local baseline: Backend 2,989 PASS / 2 FAIL / 518 SKIP (existing profile HTTP 401 vs expected 200; repair PR #2265). Frontend with correct NODE_ENV=test: 2,933 PASS. Database 62 PASS / 5 SKIP; contract 41 PASS; security/backup/release policy 34 PASS. Production dependency audit 0 vulnerabilities; full audit 9 (1 low, 8 moderate) FAIL. Initial CI/build candidate failed mobile API generated-document drift, now generated artifacts are included in this branch.
- Full build: first attempt (2,048 MiB heap) compiled and typechecked, then Next static-generation worker SIGABRT; second attempt (1,024 MiB heap) failed JavaScript heap OOM. **BUILD FAIL / resource constrained**, not PASS. Initial candidate CI and image workflow failed because generated Android schema references drifted; generated artifacts are now included for the final SHA. Final exact-HEAD CI pending; no PASS claim before results.

## Integration, Test and Production gates
- Official Test public Backend/Frontend SHA `bb5e99ae46cf279851a888dec0d27c0647be3e51`, Production `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, neither is candidate. Authorized read-only Test identity preflight against candidate failed six SHA/manifest/env/artifact mismatches. No candidate Test auth/E2E or independent restore proof; no Production release or rollback executed.
- Start audit: 247 local non-main remote-tracking refs, 228 open PR, 29 conflicts. End remote audit: 257 non-main remote branches (14 already ancestors of main, 243 unique unmerged), 238 open PR, 29 conflicts; 0 branches deleted. Virtual merge with Draft #2350 (image filter), #2494 (title sort), #2480 (most discussed) returned conflicts. Preserve all unique commits; do not merge or delete others' branches.
- No main integration, Test/Production deployment, service restart, DB mutation, or branch deletion. All gate failures are explicit RELEASE HOLD, not a passing deployment.
