# Development A QA — Verified most-discussed recent board snapshot (2026-11-02)

**Verdict: FEATURE IMPLEMENTED / LOCAL CODE GATES PASS EXCEPT FULL DEV AUDIT / EXACT-SHA TEST BLOCKED / PRODUCTION HOLD.** This report does not approve a merge or a release.

## Authority and isolation
- Base `origin/main` `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; isolated worktree and branch `auto/hourly-a-20261102-0225-board-popular`.
- First code SHA `2fd4c243699bb6cf58a32327ab2f2381f287fa5e`; second code SHA `94ae1f160c928ad05bbe61c6ab022cb20ba28e27`. Final documentation SHA is recorded in PR #2412 and host evidence; all final-SHA gates must be rerun.
- Read AGENTS, README, English/Korean PROJECT_PLAN and integrated masters, latest planning Draft #2410 (v1628), previous QA/worklogs, open PRs and CI. Draft planning is not merged into main.

## Implementation and TDD
- Existing `member_board_public_list_with_stock(50)` → read-only SQL ordering by descending `comment_count`, then `created_at`, then `post_id`; filter by existing stock and title. The top-50 *newest* set is selected before the popular order. No global ranking, new migration, direct table grants, ledger write, money conversion or auth change.
- Nest allows only `sort=popular` and emits `appliedSort` proof. Next has a labelled 44px native select, truthful 50-row scope and noindex metadata. Android app-api validates duplicate/unknown parameters and rejects unverified HTTP 200 as 503. Conditional response headers are no-store/noindex.
- Baseline backend 15 PASS. RED backend 3 failures and frontend 7 failures; GREEN backend 23 PASS, frontend 18 PASS. Second SEO/accessibility test RED 1/2 identified missing app-api sort noindex/no-store; fixed and GREEN UI+Android 10 PASS.
- Android curated contract now correctly documents optional `stock`, `q`, `sort=popular`; English/Korean schema references regenerated.

## Executed gates (first code revision; final SHA still requires retest)
| Gate | Observed | Result |
|---|---|---|
| Backend full Vitest | 2,988 PASS / 518 SKIP | PASS, skipped are not passes |
| Frontend full Vitest | 2,940 PASS | PASS before 2 new UI tests |
| Database unit | 62 PASS / 5 SKIP | PASS, skipped are not passes |
| Workspace typecheck | all packages | PASS |
| Full lint | 0 errors / 1,027 warnings | PASS with existing warnings |
| Backend build | Nest | PASS |
| Frontend build | Next.js, 602 generated static pages | PASS |
| Android API contract | 184 endpoints | PASS |
| Security policy scripts | 11 PASS | PASS |
| Production dependency audit | 0 known vulnerabilities | PASS |
| All-dependency audit | 9 findings: 1 low, 8 moderate | **FAIL**, #1075 |

The dev-toolchain audit flags `@vitest/mocker@4.1.11` (patched >=4.1.12), while the repository's 4.1.11 floor script still passes; never treat the policy-script PASS as an audit waiver. This branch intentionally does not overlap Backend B's dependency/security repair work.

## Real PostgreSQL and least privilege
- PostgreSQL 17.11 DEV `woldeok_moneyverse_dev`, `BEGIN READ ONLY; SET LOCAL ROLE moneyverse_app; ... ROLLBACK`.
- Function EXECUTE allowed. Actual public newest snapshot contained **1 post with 0 replies**; query executed and monotonic check passed, but there is **no real multi-row positive ordering proof**. Synthetic read-only PostgreSQL `VALUES` three-row descending/tie-break check PASS; clearly not a real-data acceptance test.
- P0 #993: app role direct `account_balances UPDATE=true` and `user_items DELETE=true` in DEV. No Production ACL inference and no grants/DDL changed.

## Release and branch controls
- Remote audit: 169 remote heads including main, 168 non-main, 156 with unique unmerged commits, 12 ancestor branches; 153 open Draft PRs, 29 conflicting. No duplicate branch tip except `origin` alias to main. Virtual merges against A PRs #2393/#2399/#2407/#2411 conflict. **Deleted 0 branches**; unique changes and other agents' worktrees are preserved; ancestor branches were not removed without owner/worktree and rollback confirmation.
- Authorized read-only Test identity preflight for second code SHA returned `ok:false` with manifest/backend/frontend/artifact/public backend/public frontend SHA mismatches. Official Test serves main `510dbe6...`, not this candidate. Production backend `353c6d5...` and frontend timestamp ID `1793450413898`, not this candidate. No official exact-SHA authenticated E2E, independent restore or GitOps promotion proof.
- Test deployment: **NOT PERFORMED**. Production: **NOT PERFORMED**. No service restart, DB write, main merge, rollback, branch deletion or scheduled-task change. Rollback plan: keep production unchanged; do not promote until all gates pass. If future code is deployed, revert through reviewed forward code/release process, never edit applied migrations.

## Evidence
Host: `/srv/moneyverse-data/tasks/mv-a-20261102-0225-board-popular/evidence/` (RED/GREEN logs, full gates, PostgreSQL, branch audit, Test preflight). Draft PR #2412 remains HOLD. A final-SHA validation report belongs in the PR before any approval.
