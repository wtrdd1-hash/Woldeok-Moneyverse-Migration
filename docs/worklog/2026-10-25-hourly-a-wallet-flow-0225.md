# Development A — owner-only wallet cash-flow snapshot (2026-10-25 02:25 KST)

## Before work
- Debian 13.6 miniPC status: backend/frontend/MCP/Nginx/Docker active; development DB connection confirmed. **The database name does not prove isolation**; no write on production-connected port 5433.
- Baseline `origin/main`: `c9a868b1e622341e2daa8b936ddf0988eda9988e` (checked after fetch). Latest mutable integrated planning PR #1205 SHA `e744bafefb9f497748fd5cd131ae049ad0ad800d`; notifications feature reserved to C. English master and Korean counterpart reviewed, not modified.
- Open PRs 89, remote branches 93 (including main). Known merge conflicts: #1143, #1110, #1107. Unique/unmerged changes preserved; no deletions.
- QA v1209 and RELEASE HOLD reviewed: shared live DB / least-privilege findings, security audit, migration 266, official Test exact-SHA remain blockers.
- Scope: P1 owner-only *latest-50* WLD cash-flow snapshot (incoming, outgoing, net, internal pocket moves) with server-authoritative signed ledger postings. No invented full-history totals, no reward or ledger writes, no schema migrations. Avoid B/C notification/shop/derivatives work.
- Branch `auto/hourly-a-wallet-flow-20261025-0225`; isolated worktree; no changes to other worktrees.

## In progress
- [x] RED regression tests: backend 4/4 failed because method absent; frontend module resolution failed before implementation. GREEN backend 28/28, frontend 29/29 focused tests.
- [x] Nest service/controller + private no-store, member /wallet/flows UI, activity navigation, Android app-api gateway tests. No migration or table grant.
- [x] Full gates attempted: root tests FAIL (frontend 6 baseline), security audits FAIL; root typecheck/lint/API contract PASS. Isolated real PostgreSQL READ ONLY/ROLLBACK PASS (0 ledger rows, app ACL least privilege). Mid-work main c9a868b1 unchanged, planning PR #1205 e744bafe unchanged; 89 open PRs, 94 branches including new branch.

## Finished
- Code SHA: 69fa6b51aa48dbee43aaf772278efe13bc1b9882. Detailed English and Korean release/QA reports: docs/releases/v2026.10.25.a0225.md and .ko.md.
- Test-first: RED 4 backend failures + missing frontend module; GREEN 28 backend + 32 frontend focused tests. Additional 129-digit RED/GREEN.
- Full pnpm test FAIL: backend 1,320 PASS/398 SKIP; frontend 1,402 PASS/6 FAIL (locale 1, SEO 3, login a11y 1, M2 telemetry 1). Root typecheck PASS, lint 0 errors/1,137 warnings, API contract 179 PASS. Production audit 2 High, full audit 2 Critical/10 High; bot 1 Critical/5 High.
- Backend build PASS. Worktree Next default build blocked by external node_modules symlink; separate detached build worktree with local dependencies produced default Turbopack PASS at f52183fb, same runtime code. Final SHA build check pending.
- Isolated real PG: wdmv_v761_test_acl, app role read-only owner query PASS, 0 transaction fixtures, ledger INSERT and posting UPDATE blocked, ROLLBACK. Authenticated real-member E2E BLOCKED.
- No Test or Production deployment, no DB writes, no service restarts, no GitOps, no branch deletion, no rollback. PR Draft and RELEASE HOLD pending CI/QA and official exact-SHA Test.
