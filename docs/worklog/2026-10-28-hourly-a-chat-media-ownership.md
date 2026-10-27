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
- [x] RED tests: deny foreign keys, allow owner and valid message recipients, fail closed on unavailable DB.
- [x] Forward-only owner registry and SQL authorization functions with least privilege.
- [x] Backend upload/get checks, frontend and Android route contract, isolated PG regression.
- [x] Recheck main, run and record all feasible gates; PR #1621 Draft/HOLD, official Test/Production blocked.
- [x] End: record SHA, changes, gate outcomes, Test/Production/rollback, branch preservation.

## Checkpoints
- 02:30 KST: baseline recorded; no live DB mutation.

## Midpoint (02:33 KST)
- Re-fetched `origin/main`: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`, unchanged; no main migration 286.
- RED HTTP/controller 3 failures, web app-api 2 failures; GREEN backend 16 tests and app-api 18 tests.
- Added migration 286 with registry and owner/sender-verified recipient access; app role has no direct table privileges. Actual ephemeral PostgreSQL 17.11 applied SQL successfully and passed owner, legitimate peer, forged sender, support admin, stranger, legacy-key and least-privilege assertions. Container `mv-a-0225-pg` removed.
- Existing main migration 283 collision / missing 285 and unmerged QA repair #1610 remain integration blockers. No shared/live DB writes.
- Caveats: legacy unregistered images fail closed; admin console session proof is now enforced using admin_session_touch for support-admin reads; app-role SQL spoofing risk remains while wider DB least-privilege issue #993 is unresolved. HOLD, not a release-ready fix.

## Admin-session hardening (02:34 KST)
- Added the actual session UUID to the SQL authorization decision. Support admin reads require admin role AND `admin_session_touch` returning `open`; ordinary member login or locked/expired admin console cannot authorize a support image.
- RED repository contract failed, GREEN 16 backend tests. Isolated PostgreSQL 17.11 synthetic fixtures with no shared DB access passed open-admin vs missing-admin-session, forged sender, owner, peer, outsider, legacy and direct-table-privilege checks. Ephemeral container removed.

## End-of-implementation gates (02:42 KST)
- Code SHA: `c0a3b85b57bd95a72c908f6410850903cca07f3d`; main rechecked and unchanged `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c` before Draft PR #1621.
- Backend 1,695 PASS / 430 SKIP; frontend 1,683 PASS. Typecheck, API contract, Backend build, Next Webpack build PASS. Focused backend 16 PASS and app-api 18 PASS. Bot 8 PASS after offline isolated dependency installation.
- Root dependency audit threshold high PASS (2 low, 9 moderate); Bot audit FAIL (1 critical, 5 high). Full lint FAIL on 2 pre-existing blog template escape errors. Full project test FAIL on duplicate migration 283 and absent 285. Do not mark overall CI green.
- Isolated PostgreSQL 17.11 SQL migration 286 and assertions PASS. Both ephemeral containers removed. This is a synthetic schema test, not a full migration-chain or Production DB ACL certification.
- Remote branches 361 at start, 362 after branch push. Open PRs 354 at start; PR audit before creating #1621: 354 (339 draft), 230 with at least one failed check, 253 mergeability UNKNOWN, 101 MERGEABLE, 0 duplicate head SHAs. 359 non-main branches have unique/divergent commits; 2 contained branches preserved as integration/release references. Deleted 0.
- Official Test `/api/version` HTTP 200 `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production HTTP 200 `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither equals candidate. Official Test symlink target absent. Exact-SHA Test/authenticated E2E/backup restore/GitOps release gate BLOCKED. No Test or Production deployment, rollback, live DB/ledger mutation, or feature switch changes.
- Existing PRs #1589, #1616, QA #1610 and security issue #993 preserved. No other agent worktree modified. No branch deletion. The feature remains HOLD until integration and end-to-end gates pass.

## Follow-up / integration requirements
- Rebase safely onto a main that contains an approved forward-only 285 repair; do not alter applied SQL checksums. Re-run full migration chain, actual `moneyverse_app` grants and authenticated chat/support browser + Android E2E on the exact candidate SHA.
- Resolve app-role SQL actor-spoofing and direct table DML issue #993, perform provenance-safe legacy image backfill (never infer ownership from a pasted key), complete backup restore, security audit and independent GitOps approval before promotion.
- If deployment fails, roll back application image only and leave additive registry rows intact for later reconciliation; do not drop tables or modify balances.
