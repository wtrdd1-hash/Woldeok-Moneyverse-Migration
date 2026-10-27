# v2026.10.28.1403 — TECH blog relevance and evidence remediation

**BEFORE WORK — 2026-10-28 KST.** Dedicated task branch `fix/blog-tech-relevance-v1403-20261028` from `origin/main` `656a89947f2261c12de20d4612e88f251ba6c6a6`. User approved implementation following v1380 plan (GitHub #1591 / PR #1592). Source review: `docs/planning/INTEGRATED_PLANNING_MASTER.md` and `.ko.md`, `docs/planning/AI_BLOG_EDITORIAL_PUBLICATION_ENGINE_SPEC_v2026.10.20.975.md`, v1107/v1108 policies, `docs/RELEASING.md`, `AGENTS.md` and live source. Co-worker v1102 legacy 503 publication gate is **already on main**, and must remain intact. Separate branch and no other worktree changes.

- [x] BEFORE WORK: inspect canonical docs and latest main, record screenshot-to-source root causes; confirm current v1102 publishing hold.
- [x] IN PROGRESS: targeted TECH-only rendering and topic-specific verifiable engineering drafts; no unrelated compound widget or finance CTA; eliminate invented tech statistics and synthetic page views; add unit/SSR regressions.
- [x] MIDPOINT: refetch main and inspect code overlap. Preserve v1108 no automatic unpublication and no direct file-publishing reactivation.
- [x] FINISHED: tests and checks with exact SHA, push independent branch/PR, examine official Test and Production gates. Report incomplete stages truthfully.

Publication, DB, ledger, Test and Production untouched before this work. Existing public posts remain unchanged without an editor-authorized correction.


## Midpoint — 2026-10-28 KST

Fetched remote main repeatedly: advanced from initial 656a8994 to 004be593. Main added a 7,000+ character categoryDeepDives block into blog-data.ts. We reconciled only TECH behavior with it: finance category text was retained on main, while TECH now selects an independent reviewed engineering body. Existing main v1102 503 publisher hold is preserved. Frontend contract dependencies were built in the isolated workspace after removing workspace-external node_modules symlinks that Turbopack refused.

**Local verification (branch source candidate):** targeted 20/20 PASS, whole frontend 328/328 test files and 1,686/1,686 PASS; typecheck, edited-file ESLint, contract package build, Next.js production build PASS. No DB or actual post writes occurred. Waiting for exact-SHA GitHub integration, official Test backend/API/DB/authentication and Production release gate evidence.

## FINISHED — 2026-10-28 KST (source complete, deployment BLOCKED)

- Final validated application SHA: \`b96ec0156f78757466be796f1025318e2d012806\`, uploaded to \`fix/blog-tech-relevance-v1403-20261028\`. [Draft PR #1602](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1602), [implementation tracker #1591](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1591).
- Rechecked \`origin/main\` after parallel writers' changes; latest \`4f5efd1f48615f0112701feec25a9b0fc67d9719\`. No new modifications to this task's blog files or authoritative bilingual integrated masters relative to the previously reconciled main \`004be593\`.
- Exact tested SHA source: 1,686/1,686 frontend tests PASS on 328 files, 20/20 focused blog tests PASS, frontend typecheck/edited-source ESLint/contract build/Next.js production build PASS. \`git diff --check\` PASS.
- **CI BLOCKED**: GitHub workflow run [#3796](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/40531608937) completed with FAILURE. Its classify/policy and runtime lint/typecheck/build/database migration-apply steps PASS, but database test \`migration-parity.test.ts\` fails a repeated migration number \`283\`. Both \`283-bank-loan-privacy-boundary.sql\` and \`283-space-finance-ledger-boundary-hold.sql\` already exist on main. Reproduced locally: 5/6 migration-parity tests PASS and 1 FAIL; no migration file is changed by this PR. Safe resolution recorded at [issue #1605](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1605). Applied migration files must NOT be renamed or rewritten to force green.
- **Official Test NOT CERTIFIED**: \`test-main-backend\`/\`test-main-frontend\` systemd active and HTTP public paths \`/\`, \`/blog\`, \`/api/blog\`, \`/api/health\` returned 200; this does not show the candidate running. Read-only exact-SHA Test release identity preflight returns exit 1 due to missing target for \`/srv/moneyverse-data/releases/test-current\`. No service pointer changes, no candidate Test cutover, no authenticated Test browser/backend/DB checks were performed.
- **Production BLOCKED**: read-only finance release preflight exit 2, \`status=BLOCKED\`, reports direct app-role DML on \`account_balances\`, \`accounts\`, \`system_treasury_vaults\`. The finance/readiness gate, exact-SHA Test validation, signed-in session continuity, rollback and GitHub runtime CI cannot be bypassed.
- Existing public BigInt articles keep their stored text and URLs; the new UI conditionally hides off-topic widgets once deployed, but **legacy body correction still requires an authorized human editorial review**. No auto-unpublish or automatic edit of Production content. No Test or Production deployment was executed.
- **Task closeout: CODE-CANDIDATE_COMPLETE / PR_DRAFT / CI_FAILED / TEST_BLOCKED / PRODUCTION_BLOCKED**. Follow-up: fix #1605 migration history safely, reconcile release privileges, deploy exact source to official Test with verified provenance, run full E2E and promote under \`docs/RELEASING.md\` only when all gates pass.
