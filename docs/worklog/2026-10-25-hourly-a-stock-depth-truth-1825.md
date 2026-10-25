# Development A — Verified stock depth availability (2026-10-25 18:25 KST)

## Before work
- Status: IN PROGRESS / RELEASE HOLD. Host Debian 13.6; backend, frontend, nginx, docker ACTIVE; root disk 97% used, data disk 58% used.
- Main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; branch `auto/hourly-a-stock-depth-truth-20261025-1825` from latest main in isolated data-disk worktree.
- Repository `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, `.ko.md`, `INTEGRATED_PLANNING_MASTER.md`, applicable skills, issue #1273 and previous QA were inspected. No root-level PROJECT_PLAN exists; canonical plans are under `docs/planning/`.
- Baseline remote branches 173, open PRs 169. Development C #1272 owns verified execution events inside `stock-orderbook.tsx`; avoid changing that file. Other workers' branches/PRs protected.
- P1 defect #1273: fabricated client-generated bid/ask depth appears as real liquidity; no proven persisted authoritative open-order depth. Implement a truthful server-confirmed depth availability state and an explicit no-depth web view, preserving live quote and manual order entry. No ledger, migration, or direct app DML changes.

## In progress
- [x] RED tests: backend 3 failing assertions for missing depth method; frontend missing component; Android gateway regression added.
- [x] Implement separate StockDepthController with DB-backed listed-stock validation, explicit unavailable response, no-store, 404/503; wire web server fetch and Android gateway, render truthful depth-unavailable card and remove synthetic quick simulator. Development C stock-orderbook component remains untouched.
- [x] Focused tests: backend 4 PASS, frontend/Android 15 PASS; contract 38 PASS, database 15 PASS/3 SKIP, backend full 1,317 PASS/398 SKIP, frontend full 1,402 PASS/6 FAIL (existing SEO 3, login a11y 1, calculator CTA 1, admin M2 1). Typecheck PASS, lint 0 errors/1,130 warnings, build PASS; security audit prod 2 High, full 2 Critical/10 High, bot 1 Critical/5 High; bot tests 8 PASS.
- [x] Isolated PostgreSQL `woldeok_moneyverse_ci` (214 applied migrations), `SET LOCAL ROLE moneyverse_app`, read-only transaction: 3 listed stocks, direct private trade SELECT=false, ledger posting UPDATE=false, ROLLBACK. No operating DB writes.
- [x] Main re-fetched during implementation: unchanged `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; living EN/KO project and integrated plans re-read via SHA256; remote branch audit 174 total, 173 non-main with unique unmerged commits, 0 identical trees, 0 safe deletions; open PR 169, conflict #1107/#1110/#1143. No other branches changed.

## Finished
- Candidate code SHA `2e65d12c73df7bbf45da238334fd80575da4b764`; Draft PR #1311. Release reports EN primary / KO second language at `docs/releases/v2026.10.25.a1825*.md`; QA report `docs/qa/2026-10-25-a1825-stock-depth-availability.md`.
- Final branch count 174, open PR count 170; unique unmerged branches preserved, deleted 0. Changed files: backend controller/module/test, frontend SSR/console/status/test, Android gateway test, QA/release/worklog/plan docs.
- Final Test public SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010` != candidate; new depth route HTTP 404 on Test; authorized host identity preflight blocked (manifest/backend/frontend/build `9f39f041c336b59f41e9a8c43ea14dc1d29a2586`, five mismatches). Added regression asserting the actual trading console never mounts synthetic depth.
- Final gate: PARTIAL/BLOCKED. No exact-SHA official Test auth/E2E, no Production rollout, no migrations, no WLD movement, no service restarts. Existing six frontend failures and security vulnerabilities require separate repair and full fresh gates. Rollback is candidate revert; do not re-enable fabricated depth.
