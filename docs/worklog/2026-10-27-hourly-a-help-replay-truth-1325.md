# Development A — Verified Help Replay Truth, 2026-10-27 13:25 KST

- [x] Before: miniPC Debian 13.6 directly reachable; Backend/Frontend/Bot/MCP/Nginx/Docker ACTIVE; DB connected. Root 100% (~447MiB), data 99% (~3.2GiB).
- [x] Read latest main `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`, AGENTS, README, English/Korean PROJECT_PLAN and integrated planning, latest QA and PR #1528 CI.
- [x] Start audit: 345 remote branches, 337 open PRs, 322 Draft. No deletion.
- [x] New branch `auto/hourly-a-help-replay-truth-20261027-1325` from latest main; cherry-picked prior help feature (2 commits), initial SHA `fb7c5f7791ccf275cec4975ef7daad23f9137383`. Other worktrees untouched.
- [x] RED: isolated PostgreSQL 17.11 reproduced stale publish-key replay after retraction falsely returning success; `-red.log` shows expected failure.
- [x] GREEN: lock current article row on draft/publish replay; SQLSTATE 40001 for stale state, NestJS HTTP 409 regression; isolated PostgreSQL ACL, independent approval, retraction, replay and immutable audit fixtures PASS (`-green.log`).
- [x] Full `pnpm test` PASS: Backend 1337 PASS/398 SKIP, Frontend 1430 PASS, Database 18 PASS/3 SKIP, Contract 38 PASS; Android app-api contract PASS. Typecheck PASS, Lint PASS (0 errors/1131 warnings), Backend build PASS, Next webpack build PASS, Bot test 8 PASS after restoring local-only dependency link. Isolated PG fixture PASS.
- [x] Full security audit FAIL: Critical 2/High 8; Bot audit FAIL: Critical 1/High 5. Route-ledger command missing required --inventory/--ledger (unit test + inventory generation PASS); authenticated exact-SHA official Test E2E, independent backup restore, browser a11y/SEO, GitOps release gate BLOCKED. CI pending.
- [ ] New PR CI and end-of-run branch/PR audit.
- [ ] Mid/end main+plan refresh, final branch/PR audit, GitHub update.

**Release:** DRAFT / HOLD. Migration 280 collision, security audit failures, exact-SHA official Test missing. Production forbidden.
