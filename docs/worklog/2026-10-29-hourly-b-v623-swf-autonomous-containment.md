# Backend B v623 — Autonomous SWF synthetic finance containment

## Before work
- Start from latest remote main `35971c600f25869c96f1c666d4b9f58927202730` on independent branch/worktree.
- Read AGENTS, README, EN/KO plans, QA v1356, open PRs and #1275. Prior closed unmerged #1271 is a reference, not integrated; #1746/#1751 overlap the same service file.
- P0: explicit SWF runtime flags allow fabricated 124,000 WLD taxes, direct vault/member balance updates, and non-ledger success notices. No observed Production loss claimed.
- Plan: RED direct-call/scheduler/API tests; remove unsafe autonomous SQL; enforce 503 in Nest and web gateway; preserve read-only and config APIs; rerun tests, CI, security and Test SHA gates.

## In progress
- Implementation pending. No DB, migration, service, deployment, or other automation changes authorized.

## Finished
- Pending tests and release disposition.
