# A0025 — Current stock holdings export worklog (2026-10-26 KST)

## Before
- MiniPC direct MCP status and shell: Debian 13.6, backend/frontend/Nginx/Docker ACTIVE; root 98% full (2.1GiB available), data 66% full.
- Remote main SHA `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, 201 remote branches, 197 open PRs at initial audit. Separate clean worktree `auto/hourly-a-stock-portfolio-export-20261026-0025`.
- Read AGENTS, README, English and Korean PROJECT_PLAN and integrated master, prior A2325 QA/worklog, recent open B/C/planning PRs and CI; no overlapping portfolio export PR identified.
- P1 current virtual stock holdings CSV only, owner session, existing stock_my_positions, integer-string precision, CSV formula defense, private/noindex, app-api parity. No migration, ledger write, production service mutation or branch deletion.
- TDD RED/GREEN and full release gate required; any failure => Draft PR and Production HOLD.

## During
- TDD RED: backend 3/3 tests failed on absent handler; frontend 2 suites failed to import absent CSV/route modules. GREEN: backend 3/3, frontend 16/16 (including 11 app-api gateway tests).
- Implemented backend owner-only read via existing `stock_my_positions` (no migration), strict <=100 current-position shape/amount validation, private web CSV with formula-injection defense, accessible portfolio download link and Android JSON proxy private headers.
- Midpoint re-fetch of `origin/main` and EN/KO living + integrated plans: main SHA unchanged. No B/C/Gemini/QA branch changes touched.
- `pnpm typecheck` PASS; `pnpm lint` PASS (0 errors, 1128 pre-existing warnings). First build failed due symlinked node_modules outside Turbopack root, not code; copied dependencies into isolated worktree and `pnpm build` PASS.
- Real isolated PostgreSQL 17.11 (`wdmv_v761_test_acl`, 281 migrations): transactional test stock position, `moneyverse_app` owner=1/foreign=0, precise integer calculation, direct positions SELECT and ledger INSERT denied, `ROLLBACK`, 0 residual rows. No Production-linked DB access or write.
- Added Android machine contract endpoint; 180 endpoint references generated. Contract check expected to compare against committed tree; commit then rerun.


## After (pre-PR)
- Feature commit `ba34408ba59999533fc4e78324e8bc14b70ff5bd`, 17 changed files. Final QA/release/worklog commit will have a new SHA; PR is Draft until all gates pass.
- Full `pnpm test` FAIL: backend 1316 PASS / 398 SKIPPED, frontend 1403 PASS / 6 FAIL (3 SEO/i18n, login a11y, calculator registration link, admin M2). Database 15 PASS / 3 SKIPPED, contract 38 PASS; bot 8 PASS after isolated dependency restoration.
- Security: prod 2 High; full 2 Critical/10 High/11 Moderate/3 Low; bot 1 Critical/5 High. No unrelated B/C security repairs attempted.
- Branch audit: initial 201 remote heads/197 open PRs; midpoint 202 heads (201 non-main), 201 unmerged unique tips, no duplicate tip/tree/last patch; known conflicts #1107/#1110/#1143 preserved. No branch deleted.
- Official Test API SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`; candidate mismatch. Exact-SHA authenticated Test E2E, full CI/security/SEO/a11y and GitOps gate not PASS. No merge, Test/Production promotion, restart, Production DB write, or deletion.
- Rollback: before merge abandon Draft PR; after future authorized merge revert endpoint, CSV link/route, Android privacy route and contract together. No migration rollback. Final PR/SHA/CI inventory follows in GitHub evidence.
