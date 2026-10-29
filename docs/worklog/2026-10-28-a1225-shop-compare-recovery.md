# A1225 — Member shop verified cost comparison recovery (2026-10-28 KST)

## BEFORE / v1
- Latest authoritative `origin/main`: `a28bed9aa40ff74d492824ae12892a7d52132fdd`, unchanged at start/middle. Read AGENTS, README, English canonical and Korean secondary PROJECT_PLAN and integrated planning master, QA v1340 and prior A worklogs. Remote: 20 heads including main, 18 open Draft PRs, 352 P0 recovery refs. No other worktree touched.
- Restored a distinct unmerged P1 feature from preserved old commit `db018d11f`; concurrent shop upkeep PR #1677 is still Draft and its unique changes are protected.
- Separate worktree/branch: `auto/hourly-a-shop-verified-compare-recovery-20261028-1225`; no writes to Production/dev DB, Test, Production, or applied migrations.

## IN PROGRESS / v2-v4
- RED: `shop-compare.test.ts` could not import absent feature. Ported verified two-item backend comparator, authenticated/consented API, member-only selector, no-store Android app-api, 181-endpoint contract, unit and HTTP tests. Resolved app gateway cherry-pick conflict by **retaining** existing privacy `x-robots-tag: noindex` and wallet/privacy cache protection.
- Code commit: `e6c4782d27ddf9fbf9e7dda7e34d27bcc26cc20f` (16 changed files). No SQL migration, ledger or purchase mutation. Strict UUID and integer-string precision, unavailable item refusal and no fabricated client totals.
- Isolated dependency install fixed missing `undici` in the shared baseline; NODE_ENV=test fixed React.act test environment. Bot dependency install in isolated workspace fixed missing `prism-media`.
- Tests on code commit: Backend 1,933 PASS / 441 SKIP; Frontend 1,870 PASS / 1 FAIL; DB 45 PASS / 3 SKIP; Bot 11 PASS; typecheck PASS; lint 0 errors (1,102 warnings); API contract 181 PASS; backend/Next production builds PASS. Root test FAIL at the same unrelated admin blog assertion (`편집 검토 대기`) present byte-identically in main. Do not change blog code owned by #1662/#1665.
- PostgreSQL 17.11 isolated fixture: **actual migration-123 `shop_catalog_list_v2` function body**, compiled repository, actor-scoped owned quantity, bigint price/upkeep difference, and denied direct SELECT on three tables PASS. Synthetic schema only; no full applied migration or authenticated official Test claim.
- Production dependency audit High=0/Critical=0, Moderate=1 (nonzero exit); bot audit 0 vulnerabilities. P0 QA still reports 235/241 app-role UPDATE/DELETE tables and 3 PUBLIC bank EXECUTE grants in shared DB; no Production safety claim.

## AFTER / v5 — RELEASE HOLD
- Entire remote non-main branch and open PR inventory audited; 352/352 rescue commit objects intact. Deleted branches: **0**. Existing 1 already-in-main remote branch also preserved pending reference review.
- No main merge, official Test deployment, Production rollout, financial DB write, rollback or feature activation. Exact-SHA authenticated Test, backup restore, full security/SEO/accessibility E2E and GitOps gates BLOCKED. Existing failing blog test and potential integration overlap with PR #1677 require independent resolution.
- Evidence: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-28-1225/`; final branch/PR/SHA/CI evidence appended to PR and external report after final commit.
