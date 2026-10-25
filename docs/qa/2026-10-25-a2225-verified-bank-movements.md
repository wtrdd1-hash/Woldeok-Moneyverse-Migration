# QA — A2225 Verified Bank Movements (2026-10-25, HOLD)

## Identity and scope
- Main SHA start/mid/pre-final: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (remote checked). Feature-code SHA: `aac1ce7cfc79aa0775ea8e671e845e61d3dbd202`. Branch: `auto/hourly-a-verified-bank-movements-20261025-2225`; Draft PR #1336. Final documentation SHA is the final PR head.
- English plan is canonical: `docs/planning/PROJECT_PLAN.md` and `docs/planning/INTEGRATED_PLANNING_MASTER.md`; Korean is secondary. No planning documents or applied migrations changed.
- P1: authenticated owner-only read-only recent bank deposit/withdraw movements, 1..50 bounded; ledger transaction UUID and cash/bank signed posting proofs, BigInt integer-string exactness, no fictional success; web bank page + Android gateway no-store/noindex.
- No financial write, no migration, no service restart. Rollback = revert feature branch before merge or revert feature commit if merged later. No release attempted.

## Test evidence (on Debian 13.6 miniPC)
- TDD RED: 5 Backend failures for missing repo/controller; frontend missing page and Android unsafe public cache failure. TDD GREEN after implementation: Backend 7 PASS, Frontend + Android 4 PASS (11 focused PASS).
- `pnpm typecheck`: PASS; `pnpm lint`: PASS, 0 errors / 1,128 warnings; `pnpm build`: PASS, `/bank/movements` dynamic route present; `pnpm api:contract:check`: PASS, 179 endpoints generated.
- `pnpm test`: FAIL. Backend 1,318 PASS / 398 SKIPPED; Frontend 1,400 PASS / 6 FAIL; database 15 PASS / 3 SKIPPED; contract 38 PASS. Existing Frontend failures: SEO/i18n 3, login mobile touch target 1, calculator registration CTA 1, admin M2 telemetry 1. These are separately owned by QA/other branches; no speculative overlapping repair in A branch.
- Bot test after using existing local dependency installation: 8 PASS. Initial bot test failed due to missing local `youtube-dl-exec` dependency in isolated worktree; symlink removed after verification.
- Security audits: prod 2 HIGH; full 2 CRITICAL / 10 HIGH / 11 MODERATE / 3 LOW; bot 1 CRITICAL / 5 HIGH. No security PASS claim.
- Accessibility/SEO for changed page: member-only route with `robots: noindex,nofollow`, keyboard-focusable 44px back and bank navigation links, `role=alert` on read failure; focused frontend tests PASS. Broader SEO/a11y regression FAIL as above.
- Real isolated PostgreSQL 17.11 `woldeok_moneyverse_ci` (214 applied migrations), not Production: in one transaction created a synthetic member and cash/bank accounts, generated a genuine 100 WLD `BANK_DEPOSIT` through `bank_move_balance`, then `SET LOCAL ROLE moneyverse_app` and executed the **exact query from source**. Owner returned one row (`cash_delta=-100`, `bank_delta=100`), unrelated actor returned zero, ledger INSERT and posting UPDATE both denied; `ROLLBACK` completed. No persistent fixture. Official Test authenticated full-flow on exact candidate SHA NOT DONE.

## GitHub / branch audit
- Initial remote heads 193, open PRs 189. Last pre-report inventory remote heads 194, open PRs 190 (includes this branch/PR). All 193 non-main heads had unique unmerged commits; 0 merged/eligible for deletion. Same tip SHA/tree groups: 0. Last-commit Patch-ID duplicate groups: 0 (2 empty/unavailable patch cases, not deletion evidence).
- Conflicting open PRs #1107, #1110, #1143 preserved. All other unique branches and Gemini/Dev B/Dev C/QA/planning changes preserved. Deleted branches: **0**. Main not modified.
- CI for code SHA: `40198940210` CI and `40198472172` Test Candidate initially IN PROGRESS; latest/final status must be read from PR checks. No CI PASS claimed.

## Release gate and rollback
- Official Test API `/api/version`: `6f697e74b7bf0cd1e4521d36534cfd9c140f8010` (does not equal code SHA). Production API: `6a989b5ac0c6155587d43426d64f6def6b62c917`. Both checked 2026-10-25 22:43 KST. Test services active but exact candidate not deployed; authenticated Test E2E and host identity preflight BLOCKED. No GitOps promotion or Production smoke/login/session-continuity claimed.
- Disk: root 98% (2.3GiB free), data disk 65% (67GiB free); worktree isolated on data disk.
- **FINAL: PARTIAL / BLOCKED — Production RELEASE HOLD.** PR remains Draft. No main merge, Test promotion, Production deployment, DB write, branch deletion, or restart.
