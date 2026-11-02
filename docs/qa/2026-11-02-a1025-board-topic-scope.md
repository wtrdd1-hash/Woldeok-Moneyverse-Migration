# QA — A 10:25 verified public board topic scope (2026-11-02)

**Status: DRAFT / RELEASE HOLD.** Implementation candidate, not a production release.

## Scope and provenance
- Base main: a8541927c3a351d980454c66e95a3356c47e0722
- Code SHA: c54c740ee531709e074f8cb883148310b6431460
- Branch: auto/hourly-a-20261102-1025-board-topic-scope; PR #2457.
- Scope: public latest-50 stock-linked versus general post classification via existing SECURITY DEFINER SQL, Nest API, accessible Next.js search, and Android app API source verification. No DB migration or ledger writes.
- TDD RED: backend 3 failed/20 passed, frontend 4 failed/8 passed. GREEN: backend 23 passed, frontend 17 passed.
- API contract: 184 endpoints, generated English/Korean schema references, PASS on code SHA.
- Typecheck: backend/frontend/contract PASS. Lint: 0 errors, 1,027 existing warnings.
- Full root suite: FAIL, existing profile HTTP positive-path assertions 2 FAIL (HTTP 401 vs expected 200), 2,986 backend PASS and 518 SKIP. Existing repair PR #2265 remains Draft/HOLD. Root full-suite failure is not a PASS.
- Real development PostgreSQL 17.11: READ ONLY, SET LOCAL ROLE moneyverse_app, function EXECUTE true; recent public posts 1, stock 0, general 1; ROLLBACK. Real multi-row stock positive proof not available. Exact parameterized PREPARE/EXECUTE query returned stock 0, general 1, all 1; synthetic SQL stock/general cases both 1.
- P0 app-role ACL: account_balances direct UPDATE true, user_items direct DELETE true; issue #993, no privilege changes made.
- Full pnpm audit: FAIL, 9 vulnerabilities (1 low, 8 moderate). pnpm audit --prod: PASS, zero known findings.
- Frontend full suite: 558 files, 2,931 PASS, 0 FAIL. Initial frontend build with 1 GiB heap failed with V8 heap OOM; 2 GiB retry PASS, Backend build PASS. GitHub exact-SHA CI pending at documentation close.
- Host disk: 96% used, approximately 4.3 GiB free.

## Environment / release blockers
- Public Test and Production backend/frontend version: 510dbe6bf4d5c2a8089fc06b480776053da7a2e3, not candidate.
- Exact candidate Test host identity preflight: FAIL with six SHA mismatches.
- Public Treasury endpoint: HTTP 200 on Test and Production; release policy requires fail-closed 503 until certified.
- Authenticated Test E2E, backup restore, runtime artifact provenance, rollback and GitOps gate: NOT VERIFIED.
- Remote heads 209 (208 non-main), 195 non-merged; 191 open PRs, 29 conflicting. Merge-tree probes: image repair #2453 6 conflicts, reply threshold #2448 9, category #2429 6, club CSRF #2440 zero.
- Deleted branches: zero. All unique unmerged branches and 13 main-contained branches retained to avoid disrupting other agents.
- No main merge, no Test/Production deploy, no DB mutation, no service restart or rollback.

Evidence (host): /srv/moneyverse-data/tasks/mv-a-20261102-1025-board-topic-scope/evidence/

**End-of-run audit:** 209 remote heads including main, 195 non-merged, 191 open PRs (29 conflicting), 13 main-contained branches retained, zero deletions. The candidate has 14 code/contract/worklog files at code SHA and four additional QA/release documents. No Test/Production/rollback actions.
