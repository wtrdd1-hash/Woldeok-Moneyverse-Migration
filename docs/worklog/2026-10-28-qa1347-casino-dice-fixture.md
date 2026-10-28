# QA v1347 — Casino dice fixture independence

## Before work — 2026-10-28 19:10 KST
- Baseline: origin/main `35971c600f25869c96f1c666d4b9f58927202730`.
- Isolated branch/worktree: `qa/hourly-v1347-casino-trial-20261028` at `/var/tmp/mv-qa1347-work`.
- P1 #1725: another worker reproduced 20 dice-suite failures on a disposable PostgreSQL 17.11 database (SQLSTATE 55000). Migration 100 requires a qualifying coin trial in addition to both dice trials; the dice suite previously prepared only dice trials, relying on another suite's setup and execution order.
- Shared Production-connected database, co-workers' worktrees, migrations, and release files remain untouched.
- Superpowers skills connector returned no available skill URIs; AGENTS.md's isolation, TDD, systematic-debugging and verification process was followed without claiming the skills were loaded.

## In progress — 2026-10-28 19:13–19:14 KST
- **RED**: isolated source-contract test failed: `dice fixture must establish a coin distribution trial independently`.
- **GREEN**: added a one-million-draw qualifying coin trial in the dice suite's `beforeAll`, before the dice trials, with an explicit `passed` assertion. Added a real-PostgreSQL assertion that a qualifying coin trial exists independently of the separate coin suite.
- Isolated source-contract test PASS; changed-file ESLint PASS; `git diff --check` PASS.
- Focused Vitest with no database credentials: 42 SKIPPED, 0 executed. **Not a PostgreSQL PASS.**
- Local backend typecheck BLOCKED by missing `undici` in the existing dependency installation (TS2307), not a verified code regression.
- New disposable PostgreSQL setup was not permitted by the remote execution safety gate; **real-PostgreSQL regression remains unverified in this run**. Require GitHub CI real-PG and official Test exact-SHA before any merge/release.
- origin/main rechecked unchanged at `35971c600f25869c96f1c666d4b9f58927202730`.

## Finished / release gates
- QA candidate remains Draft and must not be merged until CI and isolated PostgreSQL validation pass.
- No shared DB writes, financial ledger changes, Test or Production deployment, service restart, PR closure, or branch deletion.
- PR/CI exact SHA and final state: to be appended after remote submission.
