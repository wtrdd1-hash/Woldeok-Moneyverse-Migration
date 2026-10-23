# Hourly A — Wallet posting display integrity (2026-10-23 14:25 KST)

## Before work
- Debian 13.6 miniPC online; backend/frontend/bot/MCP/nginx/docker active; development DB connected.
- Baseline main SHA: `4834f54bf8d642e0e2bf7a410b553ee917d39c7c`.
- Isolated branch/worktree: `auto/hourly-a-wallet-posting-20261023-1425`, `/home/debian/worktrees/mv-a-20261023-1425`.
- Read AGENTS, README, EN/KO project plans, integrated master, wallet code, prior worklogs, open PRs and CI.
- Scope: truthful owner-scoped wallet transfer amount presentation; do not change financial writes, DB ACLs, migrations, or other developers' worktrees.

## Plan and in progress
- [ ] Preserve existing 13:25 regression test changes in a new isolated branch.
- [ ] Run RED tests and record exact failing assertions.
- [ ] Implement minimum wallet/activity/PostingStrip fix; run GREEN tests.
- [ ] Run lint/typecheck/build and relevant regression checks; record skipped gates.
- [ ] Recheck latest main and planning; preserve unique branch commits; PR only after evidence.

## Finished / release decision
- Pending validation. No Test/Production promotion without exact-SHA gates; rollback not required if no release.

## In-progress checkpoint (14:23 KST)
- Reused 13:25 uncommitted regression tests only by applying their diff into this new branch; original worktree untouched.
- Offline pnpm install reused 842 packages.
- TDD RED: 21 tests, 18 PASS / 3 FAIL (two pocket display failures and one unavailable amount a11y failure).
- Minimal fix: owner-pocket validation, both wallet screens, nullable PostingStrip with explicit status.
- TDD GREEN: 21 PASS / 0 FAIL, 2 files; `git diff --check` PASS.
- No backend, SQL, migration, or Production writes.

## Validation checkpoint (14:28–14:31 KST)
- Full `pnpm lint`: initially FAIL on pre-existing CSV `no-control-regex` error. Reused the exact one-line fix from existing 03:25 unique commit `4a0b1cce` without changing that branch; rerun PASS, 0 errors / 1,122 warnings.
- `pnpm typecheck`: PASS across contract/database/backend/frontend.
- `NODE_OPTIONS=--max-old-space-size=1024 pnpm build`: PASS (including wallet/activity Next.js routes).
- Full `pnpm test`: FAIL. Contract 31 PASS; database 15 PASS / 3 SKIPPED; backend 1,303 PASS / 397 SKIPPED; frontend 1,369 PASS / 1 FAIL. The only frontend failure is unrelated existing `src/app/color-contrast-regression.test.ts:67`, expecting no `text-white` in the redesigned home page. Do not modify C's homepage as part of wallet scope.
- Fresh focused wallet tests: 21 PASS / 0 FAIL (2 files), including TDD RED→GREEN.
- Real dev PostgreSQL read-only transaction: 851 ledger transactions; 1,732 postings; 0 direction-adjusted unbalanced; 0 underposted. Of 241 public tables, app role has direct write privilege on 235; accounts/balances/audit writeable, ledger_postings not writeable. P0 FAIL; no DB changes.
- Full authenticated Test E2E, app-api user flow, isolated Test exact SHA, migration checksum/production parity, and GitOps release gate: NOT VERIFIED. Do not merge or deploy.
- New code changed: wallet `sides.ts`, wallet and activity page, PostingStrip, CSV lint, and two regression tests. No backend or SQL changes; existing owner-scoped API projection is reused.
- Prior 13:25 uncommitted tests and 03:25 unique commits preserved; no branch deletion.

## Release and rollback decision
- **PARTIAL / BLOCKED — RELEASE HOLD**. This is a source candidate, not a full-stack production-ready completion.
- Full suite fails on a homepage baseline regression outside A ownership; P0 app-role ACL also fails. Integration requires repair in a separately owned branch and full exact-SHA CI rerun.
- Test: not promoted. Production: not promoted. Rollback: not needed because no release/DB changes.

## GitHub checkpoint
- Source commit: `4fe80fe2e23c1fd6ae412ab90a7efa34a3681f3b`, pushed to isolated branch.
- Draft PR #990 opened; do not merge while full-suite failure and P0 ACL issue remain.
- CI classify/policy and Test candidate release-input initially PASS; runtime-check and verify/runtime-check pending at observation.
- Branch deletion: 0; existing unique commits and unrelated worktrees preserved.
