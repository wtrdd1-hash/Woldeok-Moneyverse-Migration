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
- [ ] Recheck main, build/lint/typecheck/unit/DB/security/a11y/SEO/E2E; commit, PR, CI, Test exact SHA and release gate.
- [ ] End: record SHA, changes, gate outcomes, Test/Production/rollback, branch preservation.

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
