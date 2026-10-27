# Development A — Verified Help Review Receipt Parity (2026-10-27 17:23 KST)

**State:** DRAFT / RELEASE HOLD; do not merge or deploy.

## Before work
- Debian 13.6 mini-PC reachable, services active, PostgreSQL connected. Baseline `origin/main` = `c2a9306ddc0424438bc0ab297ea9543bb167aee6`; latest planning v1366 remains an unmerged support-hours draft, not authority to deploy. Read AGENTS, README, canonical EN/KO project plans, prior A QA/worklog and PR/CI inventory.
- Isolated worktree `auto/hourly-a-help-receipt-parity-20261027-1723` from latest main, then cherry-picked seven existing unmerged A commits from PR #1557 without altering that worktree or other owners' work.

## Implementation
- P1 defect: a live `current:true` status response with the same article ID and publication time but a *different* review deadline could expose an SSR article's obsolete later verified-until claim. The backend/SQL/app-api already provide the authoritative review deadline.
- Added a failing browser component regression, observed 1 expected FAIL / 4 PASS with `NODE_ENV=test`, then compared parsed receipt and SSR review timestamps; all 5 focused tests PASS. Updated existing test fixtures to bind each article's exact review deadline. No DB migration or role/ledger changes.

## Verification
- Full typecheck, root tests, lint, backend build and Next Webpack build PASS; backend 1,344 PASS / 398 SKIP, frontend 1,445 PASS, DB contract 20 PASS / 3 SKIP, API contract 38 PASS, Bot 8 PASS; lint 1,132 existing warnings / 0 errors. Isolated no-network PostgreSQL 17.11 bootstrap, migration 280, independent approval, retraction, ACL and immutable audit fixtures PASS; ephemeral container removed.
- Repository secrets, control-byte and Prisma migration-command guards PASS. Full workspace audit FAIL: 2 Critical / 8 High (plus lower severities); Bot audit FAIL: 1 Critical / 5 High. The original test invocation without `NODE_ENV=test` failed due React production test mode, and a tool retry duplicated a gate command; duplicate *own* gate process was stopped, and the surviving complete run passed. These are not application regressions.
- Official Test exact SHA authenticated E2E, full browser accessibility/SEO, backup restore and GitOps gate are not certified. Feature OFF; no main merge, Test/Production deployment, live DB writes, rollback or branch deletion. Existing migration 280 collision with other unmerged PRs remains unresolved.

## Review and handoff
- Two-stage review: spec matches fail-closed receipt identity and timestamp equality, code remains local to live web view and tests; source/backend/app-api contract retained. Follow-up PR must remain Draft/HOLD until all independent release gates pass.
