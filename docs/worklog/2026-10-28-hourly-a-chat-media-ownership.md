# Engineering A — Chat Media Authorization Boundary (2026-10-28 02:25 KST)

## Start / baseline
- Base main: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`; isolated branch `auto/hourly-a-chat-media-ownership-20261028-0225`.
- MiniPC Debian 13, Backend/Frontend/Bot/MCP/Nginx/Docker active, DB connected. Shared development/Production DB is NOT safe for writes or migrations.
- Prior A #1616 (cache-only) and #1589 (auth-only) are unmerged; this task addresses remaining cross-user media disclosure without rebasing or modifying their branches.
- P0: authenticated users can currently retrieve arbitrary chat image keys without owner/conversation authorization. No production exploitation claimed.
- Baseline main has duplicate migration 283 and no 285; QA repair #1610 remains unmerged. This candidate must stay HOLD until migration ordering is resolved.
- Remote branches at start: 361; open PRs: 354 (GitHub pagination header). Do not delete any branch with unique unmerged work.

## Checklist
- [x] Read main policy, README, English/Korean project plans, prior A and latest QA, open PRs, migration status.
- [ ] RED tests: deny foreign keys, allow owner and valid message recipients, fail closed on unavailable DB.
- [ ] Forward-only owner registry and SQL authorization functions with least privilege.
- [ ] Backend upload/get checks, frontend and Android route contract, isolated PG regression.
- [ ] Recheck main, build/lint/typecheck/unit/DB/security/a11y/SEO/E2E; commit, PR, CI, Test exact SHA and release gate.
- [ ] End: record SHA, changes, gate outcomes, Test/Production/rollback, branch preservation.

## Checkpoints
- 02:30 KST: baseline recorded; no live DB mutation.
